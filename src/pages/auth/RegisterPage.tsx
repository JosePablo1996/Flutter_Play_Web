import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NeonButton } from '../../components/UI/NeonButton';
import { NeonInput } from '../../components/UI/NeonInput';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  IdCard,
  Building2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Landmark,
  PiggyBank,
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react';

// Tipos para el formulario
interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  student_id: string;
  university: string;
}

interface RegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  full_name?: string;
  student_id?: string;
  university?: string;
  general?: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    student_id: '',
    university: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name as keyof RegisterErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'El nombre completo es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as ApiError;
      if (apiError.response?.data?.detail) {
        return apiError.response.data.detail;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Error al registrar usuario';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        student_id: formData.student_id || undefined,
        university: formData.university || undefined,
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
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
            {/* Logo grande */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
              <Landmark className="w-16 h-16 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.text }}>Flutter Play</h1>
            <p className="text-lg mb-8" style={{ color: colors.primary }}>Mi Banca Universitaria</p>
            
            <div className="w-16 h-0.5 rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
            
            <div className="space-y-6 text-left w-full">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}20` }}>
                  <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Seguridad avanzada</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Tus datos financieros protegidos</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.secondary}20` }}>
                  <PiggyBank className="w-5 h-5" style={{ color: colors.secondary }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Control financiero</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Gestiona tus gastos fácilmente</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.success}20` }}>
                  <Sparkles className="w-5 h-5" style={{ color: colors.success }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Experiencia universitaria</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Diseñado para estudiantes</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Formulario de registro */}
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
              {/* Logo para móvil */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <Landmark className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Flutter Play</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <PiggyBank className="w-4 h-4" style={{ color: colors.primary }} />
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Crear Cuenta</p>
                  <BookOpen className="w-4 h-4" style={{ color: colors.secondary }} />
                </div>
              </div>

              {/* Título para desktop */}
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Crear cuenta</h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Comienza a gestionar tus finanzas</p>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}30`, color: colors.error }}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Grid de campos principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeonInput
                    label="Nombre Completo"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    error={errors.full_name}
                    required
                    icon={<User className="w-5 h-5" />}
                  />

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

                  <NeonInput
                    label="ID de Estudiante (opcional)"
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="Ej: 20240001"
                    icon={<IdCard className="w-5 h-5" />}
                  />

                  <NeonInput
                    label="Universidad (opcional)"
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="Ej: Universidad Nacional"
                    icon={<Building2 className="w-5 h-5" />}
                  />
                </div>

                {/* Campo de contraseña con medidor de fortaleza */}
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

                {/* Campo de confirmar contraseña */}
                <div>
                  <label className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-3 focus:outline-none transition-all pr-12"
                      style={{ 
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${errors.confirmPassword ? colors.error : colors.border}`,
                        color: colors.text,
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
                  {errors.confirmPassword && (
                    <p className="text-sm mt-1" style={{ color: colors.error }}>{errors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.success }}>
                      <CheckCircle className="w-3 h-3" />
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <NeonButton type="submit" loading={loading} fullWidth variant="primary">
                  Crear Cuenta
                </NeonButton>
              </form>

              {/* Enlace corregido a /login */}
              <div className="mt-6 text-center">
                <p className="text-sm flex items-center justify-center gap-1" style={{ color: colors.textSecondary }}>
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="font-semibold hover:underline inline-flex items-center gap-1 transition-colors" style={{ color: colors.primary }}>
                    Inicia Sesión aquí
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;