import {
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { RequestWithAuthData } from "../types/request-with-auth.type";

/**
 * Obtém o ID do salão a partir do request autenticado (JWT ou API Key).
 * @param req O objeto Request do NestJS.
 * @returns O ID do salão.
 * @throws InternalServerErrorException se o ID do salão não puder ser determinado.
 */
export function getSalonIdFromRequest(req: RequestWithAuthData): string {
  let salonId: string | null | undefined = null;

  if (req.apiKeyData?.salonId) {
    salonId = req.apiKeyData.salonId;
  } else if (req.user?.salon_id) {
    salonId = req.user.salon_id;
  }

  if (!salonId) {
    // Isso geralmente indica um problema na configuração dos guardas ou no fluxo de autenticação
    console.error("Falha ao obter salonId do request:", {
      user: req.user,
      apiKeyData: req.apiKeyData,
    });
    throw new InternalServerErrorException(
      "Não foi possível determinar o salão associado à requisição.",
    );
  }

  return salonId;
}

/**
 * Garante que o recurso solicitado pertence ao salão do usuário/chave autenticado.
 * @param req O objeto Request do NestJS.
 * @param resourceSalonId O ID do salão ao qual o recurso pertence.
 * @throws ForbiddenException se o acesso não for permitido.
 */
export function ensureSalonAccess(
  req: RequestWithAuthData,
  resourceSalonId: string,
): void {
  const requestSalonId = getSalonIdFromRequest(req);

  if (requestSalonId !== resourceSalonId) {
    throw new ForbiddenException(
      "Acesso negado a este recurso. Ele pertence a outro salão.",
    );
  }
}
