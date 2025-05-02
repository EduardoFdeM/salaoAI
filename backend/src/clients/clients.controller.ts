import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Interface importada ou definida localmente (se não existir centralizada)
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  salon_id: string;
}

// Tipando o Request para incluir o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@ApiTags('Salon Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Protege todas as rotas do controller
@Controller('api/salon/clients') // Rota base para clientes do salão logado
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // --- Rota para Criar Cliente --- //
  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.OWNER, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Cria um novo cliente para o salão logado' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (ex: campo obrigatório faltando).' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createClientDto: CreateClientDto,
  ) {
    const user = req.user;
    if (!user?.salon_id) {
      // Verifica se tem usuário E se ele tem salon_id
      throw new ForbiddenException(
        'Usuário não autenticado ou não associado a um salão.',
      );
    }

    // Garante que o cliente está sendo criado para o salão do usuário logado
    if (createClientDto.salonId && createClientDto.salonId !== user.salon_id) {
      throw new ForbiddenException(
        'Você só pode criar clientes para o seu próprio salão.',
      );
    }
    // Define o salonId com base no usuário logado se não for fornecido
    const dtoWithSalonId = {
      ...createClientDto,
      salonId: user.salon_id,
    };

    return this.clientsService.create(dtoWithSalonId);
  }

  // --- Rota para Listar Clientes do Salão Logado --- //
  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes do salão logado' })
  @ApiResponse({ status: 200, description: 'Lista de clientes retornada.' })
  findAll(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user?.salon_id) {
      throw new ForbiddenException("Usuário não associado a um salão.");
    }
    return this.clientsService.findAllBySalonId(user.salon_id);
  }

  // --- Rota para Obter um Cliente Específico --- //
  @Get(':id')
  @ApiOperation({ summary: 'Obtém um cliente específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    if (!user?.salon_id) {
      throw new ForbiddenException(
        'Usuário não autenticado ou não associado a um salão.',
      );
    }
    const client = await this.clientsService.findOne(id);

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Validação crucial: o cliente pertence ao salão do usuário?
    if (client.salonId !== user.salon_id) {
      throw new ForbiddenException('Este cliente não pertence ao seu salão.');
    }

    return client;
  }

  // --- Rota para Atualizar Cliente --- //
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.OWNER, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Atualiza um cliente existente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (ex: campo obrigatório faltando).' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const user = req.user;
    if (!user?.salon_id) {
      throw new ForbiddenException(
        'Usuário não autenticado ou não associado a um salão.',
      );
    }

    // Verifica se o cliente a ser atualizado pertence ao salão do usuário
    await this.findOne(req, id); // Reutiliza a lógica de busca e validação

    // Impede a alteração do salonId via DTO
    if ('salonId' in updateClientDto) {
      delete (updateClientDto as any).salonId;
    }

    return this.clientsService.update(id, updateClientDto);
  }

  // --- Rota para Excluir Cliente --- //
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Exclui um cliente' })
  @ApiResponse({ status: 200, description: 'Cliente excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    if (!user?.salon_id) {
      throw new ForbiddenException(
        'Usuário não autenticado ou não associado a um salão.',
      );
    }
    // Verifica se o cliente a ser excluído pertence ao salão do usuário
    await this.findOne(req, id); // Reutiliza a lógica de busca e validação

    return this.clientsService.remove(id);
  }
} 