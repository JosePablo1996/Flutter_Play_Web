import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'neon';
  hover?: boolean;
  onClick?: () => void;
}

export const NeonCard: React.FC<NeonCardProps> = ({ 
  children, 
  className = '',
  variant = 'glass',
  hover = true,
  onClick
}) => {
  const { colors } = useTheme();

  // Variantes de estilo
  const variants = {
    default: {
      background: colors.surface,
      border: colors.border,
      shadow: 'none'
    },
    glass: {
      background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
      border: colors.border,
      shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
    },
    gradient: {
      background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`,
      border: `${colors.primary}30`,
      shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
    },
    neon: {
      background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
      border: `${colors.primary}40`,
      shadow: `0 0 20px ${colors.primary}20, 0 8px 32px rgba(0, 0, 0, 0.1)`
    }
  };

  const currentVariant = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.01, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`
        rounded-2xl p-6 backdrop-blur-xl transition-all duration-300
        ${hover && onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: currentVariant.background,
        border: `1px solid ${currentVariant.border}`,
        boxShadow: currentVariant.shadow,
      }}
    >
      {/* Efecto de brillo en neon */}
      {variant === 'neon' && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${colors.primary}10, transparent 70%)`,
          }}
        />
      )}
      
      {/* Efecto de brillo en glass */}
      {variant === 'glass' && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)`,
          }}
        />
      )}
      
      {children}
    </motion.div>
  );
};

export default NeonCard;