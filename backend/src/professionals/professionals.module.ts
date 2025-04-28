import { Module } from '@nestjs/common';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsService } from './professionals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SalonsModule } from '../salons/salons.module';

@Module({
  imports: [PrismaModule, SalonsModule],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {} 