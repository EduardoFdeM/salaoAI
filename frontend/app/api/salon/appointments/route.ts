import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '@/lib/auth'; // Importar helpers de autenticação

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter lista de agendamentos
export async function GET(request: NextRequest) {
  console.log("--- HIT: GET /api/salon/appointments --- ");
  try {
    // Obter o token e o usuário logado
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });

    if (!token || !user?.salon_id) {
      // Se não tiver token ou salon_id no token, não autorizado
      return NextResponse.json(
        { message: 'Não autorizado ou usuário não associado a um salão' },
        { status: 401 }
      );
    }
    
    const salonId = user.salon_id; // Extrair salonId do token

    // Obter parâmetros de query OPCIONAIS da requisição do frontend
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const professionalId = searchParams.get('professionalId');
    const clientId = searchParams.get('clientId'); // Adicionar clientId se precisar filtrar
    const serviceId = searchParams.get('serviceId'); // Adicionar serviceId se precisar filtrar
    const status = searchParams.get('status');
    
    // Construir URL para o BACKEND, incluindo o salonId OBRIGATÓRIO
    const backendParams = new URLSearchParams();
    backendParams.append('salonId', salonId); // Adicionar salonId obrigatório
    
    // Adicionar filtros opcionais
    if (startDate) backendParams.append('startDate', startDate);
    if (endDate) backendParams.append('endDate', endDate);
    if (professionalId) backendParams.append('professionalId', professionalId);
    if (clientId) backendParams.append('clientId', clientId); 
    if (serviceId) backendParams.append('serviceId', serviceId);
    if (status) backendParams.append('status', status);
    
    const backendUrl = `${API_URL}/api/salon/appointments?${backendParams.toString()}`;
    console.log("Calling Backend URL:", backendUrl); // Log para debug

    // Fazer requisição para o backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
       console.error("Backend Error:", response.status, data); // Log do erro do backend
      return NextResponse.json(
        { message: data.message || 'Erro ao obter agendamentos do backend' },
        { status: response.status }
      );
    }

    // Retornar os dados dos agendamentos
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao obter agendamentos (API Route):', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor na API route' },
      { status: 500 }
    );
  }
}

// Criar um novo agendamento (POST)
export async function POST(request: NextRequest) {
  try {
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });

    if (!token || !user?.salon_id) {
      return NextResponse.json(
        { message: 'Não autorizado ou usuário não associado a um salão' },
        { status: 401 }
      );
    }

    // Obter dados do corpo da requisição
    let appointmentData = await request.json();

    // Garantir que o salonId correto está sendo enviado (o do usuário logado)
    appointmentData.salonId = user.salon_id;

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/salon/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao criar agendamento' },
        { status: response.status }
      );
    }

    // Retornar os dados do agendamento criado
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento (API Route):', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor na API Route' },
      { status: 500 }
    );
  }
} 