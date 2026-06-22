import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ToastType } from '../components/UI/Toast';

export interface Notification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

export interface SecurityEvent {
  eventType: 'login' | 'password_change' | '2fa_enable' | '2fa_disable' | 'session_revoked' | 'new_device';
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  timestamp?: string;
  details?: Record<string, string | number | boolean>;
}

interface NotificationContextProps {
  notifications: Notification[];
  showNotification: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number,
    icon?: React.ReactNode
  ) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showSecurityAlert: (event: SecurityEvent) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Crear el contexto (esto no causa error de Fast Refresh)
const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showNotification = useCallback(
    (
      type: ToastType,
      title: string,
      message: string,
      duration: number = 5000,
      icon?: React.ReactNode
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const newNotification: Notification = {
        id,
        type,
        title,
        message,
        duration,
        icon,
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('success', title, message, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('error', title, message, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('warning', title, message, duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('info', title, message, duration);
    },
    [showNotification]
  );

  const showSecurityAlert = useCallback((event: SecurityEvent) => {
    const { eventType, deviceName } = event;
    
    const formatTimestamp = () => {
      const now = new Date();
      return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const configs: Record<string, { title: string; message: string; icon?: React.ReactNode }> = {
      login: {
        title: '🔐 Nuevo inicio de sesión',
        message: deviceName 
          ? `Se ha detectado un inicio de sesión desde ${deviceName} a las ${formatTimestamp()}`
          : `Se ha detectado un inicio de sesión a las ${formatTimestamp()}`,
      },
      new_device: {
        title: '🌐 Nuevo dispositivo detectado',
        message: deviceName
          ? `Se ha iniciado sesión desde un nuevo dispositivo: ${deviceName}`
          : `Se ha detectado un inicio de sesión desde un dispositivo desconocido`,
      },
      password_change: {
        title: '🔑 Contraseña actualizada',
        message: `Tu contraseña ha sido cambiada exitosamente a las ${formatTimestamp()}`,
      },
      '2fa_enable': {
        title: '🛡️ 2FA Activado',
        message: `La autenticación de dos factores ha sido activada en tu cuenta`,
      },
      '2fa_disable': {
        title: '⚠️ 2FA Desactivado',
        message: `La autenticación de dos factores ha sido desactivada en tu cuenta`,
      },
      session_revoked: {
        title: '🚪 Sesión cerrada',
        message: deviceName
          ? `Se ha cerrado la sesión en ${deviceName}`
          : `Se ha cerrado una sesión remota en tu cuenta`,
      },
    };

    const config = configs[eventType] || {
      title: '🔔 Alerta de seguridad',
      message: `Se ha detectado actividad en tu cuenta a las ${formatTimestamp()}`,
    };

    showNotification('security', config.title, config.message, 6000, config.icon);
  }, [showNotification]);

  const value: NotificationContextProps = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSecurityAlert,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// No exportamos el contexto directamente, solo el provider y el hook