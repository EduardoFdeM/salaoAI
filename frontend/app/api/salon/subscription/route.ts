import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const tokenString = getToken({ cookies: req.cookies });
    
    if (!tokenString) {
      return NextResponse.json(
        { message: "Token não encontrado." },
        { status: 401 }
      );
    }

    const userPayload = getUserFromToken({ cookies: req.cookies });
    const rawTokenForBackend = getToken({ cookies: req.cookies });

    if (!userPayload || !userPayload.salonId || !rawTokenForBackend) {
      return NextResponse.json(
        { message: "Não autorizado ou token inválido." },
        { status: 401 }
      );
    }

    const salonId = userPayload.salonId as string;
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3333';
    const response = await fetch(`${backendUrl}/salons/${salonId}/subscription`, {
      headers: {
        'Authorization': `Bearer ${rawTokenForBackend}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Falha ao obter informações da assinatura" },
        { status: response.status }
      );
    }

    const subscriptionData = await response.json();
    
    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error("Erro ao processar requisição de assinatura:", error);
    return NextResponse.json(
      { message: "Erro interno ao obter informações da assinatura" },
      { status: 500 }
    );
  }
} 