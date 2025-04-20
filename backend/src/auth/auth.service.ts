import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  salon_id: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Valida um usuário pelo email e senha
   */
  async validateUser(email: string, password: string): Promise<any> {
    return this.usersService.validateUser(email, password);
  }

  /**
   * Registra um novo usuário e faz login automaticamente
   */
  async register(createUserDto: CreateUserDto) {
    // Criação do usuário
    const user = await this.usersService.create(createUserDto);
    
    // Login automático após registro
    return this.login(user);
  }

  /**
   * Gera um token JWT para o usuário autenticado
   */
  async login(user: User) {
    // Obter informações do usuário do salão (se existir)
    const salonUser = await this.getSalonUserInfo(user.id);

    // Determinar o papel correto baseado na lógica do frontend
    let userRole: string;
    if (user.email === 'superuser@example.com') { // Identificar Superuser pelo email (ou outra lógica)
      userRole = 'SUPERUSER';
    } else if (salonUser) {
      switch (salonUser.role) {
        case 'OWNER':
          userRole = 'SALON_OWNER';
          break;
        case 'PROFESSIONAL':
          userRole = 'PROFESSIONAL';
          break;
        case 'RECEPTIONIST':
          userRole = 'RECEPTIONIST';
          break;
        default:
          userRole = 'ADMIN'; // Caso inesperado no SalonUser
      }
    } else {
      // Se não está no SalonUser e não é superuser@example.com, assume ADMIN
      userRole = 'ADMIN'; 
    }
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: userRole, // Usar o papel determinado
      salon_id: salonUser?.salonId || null,
    };

    // Obter informações adicionais do usuário se estiver associado a um salão
    let salonData: { id: string; name: string; role: string } | null = null;
    if (salonUser?.salonId) {
      const salon = await this.prisma.salon.findUnique({
        where: { id: salonUser.salonId },
      });
      
      if (salon) {
        salonData = {
          id: salon.id,
          name: salon.name,
          role: salonUser.role,
        };
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: 28800, // 8 horas em segundos
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole, // Usar o papel determinado aqui também
        salon_id: salonUser?.salonId || null,
        salon: salonData,
        avatar_url: null, // Implementar futuramente
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        is_active: user.active,
      },
    };
  }

  /**
   * Obtém dados do usuário a partir do token
   */
  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      if (payload && payload.sub) {
        return this.usersService.findOne(payload.sub);
      }
      return null;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Obtém informações do usuário relacionadas ao salão
   */
  private async getSalonUserInfo(userId: string) {
    // Buscar a relação do usuário com salão mais recente
    const salonUser = await this.prisma.salonUser.findFirst({
      where: {
        userId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return salonUser;
  }
}
