// frontend/app/api/salon/connect-whatsapp/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    // Obter o token dos cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair salonId do token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const salonId = payload.salon_id;

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/whatsapp/register-instance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ salonId, phone }),
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao registrar WhatsApp' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao registrar WhatsApp:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}