// src/appointments/appointments.service.ts (adicionar método)
import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Appointment, AppointmentStatus, Prisma, NotificationType } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Logger } from '@nestjs/common';

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

    // Verificar conflitos de horário
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        startTime: {
          lte: endTime,
        },
        endTime: {
          gte: startTime,
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
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
    // Agendar lembretes para o agendamento
    // 1. Lembrete de confirmação (logo após agendamento)
    try {
      await this.whatsappService.scheduleNotification(
        appointment.id,
        NotificationType.CONFIRMATION,
      );

      // 2. Lembrete um dia antes
      const oneDayBefore = new Date(appointment.startTime);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      const timeUntilOneDayBefore = oneDayBefore.getTime() - Date.now();
      if (timeUntilOneDayBefore > 0) {
        setTimeout(() => {
          this.whatsappService.scheduleNotification(appointment.id, NotificationType.REMINDER)
            .catch((err) =>
              console.error("Erro ao agendar lembrete day_before:", err),
            );
        }, timeUntilOneDayBefore);
      }
      
      // 3. Lembrete 1 hora antes
      const oneHourBefore = new Date(appointment.startTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      
      const timeUntilOneHourBefore = oneHourBefore.getTime() - Date.now();
      if (timeUntilOneHourBefore > 0) {
        setTimeout(() => {
          this.whatsappService.scheduleNotification(appointment.id, NotificationType.REMINDER)
            .catch((err) =>
              console.error("Erro ao agendar lembrete hour_before:", err),
            );
        }, timeUntilOneHourBefore);
      }
    } catch (error) {
      console.error("Erro ao iniciar agendamento de lembretes:", error);
    }
    
    return true; // Indica que o agendamento foi iniciado (não garante sucesso do envio)
  }

  async findAll(params: {
    clientId?: string;
    professionalId?: string;
    salonId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const { clientId, professionalId, salonId, status, startDate, endDate } = params;

    // Construir where dinâmico
    const where: Prisma.AppointmentWhereInput = {};

    if (clientId) where.clientId = clientId;
    if (professionalId) where.professionalId = professionalId;
    if (salonId) where.salonId = salonId;
    if (status) where.status = status;

    // Filtrar por período
    if (startDate || endDate) {
      where.startTime = {};
      
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.startTime.lte = new Date(endDate);
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
      throw new NotFoundException("Agendamento não encontrado");
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    const { startTime, endTime, status } = updateAppointmentDto;

    // Se estiver alterando o horário, verificar conflitos
    if (startTime || endTime) {
      const newStartTime = startTime || appointment.startTime;
      const newEndTime = endTime || appointment.endTime;

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          professionalId: appointment.professionalId,
          id: {
            not: id,
          },
          startTime: {
            lte: newEndTime,
          },
          endTime: {
            gte: newStartTime,
          },
          status: {
            not: AppointmentStatus.CANCELLED,
          },
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException(
          "Já existe um agendamento para este horário",
        );
      }
    }

    // Atualizar o agendamento
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
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

    // Se o status foi alterado para CANCELLED, enviar notificação
    if (status === AppointmentStatus.CANCELLED) {
      await this.whatsappService.scheduleNotification(
        id,
        NotificationType.CANCELLATION,
      );
    }

    return updatedAppointment;
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    // Não permitir exclusão de agendamentos que já aconteceram
    if (appointment.endTime < new Date()) {
      throw new BadRequestException(
        "Não é possível excluir agendamentos passados",
      );
    }

    // Marcar como cancelado ao invés de excluir
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
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
  }

  async scheduleNotification(appointmentId: string, type: NotificationType) {
    try {
      const appointment = await this.findOne(appointmentId);
      if (!appointment) {
        throw new NotFoundException(
          `Agendamento com ID ${appointmentId} não encontrado`,
        );
      }

      // Chamando o serviço WhatsApp para enviar a notificação
      return this.whatsappService.scheduleNotification(
        appointmentId,
        type,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao agendar notificação: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Erro ao agendar notificação");
    }
  }
}