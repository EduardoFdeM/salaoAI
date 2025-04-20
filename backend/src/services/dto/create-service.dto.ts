import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({
    description: "Nome do serviço",
    example: "Corte Feminino",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Descrição do serviço",
    example: "Corte moderno e estilizado",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Preço do serviço em reais",
    example: 80.0,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: "Duração do serviço em minutos",
    example: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: "Indica se o serviço está ativo",
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 