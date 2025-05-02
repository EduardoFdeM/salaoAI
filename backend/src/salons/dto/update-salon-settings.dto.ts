import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class ClientRequiredFieldsDto {
  @ApiProperty({ description: 'Se o telefone do cliente é obrigatório', type: Boolean })
  @IsBoolean()
  phone: boolean;

  @ApiProperty({ description: 'Se o email do cliente é obrigatório', type: Boolean })
  @IsBoolean()
  email: boolean;
}

// DTO simplificado apenas para os campos que estamos configurando na UI agora
// Pode ser expandido para incluir business_hours, etc., com validações apropriadas
export class UpdateSalonSettingsDto {
  @ApiProperty({
    description: 'Configurações de campos obrigatórios para clientes',
    required: false,
    type: ClientRequiredFieldsDto, // Informar tipo para Swagger
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ClientRequiredFieldsDto)
  clientRequiredFields?: ClientRequiredFieldsDto;

  @ApiProperty({ description: 'Intervalo entre agendamentos em minutos', required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  appointmentInterval?: number;

  @ApiProperty({ description: 'Antecedência mínima para agendar em horas', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bookingLeadTime?: number;

  @ApiProperty({ description: 'Limite em horas para cancelar agendamento', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bookingCancelLimit?: number;

  // Adicione outros campos da aba Geral/WhatsApp/IA conforme necessário
  @ApiProperty({ description: 'URL da API Evolution', required: false })
  @IsOptional()
  @IsString()
  evolutionApiUrl?: string;

  @ApiProperty({ description: 'Chave da API Evolution', required: false })
  @IsOptional()
  @IsString()
  evolutionApiKey?: string;

  @ApiProperty({ description: 'Nome da instância Evolution', required: false })
  @IsOptional()
  @IsString()
  evolutionInstanceName?: string;

  @ApiProperty({ description: 'Se o bot IA está habilitado', required: false })
  @IsOptional()
  @IsBoolean()
  aiBotEnabled?: boolean;
}