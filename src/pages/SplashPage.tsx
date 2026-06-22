// src/pages/SplashPage.tsx
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  PiggyBank, 
  Landmark, 
  Fingerprint,
  Crown,
  Heart,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface SplashPageProps {
  minimumDisplayTime?: number;
  onComplete?: () => void;
}

// Versión de la aplicación
const APP_VERSION = "2.6.0";

// Clave para sessionStorage
const SPLASH_REDIRECT_KEY = 'splash_redirected';

const SplashPage: React.FC<SplashPageProps> = ({ 
  minimumDisplayTime = 3500,
  onComplete 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const { colors } = useTheme();
  
  // Estados
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  // REFS: Para controlar que la redirección solo ocurra una vez
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ CORREGIDO: Valor directo, sin función de inicialización
  const hasRedirected = useRef<boolean>(
    sessionStorage.getItem(SPLASH_REDIRECT_KEY) === 'true'
  );
  
  const isMounted = useRef<boolean>(true);

  // Determinar si el usuario es admin
  const isAdmin = user?.role === 'admin';

  // Mensajes dinámicos según el progreso
  const loadingMessages = useMemo(() => [
    { min: 0, max: 20, text: "🔐 Iniciando sesión segura..." },
    { min: 20, max: 40, text: "🛡️ Verificando credenciales..." },
    { min: 40, max: 60, text: "💰 Preparando tu billetera..." },
    { min: 60, max: 80, text: "📊 Cargando tus datos financieros..." },
    { min: 80, max: 95, text: "✨ Casi listo, ultimando detalles..." },
    { min: 95, max: 100, text: "🎉 ¡Bienvenido a Flutter Play!" },
  ], []);

  // Generar posiciones de partículas de forma determinista
  const particlePositions = useMemo(() => {
    const positions: Array<{ x: number; y: number; duration: number; delay: number; size: number }> = [];
    for (let i = 0; i < 30; i++) {
      const seed = (i * 131071) % 1000 / 1000;
      positions.push({
        x: 10 + (seed * 80),
        y: 5 + (i * 3) % 90,
        duration: 3 + (i % 5),
        delay: (i * 0.2) % 4,
        size: 1 + (i % 3),
      });
    }
    return positions;
  }, []);

  // Obtener el mensaje actual basado en el progreso
  const currentMessage = useMemo(() => {
    return loadingMessages.find(
      msg => progress >= msg.min && progress < msg.max
    ) || loadingMessages[0];
  }, [progress, loadingMessages]);

  // Función para manejar la redirección - SOLO UNA VEZ
  const handleRedirect = useCallback(() => {
    // Si ya se redirigió en esta sesión, no hacer nada
    if (hasRedirected.current) {
      console.log('🔄 [Splash] Redirección ya realizada en esta sesión');
      return;
    }
    
    console.log('🚀 [Splash] Ejecutando redirección...');
    
    // Marcar que ya se está redirigiendo en sessionStorage
    hasRedirected.current = true;
    sessionStorage.setItem(SPLASH_REDIRECT_KEY, 'true');
    
    // Limpiar timer anterior si existe
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    
    // Programar la redirección con un pequeño retraso
    redirectTimerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      
      console.log('📍 [Splash] Navegando a:', isAuthenticated ? '/dashboard' : '/login');
      
      if (onComplete) {
        onComplete();
      } else if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 500);
  }, [isAuthenticated, navigate, onComplete]);

  // Efecto para la barra de progreso
  useEffect(() => {
    // Si ya se redirigió, no iniciar el progreso
    if (hasRedirected.current) {
      console.log('⏭️ [Splash] Saltando progreso - ya redirigido');
      return;
    }

    console.log('📊 [Splash] Iniciando barra de progreso');
    const startTime = Date.now();
    
    // Limpiar intervalo anterior si existe
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minimumDisplayTime) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        console.log('✅ [Splash] Progreso completado');
        setLoadingComplete(true);
      }
    }, 16);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [minimumDisplayTime]);

  // Efecto para manejar la redirección cuando se completa la carga
  useEffect(() => {
    // Si ya se redirigió, no hacer nada
    if (hasRedirected.current) {
      return;
    }

    // Solo proceder si:
    // 1. La carga está completa
    // 2. La autenticación ya no está cargando
    // 3. El componente está montado
    if (loadingComplete && !loading && isMounted.current) {
      console.log('🎯 [Splash] Carga completa, preparando redirección...');
      handleRedirect();
    }
    
    // Cleanup
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [loadingComplete, loading, handleRedirect]);

  // Efecto para manejar el caso en que el usuario ya está autenticado
  useEffect(() => {
    // Si ya se redirigió, no hacer nada
    if (hasRedirected.current) {
      return;
    }

    // Si el usuario está autenticado y la carga ya pasó, redirigir
    if (isAuthenticated && !loading && isMounted.current) {
      // Esperar un poco para que se vea la animación
      const timer = setTimeout(() => {
        if (!hasRedirected.current && isMounted.current) {
          console.log('👤 [Splash] Usuario autenticado, redirigiendo...');
          handleRedirect();
        }
      }, Math.min(minimumDisplayTime * 0.3, 1000));
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, handleRedirect, minimumDisplayTime]);

  // Efecto para limpiar al desmontar
  useEffect(() => {
    // Verificar si ya hay una redirección en curso
    if (sessionStorage.getItem(SPLASH_REDIRECT_KEY) === 'true') {
      hasRedirected.current = true;
    }

    return () => {
      isMounted.current = false;
      // Limpiar timers
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.3, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 200, 
        damping: 20,
        duration: 0.9
      }
    }
  };

  const textVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 15,
        delay: 0.4
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      transition: { delay: 0.6 + i * 0.08, duration: 0.4 }
    })
  };

  // Características en una sola fila
  const features = [
    { icon: Shield, text: "Seguridad avanzada", color: colors.primary },
    { icon: PiggyBank, text: "Control financiero", color: colors.success },
    { icon: Fingerprint, text: "Acceso biométrico", color: colors.info },
  ];

  // Verificar si mostrar iconos de celebración
  const showCelebrationIcons = progress >= 95;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="splash"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen w-full"
        style={{ 
          background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`,
        }}
      >
        {/* Badge de versión en esquina superior derecha */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20"
        >
          <div 
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium backdrop-blur-sm"
            style={{ 
              backgroundColor: `${colors.primary}15`,
              border: `1px solid ${colors.primary}30`,
              color: colors.primary
            }}
          >
            v{APP_VERSION}
          </div>
        </motion.div>

        {/* Efecto de brillo de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: colors.primary }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: colors.secondary }}
            animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: colors.primary }}
          />
        </div>

        {/* Contenido principal - Responsive */}
        <div className="relative z-10 text-center px-4 max-w-md sm:max-w-lg mx-auto w-full">
          {/* Logo animado */}
          <motion.div
            variants={logoVariants}
            className="mb-4 sm:mb-6"
          >
            <div 
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 40px ${colors.primary}40`
              }}
            >
              <Landmark className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
            </div>
          </motion.div>

          {/* Título */}
          <motion.div variants={textVariants} className="mb-1 sm:mb-2">
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Flutter Play
            </h1>
          </motion.div>

          {/* Subtítulo */}
          <motion.p 
            variants={textVariants}
            className="text-xs sm:text-sm mb-4 sm:mb-6"
            style={{ color: colors.textSecondary }}
          >
            Mi Banca Universitaria
          </motion.p>

          {/* Badges */}
          <motion.div 
            variants={badgeVariants}
            className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6"
          >
            <span 
              className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ 
                backgroundColor: `${colors.primary}15`,
                color: colors.primary,
                border: `1px solid ${colors.primary}30`
              }}
            >
              🔒 Seguro y Confiable
            </span>
            <span 
              className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{ 
                backgroundColor: `${colors.success}15`,
                color: colors.success,
                border: `1px solid ${colors.success}30`
              }}
            >
              🎓 Para Estudiantes
            </span>
            {isAdmin && (
              <span 
                className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: `${colors.warning}15`,
                  color: colors.warning,
                  border: `1px solid ${colors.warning}30`
                }}
              >
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Administrador
              </span>
            )}
          </motion.div>

          {/* Características - EN UNA SOLA FILA */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-1.5 text-xs sm:text-sm"
                style={{ color: colors.textSecondary }}
              >
                <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: feature.color }} />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Barra de progreso */}
          <motion.div 
            variants={textVariants}
            className="w-full max-w-xs sm:max-w-sm mx-auto mb-3 sm:mb-4"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="flex-1">
                <div 
                  className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${colors.border}` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
              <div 
                className="text-xs sm:text-sm font-semibold tabular-nums min-w-[45px] text-right"
                style={{ color: colors.primary }}
              >
                {Math.round(progress)}%
              </div>
            </div>
            
            {/* Mensaje dinámico */}
            <motion.div
              key={currentMessage.text}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-1.5 mt-2"
            >
              {showCelebrationIcons && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: colors.success }} />}
              <p 
                className="text-[10px] sm:text-xs text-center"
                style={{ color: colors.textSecondary }}
              >
                {currentMessage.text}
              </p>
              {showCelebrationIcons && <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: colors.success }} />}
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={textVariants}
            className="flex items-center justify-center gap-1 mt-2 sm:mt-3"
          >
            <span className="text-[10px] sm:text-xs" style={{ color: colors.textSecondary }}>
              Desarrollado con
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: colors.error, fill: colors.error }} />
            </motion.div>
            <span className="text-[10px] sm:text-xs" style={{ color: colors.textSecondary }}>
              por José Pablo Miranda Quintanilla
            </span>
          </motion.div>
        </div>

        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ 
                backgroundColor: colors.primary,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                left: `${pos.x}%`,
              }}
              initial={{ 
                top: '100%',
                opacity: 0
              }}
              animate={{ 
                top: '-10%',
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: pos.delay,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Anillo pulsante */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '140px',
            height: '140px',
            border: `2px solid ${colors.primary}`,
            opacity: 0.15,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashPage;