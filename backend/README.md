# Backend - Sistema de Agendamento para Cabeleireiros

API REST em NestJS para o sistema de agendamento de salões de beleza.

## Tecnologias

- NestJS 11
- Prisma ORM
- JWT para autenticação
- Swagger para documentação
- SQLite (dev) / PostgreSQL (prod)

## Estrutura da API

- Arquitetura modular com separação clara de responsabilidades
- REST API com suporte a JWT
- Documentação automática via Swagger
- Integração com banco de dados via Prisma

## Estrutura do Backend

```bash
backend/
├── src/
│   ├── admin/
│   │   ├── admin.controller.ts
│   │   ├── admin.module.ts
│   │   └── admin.service.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── appointments/
│   │   ├── appointments.module.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── clients/
│   │   ├── clients.controller.ts
│   │   ├── clients.module.ts
│   │   └── clients.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── prisma-admin/
│   │   ├── prisma-admin.controller.ts
│   │   ├── prisma-admin.module.ts
│   │   ├── prisma-admin.service.ts
│   │   └── prisma-admin.helpers.ts
│   ├── salons/
│   │   ├── salons.controller.ts
│   │   ├── salons.module.ts
│   │   └── salons.service.ts
│   ├── services/
│   │   ├── services.controller.ts
│   │   ├── services.module.ts
│   │   └── services.service.ts
│   ├── professionals/
│   │   ├── professionals.controller.ts
│   │   ├── professionals.module.ts
│   │   └── professionals.service.ts
│   └── users/
│       ├── users.controller.ts
│       ├── users.module.ts
│       ├── users.service.ts
│       ├── dto/
│       └── entities/
│   ├── app.module.ts
│   └── main.ts
├── views/
│   └── prisma-admin/
│       ├── index.hbs
│       ├── model.hbs
│       └── record.hbs
├── dist/
├── node_modules/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

## Configuração Rápida

```bash
# Instalação
npm install

# Desenvolvimento
npm run start:dev

# Build de produção
npm run build
npm run start:prod

# Testes
npm run test
```

### Para o "pgadmin" do prisma (CLI):

```
npx prisma studio
```

## Endpoints Principais

A documentação completa da API está disponível em `/api/docs` após iniciar o servidor.

## Painéis de Administração

- **API Docs**: `/api/docs` - Documentação interativa da API com Swagger
- **Prisma Studio**: Execute `npx prisma studio` para gerenciamento do banco de dados

## Considerações para Deploy

Utilize o Railway para fácil implantação com PostgreSQL integrado.


## Endpoints de Integração com WhatsApp (n8n)

### Endpoints do Backend (NestJS)
- `POST /api/whatsapp/webhook` - Recebe mensagens do WhatsApp
- `POST /api/whatsapp/create-appointment` - Cria agendamento via WhatsApp
- `POST /api/whatsapp/verify-client` - Verifica se número é cliente
- `POST /api/whatsapp/register-instance` - Registra instância do WhatsApp
- `GET /api/whatsapp/instance-status/:salonId` - Verifica status da instância
- `POST /api/whatsapp/qr-callback` - Recebe QR code para conexão
- `POST /api/whatsapp/schedule-notification` - Agenda notificações

### Endpoints do Frontend (Next.js)
- `POST /api/salon/connect-whatsapp` - Inicia processo de conexão
- `GET /api/salon/whatsapp-status` - Verifica status da conexão

### Configuração do N8N
- Porta padrão do n8n: 5678
- URLs de webhook no .env:
  - N8N_WHATSAPP_REGISTER_URL=https://n8n.evergreenmkt.com.br/webhook/whatsapp-register
  - N8N_NOTIFICATION_URL=https://n8n.evergreenmkt.com.br/webhook/whatsapp-notification

### Fluxos do N8N
1. **Fluxo de Recepção de Mensagens**: Recebe mensagens via webhook da Evolution API, processa com IA e envia para o backend
2. **Fluxo de Notificações**: Recebe pedidos de notificação do backend e envia mensagens via Evolution API
3. **Fluxo de Conexão**: Gerencia o processo de conexão com WhatsApp, incluindo geração e exibição de QR code
