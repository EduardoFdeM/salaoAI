import { Controller, Get, Render } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar status da API' })
  getHealth() {
    return this.adminService.getHealth();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Painel de administração do sistema' })
  @Render('admin/dashboard')
  getDashboard() {
    return this.adminService.getDashboardData();
  }

  @Get('prisma-admin')
  @ApiOperation({ summary: 'Painel de administração do banco de dados' })
  getPrismaAdmin() {
    return this.adminService.getPrismaAdminRedirect();
  }
}
