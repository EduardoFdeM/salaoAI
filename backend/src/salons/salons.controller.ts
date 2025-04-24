import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@ApiTags('salons')
@Controller('api/salon')
export class SalonsController {
  constructor(
    private readonly salonsService: SalonsService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do dashboard do salão' })
  @ApiResponse({ status: 200, description: 'Dados do dashboard' })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  async getDashboardData(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.salonsService.getSalonDashboardData(req.user.id, req.user.salon_id);
  }

  @Get('my-salon')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter informações do salão do usuário logado' })
  @ApiResponse({ status: 200, description: 'Informações do salão' })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  async getMySalon(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salon = await this.salonsService.getSalonByUserId(req.user.id);
    
    if (!salon) {
      throw new NotFoundException('Salão não encontrado para este usuário');
    }

    // Obter configurações do salão
    const settings = await this.salonsService.getSalonSettings(salon.id);

    // Obter papel do usuário neste salão
    const role = await this.salonsService.getUserRole(req.user.id, salon.id);

    return {
      ...salon,
      settings,
      role
    };
  }

  @Get('me/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes do salão do usuário logado' })
  @ApiResponse({ status: 200, description: 'Detalhes do salão' })
  @ApiResponse({ status: 404, description: 'Usuário não está associado a um salão' })
  getUserSalonDetails(@Request() req: any) {
    if (!req.user || !req.user.id) {
      return null;
    }
    
    return this.salonsService.getUserSalonDetails(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter todos os salões (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de salões' })
  findAll() {
    return this.salonsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter informações de um salão específico' })
  @ApiResponse({ status: 200, description: 'Informações do salão' })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  async getSalon(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter usuários de um salão' })
  @ApiResponse({ status: 200, description: 'Lista de usuários do salão' })
  async getSalonUsers(@Param('id') id: string) {
    return this.salonsService.getSalonUsers(id);
  }

  @Get(':id/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter configurações de um salão' })
  @ApiResponse({ status: 200, description: 'Configurações do salão' })
  async getSalonSettings(@Param('id') id: string) {
    return this.salonsService.getSalonSettings(id);
  }

  @Post('connect-whatsapp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Conectar WhatsApp ao salão' })
  @ApiResponse({ status: 200, description: 'WhatsApp conectado com sucesso' })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  async connectWhatsapp(@Body() data: { phone: string }, @Request() req) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new NotFoundException('Salão não encontrado para este usuário');
    }

    // Tentar chamada direta ao webhook do n8n
    try {
      return await this.whatsappService.registerInstanceDirect(salonId, data.phone);
    } catch (directError) {
      // Se falhar a chamada direta, tentar o método padrão
      console.error('Erro na chamada direta, tentando método padrão:', directError.message);
      return this.whatsappService.registerInstance(salonId, data.phone);
    }
  }

  @Get('whatsapp-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar status do WhatsApp do salão' })
  @ApiResponse({ status: 200, description: 'Status do WhatsApp' })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  async getWhatsappStatus(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new NotFoundException('Salão não encontrado para este usuário');
    }

    return this.whatsappService.getInstanceStatus(salonId);
  }
} 