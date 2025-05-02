import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Interface para tipar o objeto user injetado
interface AuthenticatedUser {
  id: string;
  salon_id?: string;
  role?: Role;
}

// Tipando o Request
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@ApiTags('Appointments (Salon)')
@ApiBearerAuth() // Indica que precisa de token JWT
@UseGuards(JwtAuthGuard) // Proteger todas as rotas com JWT
@Controller('api/salon/appointments') // Rota base ajustada para o contexto do salão
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(RoleGuard) // Adicionar guarda de role
  @Roles(Role.OWNER, Role.RECEPTIONIST) // Apenas Dono ou Recepcionista podem criar
  @ApiOperation({ summary: 'Cria um novo agendamento para o salão' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado (role insuficiente).' })
  @ApiResponse({ status: 404, description: 'Cliente, Profissional, Serviço ou Salão não encontrado.' })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    const userSalonId = req.user?.salon_id;
    if (!userSalonId || createAppointmentDto.salonId !== userSalonId) {
      throw new ForbiddenException(
        "Você só pode criar agendamentos para o seu próprio salão.",
      );
    }
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista agendamentos do salão com filtros' })
  @ApiQuery({ name: 'salonId', required: true, description: 'ID do salão para filtrar', type: String })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filtrar por ID do cliente', type: String })
  @ApiQuery({ name: 'professionalId', required: false, description: 'Filtrar por ID do profissional', type: String })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus, description: 'Filtrar por status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (YYYY-MM-DD)', type: String })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (YYYY-MM-DD)', type: String })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('salonId', ParseUUIDPipe) salonId: string,
    @Query('clientId') clientId?: string,
    @Query('professionalId') professionalId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    console.log("--- AppointmentsController.findAll HIT ---", { salonId, clientId, professionalId, status, startDate, endDate });
    const userSalonId = req.user?.salon_id;
    const userRole = req.user?.role;

    if (!userSalonId || salonId !== userSalonId) {
      throw new ForbiddenException(
        "Você só pode ver agendamentos do seu próprio salão.",
      );
    }

    const effectiveProfessionalId = professionalId;
    if (userRole === Role.PROFESSIONAL) {
      console.warn("Filtro de profissional logado ainda não implementado completamente.");
    }

    return this.appointmentsService.findAll({
      salonId,
      clientId,
      professionalId: effectiveProfessionalId,
      status,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um agendamento específico por ID' })
  @ApiParam({ name: 'id', description: 'ID do agendamento', type: String })
  @ApiResponse({ status: 200, description: 'Detalhes do agendamento.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const appointment = await this.appointmentsService.findOne(id);
    const userSalonId = req.user?.salon_id;

    if (!userSalonId || appointment.salonId !== userSalonId) {
      throw new ForbiddenException(
        "Você não tem permissão para ver este agendamento.",
      );
    }
    
    return appointment;
  }

  @Put(':id')
  @UseGuards(RoleGuard) // Adicionar guarda de role
  @Roles(Role.OWNER, Role.RECEPTIONIST) // Apenas Dono ou Recepcionista podem editar
  @ApiOperation({ summary: 'Atualiza um agendamento existente' })
  @ApiParam({ name: 'id', description: 'ID do agendamento a ser atualizado', type: String })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    // Valida se o usuário pode ver o agendamento (e portanto, pertence ao salão correto)
    await this.findOne(req, id);

    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 em caso de sucesso
  @UseGuards(RoleGuard) // Adicionar guarda de role
  @Roles(Role.OWNER, Role.RECEPTIONIST) // Apenas Dono ou Recepcionista podem excluir
  @ApiOperation({ summary: 'Exclui (hard delete) um agendamento' }) // Descrição atualizada
  @ApiParam({ name: 'id', description: 'ID do agendamento a ser excluído', type: String })
  @ApiResponse({ status: 204, description: 'Agendamento excluído com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao excluir agendamento.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    // Valida se o usuário pode ver o agendamento (e portanto, pertence ao salão correto)
    await this.findOne(req, id);
    // Chama o serviço que agora faz o hard delete
    await this.appointmentsService.remove(id); 
    // O HttpCode(HttpStatus.NO_CONTENT) garante que 204 será retornado se não houver erro
  }
} 