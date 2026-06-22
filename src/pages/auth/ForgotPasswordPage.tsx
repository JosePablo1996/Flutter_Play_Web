import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { NeonButton } from '../../components/UI/NeonButton';
import { NeonInput } from '../../components/UI/NeonInput';
import { motion } from 'framer-motion';
import api from '../../services/api';
import {
  ArrowLeft,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  PiggyBank
} from 'lucide-react';

type Step = 'otp' | 'newPassword';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('otp');
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
    } else {
      // Si no hay email, redirigir a forgot-password
      navigate('/forgot-password');
    }
  }, [location, navigate]);

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

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword !== '' && newPassword === confirmPassword;
  const isPasswordValid = newPassword.length >= 6;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.success}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: colors.success }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>¡Contraseña actualizada!</h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Tu contraseña ha sido restablecida correctamente.
            Serás redirigido al inicio de sesión.
          </p>
        </div>
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
              <Shield className="w-16 h-16 text-white" />
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
            </div>
          </motion.div>

          {/* Columna derecha - Formulario */}
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
              {step === 'otp' ? (
                <>
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                        <Key className="w-8 h-8" style={{ color: colors.primary }} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Verificar código</h2>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Ingresa el código de verificación enviado a <strong>{email}</strong>
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
                        className="text-sm hover:underline disabled:opacity-50"
                        style={{ color: colors.primary }}
                      >
                        {canResend ? 'Reenviar código' : `Reenviar en ${countdown}s`}
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs inline-flex items-center gap-1 transition-colors"
                        style={{ color: colors.textSecondary }}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Usar otro correo
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: colors.textSecondary }}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {newPassword.length > 0 && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }} />
                          </div>
                          <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>{passwordStrength.text}</p>
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
                          style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${confirmPassword && !passwordsMatch ? colors.error : colors.border}`, color: colors.text }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: colors.textSecondary }}
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

                    <NeonButton type="submit" loading={loading} fullWidth variant="primary" disabled={!isPasswordValid || !passwordsMatch}>
                      Restablecer contraseña
                    </NeonButton>
                  </form>
                </>
              )}

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