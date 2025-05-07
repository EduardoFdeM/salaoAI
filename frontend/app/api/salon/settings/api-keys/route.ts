import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken } from '@/lib/auth'; // Assuming getToken gets the JWT

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
const BACKEND_API_KEYS_URL = `${API_URL}/api/salon/settings/api-keys`;

// GET to list API keys for the salon
export async function GET() {
  try {
    const token = getToken({ cookies: cookies() });
    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const response = await fetch(BACKEND_API_KEYS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao listar chaves API' },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao listar chaves API (API Route):', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST to create a new API key
export async function POST(request: NextRequest) {
  try {
    const token = getToken({ cookies: cookies() });
    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json(); // { name: string, expiresAt?: string | Date }

    const response = await fetch(BACKEND_API_KEYS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json(); // Expected: { apiKey: string, id: string } or error
    if (!response.ok) {
       console.error("Erro ao criar chave API (Backend):", data);
      return NextResponse.json(
        { message: data.message || 'Erro ao criar chave API' },
        { status: response.status }
      );
    }
    // Return the raw API key and its ID
    return NextResponse.json(data, { status: response.status }); // Should be 201
  } catch (error) {
    console.error('Erro ao criar chave API (API Route):', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE to revoke an API key
export async function DELETE(request: NextRequest) {
  try {
    const token = getToken({ cookies: cookies() });
    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    // Expecting key ID in the URL, e.g., /api/salon/settings/api-keys?keyId=uuid...
    const keyId = request.nextUrl.searchParams.get('keyId');
    if (!keyId) {
       return NextResponse.json({ message: 'ID da chave API é obrigatório' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_API_KEYS_URL}/${keyId}`, { // Append keyId to the URL
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
       // Handle potential errors from backend even for DELETE
       let errorData;
       try {
           errorData = await response.json();
       } catch (e) {
           errorData = { message: `Erro ${response.status}` };
       }
      return NextResponse.json(
        { message: errorData.message || 'Erro ao revogar chave API' },
        { status: response.status }
      );
    }

    // Return 204 No Content on success
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Erro ao revogar chave API (API Route):', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 