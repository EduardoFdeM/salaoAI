import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiProperty({ description: "ID do salão ao qual o cliente pertence" })
  @IsNotEmpty()
  @IsUUID()
  salonId: string;

  @ApiProperty({ description: "Nome completo do cliente" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Número de telefone principal (WhatsApp)", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: "Endereço de e-mail do cliente",
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  email?: string;

  @ApiProperty({ description: "Observações sobre o cliente", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 