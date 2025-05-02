import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSalonSettingsDto } from "./dto/update-salon-settings.dto";
import {
  Salon,
  SalonUser,
  Role,
  Prisma,
  AppointmentStatus,
} from "@prisma/client";

@Injectable()
export class SalonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalonDashboardData(
    userId: string,
    salonId: string | null | undefined,
  ) {
    // Se não tiver salonId no token, tenta buscar
    if (!salonId) {
      const salon = await this.getSalonByUserId(userId);
      if (salon) {
        salonId = salon.id;
      } else {
        throw new NotFoundException("Salão não encontrado para este usuário");
      }
    }

    // Buscar dados para o dashboard
    const [
      totalAppointments,
      todayAppointments,
      professionals,
      services,
      clients,
    ] = await Promise.all([
      // Total de agendamentos
      this.prisma.appointment.count({
        where: {
          salonId,
        },
      }),
      // Agendamentos do dia
      this.prisma.appointment.findMany({
        where: {
          salonId,
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: {
          client: true,
          professional: {
            // Incluir user dentro de professional
            include: {
              user: true,
            },
          },
          service: true,
        },
        orderBy: { startTime: "asc" },
      }),
      // Profissionais
      this.prisma.salonUser.count({
        where: {
          salonId,
          active: true,
          role: "PROFESSIONAL",
        },
      }),
      // Serviços
      this.prisma.service.count({
        where: {
          salonId,
          active: true,
        },
      }),
      // Clientes
      this.prisma.client.count({
        where: {
          salonId,
        },
      }),
    ]);

    // Calcular datas para os últimos 30 dias
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));

    // Buscar agendamentos dos últimos 30 dias para cálculo de topServices/Professionals
    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        salonId,
        startTime: {
          gte: thirtyDaysAgo,
          lte: today,
        },
        // Opcional: considerar apenas agendamentos concluídos?
        // status: AppointmentStatus.COMPLETED,
      },
      select: {
        serviceId: true,
        professionalId: true,
        // Não precisamos mais buscar nomes aqui, já que temos os IDs
      },
    });

    // Calcular Top Serviços
    const serviceCounts = recentAppointments.reduce(
      (acc: Record<string, number>, app) => {
        if (app.serviceId) {
          acc[app.serviceId] = (acc[app.serviceId] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    const topServiceIds = Object.entries(serviceCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([id]) => id);

    const topServicesDetails = await this.prisma.service.findMany({
      where: { id: { in: topServiceIds }, salonId },
      select: { id: true, name: true },
    });

    const topServices = topServiceIds.map((id) => {
      const detail = topServicesDetails.find((s) => s.id === id);
      return {
        id,
        name: detail?.name || "Serviço Desconhecido",
        count: serviceCounts[id],
      };
    });

    // Calcular Top Profissionais
    const professionalCounts = recentAppointments.reduce(
      (acc: Record<string, number>, app) => {
        if (app.professionalId) {
          acc[app.professionalId] = (acc[app.professionalId] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    const topProfessionalIds = Object.entries(professionalCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([id]) => id);

    const topProfessionalsDetails = await this.prisma.salonUser.findMany({
      where: { id: { in: topProfessionalIds }, salonId },
      select: { id: true, user: { select: { name: true } } },
    });

    const topProfessionals = topProfessionalIds.map((id) => {
      const detail = topProfessionalsDetails.find((p) => p.id === id);
      return {
        id,
        name: detail?.user?.name || "Profissional Desconhecido",
        count: professionalCounts[id],
      };
    });

    // Calcular receita do dia
    const dailyRevenue = todayAppointments.reduce((sum, appointment) => {
      const price = appointment.price || appointment.service?.price || 0;
      // Considerar apenas concluídos para receita?
      // if (appointment.status === AppointmentStatus.COMPLETED) {
      //   return sum + price;
      // }
      return sum + price; // Ou soma todos confirmados/em andamento etc.
    }, 0);

    // Calcular receita do mês (buscar agendamentos concluídos do mês)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const completedMonthlyAppointments = await this.prisma.appointment.findMany(
      {
        where: {
          salonId,
          status: AppointmentStatus.COMPLETED,
          endTime: {
            // Usar endTime para garantir que foi concluído no mês
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          price: true,
          service: { select: { price: true } },
        },
      },
    );

    const monthlyRevenue = completedMonthlyAppointments.reduce((sum, app) => {
      const price = app.price || app.service?.price || 0;
      return sum + price;
    }, 0);

    return {
      totalAppointments,
      todayAppointmentsCount: todayAppointments.length,
      todayAppointments: todayAppointments.map((appt) => ({
        // Mapear para incluir nome do usuário profissional
        ...appt,
        professionalName: appt.professional?.user?.name,
      })),
      professionals,
      services,
      clients,
      dailyRevenue,
      monthlyRevenue,
      topServices,
      topProfessionals,
    };
  }

  async findAll(): Promise<Salon[]> {
    return this.prisma.salon.findMany({
      where: { active: true },
    });
  }

  async findOne(id: string): Promise<Salon> {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      throw new NotFoundException(`Salão com ID ${id} não encontrado`);
    }

    return salon;
  }

  async getSalonUsers(salonId: string): Promise<SalonUser[]> {
    return this.prisma.salonUser.findMany({
      where: {
        salonId,
        active: true,
      },
      include: {
        user: true,
      },
    });
  }

  async getSalonSettings(salonId: string): Promise<Partial<Salon>> {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        businessHours: true,
        appointmentInterval: true,
        bookingLeadTime: true,
        bookingCancelLimit: true,
        clientRequiredFields: true,
        evolutionApiUrl: true,
        evolutionApiKey: true,
        evolutionInstanceName: true,
        aiBotEnabled: true,
      },
    });

    if (!salon) {
      throw new NotFoundException(
        `Configurações para Salão com ID ${salonId} não encontradas.`,
      );
    }

    return salon;
  }

  async getSalonByUserId(userId: string): Promise<Salon | null> {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        active: true,
      },
      include: {
        salon: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return salonUser?.salon || null;
  }

  async getUserRole(userId: string, salonId: string): Promise<Role | null> {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        salonId,
        active: true,
      },
    });

    return salonUser?.role || null;
  }

  async findByUserRole(userId: string, userRole: Role): Promise<Salon | null> {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        role: userRole,
        active: true,
      },
      include: {
        salon: true,
      },
    });

    return salonUser?.salon || null;
  }

  async getUserSalonDetails(userId: string) {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        active: true,
      },
      include: {
        salon: true,
      },
    });

    if (!salonUser) {
      return null;
    }

    return {
      id: salonUser.salon.id,
      name: salonUser.salon.name,
      role: salonUser.role,
      salonUser: {
        id: salonUser.id,
        createdAt: salonUser.createdAt,
        workingHours: salonUser.workingHours,
      },
    };
  }

  async findSalonAppointments(
    salonId: string,
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: AppointmentStatus;
      professionalId?: string;
      clientId?: string;
      serviceId?: string;
    },
  ) {
    await this.validateUserSalonAccess(userId, salonId);

    const where: Prisma.AppointmentWhereInput = {
      salonId,
    };

    if (filters) {
      if (filters.startDate) {
        where.startTime = {
          gte: new Date(filters.startDate),
        };
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        if (
          where.startTime &&
          typeof where.startTime === "object" &&
          "gte" in where.startTime
        ) {
          where.startTime = { ...where.startTime, lte: endDate };
        } else if (where.startTime instanceof Date) {
          where.startTime = { gte: where.startTime, lte: endDate };
        } else {
          where.startTime = { lte: endDate };
        }
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.professionalId) {
        where.professionalId = filters.professionalId;
      }

      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      if (filters.serviceId) {
        where.serviceId = filters.serviceId;
      }
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return appointments.map((appointment) => {
      const client = appointment.client;
      const service = appointment.service;
      const professionalUserRelation = appointment.professional;
      const professionalUser = professionalUserRelation?.user;

      return {
        id: appointment.id,
        title: `${service?.name || "Serviço desconhecido"} - ${client?.name || "Cliente desconhecido"}`,
        start: appointment.startTime,
        end: appointment.endTime,
        description: appointment.notes || "",
        status: appointment.status,
        price: appointment.price || service?.price || 0,
        clientId: appointment.clientId,
        clientName: client?.name,
        clientEmail: client?.email,
        clientPhone: client?.phone,
        professionalId: appointment.professionalId,
        professionalName: professionalUser?.name,
        serviceId: appointment.serviceId,
        serviceName: service?.name,
      };
    });
  }

  /**
   * Valida se um usuário tem acesso a um determinado salão
   * @param userId ID do usuário
   * @param salonId ID do salão
   * @throws ForbiddenException se o usuário não tiver acesso ao salão
   */
  async validateUserSalonAccess(
    userId: string,
    salonId: string,
  ): Promise<void> {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        salonId,
        active: true,
      },
    });

    if (!salonUser) {
      throw new ForbiddenException("Usuário não tem acesso a este salão");
    }
  }

  async findOneWithDetails(id: string): Promise<Salon | null> {
    return this.prisma.salon.findUnique({
      where: { id },
    });
  }

  async updateSettings(
    salonId: string,
    data: UpdateSalonSettingsDto,
  ): Promise<Salon> {
    console.log("Recebido para salvar em salonId:", salonId, "Dados:", data);

    const dataToUpdate: Prisma.SalonUpdateInput = {
      appointmentInterval: data.appointmentInterval,
      bookingLeadTime: data.bookingLeadTime,
      bookingCancelLimit: data.bookingCancelLimit,
      evolutionApiUrl: data.evolutionApiUrl,
      evolutionApiKey: data.evolutionApiKey,
      evolutionInstanceName: data.evolutionInstanceName,
      aiBotEnabled: data.aiBotEnabled,
      clientRequiredFields:
        data.clientRequiredFields !== undefined
          ? { ...data.clientRequiredFields }
          : undefined,
    };

    Object.keys(dataToUpdate).forEach((key) => {
      const K = key as keyof Prisma.SalonUpdateInput;
      if (dataToUpdate[K] === undefined) {
        delete dataToUpdate[K];
      }
    });

    try {
      const updatedSalon = await this.prisma.salon.update({
        where: { id: salonId },
        data: dataToUpdate,
      });
      console.log("Salão atualizado:", updatedSalon);
      return updatedSalon;
    } catch (error) {
      console.error("Erro ao atualizar configurações do salão:", error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundException(
          `Salão com ID ${salonId} não encontrado.`,
        );
      }
      throw error;
    }
  }
}