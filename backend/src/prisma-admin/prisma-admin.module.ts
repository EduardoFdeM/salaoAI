import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaAdminController } from './prisma-admin.controller.js';
import { PrismaAdminService } from './prisma-admin.service.js';
import { PrismaAdminHelpers } from './prisma-admin.helpers.js';

@Module({
  imports: [PrismaModule],
  controllers: [PrismaAdminController],
  providers: [PrismaAdminService, PrismaAdminHelpers],
})
export class PrismaAdminModule {}
