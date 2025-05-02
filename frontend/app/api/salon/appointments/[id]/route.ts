import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Função auxiliar para obter token
function getToken() {
  const cookieStore = cookies();
  return cookieStore.get('token')?.value;
}

// Atualizar um agendamento (PUT)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken();
  const { id } = params; // Obter ID da URL

  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ message: 'ID do agendamento é obrigatório' }, { status: 400 });
  }

  try {
    const appointmentData = await request.json();

    const response = await fetch(`${API_URL}/api/salon/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao atualizar agendamento' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Cancelar (excluir logicamente) um agendamento (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken();
  const { id } = params; // Obter ID da URL

  if (!token) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  if (!id) {
    return NextResponse.json({ message: 'ID do agendamento é obrigatório' }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_URL}/api/salon/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // DELETE bem-sucedido geralmente retorna 204 No Content (sem corpo)
    if (!response.ok) {
        try {
            // Tenta ler o corpo do erro, se houver
            const errorData = await response.json();
             return NextResponse.json(
                { message: errorData.message || 'Erro ao cancelar agendamento' },
                { status: response.status }
            );
        } catch (jsonError) {
            // Se não houver corpo JSON ou derro ao ler
             return NextResponse.json(
                { message: `Erro ao cancelar agendamento (Status: ${response.status})` },
                { status: response.status }
            );
        }
    }

    // Retorna sucesso sem corpo
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 