import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { NeonButton } from '../../components/UI/NeonButton';
import { twoFactorService } from '../../services/twoFactorService';
import PasskeySection from '../../components/Security/PasskeySection';
import { 
  Key, 
  Smartphone, 
  Shield,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { SecurityBadge } from '../../components/Security';

interface AuthTabProps {
  is2FAEnabled?: boolean;
  isPasskeyEnabled?: boolean;
  onTogglePasskey?: (value: boolean) => void;
  onNavigateTo2FA: () => void;
  on2FAStatusChange?: (enabled: boolean) => void;
  onPasskeyStatusChange?: (enabled: boolean) => void;
  isDevelopment?: boolean;  // ✅ NUEVA PROPIEDAD
}

const AuthTab: React.FC<AuthTabProps> = ({
  is2FAEnabled: propIs2FAEnabled,
  onTogglePasskey,
  onNavigateTo2FA,
  on2FAStatusChange,
  onPasskeyStatusChange,
  isDevelopment = false  // ✅ VALOR POR DEFECTO
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [show2FADropdown, setShow2FADropdown] = useState(false);
  const [local2FAEnabled, setLocal2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);

  // Cargar el estado de 2FA desde el servicio si no viene por props
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        setLoading2FA(true);
        
        // Si viene por props, usar ese valor
        if (propIs2FAEnabled !== undefined) {
          setLocal2FAEnabled(propIs2FAEnabled);
          if (on2FAStatusChange) {
            on2FAStatusChange(propIs2FAEnabled);
          }
          setLoading2FA(false);
          return;
        }
        
        // Si no, cargar desde el servicio
        const status = await twoFactorService.getStatus();
        console.log('🔐 [AuthTab] Estado 2FA cargado:', status.enabled);
        setLocal2FAEnabled(status.enabled);
        if (on2FAStatusChange) {
          on2FAStatusChange(status.enabled);
        }
      } catch (error) {
        console.error('❌ [AuthTab] Error loading 2FA status:', error);
        setLocal2FAEnabled(false);
      } finally {
        setLoading2FA(false);
      }
    };

    load2FAStatus();
  }, [propIs2FAEnabled, on2FAStatusChange]);

  // Escuchar cambios en el estado de 2FA
  useEffect(() => {
    const handle2FAChange = async () => {
      console.log('🔄 [AuthTab] Evento 2FA detectado, refrescando...');
      try {
        const status = await twoFactorService.getStatus();
        console.log('🔐 [AuthTab] Nuevo estado 2FA:', status.enabled);
        setLocal2FAEnabled(status.enabled);
        if (on2FAStatusChange) {
          on2FAStatusChange(status.enabled);
        }
      } catch (error) {
        console.error('❌ [AuthTab] Error refreshing 2FA status:', error);
      }
    };

    window.addEventListener('2fa-status-changed', handle2FAChange);
    return () => {
      window.removeEventListener('2fa-status-changed', handle2FAChange);
    };
  }, [on2FAStatusChange]);

  // Manejar cambio de estado de Passkey
  const handlePasskeyStatusChange = (enabled: boolean) => {
    if (onPasskeyStatusChange) {
      onPasskeyStatusChange(enabled);
    }
    if (onTogglePasskey) {
      onTogglePasskey(enabled);
    }
  };

  // Función para manejar la navegación a 2FA
  const handleNavigateTo2FA = () => {
    console.log('🔐 [AuthTab] Navegando a /two-factor, estado actual:', local2FAEnabled);
    onNavigateTo2FA();
  };

  // Mostrar loader mientras carga
  if (loading2FA) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Cambiar contraseña */}
      <div 
        className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
        style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
        onClick={() => navigate('/reset-password')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
            <Key className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <p className="font-medium" style={{ color: colors.text }}>Cambiar contraseña</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Actualiza tu contraseña periódicamente</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
      </div>
      
      {/* Autenticación en Dos Pasos (2FA) */}
      <div 
        className="rounded-xl overflow-hidden cursor-pointer transition-colors hover:bg-white/5"
        style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
        onClick={() => setShow2FADropdown(!show2FADropdown)}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
              <Smartphone className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium" style={{ color: colors.text }}>Autenticación en Dos Pasos (2FA)</p>
                <SecurityBadge 
                  status={local2FAEnabled ? 'success' : 'warning'} 
                  text={local2FAEnabled ? 'Activado' : 'Desactivado'} 
                  size="sm"
                />
              </div>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Protege tu cuenta con un segundo factor</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </div>
        
        {show2FADropdown && (
          <div className="px-4 pb-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" style={{ color: colors.primary }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {local2FAEnabled 
                    ? 'Tu cuenta está protegida con autenticación de dos factores'
                    : 'Usa Google Authenticator o aplicaciones similares para mayor seguridad'}
                </p>
              </div>
              <NeonButton
                onClick={handleNavigateTo2FA}
                variant="secondary"
                fullWidth
              >
                {local2FAEnabled ? 'Administrar 2FA' : 'Configurar 2FA'}
              </NeonButton>
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ Passkey Section - SOLO EN DESARROLLO */}
      {isDevelopment && (
        <PasskeySection onPasskeyStatusChange={handlePasskeyStatusChange} />
      )}
    </div>
  );
};

export default AuthTab;