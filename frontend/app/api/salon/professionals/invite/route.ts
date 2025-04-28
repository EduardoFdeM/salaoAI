import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '@/lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Enviar convite para um profissional
export async function POST(request: NextRequest) {
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
    const { email, message } = requestData;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const apiUrl = `${API_URL}/api/professionals/invite`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        message: message || 'Venha fazer parte de nossa equipe!'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao enviar convite: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao enviar convite para profissional:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 