import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se já existe usuário com o mesmo email ou telefone
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { phone: createUserDto.phone }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException(
        'Já existe um usuário com este email ou telefone'
      );
    }

    // Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar o usuário sem a senha em texto plano
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        passwordHash: hashedPassword,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        active: true
      }
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Preparar dados para atualização
    const data: any = { ...updateUserDto };
    
    // Se estiver atualizando a senha, hash
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      data.passwordHash = hashedPassword;
      delete data.password; // Remover senha em texto plano
    }

    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async remove(id: string): Promise<User> {
    // Verificar se o usuário existe
    await this.findOne(id);

    // Soft delete - apenas marca como inativo
    return this.prisma.user.update({
      where: { id },
      data: { active: false }
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
