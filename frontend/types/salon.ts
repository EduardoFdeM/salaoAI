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
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  observations?: string | null;
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
  salon_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  price: number;
  notes?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  
  // Campos populados (opcional)
  client?: Client;
  professional?: Professional;
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

  // Campos do User podem ser úteis aqui se populados pela API
  name?: string;
  email?: string;
  phone?: string;
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