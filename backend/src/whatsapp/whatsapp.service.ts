// backend/src/whatsapp/whatsapp.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { AppointmentStatus, NotificationType, NotificationStatus, Prisma } from "@prisma/client";

// Interfaces para tipagem dos dados recebidos
interface IncomingMessageData {
  instanceName: string;
  message: string;
  sender: string;
}

interface QrCallbackData {
  salonId: string;
  qrCode: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async processIncomingMessage(data: IncomingMessageData) {
    const { instanceName, message, sender } = data;

    // Utilizando where condicional para buscar pelo nome da instância
    const salon = await this.prisma.salon.findFirst({
      where: {
        // Utilizar uma busca que não dependa de campos personalizados
        id: { not: "" }, // Buscar todos salões
      },
    });

    // Filtragem manual após a busca
    const filteredSalon = salon && (salon as any).evolutionInstanceName === instanceName ? salon : null;

    if (!filteredSalon) {
      console.error(`Salão não encontrado para instância ${instanceName}`);
      return { error: "Salão não encontrado" };
    }

    // TODO: Implementar lógica de processamento da mensagem (provavelmente chamar n8n)
    console.log(`Mensagem recebida para ${filteredSalon.name}:`, message);

    return {
      success: true,
      salon_id: filteredSalon.id,
      message: message,
      sender: sender,
    };
  }

  async registerInstance(salonId: string, phone: string) {
    if (!phone.match(/^\d+$/)) {
      throw new BadRequestException("Número de telefone inválido");
    }

    const instanceName = `salon_${salonId.replace(/-/g, "")}_${Date.now()}`;

    // Usar o prisma.salonSetting para armazenar informações adicionais
    await this.prisma.salon.update({
      where: { id: salonId },
      data: {},
    });

    // Criar configurações para WhatsApp como settings
    await this.prisma.salonSetting.upsert({
      where: { 
        salonId_key: {
          salonId,
          key: 'whatsappPhone'
        }
      },
      create: {
        salonId,
        key: 'whatsappPhone',
        value: phone
      },
      update: {
        value: phone
      }
    });

    await this.prisma.salonSetting.upsert({
      where: { 
        salonId_key: {
          salonId,
          key: 'evolutionInstanceName'
        }
      },
      create: {
        salonId,
        key: 'evolutionInstanceName',
        value: instanceName
      },
      update: {
        value: instanceName
      }
    });

    await this.prisma.salonSetting.upsert({
      where: { 
        salonId_key: {
          salonId,
          key: 'whatsappStatus'
        }
      },
      create: {
        salonId,
        key: 'whatsappStatus',
        value: 'PENDING_QR'
      },
      update: {
        value: 'PENDING_QR'
      }
    });

    const n8nUrl = this.configService.get<string>("N8N_WHATSAPP_REGISTER_URL");
    if (n8nUrl) {
      try {
        const apiUrl = this.configService.get<string>("API_URL") || "http://localhost:3333";
        // Usar o callback explicitamente como está nas variáveis de ambiente
        const callbackUrl = `${apiUrl}/api/whatsapp/qr-callback`;
        
        this.logger.log(`Enviando requisição para n8n: ${n8nUrl}`);
        this.logger.log(`Callback URL: ${callbackUrl}`);
        this.logger.log(`Payload: salonId=${salonId}, phone=${phone}, instanceName=${instanceName}`);

        // Fazer a chamada para o n8n
        const response = await axios.post(n8nUrl, {
          salonId,
          phone,
          instanceName,
          callback_url: callbackUrl,
        });
        
        this.logger.log(`Resposta do n8n: ${response.status} ${JSON.stringify(response.data)}`);
        
        // Atualizar status nas configurações
        await this.prisma.salonSetting.upsert({
          where: { 
            salonId_key: {
              salonId,
              key: 'whatsappStatus'
            }
          },
          create: {
            salonId,
            key: 'whatsappStatus',
            value: 'CONNECTING'
          },
          update: {
            value: 'CONNECTING'
          }
        });
      } catch (error) {
        this.logger.error(
          `Erro ao chamar n8n para registrar instância: ${error.message}`,
          error.stack
        );
        throw new BadRequestException("Falha ao registrar instância no N8N. Verifique os logs para mais detalhes.");
      }
    } else {
      this.logger.error("URL do n8n não configurada (N8N_WHATSAPP_REGISTER_URL)");
      throw new BadRequestException("URL do n8n não configurada.");
    }

    return {
      success: true,
      salonId,
      phone,
      instanceName,
    };
  }

  async getInstanceStatus(salonId: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      throw new NotFoundException("Salão não encontrado");
    }

