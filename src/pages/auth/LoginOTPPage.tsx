import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeonButton } from '../../components/UI/NeonButton';
import { NeonInput } from '../../components/UI/NeonInput';
import { NeonCard } from '../../components/UI/NeonCard';
import WelcomeModal from '../../components/Layout/WelcomeModal';
import TwoFactorVerifyModal from '../TwoFactorSetup/TwoFactorVerifyModal';
import api from '../../services/api';
import {
  Mail,
  Smartphone,
  Key,
  ArrowLeft,
  User,
  CheckCircle,
  Clock,
  Shield,
  PiggyBank,
  Send,
  LogIn
} from 'lucide-react';

type Step = 'email' | 'otp';

interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role?: string;
}

interface UserDataType {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role?: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

const LoginOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedUser, setLoggedUser] = useState<UserDataType | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  
  // Estados para manejar el 2FA
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<UserDataType | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const apiError = err as ApiError;
      if (apiError.response?.data?.detail) {
        return apiError.response.data.detail;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Error al procesar la solicitud';
  };

  const startCountdown = (seconds: number = 60) => {
    setCountdown(seconds);
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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const response = await api.post('/auth/login-otp-request', null, { 
        params: { email } 
      });
      setUserInfo(response.data.user);
      setStep('otp');
      setCanResend(false);
      startCountdown(60);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
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
      await api.post('/auth/login-otp-request', null, { params: { email } });
      setCanResend(false);
      startCountdown(60);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar verificación OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Ingresa un código válido de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login-with-otp', null, {
        params: { email, otp_code: otpCode }
      });
      
      console.log('Respuesta login-with-otp:', response.data);
      
      // VERIFICAR SI REQUIERE 2FA
      if (response.data.requires_2fa === true) {
        // Guardar temp_token para usar en el modal de 2FA
        const tempTokenValue = response.data.temp_token;
        const userData: UserDataType = response.data.user;
        
        console.log('🔐 2FA requerido - Temp token:', tempTokenValue);
        
        setTempToken(tempTokenValue);
        setPendingUser(userData);
        setShow2FAModal(true);
        setLoading(false);
        return;
      }
      
      // SIN 2FA: Login normal
      const token = response.data.access_token;
      const userData: UserDataType = response.data.user;
      
      if (!token) {
        throw new Error('No se recibió token de acceso');
      }
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Guardar usuario para el modal
      setLoggedUser(userData);
      
      // Mostrar modal de bienvenida
      setShowWelcome(true);
      
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Manejar éxito de 2FA (callback del modal)
  const handle2FASuccess = () => {
    // El modal ya guardó el token en localStorage
    // Solo cerramos el modal y mostramos bienvenida
    setShow2FAModal(false);
    
    // Recuperar el usuario del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedUser(JSON.parse(storedUser));
    }
    
    setShowWelcome(true);
  };

  // Manejar error de 2FA
  const handle2FAError = (errorMsg: string) => {
    console.error('Error 2FA:', errorMsg);
  };

  // Manejar volver atrás desde el modal 2FA
  const handle2FABack = () => {
    setShow2FAModal(false);
    setTempToken(null);
    setPendingUser(null);
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    window.location.href = '/dashboard';
  };

  // Pantalla de email (Paso 1)
  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
        <div className="w-full max-w-xl slide-up">
          <NeonCard>
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.5)]">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Flutter Play</h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <PiggyBank className="w-4 h-4 text-neon-green" />
                <p className="text-white/50 text-xs">Mi Banca Universitaria</p>
                <Shield className="w-4 h-4 text-neon-blue" />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neon-green/20 flex items-center justify-center">
                <Key className="w-8 h-8 text-neon-green" />
              </div>
              <h2 className="text-xl font-bold text-white">Iniciar con código OTP</h2>
              <p className="text-white/50 text-sm mt-1">
                Recibirás un código de verificación por email
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-neon-red/20 border border-neon-red/50 text-neon-red text-sm text-center flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-5">
              <NeonInput
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                icon={<Mail className="w-5 h-5" />}
              />

              <NeonButton type="submit" loading={loading} fullWidth variant="primary">
                <Send className="w-4 h-4 mr-2" />
                Enviar código
              </NeonButton>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-neon-green hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          </NeonCard>
        </div>
      </div>
    );
  }

  // Pantalla de código OTP (Paso 2)
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
        <div className="w-full max-w-xl slide-up">
          <NeonCard>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.5)]">
                <LogIn className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Verificar código</h2>
              <p className="text-white/50 text-xs mt-1">
                Ingresa el código que enviamos a tu correo
              </p>
            </div>

            {userInfo && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center overflow-hidden">
                    {userInfo.avatar_url && !avatarError ? (
                      <img
                        src={userInfo.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{userInfo.full_name}</p>
                    <p className="text-white/50 text-xs">{userInfo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-neon-red/20 border border-neon-red/50 text-neon-red text-sm text-center flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Código de verificación
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-12 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-neon-green"
                    autoFocus
                  />
                </div>
              </div>

              <NeonButton type="submit" loading={loading} fullWidth variant="primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verificar y acceder
              </NeonButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="text-sm text-neon-green hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {canResend ? (
                    <>
                      <Send className="w-3 h-3" />
                      Reenviar código
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      Reenviar código en {countdown}s
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Usar otro correo
                </button>
              </div>
            </form>
          </NeonCard>
        </div>
      </div>

      {/* MODAL DE VERIFICACIÓN 2FA */}
      <TwoFactorVerifyModal
        isOpen={show2FAModal}
        email={pendingUser?.email || email}
        tempToken={tempToken || ''}
        userFullName={pendingUser?.full_name}
        userAvatar={pendingUser?.avatar_url || undefined}
        userRole={pendingUser?.role}
        isVerified={true}
        onSuccess={handle2FASuccess}
        onError={handle2FAError}
        onBack={handle2FABack}
      />

      {/* Modal de bienvenida */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={handleWelcomeClose}
        userData={loggedUser}
        autoCloseSeconds={5}
      />
    </>
  );
};

export default LoginOTPPage;