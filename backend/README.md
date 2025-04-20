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
