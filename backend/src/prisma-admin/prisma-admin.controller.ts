import {
  Controller,
  Get,
  Render,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PrismaAdminService } from './prisma-admin.service.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('prisma-admin')
@Controller('prisma-admin')
export class PrismaAdminController {
  constructor(private readonly prismaAdminService: PrismaAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Interface de administração do banco de dados' })
  @Render('prisma-admin/index')
  getIndex() {
    return this.prismaAdminService.getModels();
  }

  @Get('model/:modelName')
  @ApiOperation({ summary: 'Visualizar dados de um modelo específico' })
  @Render('prisma-admin/model')
  getModel(@Param('modelName') modelName: string) {
    return this.prismaAdminService.getModelData(modelName);
  }

  @Get('record/:modelName/:id')
  @ApiOperation({ summary: 'Visualizar um registro específico' })
  @Render('prisma-admin/record')
  getRecord(@Param('modelName') modelName: string, @Param('id') id: string) {
    return this.prismaAdminService.getRecordData(modelName, id);
  }

  @Post('record/:modelName/:id')
  @ApiOperation({ summary: 'Atualizar um registro específico' })
  updateRecord(
    @Param('modelName') modelName: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.prismaAdminService.updateRecord(modelName, id, data);
  }
}
