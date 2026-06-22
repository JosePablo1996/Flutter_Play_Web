import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Shield, 
  Clock, 
  Activity, 
  Monitor, 
  CheckCircle,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { SecurityProgressBar, SecurityCard } from '../../components/Security';
import type { SecurityStats } from '../../services/sessionService';

interface GeneralTabProps {
  securityScore: number;
  securityStats: SecurityStats | null;
  is2FAEnabled: boolean;
  lastLogin: string;
  isPasskeyEnabled?: boolean;  // ✅ NUEVA PROPIEDAD
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  securityScore,
  securityStats,
  is2FAEnabled,
  lastLogin,
  isPasskeyEnabled = false  // ✅ VALOR POR DEFECTO
}) => {
  const { colors } = useTheme();
  
  // Determinar color del escudo según puntaje
  const getShieldColor = () => {
    if (securityScore < 40) return colors.error;
    if (securityScore < 70) return colors.warning;
    return colors.success;
  };
  
  // Determinar estado del escudo
  const getShieldStatus = () => {
    if (securityScore < 40) return 'Seguridad Crítica';
    if (securityScore < 70) return 'Seguridad Media';
    return 'Seguridad Alta';
  };
  
  const shieldColor = getShieldColor();
  const shieldStatus = getShieldStatus();
  
  // Valores de estadísticas con fallbacks
  const totalLogins = securityStats?.total_logins ?? 0;
  const uniqueDevices = securityStats?.unique_devices ?? 0;
  const lastLoginInfo = securityStats?.last_login;
  
  // ✅ USAR LA PROP pasada desde SecurityPage
  const hasPasskey = isPasskeyEnabled || securityStats?.has_passkey || false;
  
  // Determinar si hay datos para mostrar
  const hasData = totalLogins > 0;
  
  return (
    <div className="p-4 space-y-6">
      {/* Tarjeta principal de seguridad */}
      <div 
        className="rounded-2xl p-6 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${shieldColor}10, ${colors.background}cc)`,
          border: `1px solid ${shieldColor}30`
        }}
      >
        <div className="flex flex-col items-center">
          {/* Icono de escudo grande */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{ 
              backgroundColor: `${shieldColor}20`,
              boxShadow: `0 0 30px ${shieldColor}40`
            }}
          >
            <Shield className="w-12 h-12" style={{ color: shieldColor }} />
          </div>
          
          <h3 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
            {shieldStatus}
          </h3>
          
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            Tu cuenta está protegida
          </p>
          
          {/* Barra de seguridad grande */}
          <div className="w-full max-w-md">
            <SecurityProgressBar score={securityScore} size="lg" />
          </div>
        </div>
      </div>
      
      {/* Último acceso centrado */}
      <div 
        className="rounded-xl p-4 text-center"
        style={{ 
          backgroundColor: `${colors.surface}cc`,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-4 h-4" style={{ color: colors.primary }} />
          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Último acceso
          </span>
        </div>
        <p className="text-lg font-semibold" style={{ color: colors.text }}>
          {lastLogin || 'No disponible'}
        </p>
        {lastLoginInfo && lastLoginInfo.device && (
          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            {lastLoginInfo.device} • {lastLoginInfo.ip || 'IP desconocida'}
          </p>
        )}
      </div>
      
      {/* Estadísticas de seguridad */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" style={{ color: colors.primary }} />
          <h3 className="font-semibold text-sm" style={{ color: colors.text }}>
            Estadísticas de seguridad
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <SecurityCard
            title="Inicios de sesión"
            value={totalLogins}
            icon={<Activity className="w-5 h-5" style={{ color: colors.primary }} />}
            subtitle={hasData ? 'Total de accesos' : 'Sin actividad registrada'}
          />
          <SecurityCard
            title="Dispositivos únicos"
            value={uniqueDevices}
            icon={<Monitor className="w-5 h-5" style={{ color: colors.primary }} />}
            subtitle={hasData ? 'Equipos conectados' : 'Sin dispositivos registrados'}
          />
          <SecurityCard
            title="2FA"
            value={is2FAEnabled ? 'Activado' : 'Desactivado'}
            icon={is2FAEnabled ? 
              <CheckCircle className="w-5 h-5" style={{ color: colors.success }} /> :
              <AlertTriangle className="w-5 h-5" style={{ color: colors.warning }} />
            }
            subtitle={is2FAEnabled ? 'Doble factor activo' : 'Recomendamos activarlo'}
          />
          <SecurityCard
            title="Passkey"
            value={hasPasskey ? 'Activado' : 'Desactivado'}
            icon={<Fingerprint className="w-5 h-5" style={{ color: hasPasskey ? colors.success : colors.warning }} />}
            subtitle={hasPasskey ? 'Autenticación biométrica' : 'Registra tu dispositivo'}
          />
        </div>
      </div>
      
      {/* Mensaje cuando no hay datos */}
      {!hasData && (
        <div 
          className="rounded-xl p-4 text-center"
          style={{ 
            backgroundColor: `${colors.warning}10`,
            border: `1px solid ${colors.warning}30`
          }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: colors.warning }} />
          <p className="text-sm font-medium" style={{ color: colors.warning }}>
            No hay estadísticas disponibles
          </p>
          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            Los inicios de sesión aparecerán aquí después de que accedas a tu cuenta
          </p>
        </div>
      )}
      
      {/* Protección adicional */}
      <div 
        className="rounded-xl p-4"
        style={{ 
          backgroundColor: `${colors.surface}cc`,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" style={{ color: colors.primary }} />
          <h3 className="font-semibold text-sm" style={{ color: colors.text }}>
            Protección adicional
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              Alertas por correo
            </p>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              Notificaciones ante accesos sospechosos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
              Activado
            </span>
          </div>
        </div>
        
        {/* Recomendaciones */}
        {securityStats?.recommendations && securityStats.recommendations.length > 0 && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
            <p className="text-xs font-semibold mb-2" style={{ color: colors.warning }}>
              Recomendaciones
            </p>
            {securityStats.recommendations.map((rec, idx) => (
              <p key={idx} className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                • {rec}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralTab;