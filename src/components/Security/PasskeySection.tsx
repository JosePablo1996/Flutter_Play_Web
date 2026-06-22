// src/components/Security/PasskeySection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { webauthnService, type PasskeyCredential } from '../../services/webauthnService';
import { usePasskeyEnabled } from '../../hooks/useFeatureFlags';
import { 
  Fingerprint, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Smartphone,
  Laptop,
  RefreshCw
} from 'lucide-react';
import { SecurityBadge } from './index';

interface PasskeySectionProps {
  onPasskeyStatusChange?: (enabled: boolean) => void;
}

const PasskeySection: React.FC<PasskeySectionProps> = ({ onPasskeyStatusChange }) => {
  const { colors } = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  const isPasskeyFeatureEnabled = usePasskeyEnabled();
  
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPasskeyDropdown, setShowPasskeyDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar estado de Passkey
  const loadPasskeyStatus = useCallback(async (showRefreshing = false) => {
    if (!isPasskeyFeatureEnabled) {
      setLoading(false);
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    }

    try {
      setLoading(true);
      const supported = await webauthnService.isSupported();
      setIsSupported(supported);
      
      console.log('🔐 [PasskeySection] Soportado:', supported);
      
      if (supported) {
        const status = await webauthnService.getPasskeyStatus();
        console.log('🔐 [PasskeySection] Estado recibido:', status);
        
        setIsEnabled(status.enabled);
        setPasskeys(status.credentials);
        
        if (onPasskeyStatusChange) {
          onPasskeyStatusChange(status.enabled);
        }
      } else {
        setIsEnabled(false);
        setPasskeys([]);
      }
    } catch (error) {
      console.error('Error loading passkey status:', error);
      setIsEnabled(false);
      setPasskeys([]);
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  }, [isPasskeyFeatureEnabled, onPasskeyStatusChange]);

  // Cargar al montar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPasskeyStatus();
  }, [loadPasskeyStatus]);

  // Registrar nueva Passkey
  const handleRegisterPasskey = async () => {
    if (!isPasskeyFeatureEnabled) {
      showInfo('No disponible', 'Passkey solo está disponible en desarrollo');
      return;
    }

    if (!isSupported) {
      showError('No soportado', 'Tu dispositivo no soporta Passkeys');
      return;
    }

    setRegistering(true);
    try {
      console.log('🔐 [PasskeySection] Iniciando registro...');
      const result = await webauthnService.registerPasskey();
      
      console.log('🔐 [PasskeySection] Resultado registro:', result);
      
      if (result.success) {
        showSuccess('Passkey registrada', `Tu ${webauthnService.getPlatformName()} ha sido registrada correctamente`);
        // Esperar un momento y recargar el estado
        setTimeout(async () => {
          await loadPasskeyStatus(true);
        }, 1000);
      } else {
        showError('Error', result.error || 'No se pudo registrar la passkey');
      }
    } catch (error) {
      console.error('Error registering passkey:', error);
      showError('Error', 'No se pudo registrar la passkey');
    } finally {
      setRegistering(false);
    }
  };

  // Eliminar Passkey
  const handleDeletePasskey = async (credentialId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta passkey?')) return;
    
    setDeletingId(credentialId);
    try {
      await webauthnService.deletePasskey(credentialId);
      showSuccess('Passkey eliminada', 'La passkey ha sido eliminada correctamente');
      await loadPasskeyStatus(true);
    } catch (error) {
      console.error('Error deleting passkey:', error);
      showError('Error', 'No se pudo eliminar la passkey');
    } finally {
      setDeletingId(null);
    }
  };

  // Refrescar manualmente
  const handleRefresh = async () => {
    await loadPasskeyStatus(true);
  };

  const platformName = webauthnService.getPlatformName();

  // Si la feature no está habilitada, mostrar mensaje
  if (!isPasskeyFeatureEnabled) {
    return (
      <div 
        className="rounded-xl p-4 text-center"
        style={{ 
          backgroundColor: `${colors.surface}cc`, 
          border: `1px solid ${colors.border}` 
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <Fingerprint className="w-5 h-5" style={{ color: colors.textSecondary }} />
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Passkey disponible en desarrollo
          </p>
        </div>
      </div>
    );
  }

  // Si está cargando
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: `${colors.surface}cc`, 
        border: `1px solid ${colors.border}` 
      }}
    >
      {/* Header expandible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-white/5"
        onClick={() => setShowPasskeyDropdown(!showPasskeyDropdown)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Fingerprint className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium" style={{ color: colors.text }}>Passkey ({platformName})</p>
              <SecurityBadge 
                status={isEnabled ? 'success' : 'warning'} 
                text={isEnabled ? 'Activado' : 'Desactivado'} 
                size="sm"
              />
            </div>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              {isEnabled 
                ? `Accede con ${platformName} sin contraseña`
                : `Registra ${platformName} para acceso rápido`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={refreshing}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: colors.textSecondary }}
              title="Refrescar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${showPasskeyDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: colors.textSecondary }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      {showPasskeyDropdown && (
        <div className="px-4 pb-4">
          <div 
            className="rounded-xl p-4"
            style={{ 
              backgroundColor: `${colors.background}cc`, 
              border: `1px solid ${colors.border}` 
            }}
          >
            {/* Información del dispositivo */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-2 rounded-xl" 
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                {platformName === 'Windows Hello' ? (
                  <Laptop className="w-5 h-5" style={{ color: colors.primary }} />
                ) : (
                  <Smartphone className="w-5 h-5" style={{ color: colors.primary }} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  {platformName} detectado
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Usa {platformName} para iniciar sesión sin contraseña
                </p>
              </div>
            </div>

            {/* Lista de Passkeys registradas */}
            {passkeys.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  Passkeys registradas ({passkeys.length})
                </p>
                {passkeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ 
                      backgroundColor: `${colors.surface}cc`, 
                      border: `1px solid ${colors.border}` 
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: colors.text }}>
                          {passkey.name || platformName}
                        </p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Registrada: {new Date(passkey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePasskey(passkey.id)}
                      disabled={deletingId === passkey.id}
                      className="p-1 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                      style={{ color: colors.error }}
                    >
                      {deletingId === passkey.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de registrar */}
            {!isEnabled ? (
              <button
                onClick={handleRegisterPasskey}
                disabled={registering}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, 
                  color: '#ffffff' 
                }}
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Registrar {platformName}
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.success }}>
                <CheckCircle className="w-4 h-4" />
                <span>Passkey registrada. Puedes iniciar sesión con {platformName}</span>
              </div>
            )}

            {/* Info de compatibilidad */}
            <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
              <p className="text-xs flex items-center gap-1" style={{ color: colors.textSecondary }}>
                <AlertCircle className="w-3 h-3" />
                {platformName} es compatible con Windows 10/11, macOS, iOS y Android
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasskeySection;