import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '../../../../lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter lista de serviços
export async function GET() {
  console.log("API Route: GET /api/salon/services CALLED"); // Log inicial
  try {
    // Obter o token e o usuário
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });

    console.log("API Route: Token:", token ? "Present" : "Absent"); // Log do token
    console.log("API Route: User:", user ? user.email : "null"); // Log do usuário
    
    if (!token || !user) {
      console.error("API Route: Authorization failed (no token or user)");
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const salonId = user.salon_id;
    
    if (!salonId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a um salão' },
        { status: 403 }
      );
    }

    // Fazer requisição para o backend (caminho correto e usando salonId do token)
    const apiUrl = `${API_URL}/api/services`;
    console.log(`API Route: Calling Backend URL: ${apiUrl}`); // Log da URL do Backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`API Route: Backend Response Status: ${response.status}`); // Log do status da resposta

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      console.error(`API Route: Backend Error: ${response.status} - ${JSON.stringify(data)}`);
      return NextResponse.json(
        { error: data.message || 'Erro ao obter serviços' },
        { status: response.status }
      );
    }

    // Retornar os dados dos serviços
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route: Catch Block Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Criar um novo serviço
export async function POST(request: NextRequest) {
  try {
    // Obter o token e o usuário
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const salonId = user.salon_id;
    
    if (!salonId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a um salão' },
        { status: 403 }
      );
    }

    // Obter dados do corpo da requisição
    const serviceData = await request.json();

    // Fazer requisição para o backend com os dados originais
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData), 
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Erro ao criar serviço' },
        { status: response.status }
      );
    }

    // Retornar os dados do serviço criado
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 