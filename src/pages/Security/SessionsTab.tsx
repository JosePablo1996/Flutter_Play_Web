import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Globe, 
  LogOut, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import type { Session } from '../../services/sessionService';
import DeviceInfo from '../../components/UI/DeviceInfo';

interface SessionsTabProps {
  sessions: Session[];
  loadingSessions: boolean;
  revokingSession: string | null;
  revokingAll: boolean;
  errorSessions: string | null;
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllSessions: () => void;
  onReload: () => void;
}

// Componente para mostrar una sesión individual
const SessionItem: React.FC<{
  session: Session;
  isRevoking: boolean;
  onRevoke: (sessionId: string) => void;
}> = ({ session, isRevoking, onRevoke }) => {
  const { colors } = useTheme();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b last:border-b-0" style={{ borderColor: colors.border }}>
      <div className="flex-1 min-w-0">
        {/* DeviceInfo muestra: icono con color de marca, nombre del dispositivo, navegador, SO, IP y última actividad */}
        <DeviceInfo
          deviceType={session.device_type}
          deviceBrand={session.device_brand}
          deviceModel={session.device_model}
          deviceName={session.device_name}
          browser={session.browser}
          os={session.os}
          ipAddress={session.ip_address}
          lastActivity={session.last_activity}
          showBrowser={true}
          showOs={true}
          showIp={true}
          showLastActivity={true}
          size="md"
        />
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {session.is_current && (
          <span 
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: `${colors.success}20`, color: colors.success }}
          >
            Actual
          </span>
        )}
        
        {!session.is_current && (
          <button
            onClick={() => {
              console.log('🔴 [SessionItem] Botón revocar sesión clicado para:', session.id);
              onRevoke(session.id);
            }}
            disabled={isRevoking}
            className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
            style={{ color: colors.error }}
            title="Cerrar sesión en este dispositivo"
          >
            {isRevoking ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.error }} />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const SessionsTab: React.FC<SessionsTabProps> = ({
  sessions,
  loadingSessions,
  revokingSession,
  revokingAll,
  errorSessions,
  onRevokeSession,
  onRevokeAllSessions,
  onReload
}) => {
  const { colors } = useTheme();
  
  // Log para depuración
  console.log('🔴 [SessionsTab] Renderizando con:', {
    sessionsCount: sessions.length,
    loadingSessions,
    revokingAll,
    errorSessions,
    hasOnRevokeAllSessions: typeof onRevokeAllSessions === 'function'
  });
  
  return (
    <div className="p-4">
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
      >
        {loadingSessions ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: colors.primary }} />
            <p className="text-sm mt-3" style={{ color: colors.textSecondary }}>Cargando sesiones...</p>
          </div>
        ) : errorSessions ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm" style={{ color: colors.error }}>{errorSessions}</p>
            <button
              onClick={() => {
                console.log('🔴 [SessionsTab] Botón Reintentar clicado');
                onReload();
              }}
              className="text-sm mt-3 underline"
              style={{ color: colors.primary }}
            >
              Reintentar
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: colors.textSecondary }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>No hay sesiones activas</p>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Las sesiones aparecerán aquí cuando inicies sesión en otros dispositivos
            </p>
          </div>
        ) : (
          <>
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isRevoking={revokingSession === session.id}
                onRevoke={onRevokeSession}
              />
            ))}
          </>
        )}
        
        {/* Cerrar todas las sesiones */}
        <div className="border-t" style={{ borderColor: colors.border }}>
          <button
            onClick={() => {
              console.log('🔴 [SessionsTab] ====== BOTÓN "CERRAR TODAS LAS SESIONES" CLICKEADO ======');
              console.log('🔴 revokingAll:', revokingAll);
              console.log('🔴 loadingSessions:', loadingSessions);
              console.log('🔴 sessions.length:', sessions.length);
              console.log('🔴 onRevokeAllSessions es función?', typeof onRevokeAllSessions === 'function');
              
              if (typeof onRevokeAllSessions === 'function') {
                console.log('🔴 Llamando a onRevokeAllSessions()...');
                onRevokeAllSessions();
              } else {
                console.error('❌ onRevokeAllSessions NO es una función!');
              }
            }}
            disabled={revokingAll || loadingSessions || sessions.length === 0}
            className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
              {revokingAll ? (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.error }} />
              ) : (
                <LogOut className="w-5 h-5" style={{ color: colors.error }} />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm" style={{ color: colors.error }}>Cerrar todas las sesiones</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Finalizar sesión en todos los dispositivos</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionsTab;