# Estrutura do Banco de Dados

## Visão Geral

Este documento descreve a estrutura do banco de dados do sistema de agendamento de cabeleireiros. A estrutura foi projetada para suportar múltiplos salões, profissionais, clientes e agendamentos, mantendo a flexibilidade para futuras expansões.

## Tabelas Principais

### users

Armazena todos os usuários do sistema (admin, donos de salão, profissionais, recepcionistas).

```sql
users
- id (PK)
- name
- email (unique)
- phone (unique)
- password_hash
- created_at
- updated_at
- active
```

### salons

Armazena informações dos salões.

```sql
salons
- id (PK)
- name
- address
- phone
- email
- logo_url
- business_hours (JSON) # Horário de funcionamento do salão
- notification_settings (JSON) # Configurações de notificação
- created_at
- updated_at
- active
```

### salon_users

Relacionamento entre usuários e salões, definindo papéis e permissões.

```sql
salon_users
- id (PK)
- user_id (FK)
- salon_id (FK)
- role (enum: 'owner', 'professional', 'receptionist')
- working_hours (JSON) # Horário de atendimento (para profissionais)
- created_at
- updated_at
- active
```

### services

Catálogo de serviços oferecidos pelos salões.

```sql
services
- id (PK)
- salon_id (FK)
- name
- description
- created_at
- updated_at
- active
```

### professional_services

Relaciona profissionais com serviços, incluindo preço e duração específicos.

```sql
professional_services
- id (PK)
- professional_id (FK -> salon_users.id)
- service_id (FK)
- price
- duration_minutes
- created_at
- updated_at
- active
```

### clients

Clientes dos salões (cada salão mantém seu próprio registro de clientes).

```sql
clients
- id (PK)
- salon_id (FK)
- name
- phone
- email
- notes
- created_at
- updated_at
```

### appointments

Agendamentos de serviços.

```sql
appointments
- id (PK)
- salon_id (FK)
- client_id (FK)
- professional_id (FK -> salon_users.id)
- service_id (FK)
- start_time
- end_time
- status (enum: 'pending', 'confirmed', 'completed', 'cancelled')
- price # Preço no momento do agendamento
- notes
- created_at
- updated_at
```

### appointment_history

Histórico de alterações em agendamentos.

```sql
appointment_history
- id (PK)
- appointment_id (FK)
- status
- notes
- changed_by_user_id (FK -> users.id)
- created_at
```

## Tabelas para Funcionalidades Avançadas

### chatbot_conversations

Histórico de conversas com chatbots.

```sql
chatbot_conversations
- id (PK)
- client_id (FK)
- salon_id (FK)
- start_time
- end_time
- status (enum: 'active', 'completed', 'failed')
- source (enum: 'whatsapp', 'website', 'app')
- created_at
- updated_at
```

### chatbot_messages

Mensagens individuais das conversas com chatbots.

```sql
chatbot_messages
- id (PK)
- conversation_id (FK -> chatbot_conversations.id)
- sender_type (enum: 'client', 'bot')
- content
- timestamp
- intent (optional) # Intenção identificada pelo chatbot
- created_at
```

### webhooks

Configurações de webhooks para integrações.

```sql
webhooks
- id (PK)
- salon_id (FK)
- name
- event_type (enum: 'appointment_created', 'appointment_updated', 'client_created', etc)
- target_url
- headers (JSON)
- active
- secret_key
- created_at
- updated_at
```

### webhook_deliveries

Histórico de entregas de webhooks.

```sql
webhook_deliveries
- id (PK)
- webhook_id (FK)
- event_id
- payload (JSON)
- response_code
- response_body
- status (enum: 'success', 'failed', 'pending')
- attempts
- last_attempt_at
- created_at
```

### subscription_plans

Planos de assinatura disponíveis para salões.

```sql
subscription_plans
- id (PK)
- name
- description
- features (JSON)
- price
- billing_cycle (enum: 'monthly', 'quarterly', 'yearly')
- active
- created_at
- updated_at
```

### salon_subscriptions

Assinaturas de salões.

```sql
salon_subscriptions
- id (PK)
- salon_id (FK)
- plan_id (FK -> subscription_plans.id)
- status (enum: 'active', 'cancelled', 'past_due', 'trialing')
- start_date
- end_date
- trial_end_date
- created_at
- updated_at
```

### payments

Histórico de pagamentos.

```sql
payments
- id (PK)
- salon_id (FK)
- subscription_id (FK -> salon_subscriptions.id)
- amount
- status (enum: 'pending', 'completed', 'failed', 'refunded')
- payment_method
- transaction_id
- notes
- created_at
- updated_at
```

### salon_settings

Configurações específicas do salão, incluindo integrações e personalização.

```sql
salon_settings
- id (PK)
- salon_id (FK)
- key
- value (TEXT/JSON)
- created_at
- updated_at
```

### reports

Relatórios gerados pelo sistema.

```sql
reports
- id (PK)
- salon_id (FK)
- title
- type (enum: 'financial', 'appointments', 'clients', 'professionals')
- parameters (JSON)
- result_url
- status (enum: 'pending', 'completed', 'failed')
- created_by_user_id (FK -> users.id)
- created_at
- updated_at
```

## Estruturas JSON

### business_hours

```json
{
  "monday": { "start": "09:00", "end": "18:00" },
  "tuesday": { "start": "09:00", "end": "18:00" },
  ...
  "sunday": { "start": null, "end": null }
}
```

### working_hours

```json
{
  "monday": [
    { "start": "09:00", "end": "12:00" },
    { "start": "14:00", "end": "18:00" }
  ],
  ...
}
```

### notification_settings

```json
{
  "appointments": {
    "notify_owner": true,
    "notify_receptionist": true,
    "auto_confirm": false,
    "confirmation_timeout_minutes": 60
  },
  "chatbot": {
    "enabled": true,
    "auto_respond": true,
    "notify_receptionist_on_failure": true
  }
}
```

### webhook_headers

```json
{
  "Authorization": "Bearer token123",
  "Content-Type": "application/json",
  "X-Custom-Header": "custom-value"
}
```

### subscription_features

```json
{
  "max_professionals": 10,
  "max_services": 50,
  "analytics": true,
  "chatbot": true,
  "advanced_reports": false,
  "white_label": false
}
```

## Índices Recomendados

- `users`: email, phone
- `salons`: phone, email
- `salon_users`: (salon_id, user_id), (salon_id, role)
- `appointments`: (salon_id, start_time), (professional_id, start_time)
- `clients`: (salon_id, phone)
- `chatbot_conversations`: (salon_id, client_id), (salon_id, status)
- `chatbot_messages`: (conversation_id, timestamp)
- `webhooks`: (salon_id, event_type)
- `salon_subscriptions`: (salon_id, status)
- `payments`: (salon_id, status), (subscription_id)

## Considerações

1. A estrutura suporta que um usuário seja dono/profissional/recepcionista em múltiplos salões
2. Cada salão mantém seu próprio registro de clientes
3. Preços e durações são específicos por profissional/serviço
4. Histórico de agendamentos é mantido para auditoria
5. Configurações de notificação são flexíveis por salão
6. Sistema de webhooks permite integrações externas (n8n, etc.)
7. Arquitetura preparada para funcionalidades futuras (chatbot, relatórios, pagamentos)

## Futuras Expansões Possíveis

1. Sistema de fidelidade/pontos
2. Múltiplos serviços por agendamento
3. Métricas de performance por profissional
4. Avaliações de atendimento
5. Produtos vendidos
6. Campanhas de marketing
