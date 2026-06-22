// src/pages/TwoFactorPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { twoFactorService } from '../services/twoFactorService';
import { TwoFactorSetupPage } from './TwoFactorSetup';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle,
  Key,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';

const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Cargar estado de 2FA
  const load2FAStatus = async () => {
    try {
      setLoading(true);
      const status = await twoFactorService.getStatus();
      setIs2FAEnabled(status.enabled);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
      setIs2FAEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load2FAStatus();
  }, []);

  // Manejar desactivación de 2FA
  const handleDisable2FA = async () => {
    setIsDisabling(true);
    try {
      await twoFactorService.disable();
      setIs2FAEnabled(false);
      showSuccess('2FA Desactivado', 'La autenticación de dos factores ha sido desactivada');
      // Disparar evento para actualizar otras páginas
      window.dispatchEvent(new CustomEvent('2fa-status-changed'));
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      showError('Error', 'No se pudo desactivar 2FA');
    } finally {
      setIsDisabling(false);
      setShowDisableConfirm(false);
    }
  };

  // Manejar configuración exitosa
  const handleSetupComplete = () => {
    setShowSetupModal(false);
    load2FAStatus();
    showSuccess('2FA Activado', 'La autenticación de dos factores ha sido activada');
    window.dispatchEvent(new CustomEvent('2fa-status-changed'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="px-4 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: colors.textSecondary }}
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.text }}>Autenticación 2FA</h1>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Protege tu cuenta con un segundo factor</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {/* Tarjeta de estado actual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Icono de estado */}
            <div className="flex justify-center mb-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: is2FAEnabled ? `${colors.success}20` : `${colors.warning}20`,
                  border: `2px solid ${is2FAEnabled ? colors.success : colors.warning}`
                }}
              >
                {is2FAEnabled ? (
                  <Shield className="w-10 h-10" style={{ color: colors.success }} />
                ) : (
                  <AlertTriangle className="w-10 h-10" style={{ color: colors.warning }} />
                )}
              </div>
            </div>

            {/* Título de estado */}
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              {is2FAEnabled ? '2FA Activado' : '2FA Desactivado'}
            </h2>
            
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              {is2FAEnabled 
                ? 'Tu cuenta está protegida con autenticación de dos factores'
                : 'Activa la autenticación de dos factores para mayor seguridad'}
            </p>

            {/* Badge de estado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
              backgroundColor: is2FAEnabled ? `${colors.success}15` : `${colors.warning}15`,
              border: `1px solid ${is2FAEnabled ? colors.success : colors.warning}`
            }}>
              {is2FAEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                  <span className="text-sm font-medium" style={{ color: colors.success }}>Cuenta protegida</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" style={{ color: colors.warning }} />
                  <span className="text-sm font-medium" style={{ color: colors.warning }}>Protección no activada</span>
                </>
              )}
            </div>
          </motion.div>

          {/* Tarjeta de información */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 mb-6"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                <Smartphone className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <h3 className="font-semibold" style={{ color: colors.text }}>¿Qué es la autenticación 2FA?</h3>
            </div>
            
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              La autenticación de dos factores (2FA) añade una capa extra de seguridad a tu cuenta.
              Además de tu contraseña, necesitarás un código de 6 dígitos generado por una aplicación
              como Google Authenticator, Authy o Microsoft Authenticator.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: `${colors.background}cc` }}>
                <Key className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>Paso 1</p>
                <p className="text-xs font-medium" style={{ color: colors.text }}>Escanea el QR</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: `${colors.background}cc` }}>
                <Smartphone className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>Paso 2</p>
                <p className="text-xs font-medium" style={{ color: colors.text }}>Genera códigos TOTP</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ backgroundColor: `${colors.background}cc` }}>
                <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: colors.success }} />
                <p className="text-xs" style={{ color: colors.textSecondary }}>Paso 3</p>
                <p className="text-xs font-medium" style={{ color: colors.text }}>Cuenta protegida</p>
              </div>
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {!is2FAEnabled ? (
              <>
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                >
                  <Shield className="w-5 h-5" />
                  Configurar 2FA
                </button>
                <p className="text-xs text-center mt-3" style={{ color: colors.textSecondary }}>
                  Se te pedirá confirmar tu contraseña antes de continuar
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div 
                  className="rounded-xl p-4 mb-4"
                  style={{ backgroundColor: `${colors.success}10`, border: `1px solid ${colors.success}30` }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
                    <p className="text-sm" style={{ color: colors.success }}>2FA está activo en tu cuenta</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerar códigos de respaldo
                </button>

                <button
                  onClick={() => setShowDisableConfirm(true)}
                  className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${colors.error}`, color: colors.error, background: 'transparent' }}
                >
                  <Unlock className="w-5 h-5" />
                  Desactivar 2FA
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de configuración de 2FA */}
      <TwoFactorSetupPage
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onComplete={handleSetupComplete}
      />

      {/* Modal de confirmación para desactivar 2FA */}
      <AnimatePresence>
        {showDisableConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowDisableConfirm(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.error}30`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                  <AlertTriangle className="w-8 h-8" style={{ color: colors.error }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Desactivar 2FA</h2>
                <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                  ¿Estás seguro de que deseas desactivar la autenticación de dos factores?
                </p>
                <p className="text-xs mb-6" style={{ color: colors.warning }}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Tu cuenta quedará menos protegida.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisableConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isDisabling}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                  >
                    {isDisabling ? 'Desactivando...' : 'Desactivar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TwoFactorPage;