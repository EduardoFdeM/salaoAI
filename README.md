# Agendamento-Cabelereiros

## Estrutura do Repositório

```bash
.
├── backend/
│   ├── src/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── appointments/
│   │   ├── clients/
│   │   ├── prisma/
│   │   ├── prisma-admin/
│   │   ├── salons/
│   │   ├── services/
│   │   ├── professionals/
│   │   ├── users/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── dist/
│   ├── node_modules/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── nest-cli.json
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── admin/
│   │   ├── salon/
│   │   ├── professional/
│   │   └── login/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── middleware.ts
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── eslint.config.js
│   ├── next-env.d.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   ├── .next/
│   └── .gitignore
├── docs/
│   ├── database-structure.md
│   ├── next-steps.md
│   ├── PRD.md
│   ├── access-profiles.md
│   └── user-flows.md
├── ngrok.yml
└── README.md
```

Sistema de agendamento e gerenciamento para salões de cabeleireiros e barbearias

## Descrição e Funcionalidades:

- Atendimento conversacional via whatsapp via texto e áudio

- Site landing page vendas

- Site acesso painel de controle estabelecimento

- Sistema de assinatura mensal

- Pagamento cartão de crédito (PIX posterior)

- Preenchimento via formulário personalizado do Onboarding após venda da assinatura, dados preenchidos vão alimentar banco de dados com informações do estabelecimento: informações gerais estabelecimento (para bot básico), endereço, horário de funcionamento, profissionais, serviços, tempo de cada serviço, valor de cada serviço, conexão profissional X serviço.

- Agendamento de horários de acordo com serviços

- Calendário criado para cada estabelecimento

- Cliente pode agendar, alterar ou cancelar horário

- Acesso para visualizar calendário diário, semanal, mensal via link, abre no navegador

- Envio de mensagens de confirmação de reserva

- Dados dos clientes serão armazenados em banco de dados (nome, número de WhatsApp, histórico de agendamentos simplificado, profissional, serviço)

- Análise de frequência X serviço do cliente para envio de mensagem para preenchimento de agenda

- WhatsApp cliente X WhatsApp Adm X WhatsApp profissionais:
  WhatsApp cliente: somente consultas e agendamentos
  WhatsApp Profissionais: pode consultar própria agenda de clientes (via link de agenda) e alterar agendamentos através de conversa natural
  WhatsApp Adm: Pode realizar consultas de todos os agendamentos geral estabelecimento, realizar alterações e cancelamentos

# Sistema de Gerenciamento de Salões de Cabeleireiro com IA

## Visão Geral

Este sistema oferece uma solução completa para gerenciamento de salões de cabeleireiro com integração ao WhatsApp e recursos de IA. O projeto está passando por uma atualização significativa com um novo frontend, que será integrado ao backend existente.

## Arquitetura

**Frontend (React/TypeScript)**: Interface web para administradores e salões
**Integração WhatsApp (Evolution API)**: Para comunicação com clientes via WhatsApp

## Principais Funcionalidades

### Para Clientes (via WhatsApp)

- Agendar serviços
- Consultar agendamentos
- Receber lembretes
- Cancelar ou reagendar serviços
- Consultar catálogo de serviços
- Tirar dúvidas via IA

### Para Salões (via Interface Web)

- Gerenciar profissionais
- Configurar serviços oferecidos
- Gerenciar agendamentos
- Visualizar histórico de clientes
- Acessar métricas de negócio
- Configurar mensagens automáticas

### Para Administradores

- Monitorar o sistema
- Gerenciar salões
- Acessar relatórios gerais
- Configurar sistema de IA

## Estado Atual do Projeto

O projeto está passando por uma modernização, com as seguintes características:

- **Frontend**: Completamente renovado usando React, TypeScript, e Vite
- **Backend**: Estrutura inicial em NestJS com os seguintes componentes implementados:
  - **Admin**: Módulo de administração do sistema com métricas básicas
  - **Prisma**: Configuração ORM para acesso ao banco de dados
  - **Prisma-Admin**: Interface administrativa para visualização e edição do banco
