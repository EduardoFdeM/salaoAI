import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '../../../../../../lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { keyId: string } }
) {
  const token = getToken({ cookies: cookies() });
  if (!token) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  const { keyId } = params;

  try {
    const backendResponse = await fetch(`${API_URL}/api/salon/settings/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!backendResponse.ok) {
        const data = await backendResponse.json().catch(() => ({})); // Tenta pegar o JSON, ou retorna obj vazio
        return NextResponse.json(data, { status: backendResponse.status });
    }
    // Para DELETE 204 No Content, não há corpo na resposta
    return new NextResponse(null, { status: backendResponse.status }); 
  } catch (error) {
    return NextResponse.json({ message: `Erro ao revogar chave API ${keyId}` }, { status: 500 });
  }
}