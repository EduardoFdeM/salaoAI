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
    let status = null;
    let n8nFlowId = null;
    
    // Verificar se os dados seguem o formato da Evolution API
    if (Array.isArray(data) && data.length > 0 && data[0].success) {
      // Formato Evolution API
      if (data[0].data) {
        if (data[0].data.base64) {
          qrCode = data[0].data.base64;
          console.log('QR Code extraído do formato Evolution API');
        }
        
        if (data[0].data.pairingCode) {
          pairingCode = data[0].data.pairingCode;
          console.log('Código de pareamento extraído');
        }
        
        if (data[0].data.status) {
          status = data[0].data.status;
          console.log('Status extraído do formato Evolution API');
        }
      }
      
      // Extrair ID do fluxo, se presente
      if (data[0].n8nFlowId) {
        n8nFlowId = data[0].n8nFlowId;
        console.log('ID do fluxo do n8n extraído');
      }
      
      // Verificar se o ID do fluxo está nos metadados
      if (data[0].meta && data[0].meta.n8nFlowId) {
        n8nFlowId = data[0].meta.n8nFlowId;
        console.log('ID do fluxo do n8n extraído dos metadados');
      }
    } else {
      // Formato direto
      if (data.qrCode) {
        qrCode = data.qrCode;
        console.log('QR Code extraído do formato direto');
      }
      
      if (data.pairingCode) {
        pairingCode = data.pairingCode;
        console.log('Código de pareamento extraído do formato direto');
      }
      
      if (data.status) {
        status = data.status;
        console.log('Status extraído do formato direto');
      }
      
      if (data.n8nFlowId) {
        n8nFlowId = data.n8nFlowId;
        console.log('ID do fluxo do n8n extraído do formato direto');
      }
    }
    
    // Se não encontrou QR code, pode ser uma atualização de status
    if (!status) {
      status = data.status || (data[0]?.data?.status || null);
    }
    
    // Determinar o ID do salão
    const salonId = data.salonId || 
                   (data[0]?.meta?.salonId || null) || 
                   (data.meta?.salonId || null);
    
    if (!salonId) {
      console.error('Não foi possível determinar o ID do salão');
      return NextResponse.json(
        { message: 'ID do salão não fornecido' },
        { status: 400 }
      );
    }
    
    // Preparar dados para encaminhar ao backend
    const backendData = {
      salonId,
      qrCode,
      pairingCode,
      status,
      n8nFlowId
    };
    
    console.log('Dados processados para o backend:', backendData);
    
    // Encaminhar para o backend apenas se tiver dados relevantes para atualizar
    if (qrCode || status || n8nFlowId || pairingCode) {
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