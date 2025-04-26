// frontend/app/api/salon/connect-whatsapp/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// URL do webhook do n8n direto (conforme variável de ambiente do backend)
const N8N_WEBHOOK_URL = "https://n8n.evergreenmkt.com.br/webhook-test/cria-instancia-salaoai";
// Callback URL para o QR code - usar a URL real
const CALLBACK_URL = process.env.NEXT_PUBLIC_API_URL || "https://1ed9-186-220-156-104.ngrok-free.app";
// Base URL para webhook de mensagens
const BOT_WEBHOOK_BASE = "https://n8n.evergreenmkt.com.br/webhook-test/botsalao";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    console.log(`Conectando WhatsApp para número: ${phone}`);
    
    // Obter o token dos cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.error('Tentativa de conexão sem token de autenticação');
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair dados do token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const salonId = payload.salon_id;
    
    if (!salonId) {
      console.error('Token não contém o ID do salão');
      return NextResponse.json(
        { message: 'Token inválido - ID do salão não encontrado' },
        { status: 400 }
      );
    }

    console.log(`Enviando diretamente para webhook n8n: ${N8N_WEBHOOK_URL}`);
    
    // Gerar nome da instância
    const instanceName = `salon_${salonId.substring(0, 8)}`;
    
    // Gerar URL do webhook para o bot do salão
    const botWebhookUrl = `${BOT_WEBHOOK_BASE}-${salonId.substring(0, 8)}`;
    
    // Dados para enviar ao webhook
    const webhookData = {
      salonId,
      phone,
      instanceName,
      callback_url: `${CALLBACK_URL}/api/whatsapp/qr-callback`,
      bot_webhook_url: botWebhookUrl,
      meta: {
        salonId: salonId // Adicionado para ajudar o rastreamento
      }
    };
    
    console.log(`Enviando dados para webhook:`, webhookData);
    
    // Chamar diretamente o webhook do n8n
    const response = await axios.post(N8N_WEBHOOK_URL, webhookData);
    
    console.log(`Resposta do webhook n8n: ${response.status}`);
    console.log(`Dados: ${JSON.stringify(response.data)}`);

    // Também informar ao backend sobre a instância criada
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      await fetch(`${API_URL}/api/salon/connect-whatsapp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone,
          instanceName,
          bot_webhook_url: botWebhookUrl
        }),
      });
    } catch (backendError: any) {
      console.error('Erro ao comunicar com backend (não crítico):', backendError);
      // Continuar mesmo com erro no backend
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de conexão de WhatsApp enviada com sucesso',
      instanceName,
      bot_webhook_url: botWebhookUrl
    });

  } catch (error: any) {
    console.error('Erro ao registrar WhatsApp:', error);
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