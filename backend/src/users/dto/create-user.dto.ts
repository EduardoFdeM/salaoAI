import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

// Enum local para roles
export enum UserRole {
  OWNER = "OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  RECEPTIONIST = "RECEPTIONIST"
}

export class CreateUserDto {
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({ description: 'Email do usuário (único)' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ description: 'Telefone do usuário (único)' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  phone: string;

  @ApiProperty({ description: 'Senha do usuário (min. 6 caracteres)' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;

  @ApiProperty({
    description: 'Papel inicial do usuário em um salão (se aplicável). Usado principalmente se o registro for vinculado a um convite ou criação de salão.',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}