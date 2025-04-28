import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '@/lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter lista de profissionais do salão
export async function GET(request: Request) {
  console.log("API Route: GET /api/salon/professionals CALLED"); // Log inicial
  try {
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

    // Chama a API do backend 
    const apiUrl = `${API_URL}/api/professionals`;
    console.log(`API Route: Calling Backend URL: ${apiUrl}`); // Log da URL do Backend
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    console.log(`API Route: Backend Response Status: ${response.status}`); // Log do status da resposta

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Route: Backend Error: ${response.status} - ${errorText}`);
      throw new Error(`Erro ao buscar profissionais: ${response.statusText}`);
    }

    const professionals = await response.json();

    // Formata os profissionais para corresponder à interface esperada pelo frontend
    const formattedProfessionals = professionals.map((p: any) => ({
      id: p.id,
      name: p.user?.name || '',
      email: p.user?.email || '',
      phone: p.user?.phone || '',
      // role: p.role, // Role do SalonUser, não do User base
      specialties: p.professionalServices?.map((ps: any) => ({
        id: ps.service.id,
        name: ps.service.name
      })) || [],
      bio: p.user?.bio || '',
      imageUrl: p.user?.imageUrl || '',
      active: p.active
    }));

    return NextResponse.json(formattedProfessionals);
  } catch (error) {
    console.error('API Route: Catch Block Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Criar um novo profissional
export async function POST(request: Request) {
  try {
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const requestData = await request.json();
    
    // Converter os dados do formato do frontend para o formato do backend
    const backendData = {
      // role: "PROFESSIONAL", // O backend define isso
      userData: {
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone || "",
        bio: requestData.bio || "",
        imageUrl: requestData.imageUrl || null
      },
      specialties: requestData.specialties?.map((s: any) => String(s.id)) || [] 
    };

    // Chama a API do backend
    const apiUrl = `${API_URL}/api/professionals`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar profissional: ${response.status} - ${errorText}`);
    }

    const professional = await response.json();

    // Formata o profissional para corresponder à interface esperada pelo frontend
    const formattedProfessional = {
      id: professional.id,
      name: professional.user?.name || '',
      email: professional.user?.email || '',
      phone: professional.user?.phone || '',
      // role: professional.role, // Role do SalonUser, não do User base
      specialties: professional.professionalServices?.map((ps: any) => ({
        id: ps.service.id,
        name: ps.service.name
      })) || [],
      bio: professional.user?.bio || '',
      imageUrl: professional.user?.imageUrl || '',
      active: professional.active
    };

    return NextResponse.json(formattedProfessional, { status: 201 });
  } catch (error) {
    console.error('Erro na API de profissionais:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 