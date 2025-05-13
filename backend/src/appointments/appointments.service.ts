// src/appointments/appointments.service.ts (adicionar método)
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsappService } from "../whatsapp/whatsapp.service";
import {
  Appointment,
  AppointmentStatus,
  Prisma,
  NotificationType,
  Service as PrismaServiceEntity,
} from "@prisma/client";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService, // Injeção circular
  ) {}

  private async getServiceById(serviceId: string): Promise<PrismaServiceEntity | null> {
    return this.prisma.service.findUnique({ where: { id: serviceId } });
  }

  private calculateEndTime(startTime: string | Date, durationMinutes: number): Date {
    const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    return new Date(startDate.getTime() + durationMinutes * 60000);
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const {
      clientId,
      professionalId,
      serviceId,
      salonId,
      startTime,
      price,
    } = createAppointmentDto;
    let { endTime } = createAppointmentDto;

    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException("Cliente não encontrado");

    const professional = await this.prisma.salonUser.findUnique({
      where: { id: professionalId },
      include: { user: true },
    });
    if (!professional) throw new NotFoundException("Profissional não encontrado");

    const service = await this.getServiceById(serviceId);
    if (!service) throw new NotFoundException("Serviço não encontrado");

    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException("Salão não encontrado");

    if (!endTime) {
      if (service.duration && service.duration > 0) {
        endTime = this.calculateEndTime(startTime, service.duration).toISOString();
      } else {
        throw new BadRequestException(
          "endTime é obrigatório ou o serviço selecionado não possui uma duração definida.",
        );
      }
    }

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        startTime: { lte: new Date(endTime) },
        endTime: { gte: new Date(startTime) },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        "Já existe um agendamento para este horário com o profissional selecionado.",
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId,
        professionalId,
        serviceId,
        salonId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: createAppointmentDto.status || AppointmentStatus.PENDING,
        price: price !== undefined ? price : service.price,
        notes: createAppointmentDto.notes,
      },
      include: {
        client: true,
        professional: { include: { user: true } },
        service: true,
        salon: true,
      },
    });

    await this.whatsappService.scheduleNotification(
      appointment.id,
      NotificationType.CONFIRMATION,
    );

    const reminderTime = new Date(startTime);
    reminderTime.setHours(reminderTime.getHours() - 1);
    await this.whatsappService.scheduleNotification(
      appointment.id,
      NotificationType.REMINDER,
      reminderTime,
    );

    return appointment;
  }

  async scheduleReminders(appointment: Appointment): Promise<boolean> {
    try {
      await this.whatsappService.scheduleNotification(
        appointment.id,
        NotificationType.CONFIRMATION,
      );

      const oneDayBefore = new Date(appointment.startTime);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      const timeUntilOneDayBefore = oneDayBefore.getTime() - Date.now();
      if (timeUntilOneDayBefore > 0) {
        setTimeout(() => {
          this.whatsappService
            .scheduleNotification(appointment.id, NotificationType.REMINDER)
            .catch((err) =>
              console.error("Erro ao agendar lembrete day_before:", err),
            );
        }, timeUntilOneDayBefore);
      }

      const oneHourBefore = new Date(appointment.startTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      const timeUntilOneHourBefore = oneHourBefore.getTime() - Date.now();
      if (timeUntilOneHourBefore > 0) {
        setTimeout(() => {
          this.whatsappService
            .scheduleNotification(appointment.id, NotificationType.REMINDER)
            .catch((err) =>
              console.error("Erro ao agendar lembrete hour_before:", err),
            );
        }, timeUntilOneHourBefore);
      }
    } catch (error) {
      console.error("Erro ao iniciar agendamento de lembretes:", error);
    }
    return true;
  }

  async findAll(params: {
    clientId?: string;
    professionalId?: string;
    salonId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const { clientId, professionalId, salonId, status, startDate, endDate } =
      params;

    const where: Prisma.AppointmentWhereInput = {};

    if (clientId) where.clientId = clientId;
    if (professionalId) where.professionalId = professionalId;
    if (salonId) where.salonId = salonId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        (where.startTime as Prisma.DateTimeFilter).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startTime as Prisma.DateTimeFilter).lte = new Date(endDate);
      }
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
        salon: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
        salon: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException("Agendamento não encontrado ou foi excluído");
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado.`);
    }

    let { startTime, endTime, serviceId, professionalId, status, price, notes } =
      updateAppointmentDto;

    const finalStartTime = startTime
      ? new Date(startTime)
      : appointment.startTime;
    let finalEndTime = endTime ? new Date(endTime) : appointment.endTime;
    const finalServiceId = serviceId || appointment.serviceId;

    if (!endTime && (startTime || serviceId)) {
      const serviceToUse = serviceId
        ? await this.getServiceById(serviceId)
        : appointment.service;

      if (!serviceToUse) {
        throw new NotFoundException(
          `Serviço com ID ${finalServiceId} não encontrado para cálculo do endTime.`,
        );
      }
      if (serviceToUse.duration && serviceToUse.duration > 0) {
        finalEndTime = this.calculateEndTime(finalStartTime, serviceToUse.duration);
      } else {
        throw new BadRequestException(
          "Não é possível calcular endTime. O serviço selecionado não possui uma duração definida e endTime não foi fornecido.",
        );
      }
    }
    
    if (finalStartTime >= finalEndTime) {
        throw new BadRequestException("O horário de término deve ser posterior ao horário de início.");
    }

    if (startTime || endTime || professionalId) {
      const professionalToCheck = professionalId || appointment.professionalId;
      const conflicting = await this.prisma.appointment.findFirst({
        where: {
          professionalId: professionalToCheck,
          id: { not: id },
          startTime: { lte: finalEndTime },
          endTime: { gte: finalStartTime },
          status: { not: AppointmentStatus.CANCELLED },
        },
      });

      if (conflicting) {
        throw new BadRequestException(
          "Já existe um agendamento para este novo horário com o profissional selecionado.",
        );
      }
    }

    const dataToUpdate: Prisma.AppointmentUpdateInput = {
      startTime: startTime ? finalStartTime : undefined,
      endTime: finalEndTime,
      status: status,
      price: price,
      notes: notes,
      client: updateAppointmentDto.clientId
        ? { connect: { id: updateAppointmentDto.clientId } }
        : undefined,
      professional: professionalId
        ? { connect: { id: professionalId } }
        : undefined,
      service: serviceId ? { connect: { id: serviceId } } : undefined,
    };
    
    Object.keys(dataToUpdate).forEach(key => {
      const k = key as keyof Prisma.AppointmentUpdateInput;
      if (dataToUpdate[k] === undefined) {
        delete dataToUpdate[k];
      }
    });

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
      include: {
        client: true,
        professional: { include: { user: true } },
        service: true,
        salon: true,
      },
    });

    if (status === AppointmentStatus.CANCELLED) {
      await this.whatsappService.scheduleNotification(
        id,
        NotificationType.CANCELLATION,
      );
    }

    return updatedAppointment;
  }

  async remove(id: string) {
    // Verifica se o agendamento existe antes de tentar excluir
    await this.findOne(id);

    try {
      // Usar transação para garantir que ambos sejam excluídos ou nenhum
      const [deletedHistory /*, deletedNotifications, deletedAppointment*/] =
        await this.prisma.$transaction([
          // 1. Excluir histórico associado
          this.prisma.appointmentHistory.deleteMany({
            where: { appointmentId: id },
          }),
          // 2. Excluir notificações associadas (se necessário)
          // this.prisma.notification.deleteMany({
          //   where: { appointmentId: id },
          // }),
          // 3. Excluir o próprio agendamento
          this.prisma.appointment.delete({
            where: { id },
          }),
        ]);

      this.logger.log(
        `Agendamento ${id}, ${deletedHistory.count} registros de histórico excluídos.`,
      );
      // O controller retornará 204 No Content, então não precisamos retornar mensagem daqui
    } catch (error) {
      this.logger.error(
        `Erro ao tentar excluir fisicamente agendamento ${id}: ${error}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma Error Code:", error.code);
        // Tratar outros erros específicos do Prisma se necessário
      }
      // Relançar o erro para o controller tratar
      throw new InternalServerErrorException("Falha ao excluir o agendamento.");
    }
  }

  async scheduleNotification(appointmentId: string, type: NotificationType) {
    try {
      // Busca o agendamento apenas para garantir que ele existe (findOne já lança erro se não achar)
      await this.findOne(appointmentId);

      // Agora agenda a notificação
      return this.whatsappService.scheduleNotification(appointmentId, type);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Erro ao agendar notificação: ${message}`, stack);
      throw new InternalServerErrorException("Erro ao agendar notificação");
    }
  }

  async getAvailability(
    salonId: string,
    date: string,
    professionalId?: string,
    serviceId?: string,
  ) {
    // Validar data
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    
    // Buscar profissionais disponíveis para esse serviço
    const professionals = await this.prisma.salonUser.findMany({
      where: {
        salonId,
        ...(professionalId ? { id: professionalId } : {}),
        role: 'PROFESSIONAL',
        active: true,
        ...(serviceId ? {
          professionalServices: {
            some: {
              serviceId,
            }
          }
        } : {})
      },
      include: {
        user: true,
        professionalServices: true,
      }
    });

    // Buscar agendamentos existentes para a data
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await this.prisma.appointment.findMany({
      where: {
        salonId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: AppointmentStatus.CANCELLED },
        ...(professionalId ? { professionalId } : {})
      }
    });

    // Buscar horário de funcionamento do salão para esse dia
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId }
    });

    // Dia da semana (0 = domingo, 1 = segunda, etc.)
    const dayOfWeek = searchDate.getDay();
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekday = weekdays[dayOfWeek];
    
    // Obter horário de funcionamento do salão para esse dia da semana
    const businessHours = salon?.businessHours as Prisma.JsonObject || {};
    const dayConfig = businessHours[weekday] as any || { isOpen: false, slots: [] };
    
    if (!dayConfig.isOpen) {
      return { available: false, message: 'Salão fechado neste dia' };
    }

    // Calcular slots disponíveis para cada profissional
    const availableSlots = professionals.map(professional => {
      // Obter horário de trabalho do profissional para esse dia
      const workingHours = professional.workingHours as Prisma.JsonObject || {};
      const profDayConfig = workingHours[weekday] as any || { isOpen: false, slots: [] };
      
      if (!profDayConfig.isOpen) {
        return {
          professionalId: professional.id,
          professionalName: professional.user?.name || 'Profissional',
          available: false,
          message: 'Profissional não trabalha neste dia',
          slots: []
        };
      }
      
      // Verificar agendamentos existentes desse profissional
      const profAppointments = appointments.filter(
        app => app.professionalId === professional.id
      );
      
      // Gerar slots de 1 hora e filtrar os que já estão ocupados
      const slots: { start: string; end: string }[] = [];
      const workSlots = profDayConfig.slots || [];
      
      for (const slot of workSlots) {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        
        // Criar slots de hora em hora
        for (let h = startHour; h < endHour; h++) {
          const slotStart = new Date(searchDate);
          slotStart.setHours(h, 0, 0, 0);
          
          const slotEnd = new Date(searchDate);
          slotEnd.setHours(h + 1, 0, 0, 0);
          
          // Verificar se o slot está ocupado
          const isOccupied = profAppointments.some(app => {
            const appStart = new Date(app.startTime);
            const appEnd = new Date(app.endTime);
            return (
              (slotStart <= appEnd && slotEnd >= appStart)
            );
          });
          
          if (!isOccupied) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString()
            });
          }
        }
      }
      
      return {
        professionalId: professional.id,
        professionalName: professional.user?.name || 'Profissional',
        available: slots.length > 0,
        slots
      };
    });

    return {
      date: searchDate.toISOString().split('T')[0],
      salonOpen: true,
      professionals: availableSlots
    };
  }
}