import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  Shield
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'security';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  icon?: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  icon
}) => {
  const { colors } = useTheme();

  const typeConfig = {
    success: {
      bg: `${colors.success}15`,
      border: colors.success,
      icon: <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />,
      defaultIcon: <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
    },
    error: {
      bg: `${colors.error}15`,
      border: colors.error,
      icon: <XCircle className="w-5 h-5" style={{ color: colors.error }} />,
      defaultIcon: <XCircle className="w-5 h-5" style={{ color: colors.error }} />
    },
    warning: {
      bg: `${colors.warning}15`,
      border: colors.warning,
      icon: <AlertTriangle className="w-5 h-5" style={{ color: colors.warning }} />,
      defaultIcon: <AlertTriangle className="w-5 h-5" style={{ color: colors.warning }} />
    },
    info: {
      bg: `${colors.primary}15`,
      border: colors.primary,
      icon: <Info className="w-5 h-5" style={{ color: colors.primary }} />,
      defaultIcon: <Info className="w-5 h-5" style={{ color: colors.primary }} />
    },
    security: {
      bg: `${colors.primary}15`,
      border: colors.primary,
      icon: icon || <Shield className="w-5 h-5" style={{ color: colors.primary }} />,
      defaultIcon: <Shield className="w-5 h-5" style={{ color: colors.primary }} />
    }
  };

  const config = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
      className="relative w-80 mb-3 rounded-xl shadow-lg overflow-hidden"
      style={{ 
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Icono */}
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold" style={{ color: colors.text }}>
            {title}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            {message}
          </p>
        </div>
        
        {/* Botón cerrar */}
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: colors.textSecondary }}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-0.5"
        style={{ backgroundColor: config.border }}
      />
    </motion.div>
  );
};

export default Toast;