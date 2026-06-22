// src/services/twoFactorService.ts
import api from './api';
import type { TwoFactorSetupResponse, TwoFactorStatusResponse, TwoFactorVerifyResponse } from '../types';

// ============================================
// CONFIGURACIÓN DE API
// ============================================

// ✅ URL de la API en Render (producción)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://flutter-play-api.onrender.com';

// ============================================
// SERVICIO DE 2FA
// ============================================

export const twoFactorService = {
  /**
   * Obtener el estado actual de 2FA del usuario
   */
  getStatus: async (): Promise<TwoFactorStatusResponse> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token');
      
      if (!token) {
        return { enabled: false };
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener estado de 2FA');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      return { enabled: false };
    }
  },

  /**
   * Iniciar configuración de 2FA - Genera secreto y QR
   * Requiere contraseña del usuario para confirmar identidad
   */
  setup: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  /**
   * Verificar código 2FA durante la configuración y activar 2FA
   */
  verify: async (code: string, secret: string): Promise<{ success: boolean; backup_codes: string[] }> => {
    const response = await api.post('/auth/2fa/verify', { code, secret });
    return response.data;
  },

  /**
   * Verificar código 2FA durante el login
   */
  verifyLogin: async (code: string, tempToken: string): Promise<TwoFactorVerifyResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, temp_token: tempToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Error al verificar código 2FA');
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying 2FA login:', error);
      throw error;
    }
  },

  /**
   * Desactivar 2FA para el usuario actual
   */
  disable: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/2fa/disable');
    return response.data;
  },

  /**
   * Regenerar códigos de respaldo
   */
  regenerateBackupCodes: async (): Promise<{ backup_codes: string[] }> => {
    const response = await api.post('/auth/2fa/regenerate-backup-codes');
    return response.data;
  },

  /**
   * Obtener token temporal de autenticación
   */
  getTempToken: (): string | null => {
    return localStorage.getItem('temp_2fa_token');
  },

  /**
   * Guardar token temporal de autenticación
   */
  setTempToken: (token: string): void => {
    localStorage.setItem('temp_2fa_token', token);
  },

  /**
   * Limpiar token temporal de autenticación
   */
  clearTempToken: (): void => {
    localStorage.removeItem('temp_2fa_token');
  },

  /**
   * Verificar si el usuario tiene 2FA activado
   */
  isEnabled: async (): Promise<boolean> => {
    const status = await twoFactorService.getStatus();
    return status.enabled;
  },

  /**
   * Obtener el token de autenticación principal
   */
  getToken: (): string | null => {
    return localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token');
  },
};

export default twoFactorService;