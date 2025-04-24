// backend/src/whatsapp/whatsapp.controller.ts
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { ClientsService } from '../clients/clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { NotificationType } from '@prisma/client';

@Controller('api/whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly appointmentsService: AppointmentsService,
    private readonly clientsService: ClientsService,
  ) {}

  @Post('webhook')
  async receiveMessage(@Body() data: any) {
    // Processa mensagens recebidas do WhatsApp
    return this.whatsappService.processIncomingMessage(data);
  }

  @Post('create-appointment')
  @UseGuards(JwtAuthGuard)
  async createAppointment(@Body() data: CreateAppointmentDto) {
    // Criar agendamento a partir de dados processados pela IA
    return this.appointmentsService.create(data);
  }

  @Post('verify-client')
  async verifyClient(@Body() data: { phone: string; salonId: string }) {
    // Verifica se o número já é cliente do salão
    return this.clientsService.findByPhone(data.phone, data.salonId);
  }

  @Post('register-instance')
  @UseGuards(JwtAuthGuard)
  async registerInstance(@Body() data: { salonId: string; phone: string }) {
    // Inicia processo de registro da instância WhatsApp
    return this.whatsappService.registerInstance(data.salonId, data.phone);
  }

  @Get('instance-status/:salonId')
  @UseGuards(JwtAuthGuard)
  async instanceStatus(@Param('salonId') salonId: string) {
    // Verifica status da instância WhatsApp
    return this.whatsappService.getInstanceStatus(salonId);
  }
  
  @Post('qr-callback')
  async qrCallback(@Body() data: { salonId: string; qrCode: string }) {
    // Recebe QR code da instância WhatsApp
    return this.whatsappService.updateQrCode(data);
  }
  
  @Post('schedule-notification')
  async scheduleNotification(@Body() data: { appointmentId: string; type: string }) {
    // Agenda notificação para envio (confirmação, lembrete, etc)
    return this.whatsappService.scheduleNotification(
      data.appointmentId, 
      data.type as NotificationType
    );
  }
}