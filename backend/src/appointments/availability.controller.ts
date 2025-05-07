import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/salon/availability')
export class AvailabilityController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAvailability(
    @Query('salonId') salonId: string,
    @Query('date') date: string,
    @Query('professionalId') professionalId?: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.appointmentsService.getAvailability(
      salonId,
      date,
      professionalId,
      serviceId,
    );
  }
}