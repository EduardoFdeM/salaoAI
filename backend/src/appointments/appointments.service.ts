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

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { clientId, professionalId, serviceId, salonId, startTime, endTime } =
      createAppointmentDto;

    // Verificar se o cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException("Cliente não encontrado");
    }

    // Verificar se o profissional existe
    const professional = await this.prisma.salonUser.findUnique({
      where: { id: professionalId },
      include: { user: true },
    });

    if (!professional) {
      throw new NotFoundException("Profissional não encontrado");
    }

    // Verificar se o serviço existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException("Serviço não encontrado");
    }

    // Verificar se o salão existe
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      throw new NotFoundException("Salão não encontrado");
    }

    // Verificar conflitos de horário (ignorando cancelados)
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        startTime: { lte: endTime },
        endTime: { gte: startTime },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        "Já existe um agendamento para este horário",
      );
    }

    // Criar o agendamento
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId,
        professionalId,
        serviceId,
        salonId,
        startTime,
        endTime,
        status: AppointmentStatus.PENDING,
        price: service.price,
      },
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

    // Agendar notificações
    await this.whatsappService.scheduleNotification(
      appointment.id,
      NotificationType.CONFIRMATION,
    );

    // Agendar lembrete para 1 hora antes
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

    const { startTime, endTime, status } = updateAppointmentDto;

    if (startTime || endTime) {
      const newStartTime = startTime
        ? new Date(startTime)
        : appointment.startTime;
      const newEndTime = endTime ? new Date(endTime) : appointment.endTime;

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          professionalId: appointment.professionalId,
          id: { not: id },
          startTime: { lte: newEndTime },
          endTime: { gte: newStartTime },
          status: { not: AppointmentStatus.CANCELLED },
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException(
          "Já existe um agendamento para este horário",
        );
      }
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
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
}