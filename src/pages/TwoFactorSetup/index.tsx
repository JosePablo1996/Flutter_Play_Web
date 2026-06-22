import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, AlertCircle, 
  Copy, Download, X, Eye, EyeOff 
} from 'lucide-react';
import { twoFactorService } from '../../services/twoFactorService';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// COMPONENTE PRINCIPAL - TwoFactorSetupPage
// ============================================
interface TwoFactorSetupPageProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const TwoFactorSetupPage: React.FC<TwoFactorSetupPageProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const { colors } = useTheme();
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCodes, setShowCodes] = useState(false);

  // Iniciar setup 2FA - Solicitar QR y secreto al backend
  const handleStartSetup = async () => {
    if (!password || password.trim().length === 0) {
      setError('Ingresa tu contraseña para continuar');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Iniciando configuración 2FA...');
      
      const data = await twoFactorService.setup();
      
      console.log('📦 Respuesta:', data);
      
      const responseSecret = data.secret || '';
      const responseQrCode = data.qr_code || '';
      const responseManualKey = data.manual_key || responseSecret;
      
      if (!responseSecret) {
        throw new Error('No se recibió la clave secreta');
      }
      
      setSecret(responseSecret);
      setQrCode(responseQrCode);
      setManualKey(responseManualKey);
      setStep('verify');
      
    } catch (err) {
      console.error('❌ Error en enableTwoFactor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al configurar 2FA';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verificar código 2FA - Validar el código del usuario
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }
    
    if (!secret) {
      setError('Error: No se encontró la clave secreta');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 Verificando código 2FA...');
      
      const data = await twoFactorService.verify(verificationCode, secret);
      
      console.log('📦 Respuesta:', data);
      
      if (data.success) {
        const codes = data.backup_codes || [];
        setRecoveryCodes(codes);
        setStep('complete');
      } else {
        throw new Error('Código inválido');
      }
    } catch (err) {
      console.error('❌ Error en verifyEnableTwoFactor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Código inválido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
    onClose();
  };

  const copyManualKey = () => {
    navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flutterplay_2fa_backup_codes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && step !== 'verify') onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b" style={{ borderColor: colors.border }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                    <Shield className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: colors.text }}>Autenticación en Dos Pasos</h2>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Paso {step === 'setup' ? '1' : step === 'verify' ? '2' : '3'} de 3
                    </p>
                  </div>
                </div>
                
                {step !== 'verify' && (
                  <button 
                    onClick={onClose} 
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  </button>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* PASO 1: Confirmar contraseña */}
              {step === 'setup' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: colors.text }}>Confirma tu identidad</p>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Ingresa tu contraseña actual para continuar con la configuración</p>
                    </div>
                  </div>

                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      backgroundColor: `${colors.background}cc`,
                      border: `1px solid ${error ? colors.error : colors.border}`,
                      color: colors.text,
                    }}
                    placeholder="Tu contraseña actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartSetup()}
                    autoFocus
                    aria-label="Contraseña actual"
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.error }}>
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={onClose} 
                      className="flex-1 px-4 py-2 rounded-xl transition hover:bg-white/5"
                      style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                      aria-label="Cancelar"
                      title="Cancelar"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleStartSetup}
                      disabled={loading}
                      className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                      aria-label="Continuar"
                      title="Continuar"
                    >
                      {loading ? 'Verificando...' : 'Continuar'}
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* PASO 2: Escanear QR y verificar código */}
              {step === 'verify' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Columna izquierda - QR */}
                    <div className="text-center">
                      <p className="font-medium mb-2" style={{ color: colors.text }}>Escanea este código QR</p>
                      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>con Google Authenticator o Authy</p>
                      
                      <div className="w-48 h-48 mx-auto rounded-xl p-3" style={{ backgroundColor: colors.surface, boxShadow: `0 0 20px ${colors.primary}40` }}>
                        {qrCode ? (
                          <img src={qrCode} alt="Código QR para autenticación de dos factores" className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }} />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs mt-4" style={{ color: colors.textSecondary }}>Abre la app, toca "+" y selecciona "Escanear código QR"</p>
                    </div>

                    {/* Columna derecha - Código manual y verificación */}
                    <div>
                      <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>¿No puedes escanear?</p>
                      <div className="flex gap-2 mb-6">
                        <code className="flex-1 px-3 py-2 rounded-lg font-mono text-sm text-center break-all" style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.primary}30`, color: colors.text }}>
                          {manualKey}
                        </code>
                        <button 
                          onClick={copyManualKey} 
                          className="px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                          aria-label="Copiar clave manual"
                          title="Copiar clave manual"
                        >
                          {copied ? <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} /> : <Copy className="w-5 h-5" style={{ color: colors.textSecondary }} />}
                        </button>
                      </div>

                      <p className="font-medium mb-2" style={{ color: colors.text }}>Código de verificación</p>
                      <div className="flex justify-center gap-2 mb-4">
                        {[...Array(6)].map((_, index) => (
                          <input
                            key={index}
                            id={`code-input-${index}`}
                            type="text"
                            maxLength={1}
                            value={verificationCode[index] || ''}
                            onChange={(e) => {
                              const newCode = [...verificationCode.split('')];
                              newCode[index] = e.target.value;
                              setVerificationCode(newCode.join('').slice(0, 6));
                              if (e.target.value && index < 5) {
                                const nextInput = document.getElementById(`code-input-${index + 1}`);
                                nextInput?.focus();
                              }
                            }}
                            className="w-12 h-14 text-center text-2xl font-bold rounded-xl focus:outline-none transition-all"
                            style={{ 
                              backgroundColor: `${colors.background}cc`,
                              border: `1px solid ${error ? colors.error : colors.border}`,
                              color: colors.text,
                            }}
                            autoFocus={index === 0}
                            aria-label={`Dígito ${index + 1} del código de verificación`}
                            placeholder="0"
                          />
                        ))}
                      </div>

                      {error && (
                        <div className="flex items-center justify-center gap-2 text-sm mb-4" style={{ color: colors.error }}>
                          <AlertCircle className="w-4 h-4" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button 
                          onClick={onClose} 
                          className="flex-1 px-4 py-2 rounded-xl transition hover:bg-white/5"
                          style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                          aria-label="Cancelar"
                          title="Cancelar"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleVerifyCode}
                          disabled={loading || verificationCode.length !== 6}
                          className="flex-1 px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                          aria-label="Verificar código"
                          title="Verificar código"
                        >
                          {loading ? 'Verificando...' : 'Verificar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* PASO 3: Completado con códigos de respaldo */}
              {step === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <CheckCircle className="w-10 h-10" style={{ color: colors.primary }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>¡2FA Activado con Éxito!</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Tu cuenta ahora está protegida con autenticación en dos pasos</p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}>
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                      <div>
                        <p className="font-medium text-sm" style={{ color: colors.text }}>Guarda tus códigos de respaldo</p>
                        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                          Si pierdes acceso a Google Authenticator, usa estos códigos. Cada código funciona una sola vez.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCodes(!showCodes)}
                      className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-lg text-sm transition-colors hover:bg-white/5"
                      style={{ color: colors.primary }}
                      aria-label={showCodes ? "Ocultar códigos" : "Mostrar códigos"}
                      title={showCodes ? "Ocultar códigos" : "Mostrar códigos"}
                    >
                      {showCodes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {showCodes ? 'Ocultar códigos' : 'Mostrar códigos'}
                    </button>

                    {showCodes && recoveryCodes.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {recoveryCodes.map((code, i) => (
                          <div key={i} className="px-3 py-2 rounded-lg text-center font-mono text-sm" style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.primary}30`, color: colors.text }}>
                            {code}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={copyCodes} 
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-white/5" 
                        style={{ color: colors.primary, border: `1px solid ${colors.primary}30` }}
                        aria-label="Copiar todos los códigos"
                        title="Copiar todos los códigos"
                        disabled={recoveryCodes.length === 0}
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? '¡Copiado!' : 'Copiar todos'}
                      </button>
                      <button 
                        onClick={downloadCodes} 
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 hover:bg-white/5" 
                        style={{ color: colors.primary, border: `1px solid ${colors.primary}30` }}
                        aria-label="Descargar códigos"
                        title="Descargar códigos"
                        disabled={recoveryCodes.length === 0}
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleComplete} 
                    className="w-full py-3 rounded-xl font-semibold transition-all" 
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    Entendido, cerrar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TwoFactorSetupPage;