- **Em desenvolvimento**:
  - Módulos de Autenticação e Usuários
  - Módulos de domínio (Salões, Profissionais, Serviços, Agendamentos, Clientes)

## Componentes do Sistema

### Frontend (`/frontend`)

Interface web desenvolvida com React, TypeScript e Vite. Veja [documentação do frontend](frontend/README.md) para mais detalhes.

### Integrações

- **Evolution API**: Para integração com WhatsApp
- **DeepInfra API**: Para processamento de linguagem natural
- **Minio**: Para armazenamento de arquivos. (Mas não acho que será necessário)
- **MercadoPago**: Para processamento de pagamentos

### Detalhes das Integrações

#### Evolution API (WhatsApp)

A documentação detalhada da integração com o WhatsApp através da Evolution API está disponível em [Integração WhatsApp](core/integrations/README.md) e inclui:

- **URL Base**: `https://api.agendacabelereiro.com.br`
- **Exemplos de Endpoints**:
  - Criação de instância: `POST /instance/create`
  - Verificação de status: `GET /instance/connectionState/{instanceName}`
  - Envio de mensagens: `POST /message/sendText/{instanceName}`
- **Payloads**: Exemplos completos de requisições e respostas
- **Webhooks**: Estrutura para recebimento de mensagens
- **Autenticação**: Mecanismo de autenticação via token

#### DeepInfra API (LLM)

A documentação detalhada da integração com modelos de linguagem através da DeepInfra API está disponível em [Modelos de Linguagem](core/llm/README.md) e inclui:

- **URL Base**: `https://api.deepinfra.com/v1/openai/chat/completions`
- **Modelo Utilizado**: `mistralai/Mixtral-8x7B-Instruct-v0.1`
- **Exemplos de Payloads**:
  - Bot de Salão: Com informações contextuais de serviços e profissionais
  - Bot de Suporte: Para questões técnicas e administrativas
- **Tratamento de Erros**: Exemplos de respostas de erro e soluções
- **Exemplos de Prompts**: Templates utilizados para diferentes cenários

## Fluxos Principais

### Agendamento via WhatsApp

1. Cliente inicia conversa com número do salão
2. Bot de IA identifica intenção de agendamento
3. Bot apresenta serviços disponíveis
4. Cliente seleciona serviço desejado
5. Bot apresenta profissionais disponíveis
6. Cliente seleciona profissional
7. Bot mostra datas e horários disponíveis
8. Cliente confirma agendamento
9. Sistema registra e envia confirmação

### Gestão via Interface Web

1. Proprietário ou funcionário acessa plataforma
2. Visualiza dashboard com agendamentos do dia
3. Gerencia agendamentos (confirma, cancela, etc.)
4. Configura novos serviços ou profissionais
5. Acessa relatórios de desempenho

## Configuração e Instalação

### Requisitos

- Python 3.9+
- Node.js 16+
- PostgreSQL
- Redis

### Acessos para Teste

Para testar o sistema, utilize as seguintes credenciais:

#### Superusuário (Acesso Total)

- Email: superuser@example.com
- Senha: superuser123
- Role: SUPERUSER
- Permissões: Acesso total ao sistema, incluindo gerenciamento de usuários e configurações do bot

#### Administrador

- Email: admin@example.com
- Senha: admin123
- Role: ADMIN
- Permissões: Gerenciamento de salões, planos, relatórios e suporte

#### Dono de Salão

- Email: salon@example.com
- Senha: salon123
- Role: SALON_OWNER
- Permissões: Gerenciamento do próprio salão

#### Profissional

- Email: professional@example.com
- Senha: professional123
- Role: PROFESSIONAL
- Permissões: Gerenciamento da própria agenda

#### Recepcionista

