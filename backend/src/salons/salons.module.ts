import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalonsService } from './salons.service';
import { SalonsController } from './salons.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [PrismaModule, WhatsappModule],
  controllers: [SalonsController],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}
