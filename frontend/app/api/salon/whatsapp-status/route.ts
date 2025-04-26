// frontend/app/api/salon/whatsapp-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function GET() {
  try {
    console.log('Verificando status do WhatsApp...');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.error('Token não encontrado nos cookies');
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair salonId do token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const salonId = payload.salon_id;
    console.log(`SalonId extraído do token: ${salonId}`);

    if (!salonId) {
      console.error('Token não contém ID do salão');
      return NextResponse.json(
        { message: 'Token inválido - ID do salão não encontrado' },
        { status: 400 }
      );
    }

    console.log(`Chamando endpoint: ${API_URL}/api/whatsapp/instance-status/${salonId}`);
    const response = await fetch(`${API_URL}/api/whatsapp/instance-status/${salonId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status da resposta: ${response.status}`);
    const data = await response.json();
    console.log(`Dados recebidos:`, data);

    if (!response.ok) {
      console.error(`Erro ao verificar status: ${data.message || 'Erro desconhecido'}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao verificar status do WhatsApp' },
        { status: response.status }
      );
    }

    // Formatar os dados para a resposta
    const responseData = {
      whatsappStatus: data.whatsappStatus || 'DISCONNECTED',
      whatsappQrCode: data.whatsappQrCode || null,
      whatsappPhone: data.whatsappPhone || null,
      evolutionInstanceName: data.evolutionInstanceName || null,
      whatsappPairingCode: data.whatsappPairingCode || null,
      whatsappConnected: data.whatsappStatus === 'CONNECTED'
    };

    console.log('Dados formatados para frontend:', responseData);

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    return NextResponse.json(
      { message: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}