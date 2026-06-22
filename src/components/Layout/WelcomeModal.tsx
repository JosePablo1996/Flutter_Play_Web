import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Clock, ArrowRight, Crown, ShieldCheck, Mail } from 'lucide-react';

interface UserDataType {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role?: string;
}

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseSeconds?: number;
  userData?: UserDataType | null;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  autoCloseSeconds = 5,
  userData: propUserData
}) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { colors } = useTheme();
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const [user, setUser] = useState<UserDataType | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener el rol correctamente
  const userRole = user?.role || authUser?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isVerified = user?.email !== undefined || authUser?.email !== undefined;

  // Usar datos del prop o del contexto o del localStorage
  useEffect(() => {
    let isMounted = true;
    
    const loadUserData = () => {
      if (!isMounted) return;
      
      setLoading(true);
      
      // Prioridad 1: Datos del prop
      if (propUserData && propUserData.email) {
        console.log('📱 [WelcomeModal] Usando datos del prop:', propUserData.email);
        setUser(propUserData);
        setLoading(false);
        return;
      }
      
      // Prioridad 2: Datos del contexto de autenticación
      if (authUser && authUser.email) {
        console.log('📱 [WelcomeModal] Usando datos del contexto:', authUser.email);
        const formattedUser: UserDataType = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.full_name || '',
          avatar_url: authUser.avatar_url,
          role: authUser.role
        };
        setUser(formattedUser);
        setLoading(false);
        return;
      }
      
      // Prioridad 3: Datos del localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('📱 [WelcomeModal] Usando datos del localStorage:', parsedUser.email);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      // Prioridad 4: Intentar obtener del token
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.email) {
            console.log('📱 [WelcomeModal] Usando datos del token:', payload.email);
            setUser({
              id: payload.sub || '',
              email: payload.email,
              full_name: payload.full_name || payload.email.split('@')[0],
              avatar_url: null,
              role: payload.role || 'user'
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      console.warn('📱 [WelcomeModal] No se pudo obtener datos del usuario');
      setLoading(false);
    };
    
    if (isOpen) {
      loadUserData();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCountdown(autoCloseSeconds);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, propUserData, authUser, autoCloseSeconds]);

  // Cuenta regresiva para cerrar automáticamente
  useEffect(() => {
    if (!isOpen || loading) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, onClose, navigate, loading]);

  if (!isOpen) return null;
  
  // Mostrar un loader mientras se cargan los datos
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative rounded-2xl p-8 text-center" style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)'
        }}>
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  const getInitials = (): string => {
    const name = user?.full_name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getUserName = (): string => {
    return user?.full_name || 'Usuario';
  };

  const getUserEmail = (): string => {
    return user?.email || 'usuario@email.com';
  };

  const getAvatarUrl = (): string | null => {
    if (user?.avatar_url && !avatarError) {
      return user.avatar_url;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const currentHour = new Date().getHours();
  
  const getGreeting = (): string => {
    if (currentHour >= 5 && currentHour < 12) return 'Buenos días';
    if (currentHour >= 12 && currentHour < 18) return 'Buenas tardes';
    if (currentHour >= 18 && currentHour < 22) return 'Buenas noches';
    return 'Buenas noches';
  };

  const getGreetingIcon = (): React.ReactNode => {
    return <Sparkles className="w-4 h-4" />;
  };

  const greeting = getGreeting();
  const greetingIcon = getGreetingIcon();
  const progressWidth = `${(countdown / autoCloseSeconds) * 100}%`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Barra de progreso */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: `${colors.border}` }}>
              <motion.div 
                className="h-full"
                initial={{ width: '100%' }}
                animate={{ width: progressWidth }}
                transition={{ duration: autoCloseSeconds, ease: "linear" }}
                style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
              />
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10"
              style={{ color: colors.textSecondary }}
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido */}
            <div className="p-8 text-center">
              {/* Avatar */}
              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      borderColor: colors.surface
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="font-bold text-4xl" style={{ color: colors.text }}>
                        {getInitials()}
                      </span>
                    )}
                  </div>
                  
                  {/* Badge de verificación en el avatar */}
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md bg-gradient-to-br from-green-500 to-green-600"
                        style={{ borderColor: colors.surface }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Badge de administrador en el avatar */}
                  {isAdmin && (
                    <div className="absolute -top-1 -right-1">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-md bg-gradient-to-br from-amber-500 to-yellow-500"
                        style={{ borderColor: colors.surface }}
                      >
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Saludo */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 backdrop-blur-sm"
                style={{ backgroundColor: `${colors.primary}15`, border: `1px solid ${colors.primary}30` }}
              >
                {greetingIcon}
                <span className="text-xs font-medium" style={{ color: colors.primary }}>{greeting}</span>
              </div>

              {/* Nombre */}
              <h2 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                {getUserName()}
              </h2>

              {/* Email */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Mail className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {getUserEmail()}
                </p>
              </div>

              {/* Badges */}
              <div className="flex justify-center gap-2 mb-6">
                {/* Badge de cuenta verificada */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/15 to-green-600/15 border border-green-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: colors.success }} />
                  <span className="text-xs font-medium" style={{ color: colors.success }}>Cuenta verificada</span>
                </div>
                
                {/* Badge de administrador */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30">
                    <Crown className="w-3.5 h-3.5" style={{ color: colors.warning }} />
                    <span className="text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                      Administrador
                    </span>
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                  </div>
                )}
              </div>

              {/* Línea decorativa */}
              <div className="w-16 h-px mx-auto my-4" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />

              {/* Cuenta regresiva */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4" style={{ color: colors.textSecondary }} />
                <span style={{ color: colors.textSecondary }}>
                  Cerrando en {countdown} segundo{countdown !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Botón continuar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="mt-4 w-full py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#ffffff'
                }}
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;