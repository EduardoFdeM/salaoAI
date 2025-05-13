import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '../../../../lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function GET(request: NextRequest) {
  try {
    // Obter o token e o usuário logado
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });

    if (!token || !user?.salon_id) {
      return NextResponse.json(
        { message: 'Não autorizado ou usuário não associado a um salão' },
        { status: 401 }
      );
    }
    
    // Obter parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');
    const serviceId = searchParams.get('serviceId');
    
    // Se não houver data, retornar erro
    if (!date) {
      return NextResponse.json(
        { message: 'Data é obrigatória' },
        { status: 400 }
      );
    }
    
    // Construir URL para o backend
    const backendParams = new URLSearchParams();
    backendParams.append('salonId', user.salon_id);
    backendParams.append('date', date);
    if (professionalId) backendParams.append('professionalId', professionalId);
    if (serviceId) backendParams.append('serviceId', serviceId);
    
    const response = await fetch(`${API_URL}/api/salon/appointments/availability?${backendParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao verificar disponibilidade' },
        { status: response.status }
      );
    }

    // Retornar os dados da disponibilidade
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao consultar disponibilidade:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 