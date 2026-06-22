import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import type { SecurityEvent } from '../context/NotificationContext';

export interface UseNotificationsReturn {
  // Notificaciones básicas
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  
  // Notificaciones de seguridad específicas
  notifyNewLogin: (deviceName: string, deviceType?: string, browser?: string, os?: string, ipAddress?: string) => void;
  notifyNewDevice: (deviceName: string, deviceType?: string, browser?: string, os?: string, ipAddress?: string) => void;
  notifyPasswordChange: (success: boolean, sessionsRevoked?: number) => void;
  notify2FAEnable: (success: boolean) => void;
  notify2FADisable: (success: boolean) => void;
  notifySessionRevoked: (deviceName?: string, wasCurrent?: boolean) => void;
  notifyAllSessionsRevoked: (count: number) => void;
  
  // Notificaciones de error
  notifyError: (action: string, errorMessage?: string) => void;
  
  // Notificación genérica de seguridad
  notifySecurityEvent: (event: SecurityEvent) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { showSuccess, showError, showWarning, showInfo, showSecurityAlert } = useNotification();

  // Notificaciones básicas
  const notifySuccess = useCallback((title: string, message: string, duration?: number) => {
    showSuccess(title, message, duration);
  }, [showSuccess]);

  const notifyError = useCallback((action: string, errorMessage?: string) => {
    showError(
      '❌ Error',
      errorMessage || `Error al ${action}. Intenta nuevamente.`,
      5000
    );
  }, [showError]);

  const notifyWarning = useCallback((title: string, message: string, duration?: number) => {
    showWarning(title, message, duration);
  }, [showWarning]);

  const notifyInfo = useCallback((title: string, message: string, duration?: number) => {
    showInfo(title, message, duration);
  }, [showInfo]);

  // Notificaciones de seguridad específicas
  const notifyNewLogin = useCallback((
    deviceName: string,
    deviceType?: string,
    browser?: string,
    os?: string,
    ipAddress?: string
  ) => {
    const fullDeviceName = deviceName || [deviceType, os, browser].filter(Boolean).join(' - ') || 'dispositivo desconocido';
    
    showSecurityAlert({
      eventType: 'login',
      deviceName: fullDeviceName,
      deviceType,
      browser,
      os,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }, [showSecurityAlert]);

  const notifyNewDevice = useCallback((
    deviceName: string,
    deviceType?: string,
    browser?: string,
    os?: string,
    ipAddress?: string
  ) => {
    const fullDeviceName = deviceName || [deviceType, os, browser].filter(Boolean).join(' - ') || 'dispositivo desconocido';
    
    showSecurityAlert({
      eventType: 'new_device',
      deviceName: fullDeviceName,
      deviceType,
      browser,
      os,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }, [showSecurityAlert]);

  const notifyPasswordChange = useCallback((success: boolean, sessionsRevoked?: number) => {
    if (success) {
      const revokedCount = sessionsRevoked ?? 0;
      showSecurityAlert({
        eventType: 'password_change',
        details: { sessionsRevoked: revokedCount }
      });
      
      if (revokedCount > 0) {
        notifyInfo(
          '🔒 Sesiones cerradas',
          `Se han cerrado ${revokedCount} sesión${revokedCount !== 1 ? 'es' : ''} activa${revokedCount !== 1 ? 's' : ''} por seguridad.`,
          5000
        );
      }
    } else {
      notifyError('cambiar tu contraseña', 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    }
  }, [showSecurityAlert, notifyInfo, notifyError]);

  const notify2FAEnable = useCallback((success: boolean) => {
    if (success) {
      showSecurityAlert({
        eventType: '2fa_enable',
        timestamp: new Date().toISOString()
      });
    } else {
      notifyError('activar la autenticación de dos factores', 'Código de verificación incorrecto. Intenta nuevamente.');
    }
  }, [showSecurityAlert, notifyError]);

  const notify2FADisable = useCallback((success: boolean) => {
    if (success) {
      showSecurityAlert({
        eventType: '2fa_disable',
        timestamp: new Date().toISOString()
      });
    } else {
      notifyError('desactivar la autenticación de dos factores');
    }
  }, [showSecurityAlert, notifyError]);

  const notifySessionRevoked = useCallback((deviceName?: string, wasCurrent?: boolean) => {
    if (wasCurrent) {
      notifyWarning(
        '🚪 Sesión actual cerrada',
        'Has cerrado sesión en este dispositivo. Serás redirigido al inicio de sesión.',
        4000
      );
    } else {
      showSecurityAlert({
        eventType: 'session_revoked',
        deviceName,
        timestamp: new Date().toISOString()
      });
    }
  }, [showSecurityAlert, notifyWarning]);

  const notifyAllSessionsRevoked = useCallback((count: number) => {
    if (count > 0) {
      notifyWarning(
        '🔒 Todas las sesiones cerradas',
        `Se han cerrado ${count} sesión${count !== 1 ? 'es' : ''} activa${count !== 1 ? 's' : ''} en todos tus dispositivos.`,
        5000
      );
    } else {
      notifyInfo(
        '📱 Sin sesiones activas',
        'No hay otras sesiones activas para cerrar.',
        3000
      );
    }
  }, [notifyWarning, notifyInfo]);

  const notifySecurityEvent = useCallback((event: SecurityEvent) => {
    showSecurityAlert(event);
  }, [showSecurityAlert]);

  return {
    // Básicas
    showSuccess: notifySuccess,
    showError: notifyError,
    showWarning: notifyWarning,
    showInfo: notifyInfo,
    
    // Seguridad específicas
    notifyNewLogin,
    notifyNewDevice,
    notifyPasswordChange,
    notify2FAEnable,
    notify2FADisable,
    notifySessionRevoked,
    notifyAllSessionsRevoked,
    
    // Error
    notifyError,
    
    // Genérica
    notifySecurityEvent,
  };
};

export default useNotifications;