import { IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID do salão' })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ description: 'ID do cliente' })
  @IsNotEmpty()
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'ID do profissional' })
  @IsNotEmpty()
  @IsUUID()
  professionalId: string;

  @ApiProperty({ description: 'ID do serviço' })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Data e hora de início' })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Data e hora de término' })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Preço do serviço' })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ 
    description: 'Status do agendamento', 
    required: false, 
    enum: AppointmentStatus, 
    default: AppointmentStatus.PENDING 
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.PENDING;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 