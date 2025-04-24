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
          in: ['whatsappStatus', 'evolutionInstanceName', 'whatsappPhone', 'whatsappQrCode']
        }
      }
    });

    // Converter para objeto
    const whatsappSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return whatsappSettings;
  }

  async updateQrCode(data: QrCallbackData) {
    const { salonId, qrCode } = data;

    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException(`Salão com ID ${salonId} não encontrado.`);
    }

    // Atualizar QR code nas configurações
    await this.prisma.salonSetting.upsert({
      where: { 
        salonId_key: {
          salonId,
          key: 'whatsappQrCode'
        }
      },
      create: {
        salonId,
        key: 'whatsappQrCode',
        value: qrCode
      },
      update: {
        value: qrCode
      }
    });

    // Atualizar status para PENDING_QR se tiver QR code
    if (qrCode) {
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
    }

    return { success: true };
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

    const instanceName = `salon_${salonId.replace(/-/g, "")}_${Date.now()}`;

    // Url hardcoded do webhook para teste direto
    const webhookUrl = "https://n8n.evergreenmkt.com.br/webhook-test/cria-instancia-salaoai";
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
          value: 'CONNECTING'
        },
        update: {
          value: 'CONNECTING'
        }
      });
      
      return {
        success: true,
        salonId,
        phone,
        instanceName,
        directCall: true
      };
    } catch (error) {
      this.logger.error(`Erro na chamada direta: ${error.message}`);
      throw new BadRequestException(`Falha na chamada direta ao webhook: ${error.message}`);
    }
  }
}