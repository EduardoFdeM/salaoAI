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
  }
}
```

## Índices Recomendados
- `users`: email, phone
- `salons`: phone, email
- `salon_users`: (salon_id, user_id), (salon_id, role)
- `appointments`: (salon_id, start_time), (professional_id, start_time)
- `clients`: (salon_id, phone)

## Considerações
1. A estrutura suporta que um usuário seja dono/profissional/recepcionista em múltiplos salões
2. Cada salão mantém seu próprio registro de clientes
3. Preços e durações são específicos por profissional/serviço
4. Histórico de agendamentos é mantido para auditoria
5. Configurações de notificação são flexíveis por salão

## Futuras Expansões Possíveis
1. Sistema de fidelidade/pontos
2. Múltiplos serviços por agendamento
3. Pagamentos e comissões
4. Avaliações de atendimento
5. Produtos vendidos
6. Campanhas de marketing
