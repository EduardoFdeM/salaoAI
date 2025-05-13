// frontend/app/api/salon/connect-whatsapp/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// URL do webhook do n8n direto (conforme variável de ambiente do backend)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.evergreenmkt.com.br/webhook-test/cria-instancia-salaoai";
// Callback URL para o QR code - usar a URL real
const CALLBACK_URL = process.env.NEXT_PUBLIC_API_URL || "https://1ed9-186-220-156-104.ngrok-free.app";
// Base URL para webhook de mensagens
const BOT_WEBHOOK_BASE = "https://n8n.evergreenmkt.com.br/webhook/botsalao";

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
    const botWebhookUrl = `${BOT_WEBHOOK_BASE}-salon_${salonId.substring(0, 8)}`;
    
    // Gerar nome do fluxo do n8n
    const flowName = `salon_${salonId.substring(0, 8)} - SalaoAI`;
    
    // Verificar se já existe um ID de fluxo e obter o nome do salão
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    let currentFlowId = null;
    let salonName = "Salão"; // Default name
    let salonAddress = "Endereço não informado"; // Default address
    
    try {
      // Assumindo que /api/salon/me/details retorna { id, name, n8nFlowId, address, ... }
      const salonResponse = await fetch(`${API_URL}/api/salon/me/details`, { // Ajustado para /me/details
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (salonResponse.ok) {
        const salonData = await salonResponse.json();
        if (salonData.n8nFlowId) {
          currentFlowId = salonData.n8nFlowId;
          console.log(`ID de fluxo existente encontrado: ${currentFlowId}`);
        }
        if (salonData.name) {
          salonName = salonData.name;
          console.log(`Nome do salão encontrado: ${salonName}`);
        }
        if (salonData.address) { // Adicionado para buscar o endereço
          salonAddress = salonData.address;
          console.log(`Endereço do salão encontrado: ${salonAddress}`);
        }
      } else {
        console.warn(`Não foi possível obter detalhes do salão: ${salonResponse.status}`);
      }
    } catch (error) {
      console.log('Erro ao buscar detalhes do salão (não crítico)', error);
    }
    
    // Dados para enviar ao webhook
    const webhookData = {
      salonId,
      phone,
      instanceName,
      callback_url: `${CALLBACK_URL}/api/whatsapp/qr-callback`,
      bot_webhook_url: botWebhookUrl,
      flow_name: flowName,
      flow_id: currentFlowId, // null na primeira vez, preenchido nas reconexões
      salonName: salonName, // Adicionado nome do salão
      salonAddress: salonAddress, // Adicionado endereço do salão
      meta: {
        salonId: salonId // Adicionado para ajudar o rastreamento
      }
    };
    
    console.log(`Enviando dados para webhook:`, webhookData);
    
    // Chamar diretamente o webhook do n8n
    const response = await axios.post(N8N_WEBHOOK_URL, webhookData);
    
    console.log(`Resposta do webhook n8n: ${response.status}`);
    console.log(`Dados: ${JSON.stringify(response.data)}`);

    // Dizer ao frontend para começar a verificar o status imediatamente em vez de esperar a resposta completa
    return NextResponse.json({
      success: true,
      message: 'Solicitação de conexão de WhatsApp enviada com sucesso',
      instanceName,
      bot_webhook_url: botWebhookUrl,
      flow_name: flowName,
      checkStatus: true // Instruir o frontend a começar a verificar o status imediatamente
    });

  } catch (error: any) {
    console.error('Erro ao registrar WhatsApp:', error);
    // Se o erro tiver uma resposta do axios, usar o status e mensagem dela
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro interno do servidor';
    const errorStatus = error?.response?.status || 500;
    
    console.log(`Retornando erro para o frontend: Status ${errorStatus}, Mensagem: ${errorMessage}`);
    
    return NextResponse.json(
      { 
        message: errorMessage
      },
      { status: errorStatus }
    );
  }
}