- Email: receptionist@example.com
- Senha: receptionist123
- Role: RECEPTIONIST
- Permissões: Gerenciamento de agendamentos e clientes

Usuários de Teste:
  - Superusuário: superuser@example.com / superuser123
  - Admin: admin@example.com / admin123
Salão: Salão Beleza Total (ID: 64cc5f9b-7483-44ea-9d0a-b4d37563783f)
  - Dono Genérico: salon@example.com / salon123
  - Profissional Genérico: professional@example.com / professional123
  - Recepcionista Genérico: receptionist@example.com / receptionist123
  ---
  - Dona Específica: maria.dona@email.com / senha123
  - Profissional Específico 1: ana.pro@email.com / senha123
  - Profissional Específico 2: joao.pro@email.com / senha123
  - Recepcionista Específico: clara.recep@email.com / senha123
Clientes:
  - Fernanda Lima (11987654321)
  - Ricardo Alves (11912345678)
Agendamentos:
  - 7700de90... (CONFIRMED) - Fernanda Lima com Profissional ID ba097549...
  - edb1ec30... (PENDING) - Ricardo Alves com Profissional ID ce55e26a...
-------------------------------------------
Criando franquia de exemplo...
Franquia criada: Rede Beleza Brasil (ID: 588e4ed4-794d-425e-8518-96329790c7a6)
Dono de Franquia criado: franchise@example.com
Segundo salão criado: Beleza Total - Filial 2 (ID: ce8a6ef7-0a1f-4844-bd24-e9dd2a139ae1)
  - Franquia: Rede Beleza Brasil (ID: 588e4ed4-794d-425e-8518-96329790c7a6)
  - Dono de Franquia: franchise@example.com / franchise123

### Iniciar Frontend

```bash
# Na pasta frontend
cd frontend
npm run dev
```

### Iniciar backend

```bash
cd backend
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
# Interface administrativa do banco de dados (Prisma Admin)
# Acesse http://localhost:3000/prisma-admin após iniciar o servidor

# Ou use o Prisma Studio para uma interface alternativa
npx prisma studio
```

### Configurar Ngrok (para testes de webhook)

```bash
# Execute-o na pasta raiz do projeto onde está o arquivo ngrok.yml.
ngrok http 3333 --config=ngrok.yml
# Você também pode usar ngrok diretamente sem o arquivo de configuração:
ngrok http 3333
```

### Ambiente de Produção

```bash
# Deploy do Backend na Railway
railway up
# Deploy do Frontend na Vercel
cd frontend && vercel --prod
```

## Plano de Integração

Foi criado um plano detalhado de integração do frontend com o backend existente, que pode ser consultado em [next-steps.md](next-steps.md). Este plano inclui:

1. **Análise e Documentação**: Mapear endpoints, modelos e lacunas
2. **Configuração de Ambiente**: Ambiente de desenvolvimento e CI/CD
3. **Refatoração do Backend**: Adaptação de endpoints e melhorias
4. **Integração Frontend-Backend**: Implementação da autenticação e serviços
5. **Testes e Qualidade**: Testes automatizados e manuais
6. **Implantação**: Deploy do sistema completo
7. **Otimização Contínua**: Monitoramento e melhorias iterativas

## Deploy

### Backend (Railway)

O backend está configurado para deploy na Railway, que oferece:

- PostgreSQL e Redis gerenciados
- Escalabilidade automática
- CI/CD integrado

### Frontend (Vercel)

O frontend está configurado para deploy na Vercel, que oferece:

- Integração simples com repositórios Git
- Previews automáticos para branches
- Domínios personalizados e SSL

## Recursos Adicionais

- [Plano de Ação](next-steps.md): Passos detalhados para a integração e desenvolvimento
- [Documentação da API](core/README.md): Descrição dos endpoints disponíveis
- [Documentação do Frontend](frontend/README.md): Estrutura e funcionalidades da interface

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.
