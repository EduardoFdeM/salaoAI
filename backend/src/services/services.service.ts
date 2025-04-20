import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllBySalon(salonId: string) {
    return this.prisma.service.findMany({
      where: {
        salonId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: string, salonId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }

    // Verifica se o serviço pertence ao salão do usuário
    if (service.salonId !== salonId) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar este serviço",
      );
    }

    return service;
  }

  async create(createServiceDto: CreateServiceDto & { salonId: string }) {
    return this.prisma.service.create({
      data: {
        name: createServiceDto.name,
        description: createServiceDto.description,
        price: createServiceDto.price,
        duration: createServiceDto.duration,
        active: createServiceDto.active ?? true,
        salon: {
          connect: { id: createServiceDto.salonId },
        },
      },
    });
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    salonId: string,
  ) {
    // Verificar se o serviço existe e pertence ao salão
    await this.findOne(id, salonId);

    return this.prisma.service.update({
      where: { id },
      data: {
        name: updateServiceDto.name,
        description: updateServiceDto.description,
        price: updateServiceDto.price,
        duration: updateServiceDto.duration,
        active: updateServiceDto.active,
      },
    });
  }

  async remove(id: string, salonId: string) {
    // Verificar se o serviço existe e pertence ao salão
    await this.findOne(id, salonId);

    // Opção 1: Exclusão real
    // return this.prisma.service.delete({
    //   where: { id },
    // });

    // Opção 2: Exclusão lógica (preferível)
    return this.prisma.service.update({
      where: { id },
      data: { active: false },
    });
  }
} 