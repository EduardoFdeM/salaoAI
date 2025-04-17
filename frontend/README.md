# Frontend do Sistema de Agendamento para Cabeleireiros (SaaS)

## Sobre o Projeto

Interface web do sistema de gerenciamento de agendamentos em salões de beleza, parte do sistema SaaS completo. Para informações gerais do projeto e perfis de acesso, consulte a [documentação principal](../README.md).

### Tecnologias Principais

- Next.js 14 com TypeScript
- TanStack Query para gerenciamento de estado
- Tailwind CSS para estilização
- Shadcn/ui para componentes base
- JWT para autenticação
- React Hook Form + Zod para formulários

## Estrutura do Projeto

```
frontend/
├── app/                 # Rotas e páginas (Next.js App Router)
│   ├── api/             # API routes para mocks durante desenvolvimento
│   ├── admin/           # Área administrativa
│   ├── salon/           # Área de salão (compartilhada entre dono e recepcionista)
│   ├── professional/    # Área do profissional
│   └── login/           # Página de login
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React
├── lib/                # Utilitários e configurações
├── hooks/              # Hooks customizados
├── types/              # Tipagens TypeScript
└── middleware.ts       # Middleware do Next.js para proteção de rotas
```

## Arquitetura do Sistema

### Autenticação e Autorização

- JWT para autenticação
- Cookies e localStorage para persistência
- Middleware para proteção de rotas
- Verificação de permissões nos layouts

### Abordagem de Interface Compartilhada

- Estrutura unificada para donos de salão e recepcionistas
- Conteúdo condicional baseado no papel do usuário
- Redirecionamento inteligente baseado em perfil

## Configuração do Ambiente

1. Instalar dependências:

```bash
npm install
```

2. Rodar em desenvolvimento:

```bash
npm run dev
```

## Progresso de Implementação

### Fase 1 - Estrutura Base

- [x] Setup inicial do Next.js
- [x] Configuração do TypeScript
- [x] Estrutura de diretórios
- [x] Configuração de autenticação JWT
- [ ] Layout base responsivo
- [ ] Componentes base

### Fase 2 - Funcionalidades Core

- [ ] Sistema de agendamentos
- [ ] Gestão de usuários e acessos
- [ ] Cadastros básicos
- [ ] Dashboard inicial

### Fase 3 - Recursos Avançados

- [ ] Relatórios e métricas
- [ ] Sistema financeiro
- [ ] Notificações
- [ ] Integrações
