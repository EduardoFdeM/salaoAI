import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os serviços do salão do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de serviços' })
  async findAll(@Request() req) {
    // Busca serviços com base no salonId do usuário
    return this.servicesService.findAllBySalon(req.user.salon_id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter um serviço específico' })
  @ApiResponse({ status: 200, description: 'Detalhes do serviço' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.servicesService.findOne(id, req.user.salon_id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    // Adiciona salonId do token ao DTO
    return this.servicesService.create({
      ...createServiceDto,
      salonId: req.user.salon_id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um serviço existente' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req
  ) {
    return this.servicesService.update(id, updateServiceDto, req.user.salon_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir um serviço' })
  @ApiResponse({ status: 200, description: 'Serviço excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.salon_id);
  }
} 