import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Salon, SalonUser, Role } from '@prisma/client';

@Injectable()
export class SalonsService {
  constructor(private readonly prisma: PrismaService) {}

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
        createdAt: 'desc',
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
} 