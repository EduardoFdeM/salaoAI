/**
 * Tipos relacionados aos salões, serviços, profissionais, etc.
 * Adaptado de frontend/src/types/salon.ts
 */
import { UserRole } from './auth'; // Assume que UserRole já existe

/**
 * Representa um salão no sistema
 */
export interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string | null;
  business_hours: BusinessHours;
  notification_settings: object;
  version: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Status de um agendamento
 */
export enum AppointmentStatus {
  PENDING = 'PENDING',           // Pendente (criado, aguardando confirmação inicial talvez)
  SCHEDULED = 'SCHEDULED',       // Agendado (confirmado inicialmente, mas não confirmado final)
  CONFIRMED = 'CONFIRMED',       // Confirmado (pelo cliente/salão)
  WAITING = 'WAITING',           // Cliente chegou e está aguardando
  IN_PROGRESS = 'IN_PROGRESS',   // Em atendimento
  COMPLETED = 'COMPLETED',       // Concluído
  CANCELLED = 'CANCELLED',       // Cancelado (genérico, pode ser substituído pelos específicos)
  CANCELLED_BY_CLIENT = 'CANCELLED_BY_CLIENT', // Cancelado pelo Cliente
  CANCELLED_BY_SALON = 'CANCELLED_BY_SALON',   // Cancelado pelo Salão
  NO_SHOW = 'NO_SHOW',           // Não Compareceu
}

/**
 * Serviço oferecido por um salão
 */
export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  version: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Profissional vinculado a um salão (representado por SalonUser)
 */
export interface Professional {
  id: string;
  user_id: string;
  salon_id: string;
  role: string;
  working_hours?: BusinessHours;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Campos populados
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Representa o serviço específico de um profissional
 */
export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_id: string;
  price: number;
  duration_minutes: number;
  version: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Cliente de um salão
 */
export interface Client {
  id: string;
  salon_id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  last_visit?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Agendamento no sistema
 */
export interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: number;
  notes?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  
  // Campos populados (opcional)
  client?: Client;
  professional?: SalonUser;
  service?: Service;
}

/**
 * Horários de funcionamento
 */
export interface BusinessHours {
  monday: DaySchedule | null;
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
  isOpen: boolean;
  slots: TimeSlot[];
}

/**
 * Representa um bloco de tempo de trabalho
 */
export interface TimeSlot {
  start: string; // Formato: HH:MM
  end: string;   // Formato: HH:MM
}

// Formulários
export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
}

export interface ClientFormData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface AppointmentFormData {
  start_time: Date;
  client_id: string;
  professional_id: string;
  service_id: string;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
}

/**
 * Usuário de um salão com permissões específicas (SalonUser do backend)
 */
export interface SalonUser {
  id: string; // ID do SalonUser
  userId: string; // ID do User
  salonId: string;
  role: UserRole; // PAPEL DENTRO DO SALÃO (Owner, Prof, Recep)
  active: boolean;
  workingHours?: BusinessHours; // Prisma tem como Json?
  created_at?: string;
  updated_at?: string;

  // Campos do User populados pela API
  name?: string; // Nome pode vir direto ou do user
  email?: string; // Email pode vir direto ou do user
  phone?: string; // Telefone pode vir direto ou do user

  // Adicionando o objeto user populado
  user?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    // Adicione outros campos do User se necessário
  };
}

/**
 * Configurações de Salão (baseado em múltiplos SalonSetting do backend)
 */
export interface SalonSettingsData {
  business_hours?: BusinessHours;
  appointment_interval?: number;
  booking_lead_time?: number;
  booking_cancel_limit?: number;
  // notification_settings?: any; // Definir tipo se necessário

  // Configurações Evolution API / WhatsApp (agrupadas do Salon model)
  evolution_api_url?: string; // Não está no schema Prisma
  evolution_api_key?: string; // Não está no schema Prisma
  evolution_instance_name?: string; // Está no Salon
  whatsappPhone?: string; // Está no Salon
  whatsappStatus?: string; // Está no Salon
  whatsappQrCode?: string; // Está no Salon

  // Configurações Bot IA (agrupadas de SalonSetting?)
  ai_bot_model?: string;
  ai_bot_prompt_template?: string;
  ai_bot_enabled?: boolean;
}

// Agrupando configurações para o formulário
export interface SettingsFormData extends SalonSettingsData {}