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

## Armazenamento de Imagens de Profissionais (Avatares)

Atualmente, as imagens de avatar dos usuários (profissionais) são armazenadas localmente no servidor do backend.

### Configuração Atual

- **Pasta de Upload:** As imagens são salvas em `./uploads/avatars/`. Certifique-se de que esta pasta exista na raiz do projeto backend.
- **Servidor Estático:** O NestJS está configurado em `src/app.module.ts` usando `ServeStaticModule` para servir arquivos da pasta `uploads` através da URL base `/uploads`. Por exemplo, um arquivo salvo como `./uploads/avatars/avatar-123.jpg` pode ser acessado publicamente via `http://<BACKEND_URL>/uploads/avatars/avatar-123.jpg`.
- **Banco de Dados:** O caminho relativo do arquivo (ex: `/uploads/avatars/avatar-123.jpg`) é armazenado no campo `imageUrl` da tabela `User`.

### Upload

O endpoint `POST /api/professionals/upload-image/:userId` recebe um arquivo (`multipart/form-data`) no campo `imageFile`, salva-o localmente com um nome único e atualiza o campo `imageUrl` do `User` correspondente.

## Futuro: Migração para Armazenamento em Nuvem (Ex: S3)

Para maior escalabilidade e resiliência, recomenda-se migrar o armazenamento de imagens para um serviço de nuvem como AWS S3, Google Cloud Storage ou similar. Passos gerais para a migração:

1.  **Configurar Provedor de Nuvem:** Escolha um provedor, crie um bucket/storage e configure as credenciais de acesso (chaves de API, etc.) de forma segura no backend (usando variáveis de ambiente e `ConfigService`).
2.  **Instalar SDK:** Instale o SDK apropriado no backend (ex: `npm install @aws-sdk/client-s3`).
3.  **Modificar Serviço de Upload:** Altere a lógica em `ProfessinalsService` (ou crie um serviço de upload dedicado). Em vez de usar `fs` para salvar localmente, use o SDK do provedor para fazer o upload do buffer do arquivo recebido para o bucket na nuvem.
4.  **Atualizar URL no DB:** Salve a URL pública completa retornada pelo provedor de nuvem no campo `User.imageUrl` no banco de dados.
5.  **Remover Servidor Estático:** Remova a configuração do `ServeStaticModule` de `src/app.module.ts`, pois os arquivos não serão mais servidos localmente.
6.  **Ajustar Frontend (se necessário):** Garanta que o frontend esteja usando a URL completa retornada pela API ao exibir as imagens.
7.  **(Opcional) Migrar Arquivos Existentes:** Crie um script para fazer o upload dos arquivos existentes na pasta `./uploads/avatars` para o bucket na nuvem e atualizar os respectivos campos `imageUrl` no banco de dados.
