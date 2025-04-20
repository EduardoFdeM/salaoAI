# Plano de Ação para Integração do Frontend com Backend

## Status Atual (Atualizado)

- ### Módulos do Backend Implementados
- - [x] Configuração da estrutura básica NestJS
- - [x] Módulo Admin (admin.module.ts, admin.service.ts, admin.controller.ts)
- - [x] Módulo Prisma (prisma.module.ts, prisma.service.ts)
- - [x] Módulo Prisma-Admin (prisma-admin.module.ts, prisma-admin.service.ts, prisma-admin.controller.ts, prisma-admin.helpers.ts)
- - [x] Visualização do Prisma Admin (views/prisma-admin/index.hbs, model.hbs, record.hbs)
- - [ ] Módulo de Usuários (estrutura criada, mas arquivos vazios)
- - [ ] Módulo de Autenticação (estrutura criada, mas arquivos vazios)
-
- ### Próximos Módulos a Serem Implementados
- - [ ] Módulo de Salões (estrutura vazia existente)
- - [ ] Módulo de Profissionais (estrutura vazia existente)
- - [ ] Módulo de Serviços (estrutura vazia existente)
- - [ ] Módulo de Agendamentos (estrutura vazia existente)
- - [ ] Módulo de Clientes (estrutura vazia existente)
-

## Fase 1: Nivelando o terreno

### 1.1 Inventário e Mapeamento

- [x] Mapear a estrutura do frontend
  - [x] Verificar estruturas obsoletas e redundântes, e sugerir melhorias
  - [x] Verificar se há estruturas que podem ser reutilizadas
  - [x] Verificar se há estruturas que podem ser deletadas
- [x] Reestruturar o repositório do frontend (se necessário)
- [x] Comentar todas as linhas, funções, classes e métodos de todos os arquivos do frontend
- [x] Revisar o README do frontend
- [x] Revisar o README do projeto

### 1.2 Documentação do Frontend

- [x] Documentar toda estrutura do frontend (componentes, páginas, serviços, contextos, etc)
- [x] Mapear fluxos de usuário e requisitos de dados

## Fase 2: Frontend

### 2.1 Melhorias de UI/UX

- [x] Melhorar responsividade das páginas
  - [x] Agendamentos
  - [x] Profissionais
- [ ] Implementar modo escuro
- [ ] Melhorar acessibilidade

### 2.2 Melhorar telas por perfil

- [ ] Melhorar o acesso do ADMIN
- [x] Melhorar o acesso do SALON_OWNER
  - [x] Página de Profissionais
  - [x] Página de Agendamentos
- [ ] Melhorar o acesso do PROFESSIONAL
- [ ] Melhorar o acesso do RECEPTIONIST

## Fase 3: Backend

### 3.1 Planejar o Backend

- [x] Definir stack tecnológica (NestJS + Prisma)
- [x] Planejar a arquitetura do banco de dados

* - [x] Configurar estrutura base do projeto NestJS
* - [x] Configurar módulo Prisma
* - [x] Implementar módulo Admin e Prisma-Admin

- [ ] Definir estrutura de módulos

* - [x] Estrutura de pastas dos módulos criada
  - [ ] Módulo de autenticação
* - [ ] Implementar auth.service.ts
* - [ ] Implementar auth.controller.ts

- [ ] Módulo de usuários

* - [ ] Implementar users.service.ts
* - [ ] Implementar users.controller.ts
* - [ ] Criar DTOs de usuário

- [ ] Módulo de salões
- [ ] Módulo de profissionais
- [ ] Módulo de serviços
- [ ] Módulo de agendamentos
- [ ] Módulo de clientes
- [ ] Mapear endpoints necessários
- [ ] Definir estratégia de autenticação e autorização (JWT)
- [ ] Planejar integração com serviços externos (n8n, webhooks, etc.)

### 3.2 Configuração Inicial do Backend

- [x] Iniciar projeto NestJS
- [x] Configurar Prisma ORM

* - [x] Configurar serviço Prisma no NestJS
  - [ ] Definir schema do Prisma baseado na documentação
  - [ ] Gerar primeira migration
  - [ ] Configurar client do Prisma

