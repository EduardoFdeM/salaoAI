import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma, Client } from "@prisma/client";

// Interface para tipar o JSON de clientRequiredFields
interface ClientRequiredFieldsConfig {
  phone?: boolean;
  email?: boolean;
}

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  // Função helper para validar campos obrigatórios
  private async validateRequiredFields(
    salonId: string,
    data: CreateClientDto | UpdateClientDto,
  ): Promise<void> {
    const salonSettings = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { clientRequiredFields: true },
    });

    // Default se não houver configuração (ou se for null/inválido)
    let requiredConfig: ClientRequiredFieldsConfig = { phone: true, email: false };
    if (
      salonSettings?.clientRequiredFields &&
      typeof salonSettings.clientRequiredFields === "object" &&
       salonSettings.clientRequiredFields !== null // Garantir que não seja null do DB
    ) {
        // Type assertion segura após verificação
        requiredConfig = salonSettings.clientRequiredFields as ClientRequiredFieldsConfig;
    }


    const errors: string[] = [];

    if (requiredConfig.phone && !data.phone) {
      errors.push("O telefone do cliente é obrigatório.");
    }
    if (requiredConfig.email && !data.email) {
      errors.push("O email do cliente é obrigatório.");
    }
    // Adicionar outras validações se necessário

    if (errors.length > 0) {
      throw new BadRequestException(errors); // Lança exceção com a lista de erros
    }
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Validar campos obrigatórios ANTES de criar
    await this.validateRequiredFields(createClientDto.salonId, createClientDto);

    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany();
  }

  async findOne(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  async findByPhone(phone: string, salonId: string): Promise<Client | null> {
    return this.prisma.client.findFirst({
      where: {
        phone,
        salonId,
      },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    // Buscar o cliente para obter o salonId
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    // Validar campos obrigatórios ANTES de atualizar
    // Nota: updateClientDto pode não ter salonId, usamos o do cliente existente
    await this.validateRequiredFields(client.salonId, updateClientDto);

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string): Promise<Client> {
    return this.prisma.client.delete({
      where: { id },
    });
  }

  async findAllBySalonId(
    salonId: string,
    filters?: { phone?: string; name?: string; email?: string }
  ): Promise<Client[]> {
    console.log(`[ClientsService] findAllBySalonId - salonId: ${salonId}, filters:`, filters); // LOG 1

    const where: Prisma.ClientWhereInput = { salonId };

    if (filters) {
      if (filters.phone) {
        const cleanedPhone = filters.phone.replace(/\D/g, '');
        console.log(`[ClientsService] Cleaned phone filter: ${cleanedPhone}`); // LOG 2
        if (cleanedPhone) { // Evitar contains com string vazia se o telefone original só tinha não-numéricos
          where.phone = {
            contains: cleanedPhone
          };
        }
      }

      if (filters.name) {
        console.log(`[ClientsService] Name filter: ${filters.name}`); // LOG 3
        where.name = {
          contains: filters.name,
          mode: 'insensitive' // Busca insensível a maiúsculas/minúsculas
        };
      }

      if (filters.email) {
        console.log(`[ClientsService] Email filter: ${filters.email}`); // LOG 4
        where.email = {
          contains: filters.email,
          mode: 'insensitive'
        };
      }
    }

    console.log('[ClientsService] Prisma where clause:', JSON.stringify(where, null, 2)); // LOG 5

    const results = await this.prisma.client.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`[ClientsService] Found ${results.length} clients.`); // LOG 6
    return results;
  }
} 