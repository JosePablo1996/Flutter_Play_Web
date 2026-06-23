import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NeonButton } from '../../components/UI/NeonButton';
import { NeonInput } from '../../components/UI/NeonInput';
import WelcomeModal from '../../components/Layout/WelcomeModal';
import { TwoFactorVerifyModal } from '../TwoFactorSetup/TwoFactorVerifyModal';
import { webauthnService } from '../../services/webauthnService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  Key,
  Smartphone,
  Fingerprint,
  ArrowRight,
  Shield,
  PiggyBank,
  Landmark,
  LogIn,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

// Tipos para el formulario
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Función para calcular la fortaleza de la contraseña
const getPasswordStrength = (password: string): { score: number; text: string; color: string; barColor: string } => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score <= 1) return { score: 20, text: 'Muy débil', color: 'text-red-500', barColor: 'bg-red-500' };
  if (score === 2) return { score: 40, text: 'Débil', color: 'text-orange-500', barColor: 'bg-orange-500' };
  if (score === 3) return { score: 60, text: 'Media', color: 'text-yellow-500', barColor: 'bg-yellow-500' };
  if (score === 4) return { score: 80, text: 'Fuerte', color: 'text-lime-500', barColor: 'bg-lime-500' };
  return { score: 100, text: 'Muy fuerte', color: 'text-neon-green', barColor: 'bg-neon-green' };
};

// Componente de barra de fortaleza
const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { colors } = useTheme();
  if (!password) return null;
  
  const strength = getPasswordStrength(password);
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: colors.textSecondary }}>Fortaleza de la contraseña</span>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.text}
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.border}` }}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${strength.barColor}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <div className="grid grid-cols-4 gap-1 mt-1">
        <div className="flex items-center gap-1">
          <span className={`text-xs ${password.length >= 6 ? 'text-neon-green' : 'text-white/30'}`}>
            {password.length >= 6 ? '✓' : '○'}
          </span>
          <span className={`text-[10px] ${password.length >= 6 ? 'text-white/70' : 'text-white/30'}`}>
            Mínimo 6
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${/[A-Z]/.test(password) ? 'text-neon-green' : 'text-white/30'}`}>
            {/[A-Z]/.test(password) ? '✓' : '○'}
          </span>
          <span className={`text-[10px] ${/[A-Z]/.test(password) ? 'text-white/70' : 'text-white/30'}`}>
            Mayúsculas
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${/[0-9]/.test(password) ? 'text-neon-green' : 'text-white/30'}`}>
            {/[0-9]/.test(password) ? '✓' : '○'}
          </span>
          <span className={`text-[10px] ${/[0-9]/.test(password) ? 'text-white/70' : 'text-white/30'}`}>
            Números
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? 'text-neon-green' : 'text-white/30'}`}>
            {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}
          </span>
          <span className={`text-[10px] ${/[^A-Za-z0-9]/.test(password) ? 'text-white/70' : 'text-white/30'}`}>
            Símbolos
          </span>
        </div>
      </div>
    </div>
  );
};

