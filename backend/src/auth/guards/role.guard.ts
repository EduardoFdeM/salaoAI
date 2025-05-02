import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client'; // Importar Role do Prisma

// Mapeamento reverso para converter a string do token para o enum do Prisma
// (Baseado nos mapeamentos que existiam ou deveriam existir em AuthService)
const tokenRoleToPrismaRole: { [key: string]: Role } = {
  ADMIN: Role.OWNER, // Exemplo: Se Admin no token deve ter permissão de OWNER? Ajustar conforme necessário.
  SUPERUSER: Role.OWNER, // Exemplo: Ajustar permissão base do superuser se necessário.
  SALON_OWNER: Role.OWNER,
  PROFESSIONAL: Role.PROFESSIONAL,
  RECEPTIONIST: Role.RECEPTIONIST,
  FRANCHISE_OWNER: Role.FRANCHISE_OWNER,
};


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role: string } }>();
    const user = request.user;

    if (!user || !user.role) {
      console.log('[RoleGuard] User ou User Role não encontrado no request.');
      return false;
    }

    const userRoleFromToken: string = user.role; // Role vindo do token (string)

    console.log('[RoleGuard] User Role from Token:', userRoleFromToken);
    console.log('[RoleGuard] Required Prisma Roles:', requiredRoles);

    // Tenta mapear a string do token para um Role do Prisma
    const mappedUserPrismaRole = tokenRoleToPrismaRole[userRoleFromToken];

    if (!mappedUserPrismaRole) {
      console.log('[RoleGuard] Não foi possível mapear o role do token para um Role do Prisma:', userRoleFromToken);
      // Se não houver mapeamento, a comparação direta pode funcionar se o token já usar o enum
      return requiredRoles.some(requiredRole => userRoleFromToken === requiredRole);
    }

    // Verifica se o Role mapeado está na lista de roles requeridos
    const hasPermission = requiredRoles.some(requiredRole => mappedUserPrismaRole === requiredRole);

    console.log('[RoleGuard] Mapped User Prisma Role:', mappedUserPrismaRole);
    console.log('[RoleGuard] Has Permission:', hasPermission);

    return hasPermission;
  }
} 