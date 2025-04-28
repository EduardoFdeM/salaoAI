import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços do salão do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de serviços' })
  async findAll(@Request() req) {
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.servicesService.findAllBySalon(salonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um serviço específico' })
  @ApiResponse({ status: 200, description: 'Detalhes do serviço' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.servicesService.findOne(id, salonId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    const data = { ...createServiceDto, salonId };
    return this.servicesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um serviço existente' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.servicesService.update(id, updateServiceDto, salonId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um serviço (exclusão lógica)' })
  @ApiResponse({ status: 200, description: 'Serviço desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async remove(@Param('id') id: string, @Request() req) {
    const salonId = req.user.salon_id;
    if (!salonId) {
      throw new Error("Usuário não associado a um salão.");
    }
    return this.servicesService.remove(id, salonId);
  }
} 