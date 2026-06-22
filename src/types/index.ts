// src/types/index.ts

export interface User {
  id: string;
  email: string;
  full_name?: string;
  student_id?: string;
  university?: string;
  avatar_url?: string;
  banner_url?: string;
  currency: string;
  monthly_budget: number;
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
  two_factor_enabled?: boolean;
  role?: string; // 👈 NUEVO: rol del usuario ('admin' | 'user')
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  student_id?: string;
  university?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  refresh_token?: string;
  requires_2fa?: boolean;
  temp_token?: string;
}

// Interfaz para respuesta de verificación 2FA
export interface TwoFactorVerifyResponse {
  success: boolean;
  access_token: string;
  refresh_token?: string;
  user: User;
}

// Interfaz para configuración de 2FA
export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
  manual_key: string;
}

// Interfaz para estado de 2FA
export interface TwoFactorStatusResponse {
  enabled: boolean;
}

// Tipo para actualización de perfil
export interface ProfileUpdateData {
  full_name?: string;
  student_id?: string;
  university?: string;
  currency?: string;
  monthly_budget?: number;
  avatar_url?: string;
  banner_url?: string;
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
}

// Tipo para estadísticas
export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
  byCategory?: Record<string, number>;
}

// Tipo para respuestas de API
export interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}

// ============================================
// NUEVOS TIPOS PARA ADMINISTRACIÓN
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

export interface AdminUserUpdate {
  role?: 'user' | 'admin';
  full_name?: string;
  email?: string;
}

// ============================================
// TIPOS PARA PASSEY (WEBAUTHN)
// ============================================

export interface PasskeyCredential {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface PasskeyStatusResponse {
  enabled: boolean;
  count: number;
  credentials: PasskeyCredential[];
}

// ============================================
// TIPOS PARA CATEGORÍAS PERSONALIZADAS
// ============================================

export interface CategoryCreate {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
}

// ============================================
// TIPOS PARA PRESUPUESTOS
// ============================================

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCreate {
  category: string;
  amount: number;
  period?: 'monthly' | 'yearly';
}

export interface BudgetUpdate {
  amount?: number;
  period?: 'monthly' | 'yearly';
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

// ============================================
// TIPOS PARA SESIONES
// ============================================

export interface Session {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
}

export interface LoginHistory {
  id: string;
  login_type: string;
  ip_address: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  location: string;
  status: string;
  created_at: string;
}

export interface SecurityChange {
  id: string;
  change_type: string;
  old_value: string | null;
  new_value: string | null;
  ip_address: string;
  location: string;
  status: string;
  created_at: string;
}

export interface SecurityStats {
  total_logins: number;
  unique_devices: number;
  last_login: {
    date: string;
    device: string;
    ip: string;
  } | null;
  security_score: number;
  recommendations: string[];
}

// ============================================
// TIPOS PARA NOTIFICACIONES
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'security';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ============================================
// TIPOS PARA ESTADÍSTICAS DE SEGURIDAD
// ============================================

export interface SecurityEvent {
  eventType: 'login' | 'password_change' | '2fa_enable' | '2fa_disable' | 'session_revoked' | 'new_device';
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}