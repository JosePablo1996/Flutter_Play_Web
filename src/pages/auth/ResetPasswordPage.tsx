import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { NeonButton } from '../../components/UI/NeonButton';
import { NeonInput } from '../../components/UI/NeonInput';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
  ArrowLeft,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  PiggyBank,
  Sparkles,
  Mail,
  Lock,
  Landmark
} from 'lucide-react';

type Step = 'welcome' | 'otp' | 'newPassword';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Obtener email del estado de navegación
  useEffect(() => {
    const state = location.state as { email?: string; otpSent?: boolean };
    if (state?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(state.email);
    }
  }, [location]);

  const startCountdown = (seconds: number = 60) => {
    setCountdown(seconds);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setError('El email es requerido');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/request-otp', null, { params: { email } });
      setStep('otp');
      startCountdown(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar el código';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/request-otp', null, { params: { email } });
      startCountdown(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reenviar el código';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', null, { 
        params: { email, otp_code: otpCode } 
      });
      setResetToken(response.data.reset_token);
      setStep('newPassword');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Código inválido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 1) return { score: 20, text: 'Muy débil', color: colors.error };
    if (score === 2) return { score: 40, text: 'Débil', color: colors.warning };
    if (score === 3) return { score: 60, text: 'Media', color: colors.warning };
    if (score === 4) return { score: 80, text: 'Fuerte', color: colors.success };
    return { score: 100, text: 'Muy fuerte', color: colors.success };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password-with-otp', null, {
        params: { reset_token: resetToken, new_password: newPassword }
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer la contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToEmailStep = () => {
    setStep('welcome');
    setError('');
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword !== '' && newPassword === confirmPassword;
  const isPasswordValid = newPassword.length >= 6;

  // Función para obtener la clase del círculo de paso
  const getStepCircleClass = (stepNumber: 1 | 2 | 3, currentStep: Step): string => {
    const isActive = 
      (stepNumber === 1 && currentStep === 'welcome') ||
      (stepNumber === 2 && currentStep === 'otp') ||
      (stepNumber === 3 && currentStep === 'newPassword');
    
    
    const baseClass = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300";
    
    if (isActive) {
      return `${baseClass} ring-2 ring-offset-2`;
    }
    return baseClass;
  };

  // Función para obtener el estilo del círculo de paso
  const getStepCircleStyle = (stepNumber: 1 | 2 | 3, currentStep: Step): React.CSSProperties => {
    const isActive = 
      (stepNumber === 1 && currentStep === 'welcome') ||
      (stepNumber === 2 && currentStep === 'otp') ||
      (stepNumber === 3 && currentStep === 'newPassword');
    
    const isCompleted = 
      (stepNumber === 1 && (currentStep === 'otp' || currentStep === 'newPassword')) ||
      (stepNumber === 2 && currentStep === 'newPassword');
    
    if (isActive) {
      return {
        backgroundColor: colors.primary,
        color: '#ffffff',
        boxShadow: `0 0 0 2px ${colors.surface}, 0 0 0 4px ${colors.primary}`
      };
    }
    if (isCompleted) {
      return {
        backgroundColor: colors.primary,
        color: '#ffffff'
      };
    }
    return {
      backgroundColor: colors.border,
      color: colors.textSecondary
    };
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.success}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: colors.success }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>¡Contraseña actualizada!</h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Tu contraseña ha sido restablecida correctamente.
            Serás redirigido al inicio de sesión.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna izquierda - Logo e información */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden lg:flex flex-col justify-center items-center p-8 rounded-2xl backdrop-blur-sm text-center"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
              <Landmark className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>Flutter Play</h1>
            <p className="text-lg mb-8" style={{ color: colors.primary }}>Mi Banca Universitaria</p>
            <div className="w-16 h-0.5 rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
            <div className="space-y-6 text-left w-full">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                  <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Verificación OTP</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Código de un solo uso</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}20` }}>
                  <PiggyBank className="w-5 h-5" style={{ color: colors.secondary }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Recuperación segura</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Restablece tu contraseña fácilmente</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.success}20` }}>
                  <Sparkles className="w-5 h-5" style={{ color: colors.success }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Protección avanzada</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Tu cuenta está segura</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Formulario según paso */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="rounded-2xl p-8 backdrop-blur-sm" style={{ 
              backgroundColor: `${colors.surface}cc`,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1)`
            }}>
              
              {/* Indicador de pasos */}
              <div className="flex items-center justify-center mb-8 gap-2">
                <div className="flex items-center">
                  <div 
                    className={getStepCircleClass(1, step)}
                    style={getStepCircleStyle(1, step)}
                  >
                    1
                  </div>
                  <div 
                    className="w-12 h-0.5 transition-all duration-300" 
                    style={{ backgroundColor: step === 'otp' || step === 'newPassword' ? colors.primary : colors.border }} 
                  />
                </div>
                <div className="flex items-center">
                  <div 
                    className={getStepCircleClass(2, step)}
                    style={getStepCircleStyle(2, step)}
                  >
                    2
                  </div>
                  <div 
                    className="w-12 h-0.5 transition-all duration-300" 
                    style={{ backgroundColor: step === 'newPassword' ? colors.primary : colors.border }} 
                  />
                </div>
                <div className="flex items-center">
                  <div 
                    className={getStepCircleClass(3, step)}
                    style={getStepCircleStyle(3, step)}
                  >
                    3
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* PASO 1: Bienvenida y email */}
                {step === 'welcome' && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                          <Lock className="w-8 h-8" style={{ color: colors.primary }} />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>¿Olvidaste tu contraseña?</h2>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta.
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}10` }}>
                        <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                        <p className="text-sm" style={{ color: colors.text }}>Recibirás un código de verificación OTP</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}10` }}>
                        <CheckCircle className="w-5 h-5" style={{ color: colors.secondary }} />
                        <p className="text-sm" style={{ color: colors.text }}>El código es válido por 10 minutos</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${colors.success}10` }}>
                        <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
                        <p className="text-sm" style={{ color: colors.text }}>Podrás establecer una nueva contraseña</p>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}30`, color: colors.error }}>
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <NeonInput
                      label="Correo Electrónico"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      icon={<Mail className="w-5 h-5" />}
                    />

                    <div className="mt-6 space-y-4">
                      <NeonButton onClick={handleRequestOTP} loading={loading} fullWidth variant="primary">
                        Enviar código de verificación
                      </NeonButton>

                      <div className="text-center">
                        <button
                          onClick={() => navigate('/login')}
                          className="text-sm hover:underline inline-flex items-center gap-1 transition-colors"
                          style={{ color: colors.primary }}
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Volver al inicio de sesión
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PASO 2: Verificar código OTP */}
                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                          <Key className="w-8 h-8" style={{ color: colors.primary }} />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Verificar código</h2>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Ingresa el código de verificación enviado a <strong style={{ color: colors.primary }}>{email}</strong>
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}30`, color: colors.error }}>
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      <NeonInput
                        label="Código OTP"
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000000"
                        required
                        icon={<Key className="w-5 h-5" />}
                      />

                      <NeonButton type="submit" loading={loading} fullWidth variant="primary">
                        Verificar código
                      </NeonButton>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={!canResend}
                          className="text-sm hover:underline disabled:opacity-50 transition-colors"
                          style={{ color: colors.primary }}
                        >
                          {canResend ? 'Reenviar código' : `Reenviar en ${countdown}s`}
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={goToEmailStep}
                          className="text-xs inline-flex items-center gap-1 transition-colors"
                          style={{ color: colors.textSecondary }}
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Usar otro correo
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* PASO 3: Nueva contraseña */}
                {step === 'newPassword' && (
                  <motion.div
                    key="newPassword"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.success}20` }}>
                          <CheckCircle className="w-8 h-8" style={{ color: colors.success }} />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Nueva contraseña</h2>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Crea una contraseña segura para tu cuenta</p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}30`, color: colors.error }}>
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>Nueva contraseña *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg px-4 py-3 focus:outline-none transition-all pr-12"
                            style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.border}`, color: colors.text }}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: colors.textSecondary }}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {newPassword.length > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs" style={{ color: colors.textSecondary }}>Fortaleza:</span>
                              <span className="text-xs" style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>Confirmar contraseña *</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg px-4 py-3 focus:outline-none transition-all pr-12"
                            style={{ 
                              backgroundColor: `${colors.background}cc`, 
                              border: `1px solid ${confirmPassword && !passwordsMatch ? colors.error : colors.border}`, 
                              color: colors.text 
                            }}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: colors.textSecondary }}
                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {confirmPassword && passwordsMatch && isPasswordValid && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.success }}>
                            <CheckCircle className="w-3 h-3" /> Las contraseñas coinciden
                          </p>
                        )}
                      </div>

                      <NeonButton 
                        type="submit" 
                        loading={loading} 
                        fullWidth 
                        variant="primary" 
                        disabled={!isPasswordValid || !passwordsMatch}
                      >
                        Restablecer contraseña
                      </NeonButton>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm hover:underline inline-flex items-center gap-1 transition-colors"
                  style={{ color: colors.primary }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;