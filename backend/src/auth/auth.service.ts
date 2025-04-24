import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Enum para o frontend (mapeamento dos roles do banco)
export enum FrontendUserRole {
  SUPERUSER = "SUPERUSER",
  ADMIN = "ADMIN",
  SALON_OWNER = "SALON_OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  RECEPTIONIST = "RECEPTIONIST"
}

// Mapeamento de papéis do Prisma para frontend
const roleMapping = {
  OWNER: FrontendUserRole.SALON_OWNER,
  PROFESSIONAL: FrontendUserRole.PROFESSIONAL,
  RECEPTIONIST: FrontendUserRole.RECEPTIONIST
};

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

    // Determinar o papel correto baseado na lógica
    let frontendUserRole: FrontendUserRole;
    
    if (user.isSystemAdmin) {
      frontendUserRole = FrontendUserRole.ADMIN;
      
      // Superuser lógica opcional
      if (process.env.SUPERUSER_EMAIL && user.email === process.env.SUPERUSER_EMAIL) {
        frontendUserRole = FrontendUserRole.SUPERUSER;
      }
    } else if (salonUser) {
      frontendUserRole = roleMapping[salonUser.role] || FrontendUserRole.PROFESSIONAL;
    } else {
      // Usuário sem papel definido
      throw new Error("Usuário sem papel definido no sistema.");
    }
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: frontendUserRole,
      salon_id: salonUser?.salonId || null,
    };

    // Obter informações adicionais do salão se estiver associado
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

    const expiresInSeconds = parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "28800", 10);

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: expiresInSeconds }),
      token_type: "Bearer",
      expires_in: expiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: frontendUserRole,
        salon_id: salonUser?.salonId || null,
        salon: salonData,
        avatar_url: null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        is_active: user.active,
        is_system_admin: user.isSystemAdmin,
      },
    };
  }

  /**
   * Obtém dados do usuário a partir do token
   */
  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload && payload.sub) {
        return this.usersService.findOne(payload.sub);
      }
      return null;
    } catch (error) {
      console.error("Error verifying token:", error);
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
      orderBy: { createdAt: "desc" },
    });
    
    return salonUser;
  }
}
