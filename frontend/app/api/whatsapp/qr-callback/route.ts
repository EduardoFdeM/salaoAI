import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(request: Request) {
  try {
    console.log('Recebendo callback com QR code ou status');
    
    // Obter dados do body
    const data = await request.json();
    console.log('Dados recebidos:', JSON.stringify(data));
    
    // Extrair informações relevantes
    let qrCode = null;
    let pairingCode = null;
    
    // Verificar se os dados seguem o formato da Evolution API
    if (Array.isArray(data) && data.length > 0 && data[0].success) {
      // Formato Evolution API
      if (data[0].data && data[0].data.base64) {
        qrCode = data[0].data.base64;
        pairingCode = data[0].data.pairingCode;
        
        console.log('QR Code extraído do formato Evolution API');
      }
    } else if (data.salonId && data.qrCode) {
      // Formato direto (do n8n)
      qrCode = data.qrCode;
      console.log('QR Code extraído do formato direto');
    }
    
    // Se não encontrou QR code, pode ser uma atualização de status
    const status = data.status || (data[0]?.data?.status || null);
    
    // Preparar dados para encaminhar ao backend
    const backendData = {
      salonId: data.salonId || (data[0]?.meta?.salonId || null),
      qrCode: qrCode,
      pairingCode: pairingCode,
      status: status
    };
    
    console.log('Dados processados para o backend:', backendData);
    
    // Encaminhar para o backend apenas se tiver salonId e qrCode ou status
    if (backendData.salonId && (backendData.qrCode || backendData.status)) {
      const response = await axios.post(`${API_URL}/api/whatsapp/qr-callback`, backendData);
      console.log(`Resposta do backend: ${response.status}`);
    } else {
      console.log('Dados insuficientes para encaminhar ao backend');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dados recebidos e processados'
    });
  } catch (error: any) {
    console.error('Erro ao processar callback:', error);
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