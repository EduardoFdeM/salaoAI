export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  SALON_OWNER = 'SALON_OWNER',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST',
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  created_at?: string
  updated_at?: string
  last_login?: string
  is_active?: boolean
  permissions?: string[]
  salon_id?: string // ID do salão associado (para SALON_OWNER, PROFESSIONAL e RECEPTIONIST)
}

export interface AuthResponse {
  token: string
  user: User
}

// Permissões específicas para cada role
export const RolePermissions: Record<UserRole, string[]> = {
  SUPERUSER: [
    'manage:all',
    'manage:admins',
    'manage:salons',
    'manage:plans',
    'manage:bot',
    'view:metrics',
    'manage:support'
  ],
  ADMIN: [
    'manage:salons',
    'manage:plans',
    'view:metrics',
    'manage:support'
  ],
  SALON_OWNER: [
    'manage:own_salon',
    'manage:professionals',
    'manage:services',
    'view:own_metrics',
    'manage:appointments',
    'manage:whatsapp'
  ],
  PROFESSIONAL: [
    'manage:own_schedule',
    'view:own_appointments',
    'manage:own_clients'
  ],
  RECEPTIONIST: [
    'manage:appointments',
    'view:salon_schedule',
    'manage:clients'
  ]
}