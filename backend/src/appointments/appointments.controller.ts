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
  @Roles(Role.OWNER, Role.RECEPTIONIST, Role.SYSTEM) // Apenas Dono, Recepcionista ou System podem criar
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
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: any,
    @Request() req: AuthenticatedRequest
  ) {
    const userSalonId = req.user?.salon_id;
    const userRole = req.user?.role;

    // Para roles com escopo de salão (OWNER, RECEPTIONIST, PROFESSIONAL, SYSTEM com salon_id)
    // o salon_id do token é mandatório.
    if (!userSalonId && (userRole === Role.OWNER || userRole === Role.RECEPTIONIST || userRole === Role.PROFESSIONAL || userRole === Role.SYSTEM)) {
      throw new ForbiddenException(
        "Usuário ou token de sistema não está associado a um salão específico.",
      );
    }

    // Se um salonId foi explicitamente passado na query:
    if (query.salonId) {
      // E o usuário tem um salon_id no token (escopo de salão)
      if (userSalonId) {
        // O salonId da query DEVE corresponder ao salonId do token.
        if (query.salonId !== userSalonId) {
          throw new ForbiddenException(
            "Você não tem permissão para acessar dados deste salão.",
          );
        }
        // Se chegou aqui, query.salonId === userSalonId, o que é redundante, mas ok.
        // O service usará este valor.
      } else {
        // O usuário não tem salon_id no token (ex: um admin global futuro).
        // Neste caso, o salonId da query é usado para filtrar. Nenhuma ação extra aqui, o service usará query.salonId.
      }
    } else {
      // Se salonId NÃO foi passado na query:
      // E o usuário TEM um salon_id no token, usamos esse para filtrar.
      if (userSalonId) {
        query.salonId = userSalonId;
      } else {
        // Usuário não tem salon_id no token E não passou salonId na query.
        // Se for um admin global, ele pode ver todos (sem filtro de salão).
        // Se for outra role, isso seria um erro (já tratado acima).
        // Para este caso (admin global sem filtro), query.salonId permanecerá undefined,
        // e o serviço não aplicará filtro de salão.
      }
    }

    // Aplicar filtro de professionalId se o usuário for um profissional.
    // O ID do profissional no token (req.user.id) é o ID do SalonUser.
    if (userRole === Role.PROFESSIONAL && req.user?.id) {
      query.professionalId = req.user.id;
    }

    return this.appointmentsService.findAll(query);
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