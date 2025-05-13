import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '../../../../../lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter detalhes de um profissional específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const id = params.id;
    const apiUrl = `${API_URL}/api/professionals/${id}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar profissional: ${response.statusText}`);
    }

    const professional = await response.json();

    // Formatar o profissional para corresponder à interface esperada pelo frontend
    const formattedProfessional = {
      id: professional.id,
      name: professional.user?.name || '',
      email: professional.user?.email || '',
      phone: professional.user?.phone || '',
      role: professional.role,
      specialties: professional.professionalServices?.map((ps: any) => ({
        id: ps.service.id,
        name: ps.service.name
      })) || [],
      bio: professional.user?.bio || '',
      imageUrl: professional.user?.imageUrl || '',
      active: professional.active
    };

    return NextResponse.json(formattedProfessional);
  } catch (error) {
    console.error('Erro na API de profissionais:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Atualizar um profissional
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const id = params.id;
    const requestData = await request.json();
    
    // Converter os dados do formato do frontend para o formato do backend
    const backendData = {
      active: requestData.active,
      userData: {
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone || "",
        bio: requestData.bio || "",
        imageUrl: requestData.imageUrl || null
      },
      specialties: requestData.specialties?.map((s: any) => String(s.id)) || []
    };

    const apiUrl = `${API_URL}/api/professionals/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(backendData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao atualizar profissional: ${response.status} - ${errorText}`);
    }

    const updatedProfessional = await response.json();

    // Formatar o profissional para corresponder à interface esperada pelo frontend
    const formattedProfessional = {
      id: updatedProfessional.id,
      name: updatedProfessional.user?.name || '',
      email: updatedProfessional.user?.email || '',
      phone: updatedProfessional.user?.phone || '',
      role: updatedProfessional.role,
      specialties: updatedProfessional.professionalServices?.map((ps: any) => ({
        id: ps.service.id,
        name: ps.service.name
      })) || [],
      bio: updatedProfessional.user?.bio || '',
      imageUrl: updatedProfessional.user?.imageUrl || '',
      active: updatedProfessional.active
    };

    return NextResponse.json(formattedProfessional);
  } catch (error) {
    console.error('Erro na API de profissionais:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
}

// Excluir um profissional
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const id = params.id;
    const apiUrl = `${API_URL}/api/professionals/${id}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao excluir profissional: ${response.status} - ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na API de profissionais:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 