// Modal de opciones de inicio de sesión
const LoginOptionsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onPasskeySuccess: () => void;
  onPasskeyError: (error: string) => void;
  onOtpNavigate: () => void;
}> = ({ 
  isOpen, 
  onClose, 
  onPasskeySuccess, 
  onPasskeyError,
  onOtpNavigate
}) => {
  const { colors } = useTheme();
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Detectar entorno: Solo mostrar Passkey en desarrollo
  const isDevelopment = import.meta.env.DEV;

  const handleOtpLogin = () => {
    onClose();
    onOtpNavigate();
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    try {
      const result = await webauthnService.authenticatePasskeyWithoutEmail();
      
      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('access_token', result.token);
        localStorage.setItem('token', result.token);
        onClose();
        onPasskeySuccess();
      } else {
        onPasskeyError(result.error || 'Error al autenticar con passkey');
        onClose();
      }
    } catch (error) {
      console.error('Error en autenticación passkey:', error);
      onPasskeyError('Error al autenticar con passkey');
      onClose();
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="relative px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                <Key className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.text }}>Otras formas de inicio</h2>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Elige cómo quieres acceder</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Botón OTP - Siempre visible */}
          <button
            onClick={handleOtpLogin}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: `${colors.background}cc`,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium" style={{ color: colors.text }}>Iniciar con código OTP</p>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Recibe un código por email</p>
            </div>
            <ArrowRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
          </button>

          {/* Botón Passkey - SOLO EN DESARROLLO */}
          {isDevelopment && (
            <button
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ 
                backgroundColor: `${colors.background}cc`,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                {passkeyLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Fingerprint className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium" style={{ color: colors.text }}>
                  {passkeyLoading ? 'Autenticando...' : 'Iniciar con Passkey'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Usa Windows Hello, Face ID o huella digital</p>
              </div>
              {!passkeyLoading && <ArrowRight className="w-5 h-5" style={{ color: colors.textSecondary }} />}
            </button>
          )}
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: colors.border }}>
          <p className="text-xs text-center" style={{ color: colors.textSecondary }}>
            También puedes iniciar sesión con tu correo y contraseña
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [showLoginOptions, setShowLoginOptions] = useState<boolean>(false);
  
  // Estados para 2FA
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user');
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [generalError, setGeneralError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name as keyof LoginErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validate = (): boolean => {
    const newErrors: LoginErrors = {};
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserProfile = async (token: string, email: string): Promise<{ name: string; avatar: string; role: string }> => {
    try {
      const profileResponse = await fetch('/api/v1/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('📱 [LoginPage] Perfil obtenido:', profileData);
        return {
          name: profileData.full_name || email.split('@')[0],
          avatar: profileData.avatar_url || '',
          role: profileData.role || 'user'
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    return { name: email.split('@')[0], avatar: '', role: 'user' };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');
    try {
      const result = await login({ 
        email: formData.email, 
        password: formData.password 
      });

      if (result.requires2FA && result.tempToken) {
        setTempToken(result.tempToken);
        setUserEmail(formData.email);
        
        if (result.user) {
          console.log('📱 [LoginPage] Usuario desde result.user:', result.user);
          setUserFullName(result.user.full_name || formData.email.split('@')[0]);
          setUserAvatar(result.user.avatar_url || '');
          setUserRole(result.user.role || 'user');
          setShow2FAModal(true);
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
          const { name, avatar, role } = await fetchUserProfile(token, formData.email);
          setUserFullName(name);
          setUserAvatar(avatar);
          setUserRole(role || 'user');
        } else {
          setUserFullName(formData.email.split('@')[0]);
          setUserRole('user');
        }
        
        setShow2FAModal(true);
        setLoading(false);
        return;
      }

      await refreshUser();
      setShowWelcome(true);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al iniciar sesión';
      setGeneralError(errorMessage);
      setLoading(false);
    }
  };

  const handle2FASuccess = async () => {
    setShow2FAModal(false);
    await refreshUser();
    setShowWelcome(true);
  };

  const handle2FAError = (error: string) => {
    console.error('Error 2FA:', error);
    setGeneralError('Error de verificación 2FA. Intenta nuevamente.');
  };

  const handle2FABack = () => {
    setShow2FAModal(false);
    setTempToken('');
    setUserEmail('');
    setUserFullName('');
    setUserAvatar('');
    setUserRole('user');
    sessionStorage.removeItem('temp_2fa_token');
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    navigate('/dashboard');
  };

  const handlePasskeySuccess = async () => {
    console.log('🔐 [LoginPage] Passkey exitoso, refrescando usuario...');
    try {
      await refreshUser();
      setShowWelcome(true);
    } catch (error) {
      console.error('Error refreshing user after passkey:', error);
      setGeneralError('Error al cargar los datos del usuario');
    }
  };

  const handlePasskeyError = (error: string) => {
    setGeneralError(error);
  };

  const handleOtpNavigate = () => {
    navigate('/login-otp');
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 py-8 md:py-12 overflow-y-auto" style={{ backgroundColor: colors.background }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl my-4 md:my-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Columna izquierda - Logo e información */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden lg:flex flex-col justify-center items-center p-6 md:p-8 rounded-2xl backdrop-blur-sm text-center"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                <Landmark className="w-14 h-14 md:w-16 md:h-16 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.text }}>Flutter Play</h1>
              <p className="text-base md:text-lg mb-6 md:mb-8" style={{ color: colors.primary }}>Mi Banca Universitaria</p>
              
              <div className="w-16 h-0.5 rounded-full mb-6 md:mb-8" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
              
              <div className="space-y-4 md:space-y-6 text-left w-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}20` }}>
                    <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Seguridad avanzada</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Protegemos tus datos con autenticación de dos factores</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.secondary}20` }}>
                    <PiggyBank className="w-5 h-5" style={{ color: colors.secondary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Control financiero</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Gestiona tus gastos y presupuestos fácilmente</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.success}20` }}>
                    <Sparkles className="w-5 h-5" style={{ color: colors.success }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Experiencia moderna</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Diseño intuitivo y adaptado a estudiantes universitarios</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Columna derecha - Formulario de login */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <div className="w-full rounded-2xl p-5 md:p-8 backdrop-blur-sm max-h-[90vh] overflow-y-auto" style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1)`
              }}>
                <div className="lg:hidden text-center mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    <Landmark className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text }}>Flutter Play</h1>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <PiggyBank className="w-4 h-4" style={{ color: colors.primary }} />
                    <p className="text-xs md:text-sm" style={{ color: colors.textSecondary }}>Mi Banca Universitaria</p>
                    <Building2 className="w-4 h-4" style={{ color: colors.secondary }} />
                  </div>
                </div>

                <div className="hidden lg:block text-center mb-6 md:mb-8">
                  <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Bienvenido de vuelta</h2>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Inicia sesión para continuar</p>
                </div>

                {generalError && (
                  <div className="mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}30`, color: colors.error }}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{generalError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                  <NeonInput
                    label="Correo Electrónico"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    error={errors.email}
                    required
                    icon={<Mail className="w-5 h-5" />}
                  />

                  <div>
                    <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-lg px-4 py-3 focus:outline-none transition-all pr-12"
                        style={{ 
                          backgroundColor: `${colors.background}cc`,
                          border: `1px solid ${errors.password ? colors.error : colors.border}`,
                          color: colors.text,
                        }}
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
                    {errors.password && (
                      <p className="text-sm mt-1" style={{ color: colors.error }}>{errors.password}</p>
                    )}

                    <StrengthBar password={formData.password} />
                  </div>

                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm hover:underline flex items-center gap-1 transition-colors" style={{ color: colors.primary }}>
                      ¿Olvidaste tu contraseña?
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <NeonButton type="submit" loading={loading} fullWidth variant="primary">
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </NeonButton>
                </form>

                <div className="relative my-4 md:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: colors.border }} />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 flex items-center gap-1" style={{ backgroundColor: colors.surface, color: colors.textSecondary }}>
                      <Shield className="w-3 h-3" />
                      O
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLoginOptions(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm"
                  style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                >
                  <Key className="w-4 h-4" />
                  Inicie sesión de otras formas
                </motion.button>

                <div className="mt-4 md:mt-6 text-center">
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="font-semibold hover:underline inline-flex items-center gap-1 transition-colors" style={{ color: colors.primary }}>
                      Regístrate aquí
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        <LoginOptionsModal
          isOpen={showLoginOptions}
          onClose={() => setShowLoginOptions(false)}
          onPasskeySuccess={handlePasskeySuccess}
          onPasskeyError={handlePasskeyError}
          onOtpNavigate={handleOtpNavigate}
        />
      </AnimatePresence>

      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeClose}
        autoCloseSeconds={5}
      />

      <TwoFactorVerifyModal
        isOpen={show2FAModal}
        email={userEmail}
        tempToken={tempToken}
        userFullName={userFullName}
        userAvatar={userAvatar}
        userRole={userRole}
        isVerified={true}
        onSuccess={handle2FASuccess}
        onError={handle2FAError}
        onBack={handle2FABack}
      />
    </>
  );
};

export default LoginPage;