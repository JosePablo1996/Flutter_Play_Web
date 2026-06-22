import type { SecurityEvent } from '../context/NotificationContext';

// Tipo para el payload de notificación que viene del backend (WebSocket o SSE)
export interface NotificationPayload {
  id: string;
  type: 'security' | 'info' | 'warning' | 'success' | 'error';
  event_type: string;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean>;
  timestamp: string;
}

// Tipo para el evento de seguridad del backend
export interface BackendSecurityEvent {
  event_type: 'login' | 'password_change' | '2fa_enable' | '2fa_disable' | 'session_revoked' | 'new_device';
  user_id: string;
  email: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location?: string;
  timestamp: string;
  details?: Record<string, string | number | boolean>;
}

class NotificationService {
  private listeners: Map<string, Set<(payload: NotificationPayload) => void>> = new Map();
  private eventSource: EventSource | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastCheckedAt: string = new Date().toISOString();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    // Inicializar el servicio
    this.init();
  }

  private init(): void {
    // Intentar conectar a WebSocket/SSE si está disponible
    this.connectToEventSource();
    
    // Fallback a polling si no hay WebSocket
    this.startPolling();
  }

  private connectToEventSource(): void {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.log('📡 [NotificationService] No hay token, esperando autenticación');
      return;
    }

    try {
      // Intentar conectar a SSE (Server-Sent Events)
      const sseUrl = `${apiBaseUrl}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(sseUrl);
      
      this.eventSource.onopen = () => {
        console.log('📡 [NotificationService] Conexión SSE establecida');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationPayload;
          this.handleNotification(data);
        } catch (error) {
          console.error('❌ [NotificationService] Error parsing SSE message:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('❌ [NotificationService] Error SSE:', error);
        this.handleDisconnect();
      };
    } catch (error) {
      console.error('❌ [NotificationService] Error connecting to SSE:', error);
      this.handleDisconnect();
    }
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    // Intentar reconectar si no se ha excedido el límite
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`📡 [NotificationService] Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connectToEventSource(), delay);
    } else {
      console.log('📡 [NotificationService] Usando polling como fallback');
      this.startPolling();
    }
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    // Polling cada 30 segundos como fallback
    this.pollingInterval = setInterval(() => {
      this.checkForNewNotifications();
    }, 30000);
    
    console.log('📡 [NotificationService] Polling iniciado (intervalo: 30s)');
  }

  private async checkForNewNotifications(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/notifications?since=${encodeURIComponent(this.lastCheckedAt)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const notifications = await response.json() as NotificationPayload[];
        if (notifications && notifications.length > 0) {
          notifications.forEach((notif) => {
            this.handleNotification(notif);
          });
          this.lastCheckedAt = new Date().toISOString();
        }
      }
    } catch (error) {
      console.error('❌ [NotificationService] Error polling notifications:', error);
    }
  }

  private handleNotification(payload: NotificationPayload): void {
    console.log('📡 [NotificationService] Notificación recibida:', payload);
    
    // Notificar a todos los listeners
    const listeners = this.listeners.get(payload.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error('❌ [NotificationService] Error en listener:', error);
        }
      });
    }
    
    // También notificar por tipo específico de evento
    const eventListeners = this.listeners.get(`event:${payload.event_type}`);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error('❌ [NotificationService] Error en event listener:', error);
        }
      });
    }
  }

  // Convertir evento del backend a evento de seguridad del frontend
  public convertToSecurityEvent(backendEvent: BackendSecurityEvent): SecurityEvent {
    const eventTypeMap: Record<string, SecurityEvent['eventType']> = {
      'login': 'login',
      'password_change': 'password_change',
      '2fa_enable': '2fa_enable',
      '2fa_disable': '2fa_disable',
      'session_revoked': 'session_revoked',
      'new_device': 'new_device'
    };
    
    return {
      eventType: eventTypeMap[backendEvent.event_type] || 'login',
      deviceName: backendEvent.device_name,
      deviceType: backendEvent.device_type,
      browser: backendEvent.browser,
      os: backendEvent.os,
      ipAddress: backendEvent.ip_address,
      timestamp: backendEvent.timestamp,
      details: backendEvent.details
    };
  }

  // Suscribirse a notificaciones de un tipo específico
  public subscribe(
    type: string,
    callback: (payload: NotificationPayload) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(callback);
    
    // Retornar función para desuscribirse
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Suscribirse a eventos de seguridad específicos
  public subscribeToSecurityEvents(
    eventType: SecurityEvent['eventType'],
    callback: (event: SecurityEvent) => void
  ): () => void {
    return this.subscribe(`event:${eventType}`, (payload) => {
      if (payload.data) {
        const securityEvent = this.convertToSecurityEvent(payload.data as unknown as BackendSecurityEvent);
        callback(securityEvent);
      }
    });
  }

  // Suscribirse a todos los eventos de seguridad
  public subscribeToAllSecurityEvents(
    callback: (event: SecurityEvent) => void
  ): () => void {
    return this.subscribe('security', (payload) => {
      if (payload.data) {
        const securityEvent = this.convertToSecurityEvent(payload.data as unknown as BackendSecurityEvent);
        callback(securityEvent);
      }
    });
  }

  // Enviar notificación manual (para pruebas o cuando se necesita notificar desde el frontend)
  public sendLocalNotification(
    type: NotificationPayload['type'],
    eventType: string,
    title: string,
    message: string,
    data?: Record<string, string | number | boolean>
  ): void {
    const payload: NotificationPayload = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      event_type: eventType,
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.handleNotification(payload);
  }

  // Desconectar y limpiar recursos
  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.listeners.clear();
    this.isConnected = false;
    console.log('📡 [NotificationService] Desconectado');
  }

  // Reconectar (útil después de login)
  public reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.lastCheckedAt = new Date().toISOString();
    this.init();
  }

  // Verificar si está conectado
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton
export const notificationService = new NotificationService();

// Hook para usar en componentes (alternativa al contexto)
export const useNotificationService = (): NotificationService => {
  return notificationService;
};

export default notificationService;