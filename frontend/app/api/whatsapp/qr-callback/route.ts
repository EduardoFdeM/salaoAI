import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(request: Request) {
  try {
    console.log('Recebendo callback com QR code');
    
    // Obter dados do body
    const data = await request.json();
    console.log('Dados recebidos:', JSON.stringify(data));
    
    // Encaminhar para o backend
    const response = await axios.post(`${API_URL}/api/whatsapp/qr-callback`, data);
    
    console.log(`Resposta do backend: ${response.status}`);
    
    return NextResponse.json({
      success: true,
      message: 'QR Code recebido e processado'
    });
  } catch (error) {
    console.error('Erro ao processar QR code:', error);
    return NextResponse.json(
      { 
        message: error?.response?.data?.message || 
                error?.message || 
                'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
} 