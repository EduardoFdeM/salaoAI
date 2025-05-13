import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken } from '../../../../../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log("API Route: POST /api/professionals/upload-image CALLED");
  try {
    const token = getToken({ cookies: cookies() });
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário ausente' }, { status: 400 });
    }

    // Obter o FormData da requisição original
    const formData = await request.formData();
    const imageFile = formData.get('imageFile');

    if (!imageFile) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Recriar o FormData para encaminhar ao backend
    const backendFormData = new FormData();
    backendFormData.append('imageFile', imageFile);

    // Chamar o endpoint do backend
    const backendUrl = `${API_URL}/api/professionals/upload-image/${userId}`;
    console.log(`API Route: Calling Backend Upload URL: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        // Não definir Content-Type, o fetch faz isso para FormData
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData, // Enviar o FormData diretamente
    });

    console.log(`API Route: Backend Upload Response Status: ${response.status}`);
    const responseData = await response.json();

    if (!response.ok) {
       console.error(`API Route: Backend Upload Error: ${response.status} - ${JSON.stringify(responseData)}`);
      throw new Error(responseData.message || 'Erro no upload da imagem no backend');
    }

    // Retornar a resposta do backend (que deve conter a imageUrl)
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('API Route: Upload Catch Block Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar upload' },
      { status: 500 }
    );
  }
} 