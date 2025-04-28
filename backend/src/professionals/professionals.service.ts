import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(salonId: string) {
    return this.prisma.salonUser.findMany({
      where: {
        salonId,
        role: "PROFESSIONAL",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            imageUrl: true,
          },
        },
        professionalServices: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async findOne(id: string, salonId: string) {
    const professional = await this.prisma.salonUser.findFirst({
      where: {
        id,
        salonId,
        role: "PROFESSIONAL",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            imageUrl: true,
          },
        },
        professionalServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!professional) {
      throw new NotFoundException(
        `Profissional com ID ${id} não encontrado no salão ${salonId}`,
      );
    }

    return professional;
  }

  async create(data: {
    userId?: string;
    salonId: string;
    role: string;
    userData?: {
      name: string;
      email: string;
      phone?: string;
    };
    specialties?: string[];
  }) {
    const { userId: userIdParam, salonId, userData, specialties } = data;

    let userId = userIdParam;
    if (!userId && userData) {
      const user = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          passwordHash: "",
        },
      });
      userId = user.id;
    }

    if (!userId) {
      throw new Error(
        "Não foi possível criar o profissional: userId não definido",
      );
    }

    const professional = await this.prisma.salonUser.create({
      data: {
        userId: userId,
        salonId,
        role: "PROFESSIONAL",
        active: true,
      },
    });

    if (specialties && specialties.length > 0) {
      await this.updateSpecialties(professional.id, specialties);
    }

    return this.findOne(professional.id, salonId);
  }

  async update(
    id: string,
    salonId: string,
    data: {
      active?: boolean;
      userData?: {
        name?: string;
        email?: string;
        phone?: string;
        bio?: string;
        imageUrl?: string;
      };
      specialties?: string[];
    },
  ) {
    const professional = await this.findOne(id, salonId);

    if (data.userData) {
      const userDataToUpdate = Object.fromEntries(
        Object.entries(data.userData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(userDataToUpdate).length > 0) {
        await this.prisma.user.update({
          where: { id: professional.userId },
          data: userDataToUpdate,
        });
      }
    }

    if (data.active !== undefined) {
      await this.prisma.salonUser.update({
        where: { id: professional.id },
        data: { active: data.active },
      });
    }

    if (data.specialties) {
      await this.updateSpecialties(id, data.specialties);
    }

    return this.findOne(id, salonId);
  }

  async remove(id: string, salonId: string) {
    const professional = await this.findOne(id, salonId);
    await this.prisma.salonUser.delete({
      where: { id: professional.id },
    });
    return { message: "Relação profissional-salão removida com sucesso." };
  }

  private async updateSpecialties(
    professionalId: string,
    serviceIds: string[],
  ) {
    await this.prisma.professionalService.deleteMany({
      where: { professionalId },
    });

    if (serviceIds && serviceIds.length > 0) {
      const professional = await this.prisma.salonUser.findUnique({
        where: { id: professionalId },
        select: { salonId: true },
      });

      if (!professional || !professional.salonId) {
        throw new NotFoundException(
          `Profissional com ID ${professionalId} ou seu salão não encontrado.`,
        );
      }
      const salonId = professional.salonId;

      const servicesDetails = await this.prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          salonId,
        },
        select: { id: true, price: true, duration: true },
      });

      const serviceMap = new Map(servicesDetails.map((s) => [s.id, s]));

      const specialtiesToCreate = serviceIds.map((serviceId) => ({
        professionalId,
        serviceId,
        price: serviceMap.get(serviceId)?.price ?? 0,
        durationMinutes: serviceMap.get(serviceId)?.duration ?? 0,
      }));

      await this.prisma.professionalService.createMany({
        data: specialtiesToCreate,
      });
    }
  }

  async invite(email: string, salonId: string, message?: string) {
    console.log(
      `Simulando convite para ${email} no salão ${salonId} com a mensagem: ${message}`,
    );
    await Promise.resolve();
    return { message: `Convite enviado para ${email}` };
  }
}