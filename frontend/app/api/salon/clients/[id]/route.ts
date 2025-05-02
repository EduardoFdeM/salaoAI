import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Atualizar um cliente (PATCH)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = params.id;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const clientData = await request.json();

    const response = await fetch(`${API_URL}/api/salon/clients/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao atualizar cliente' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${clientId}:`, error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Excluir um cliente (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = params.id;
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/salon/clients/${clientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // DELETE bem-sucedido geralmente retorna 200 OK ou 204 No Content sem corpo
    if (!response.ok) {
      let errorData;
      try {
        // Tenta parsear JSON, mas pode falhar se a resposta for vazia
        errorData = await response.json();
      } catch (parseError) {
        // Se não conseguiu parsear, usa o status text
        errorData = { message: response.statusText || 'Erro ao excluir cliente' };
      }
      return NextResponse.json(
        { message: errorData.message || 'Erro ao excluir cliente' },
        { status: response.status }
      );
    }

    // Retorna sucesso (pode ser vazio ou com uma mensagem)
    return NextResponse.json({ message: 'Cliente excluído com sucesso' }, { status: 200 });

  } catch (error) {
    console.error(`Erro ao excluir cliente ${clientId}:`, error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 