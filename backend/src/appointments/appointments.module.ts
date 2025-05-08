import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => WhatsappModule)
  ],
  controllers: [AppointmentsController, AvailabilityController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
