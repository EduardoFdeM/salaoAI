import { Request } from "express";
import { Role } from "@prisma/client"; // Importando Role do Prisma

/**
 * Interface para tipar o objeto Request após a passagem pelos guardas de autenticação,
 * podendo conter dados do usuário JWT ou dados da API Key.
 */
export interface RequestWithAuthData extends Request {
  user?: {
    id?: string;
    email?: string; // Adicionado de AuthenticatedRequest
    name?: string;  // Adicionado de AuthenticatedRequest
    salon_id?: string | null;
    role?: Role | string; // Atualizado para suportar tanto Role do Prisma quanto string
    isSystemAdmin?: boolean;
    // ... outros campos que seu JWT payload possa ter
  };
  apiKeyData?: {
    salonId: string;
    // ... outros campos que a validação da API Key possa retornar
  };
}