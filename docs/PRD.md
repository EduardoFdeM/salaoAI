# Documento de Requisitos do Produto (PRD)

## Visão Geral

Sistema SaaS para gestão de salões de beleza, focado em agendamentos e gestão de clientes.

## Objetivos

1. Simplificar o processo de agendamento
2. Reduzir faltas e cancelamentos
3. Melhorar a gestão do salão
4. Aumentar a satisfação dos clientes

## Personas e Níveis de Acesso

### Staff SaaS (Nível 5)

- Acesso total ao sistema
- Gerenciamento de salões
- Configurações globais
- Métricas e relatórios globais
- Suporte técnico avançado

### Proprietário do Salão (Nível 4)

- Gerenciamento completo do seu salão
- Acesso a todas as configurações do estabelecimento
- Relatórios financeiros e métricas
- Gestão de funcionários
- Definição de políticas e preços

### Gerente/Recepcionista (Nível 3)

- Gestão da agenda
- Atendimento ao cliente
- Cadastro de clientes
- Controle de caixa
- Relatórios operacionais

### Profissional (Nível 2)

- Visualização da própria agenda
- Gestão de horários disponíveis
- Registro de atendimentos
- Histórico de clientes atendidos
- Comissões e métricas pessoais

### Cliente (Nível 1) - Futuro

- Agendamento online
- Histórico de atendimentos
- Avaliações
- Fidelidade e promoções

## Estrutura de Dados Base

### Salão (Tenant)

- Informações básicas
- Configurações
- Horários de funcionamento
- Políticas de cancelamento

### Usuário

- Dados pessoais
- Nível de acesso
- Vínculo com salão(ões)
- Preferências

### Serviço

- Nome e descrição
- Duração
- Preço
- Profissionais habilitados

### Agendamento

- Cliente
- Profissional
- Serviço(s)
- Data/Hora
- Status

## Funcionalidades por Nível

### Nível 5 (Staff SaaS)

- Dashboard global
- Gestão de tenants
- Suporte técnico
- Configurações do sistema

### Nível 4 (Proprietário)

- Gestão financeira
- Relatórios avançados
- Configuração do salão
- Gestão de equipe

### Nível 3 (Gerente/Recepcionista)

- Agenda completa
- Caixa e pagamentos
- Cadastros gerais
- Relatórios básicos

### Nível 2 (Profissional)

- Agenda pessoal
- Atendimentos
- Comissões
- Disponibilidade

### Nível 1 (Cliente) - Futuro

- Agendamento
- Histórico
- Avaliações
- Fidelidade

## Stack Tecnológica Atualizada

### Frontend

- Next.js 14 (App Router)
- TypeScript
- TanStack Query
- Tailwind CSS
- Shadcn/ui
- React Hook Form + Zod
- JWT para autenticação

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Redis (cache)
- JWT + RBAC

### Infraestrutura

- Vercel para deploy do front
- Railway para deploy do back + db
- GitHub Actions para CI/CD

## Próximos Passos

### Fase 1 - Base (4 semanas)

1. Setup inicial com Next.js e autenticação
2. Implementação do RBAC
3. Layout base responsivo
4. Componentes core

### Fase 2 - Core (6 semanas)

1. Sistema de agendamentos
2. Gestão de usuários e acessos
3. Cadastros básicos
4. Dashboard inicial

### Fase 3 - Avançado (8 semanas)

1. Relatórios e métricas
2. Sistema financeiro
3. Notificações
4. Integrações

## Métricas de Sucesso

- Taxa de adoção por salões
- Redução de faltas
- Satisfação dos usuários
- Tempo médio de uso
- Taxa de retenção