- [ ] Implementar módulo de autenticação
  - [ ] Estratégia de JWT
  - [ ] Guards para rotas protegidas
  - [ ] Refresh tokens
- [ ] Configurar validação com class-validator
- [ ] Definir estrutura de DTOs (Data Transfer Objects)
- [ ] Implementar sistema de logging

* - [x] Configurar documentação automática com Swagger (em main.ts)

### 3.3 Implementação Core

- [ ] Implementar CRUD de usuários

* - [ ] Modelo de usuário no Prisma
* - [ ] DTOs de criação, atualização e filtro
* - [ ] Serviço de usuários com métodos CRUD
* - [ ] Controlador com endpoints REST

- [ ] Implementar CRUD de salões
- [ ] Implementar CRUD de profissionais
- [ ] Implementar CRUD de serviços
- [ ] Implementar CRUD de agendamentos
- [ ] Implementar CRUD de clientes

### 3.4 Implementação de Regras de Negócio

- [ ] Lógica de disponibilidade de agendamentos
- [ ] Lógica de notificações
- [ ] Lógica de permissões
- [ ] Integração com webhooks para n8n

### 3.5 Arquitetura para Futuras Expansões

- [ ] Desenhar arquitetura para integrações com microserviços
  - [ ] Sistema de mensageria com RabbitMQ para comunicação assíncrona
  - [ ] API Gateway para gerenciar microserviços
  - [ ] Contratos de API para interoperabilidade
- [ ] Planejamento para futuros microserviços
  - [ ] Serviço de IA/Chatbot (potencialmente em Python)
  - [ ] Serviço de relatórios
  - [ ] Serviço de pagamentos

### 3.6 Testes

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes e2e

## Fase 4: Integração Front-Back

### 4.1 Configuração

- [ ] Configurar ambiente de desenvolvimento para integração
- [ ] Implementar serviços de API no frontend
- [ ] Configurar interceptores para tokens

### 4.2 Integração por Módulos

- [ ] Autenticação e Usuários
- [ ] Salões
- [ ] Profissionais
- [ ] Serviços
- [ ] Agendamentos
- [ ] Clientes

## Fase 5: Testes e Refinamento

### 5.1 Testes de Integração

- [ ] Testes manuais por fluxo de usuário
- [ ] Testes de performance
- [ ] Testes de usabilidade

### 5.2 Refinamento

- [ ] Otimização de carregamento
- [ ] Melhorias de UI baseadas em feedback
- [ ] Correção de bugs
- [ ] Otimização de queries

## Fase 6: Implantação

### 6.1 Preparação

- [ ] Configurar banco de dados de produção (PostgreSQL)
- [ ] Configurar serviços externos em produção (n8n, webhooks, pagamentos)
- [ ] Preparar scripts de migração de dados
- [ ] Definir estratégia de rollback

### 6.2 Deploy

- [ ] Implantar backend na Railway
- [ ] Implantar frontend na Vercel
- [ ] Verificar configurações de CORS e segurança
- [ ] Configurar domínios e certificados SSL

### 6.3 Pós-Implantação

- [ ] Monitorar desempenho e erros
- [ ] Realizar ajustes finais
- [ ] Documentar processos de manutenção
- [ ] Treinar equipe para suporte

## Estratégia de Deploy

### Frontend (Vercel)

- Configurar projeto no Vercel conectado ao repositório Git
- Configurar variáveis de ambiente necessárias (NEXT_PUBLIC_API_URL)
- Utilizar domínio personalizado e configurar SSL
- Configurar previews automáticos para branches de desenvolvimento

### Backend (Railway)

- Configurar projeto no Railway conectado ao repositório Git
- Configurar serviços necessários:
  - PostgreSQL
  - Redis (cache)
  - Serviço web (NestJS)
  - RabbitMQ (para comunicações assíncronas futuras)
- Configurar variáveis de ambiente
- Configurar domínio para a API
- Implementar health checks e auto-restart

### Considerações de Segurança

- Configurar CORS apropriadamente
- Implementar rate limiting
- Configurar headers de segurança (Helmet)
- Revisar permissões e exposição de endpoints
- Implementar throttling para prevenção de ataques de força bruta
- Validação de entrada em todos os endpoints
- Implementar proteção contra ataques comuns (SQL Injection, XSS, CSRF)
