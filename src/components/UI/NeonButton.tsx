import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled = false,
  icon,
  size = 'md'
}) => {
  const { colors } = useTheme();

  // Tamaños del botón
  const sizes = {
    sm: {
      padding: 'px-3 py-1.5',
      fontSize: 'text-xs',
      iconSize: 'w-3 h-3'
    },
    md: {
      padding: 'px-4 py-2',
      fontSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    lg: {
      padding: 'px-6 py-3',
      fontSize: 'text-base',
      iconSize: 'w-5 h-5'
    }
  };

  // Variantes de estilo
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          border: 'none',
          color: '#ffffff',
          hover: `brightness(1.05)`,
          shadow: `0 4px 15px ${colors.primary}40`
        };
      case 'secondary':
        return {
          background: `linear-gradient(135deg, ${colors.secondary}, ${colors.info})`,
          border: 'none',
          color: '#ffffff',
          hover: `brightness(1.05)`,
          shadow: `0 4px 15px ${colors.secondary}40`
        };
      case 'danger':
        return {
          background: `linear-gradient(135deg, ${colors.error}, ${colors.error}dd)`,
          border: 'none',
          color: '#ffffff',
          hover: `brightness(1.05)`,
          shadow: `0 4px 15px ${colors.error}40`
        };
      case 'success':
        return {
          background: `linear-gradient(135deg, ${colors.success}, ${colors.success}dd)`,
          border: 'none',
          color: '#ffffff',
          hover: `brightness(1.05)`,
          shadow: `0 4px 15px ${colors.success}40`
        };
      case 'outline':
        return {
          background: 'transparent',
          border: `2px solid ${colors.primary}`,
          color: colors.primary,
          hover: `${colors.primary}10`,
          shadow: 'none'
        };
      case 'ghost':
        return {
          background: 'transparent',
          border: 'none',
          color: colors.textSecondary,
          hover: `${colors.text}10`,
          shadow: 'none'
        };
      default:
        return {
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          border: 'none',
          color: '#ffffff',
          hover: `brightness(1.05)`,
          shadow: `0 4px 15px ${colors.primary}40`
        };
    }
  };

  const styles = getVariantStyles();
  const currentSize = sizes[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        relative overflow-hidden rounded-xl font-semibold transition-all duration-300
        ${currentSize.padding}
        ${currentSize.fontSize}
        ${fullWidth ? 'w-full' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={{
        background: styles.background,
        border: styles.border,
        color: styles.color,
        boxShadow: styles.shadow
      }}
    >
      {/* Efecto de brillo en hover */}
      {variant !== 'outline' && variant !== 'ghost' && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Efecto de brillo en outline */}
      {variant === 'outline' && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          style={{ background: `${styles.color}10` }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Contenido del botón */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg 
              className={`${currentSize.iconSize} animate-spin`} 
              fill="none" 
              viewBox="0 0 24 24"
              style={{ color: styles.color }}
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          <>
            {icon && <span className={currentSize.iconSize}>{icon}</span>}
            {children}
          </>
        )}
      </div>

      {/* Efecto Liquid Glass en ghost y outline */}
      {(variant === 'ghost' || variant === 'outline') && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            backdropFilter: 'blur(4px)',
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05), transparent 70%)',
          }}
        />
      )}
    </motion.button>
  );
};

export default NeonButton;