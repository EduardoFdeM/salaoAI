// src/admin/admin.service.ts
import { Injectable, Redirect } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getDashboardData() {
    const [totalSalons, totalUsers, totalAppointments, totalClients] =
      await Promise.all([
        this.prisma.salon.count(),
        this.prisma.user.count(),
        this.prisma.appointment.count(),
        this.prisma.client.count(),
      ]);

    return {
      stats: {
        totalSalons,
        totalUsers,
        totalAppointments,
        totalClients,
      },
      page: 'Dashboard',
    };
  }

  @Redirect('/prisma-admin', 302)
  getPrismaAdminRedirect() {
    return;
  }
}