    // Buscar as configurações do WhatsApp como settings
    const settings = await this.prisma.salonSetting.findMany({
      where: {
        salonId,
        key: {
          in: ['whatsappStatus', 'evolutionInstanceName', 'whatsappPhone', 'whatsappQrCode', 'whatsappPairingCode']
        }
      }
    });

    // Converter para objeto
    const whatsappSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return whatsappSettings;
  }

  async updateQrCode(data: { salonId: string; qrCode?: string; n8nFlowId?: string; pairingCode?: string; status?: string }) {
    const { salonId, qrCode, n8nFlowId, pairingCode, status } = data;

    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException(`Salão com ID ${salonId} não encontrado.`);
    }

    // Armazenar o ID do fluxo do n8n se fornecido
    if (n8nFlowId) {
      this.logger.log(`Recebido ID do fluxo do n8n: ${n8nFlowId} para o salão ${salonId}`);
      await this.updateN8nFlowId(salonId, n8nFlowId);
    }

    // Se o status for CONNECTED, a conexão foi bem-sucedida
    if (status === 'CONNECTED') {
      this.logger.log(`Conexão WhatsApp estabelecida para o salão ${salonId} (Flow ID: ${n8nFlowId || 'N/A'})`);
      await this.prisma.salonSetting.upsert({
        where: { salonId_key: { salonId, key: 'whatsappStatus' } },
        create: { salonId, key: 'whatsappStatus', value: 'CONNECTED' },
        update: { value: 'CONNECTED' },
      });
      // Limpar QR code e pairing code, pois não são mais necessários
      await this.prisma.salonSetting.deleteMany({
        where: {
          salonId,
          key: { in: ['whatsappQrCode', 'whatsappPairingCode'] },
        },
      });
      // Opcionalmente, pode-se manter o n8nFlowId se ainda não estiver no Salon model
      // e se for relevante mantê-lo aqui também.
      // Se n8nFlowId já está sendo salvo em Salon.n8nFlowId, não precisa duplicar.
    } else {
      // Lógica para quando a conexão ainda está pendente (recebendo QR code/pairing code)
      if (qrCode) {
        await this.prisma.salonSetting.upsert({
          where: { salonId_key: { salonId, key: 'whatsappQrCode' } },
          create: { salonId, key: 'whatsappQrCode', value: qrCode },
          update: { value: qrCode },
        });
      }

      if (pairingCode) {
        await this.prisma.salonSetting.upsert({
          where: { salonId_key: { salonId, key: 'whatsappPairingCode' } },
          create: { salonId, key: 'whatsappPairingCode', value: pairingCode },
          update: { value: pairingCode },
        });
      }

      // Atualizar status se fornecido (e não for 'CONNECTED')
      // ou definir como PENDING_QR se um qrCode foi recebido sem status explícito.
      const newStatus = status || (qrCode ? 'PENDING_QR' : 'UNKNOWN');
      if (status || qrCode) { // Apenas atualiza se houver um status novo ou QR code
        await this.prisma.salonSetting.upsert({
          where: { salonId_key: { salonId, key: 'whatsappStatus' } },
          create: { salonId, key: 'whatsappStatus', value: newStatus },
          update: { value: newStatus },
        });
      }
    }

    return { success: true, salonId, status: await this.getInstanceStatus(salonId) };
  }

  async scheduleNotification(
    appointmentId: string,
    notificationType: NotificationType,
    scheduledFor?: Date,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        professional: {
          include: {
            user: true,
          },
        },
        service: true,
        salon: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    if (!appointment.client) {
      throw new BadRequestException(
        "Cliente não encontrado para este agendamento.",
      );
    }

    const payload = {
      appointmentId: appointment.id,
      startTime: appointment.startTime,
      clientName: appointment.client.name,
      professionalName: appointment.professional?.user?.name ?? "Profissional",
      serviceName: appointment.service.name,
      salonName: appointment.salon.name,
    };

    const notification = await this.prisma.notification.create({
      data: {
        salonId: appointment.salonId,
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        professionalId: appointment.professionalId,
        type: notificationType,
        payload: payload,
        status: NotificationStatus.PENDING,
        sentAt: scheduledFor,
      },
    });

    console.log(
      `Notificação ${notification.id} criada para agendamento ${appointmentId}`,
    );

    return { success: true, notificationId: notification.id };
  }

  async triggerN8nNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { salon: true },
    });

    if (!notification) {
      console.error(`Notificação ${notificationId} não encontrada.`);
      return;
    }

    // Buscar a instância do Evolution nas configurações do salão
    const evolutionInstanceSetting = await this.prisma.salonSetting.findUnique({
      where: {
        salonId_key: {
          salonId: notification.salonId,
          key: 'evolutionInstanceName'
        }
      }
    });

    if (!evolutionInstanceSetting) {
      console.error(`Configuração do salão inválida para notificação ${notificationId}.`);
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: NotificationStatus.FAILED,
          payload: {
            ...(typeof notification.payload === 'object' ? notification.payload : {}),
            error: "Configuração inválida"
          }
        },
      });
      return;
    }

    const n8nUrl = this.configService.get<string>("N8N_NOTIFICATION_URL");
    if (!n8nUrl) {
      console.error("URL de notificação n8n não configurada");
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: NotificationStatus.FAILED,
          payload: {
            ...(typeof notification.payload === 'object' ? notification.payload : {}),
            error: "N8N URL não configurada"
          }
        },
      });
      return;
    }

    try {
      await axios.post(n8nUrl, {
        notificationId: notification.id,
        type: notification.type,
        payload: notification.payload,
        salon: {
          instance: evolutionInstanceSetting.value
        },
      });

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { 
          status: NotificationStatus.SENT, 
          sentAt: new Date() 
        },
      });
      console.log(`Notificação ${notificationId} enviada para N8N.`);
    } catch (error) {
      console.error(
        `Erro ao enviar notificação ${notificationId} para n8n:`,
        error.response?.data || error.message,
      );
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.FAILED,
          payload: {
            ...(typeof notification.payload === 'object' ? notification.payload : {}),
            error: error.message || "Erro desconhecido ao enviar para N8N"
          }
        },
      });
    }
  }

  async registerInstanceDirect(salonId: string, phone: string) {
    if (!phone.match(/^\d+$/)) {
      throw new BadRequestException("Número de telefone inválido");
    }

    const instanceName = `salon_${salonId.substring(0, 8)}`;

    // Url hardcoded do webhook para teste direto
    const webhookUrl = "https://n8n.evergreenmkt.com.br/webhook/cria-instancia-salaoai";
    // API URL para callback
    const apiUrl = this.configService.get<string>("API_URL") || "https://1ed9-186-220-156-104.ngrok-free.app";
    const callbackUrl = `${apiUrl}/api/whatsapp/qr-callback`;

    this.logger.log(`Tentando chamada direta ao webhook: ${webhookUrl}`);
    this.logger.log(`Callback: ${callbackUrl}`);
    
    try {
      // Chamar o webhook diretamente
      const response = await axios.post(webhookUrl, {
        salonId, 
        phone,
        instanceName,
        callback_url: callbackUrl
      });
      
      this.logger.log(`Resposta do webhook: ${response.status}`);
      this.logger.log(`Dados: ${JSON.stringify(response.data)}`);
      
      // Atualizar configurações
      await this.prisma.salonSetting.upsert({
        where: { 
          salonId_key: { salonId, key: 'whatsappPhone' }
        },
        create: { salonId, key: 'whatsappPhone', value: phone },
        update: { value: phone }
      });
      
      await this.prisma.salonSetting.upsert({
        where: { 
          salonId_key: { salonId, key: 'evolutionInstanceName' }
        },
        create: { salonId, key: 'evolutionInstanceName', value: instanceName },
        update: { value: instanceName }
      });
      
      await this.prisma.salonSetting.upsert({
        where: { 
          salonId_key: { salonId, key: 'whatsappStatus' }
        },
        create: { salonId, key: 'whatsappStatus', value: 'CONNECTING' },
        update: { value: 'CONNECTING' }
      });
      
      return {
        success: true,
        salonId,
        phone,
        instanceName,
        directCall: true
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro na chamada direta: ${msg}`);
      throw new BadRequestException(`Falha na chamada direta ao webhook: ${msg}`);
    }
  }

  // Método novo para atualizar o ID do fluxo do n8n
  async updateN8nFlowId(salonId: string, flowId: string) {
    this.logger.log(`Atualizando ID do fluxo do n8n para o salão ${salonId}: ${flowId}`);
    try {
      // Atualizar no Salon diretamente
      await this.prisma.salon.update({
        where: { id: salonId },
        data: { n8nFlowId: flowId },
      });
      
      // Também armazenar nas configurações para compatibilidade
      await this.prisma.salonSetting.upsert({
        where: { 
          salonId_key: {
            salonId,
            key: 'n8nFlowId'
          }
        },
        create: {
          salonId,
          key: 'n8nFlowId',
          value: flowId
        },
        update: {
          value: flowId
        }
      });
      
      return {
        success: true,
        salonId,
        flowId
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar ID do fluxo do n8n: ${msg}`);
      throw new InternalServerErrorException(`Falha ao atualizar ID do fluxo: ${msg}`);
    }
  }
}