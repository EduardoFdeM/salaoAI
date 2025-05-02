import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  Patch,
  ForbiddenException,
} from "@nestjs/common";
import { SalonsService } from "./salons.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { WhatsappService } from "../whatsapp/whatsapp.service";
import { UpdateSalonSettingsDto } from "./dto/update-salon-settings.dto";
import { RoleGuard } from "../auth/guards/role.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

// Interface para tipar o objeto user injetado pelo JwtAuthGuard
interface AuthenticatedUser {
  id: string;
  salon_id?: string;
  role?: Role;
  email?: string;
  name?: string;
  isSystemAdmin?: boolean;
}

// Tipando o Request para incluir o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@ApiTags("salons")
@Controller("api/salon")
export class SalonsController {
  constructor(
    private readonly salonsService: SalonsService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get("settings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter configurações do salão logado" })
  @ApiResponse({ status: 200, description: "Configurações do salão" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async getSettings(@Request() req: AuthenticatedRequest) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    const salon = await this.salonsService.findOneWithDetails(salonId);
    if (!salon) {
      throw new NotFoundException(`Salão com ID ${salonId} não encontrado.`);
    }
    return {
      business_hours: salon.businessHours,
      appointment_interval: salon.appointmentInterval,
      booking_lead_time: salon.bookingLeadTime,
      booking_cancel_limit: salon.bookingCancelLimit,
      clientRequiredFields: salon.clientRequiredFields,
      evolution_api_url: salon.evolutionApiUrl,
      evolution_api_key: salon.evolutionApiKey,
      evolution_instance_name: salon.evolutionInstanceName,
      ai_bot_enabled: salon.aiBotEnabled,
    };
  }

  @Patch("settings")
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualizar configurações do salão logado" })
  @ApiResponse({ status: 200, description: "Configurações atualizadas" })
  @ApiResponse({ status: 403, description: "Acesso negado" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async updateSettings(
    @Request() req: AuthenticatedRequest,
    @Body() updateSettingsDto: UpdateSalonSettingsDto,
  ) {
    const salonId = req.user?.salon_id;
    if (!salonId) {
      throw new NotFoundException("Usuário não associado a um salão.");
    }
    console.log("Controller recebendo para salvar:", updateSettingsDto);
    return this.salonsService.updateSettings(salonId, updateSettingsDto);
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter dados do dashboard do salão" })
  @ApiResponse({ status: 200, description: "Dados do dashboard" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async getDashboardData(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new NotFoundException("Usuário não autenticado corretamente.");
    }
    return this.salonsService.getSalonDashboardData(
      req.user.id,
      req.user.salon_id,
    );
  }

  @Get("my-salon")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obter informações GERAIS do salão do usuário logado",
  })
  @ApiResponse({ status: 200, description: "Informações gerais do salão" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async getMySalon(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new NotFoundException("Usuário não autenticado corretamente.");
    }
    const salon = await this.salonsService.getSalonByUserId(req.user.id);
    if (!salon) {
      throw new NotFoundException("Salão não encontrado para este usuário");
    }
    const role = await this.salonsService.getUserRole(req.user.id, salon.id);
    return {
      id: salon.id,
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      email: salon.email,
      logoUrl: salon.logoUrl,
      role: role,
    };
  }

  @Get("me/details")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter detalhes do salão do usuário logado" })
  @ApiResponse({ status: 200, description: "Detalhes do salão" })
  @ApiResponse({
    status: 404,
    description: "Usuário não está associado a um salão",
  })
  getUserSalonDetails(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new NotFoundException("Usuário não autenticado corretamente.");
    }
    return this.salonsService.getUserSalonDetails(req.user.id);
  }

  @Get("whatsapp-status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verificar status do WhatsApp do salão" })
  @ApiResponse({ status: 200, description: "Status do WhatsApp" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async getWhatsappStatus(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new NotFoundException("Usuário não autenticado corretamente.");
    }
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new NotFoundException("Salão não encontrado para este usuário");
    }
    return this.whatsappService.getInstanceStatus(salonId);
  }

  @Post("connect-whatsapp")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Conectar WhatsApp ao salão" })
  @ApiResponse({ status: 200, description: "WhatsApp conectado com sucesso" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async connectWhatsapp(
    @Body() data: { phone: string },
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user?.id) {
      throw new NotFoundException("Usuário não autenticado corretamente.");
    }
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new NotFoundException("Salão não encontrado para este usuário");
    }
    try {
      return await this.whatsappService.registerInstanceDirect(
        salonId,
        data.phone,
      );
    } catch (directError: any) {
      const errorMessage =
        directError instanceof Error
          ? directError.message
          : "Erro desconhecido";
      console.error(
        "Erro na chamada direta, tentando método padrão:",
        errorMessage,
      );
      return this.whatsappService.registerInstance(salonId, data.phone);
    }
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter informações de um salão específico" })
  @ApiResponse({ status: 200, description: "Informações do salão" })
  @ApiResponse({ status: 404, description: "Salão não encontrado" })
  async getSalonById(@Param("id") id: string) {
    console.log("--- SalonsController.getSalonById HIT ---", { id });
    return this.salonsService.findOne(id);
  }

  @Get(":id/users")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter usuários de um salão" })
  @ApiResponse({ status: 200, description: "Lista de usuários do salão" })
  async getSalonUsers(@Param("id") id: string) {
    return this.salonsService.getSalonUsers(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obter todos os salões (APENAS System Admin)" })
  @ApiResponse({ status: 200, description: "Lista de salões" })
  @ApiResponse({ status: 403, description: "Acesso negado" })
  findAll(@Request() req: AuthenticatedRequest) {
    if (!req.user?.isSystemAdmin) {
      throw new ForbiddenException(
        "Acesso negado. Apenas administradores do sistema podem listar todos os salões.",
      );
    }
    return this.salonsService.findAll();
  }
} 