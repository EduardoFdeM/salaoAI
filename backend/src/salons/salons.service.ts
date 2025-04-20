import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Salon, SalonUser, Role } from '@prisma/client';

@Injectable()
export class SalonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalonDashboardData(userId: string, salonId: string | null | undefined) {
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
      // Buscar outros dados necessários para o dashboard
    ] = await Promise.all([
      // Total de agendamentos
      this.prisma.appointment.count({
        where: { 
          salonId,
          // active: true // Remover propriedade que não existe
        }
      }),
      // Agendamentos do dia
      this.prisma.appointment.findMany({
        where: {
          salonId,
          // active: true, // Remover propriedade que não existe
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: {
          client: true,
          professional: true,
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
          active: true
        },
      }),
      // Clientes
      this.prisma.client.count({
        where: { 
          salonId,
          // active: true // Remover propriedade que não existe
        },
      }),
    ]);

    // Calcular receita do dia (usando dados reais dos agendamentos quando disponíveis)
    const dailyRevenue = todayAppointments.reduce((sum, appointment) => {
      // Verificar se temos o preço diretamente no agendamento ou pelo serviço relacionado
      const price = appointment.price || appointment.service?.price || 0;
      return sum + price;
    }, 0);

    // Calcular receita do mês (mock inicialmente)
    const monthlyRevenue = dailyRevenue * 20; // Simulação básica

    return {
      totalAppointments,
      todayAppointmentsCount: todayAppointments.length,
      todayAppointments,
      professionals,
      services,
      clients,
      dailyRevenue,
      monthlyRevenue,
      // Outros dados relevantes para o dashboard
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

  async getSalonSettings(salonId: string) {
    const settings = await this.prisma.salonSetting.findMany({
      where: {
        salonId,
      },
    });

    const settingsObject = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
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

  async findSalonAppointments(salonId: string, userId: string, filters?: any) {
    // Verificar se o usuário tem acesso ao salão
    await this.validateUserSalonAccess(userId, salonId);

    // Construir a query com filtros
    const where: any = {
      salonId,
    };

    // Aplicar filtros adicionais se fornecidos
    if (filters) {
      // Filtro por data de início
      if (filters.startDate) {
        where.startTime = {
          gte: new Date(filters.startDate),
        };
      }

      // Filtro por data de fim
      if (filters.endDate) {
        where.endTime = {
          lte: new Date(filters.endDate),
        };
      }

      // Filtro por status
      if (filters.status) {
        where.status = filters.status;
      }

      // Filtro por profissional
      if (filters.professionalId) {
        where.professionalId = filters.professionalId;
      }

      // Filtro por cliente
      if (filters.clientId) {
        where.clientId = filters.clientId;
      }

      // Filtro por serviço
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
          }
        },
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Transformar para o formato de resposta
    return appointments.map((appointment) => {
      // Usar type assertion para informar ao TypeScript sobre a estrutura
      const client = appointment['client'] as any;
      const service = appointment['service'] as any;
      const professional = appointment['professional'] as any;
      const professionalUser = professional?.user as any;

      return {
        id: appointment.id,
        title: `${service.name} - ${client.name}`,
        start: appointment.startTime,
        end: appointment.endTime,
        description: appointment.notes || "",
        status: appointment.status,
        price: appointment.price || service.price,
        clientId: appointment.clientId,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        professionalId: appointment.professionalId,
        professionalName: professionalUser?.name,
        serviceId: appointment.serviceId,
        serviceName: service.name,
      };
    });
  }

  /**
   * Valida se um usuário tem acesso a um determinado salão
   * @param userId ID do usuário
   * @param salonId ID do salão
   * @throws ForbiddenException se o usuário não tiver acesso ao salão
   */
  async validateUserSalonAccess(userId: string, salonId: string): Promise<void> {
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        salonId,
        active: true,
      },
    });

    if (!salonUser) {
      throw new ForbiddenException('Usuário não tem acesso a este salão');
    }
  }
} 