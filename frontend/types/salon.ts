/**
 * Tipos relacionados aos salões, serviços, profissionais, etc.
 * Adaptado de frontend/src/types/salon.ts
 */
import { UserRole } from './auth'; // Assume que UserRole já existe em frontend-new/types/auth.ts

/**
 * Representa um salão no sistema
 */
export interface Salon {
  /** Identificador único do salão */
  id: string;
  
  /** Nome do salão */
  name: string;
  
  /** ID do proprietário do salão */
  owner_id: string; // Ajustar se o tipo for diferente (e.g., User ID)
  
  /** Endereço completo do salão */
  address: string | null;
  
  /** Lista de telefones de contato */
  phones: string[] | null;
  
  /** Indica se o salão está ativo no sistema */
  active: boolean;

  // Adicionar outros campos conforme necessário (ex: logo_url, etc.)
  logo_url?: string; 
  owner_name?: string; // Pode ser útil
  email?: string; // Email de contato do salão
  status?: SalonStatus; // Status geral
  subscription_active?: boolean; // Status da assinatura
}

/**
 * Status possíveis de um salão
 */
export enum SalonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Serviço oferecido por um salão
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number; // Usar number para valores monetários
  duration: number; // Em minutos
  salon_id: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Profissional vinculado a um salão
 */
export interface Professional {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    specialties?: string[]; // Ex: ['Corte', 'Coloração']
    availability?: BusinessHours; // Horários específicos do profissional
    user_id: string; // ID do usuário correspondente
    salon_id: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Cliente de um salão
 */
export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone: string; // Telefone principal (WhatsApp)
  observations?: string;
  salon_id: string;
  created_at?: string;
  updated_at?: string;
  last_visit?: string;
}

/**
 * Status de um agendamento
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED_BY_CLIENT = 'cancelled_by_client',
  CANCELLED_BY_SALON = 'cancelled_by_salon',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show', // Cliente não compareceu
  WAITING = 'waiting', // Cliente chegou e está esperando
  IN_PROGRESS = 'in_progress', // Atendimento em andamento
}

/**
 * Agendamento no sistema
 */
export interface Appointment {
  id: string;
  start_time: string; // ISO 8601 string
  end_time: string; // ISO 8601 string
  client_id: string;
  professional_id: string;
  service_id: string;
  salon_id: string;
  status: AppointmentStatus;
  notes?: string; // Observações do agendamento
  created_at?: string;
  updated_at?: string;

  // Campos populados (opcional, depende da API)
  client?: Client;
  professional?: Professional;
  service?: Service;
}


/**
 * Usuário de um salão com permissões específicas (similar a User em auth.ts, mas pode ter detalhes específicos do contexto do salão)
 */
export interface SalonUser {
  id: string; // Geralmente o ID do User
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole; // PAPEL DENTRO DO SALÃO (Owner, Prof, Recep)
  active: boolean; // Status do vínculo com o salão
  salon_id: string; 
}

/**
 * Configurações de funcionamento do salão
 */
export interface SalonSettings {
  id: string; // ID do registro de configurações
  salon_id: string;
  business_hours: BusinessHours;
  appointment_interval: number; // Em minutos (ex: 15, 30)
  booking_lead_time: number; // Em horas (antecedência mínima para agendar)
  booking_cancel_limit: number; // Em horas (limite para cancelar)
  // notification_settings: NotificationSettings; // Descomentar se necessário
  active: boolean;
  updated_at?: string;

  // Configurações Evolution API
  evolution_api_url?: string;
  evolution_api_key?: string;
  evolution_instance_name?: string;

  // Configurações Bot IA
  ai_bot_model?: string; // Ex: 'mistralai/Mixtral-8x7B-Instruct-v0.1'
  ai_bot_prompt_template?: string;
  ai_bot_enabled?: boolean;
}

/**
 * Horários de funcionamento (pode ser usado para salão e profissionais)
 */
export interface BusinessHours {
  monday: DaySchedule | null; // null se fechado
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

/**
 * Horários de um dia específico
 */
export interface DaySchedule {
  isOpen: boolean; // Redundante se usamos null em BusinessHours, mas pode ser útil
  slots: TimeSlot[]; // Lista de horários de trabalho
}

/**
 * Representa um bloco de tempo de trabalho
 */
export interface TimeSlot {
  start: string; // Formato: HH:MM (ex: "09:00")
  end: string;   // Formato: HH:MM (ex: "18:00")
}


/**
 * Dados para formulários (exemplo, podem ser criados arquivos específicos)
 */

// Exemplo para formulário de Serviço
export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
}

// Exemplo para formulário de Cliente
export interface ClientFormData {
    name: string;
    phone: string;
    email?: string;
    observations?: string;
}

// Exemplo para formulário de Agendamento
export interface AppointmentFormData {
    start_time: Date; // Usar Date no formulário facilita com date pickers
    client_id: string;
    professional_id: string;
    service_id: string;
    status: AppointmentStatus;
    notes?: string;
}

// Exemplo para formulário de Configurações
export interface SettingsFormData {
  business_hours: BusinessHours;
  appointment_interval: number;
  booking_lead_time: number; 
  booking_cancel_limit: number; 
  
  evolution_api_url?: string;
  evolution_api_key?: string;
  evolution_instance_name?: string;

  ai_bot_model?: string;
  ai_bot_prompt_template?: string;
  ai_bot_enabled?: boolean;
}