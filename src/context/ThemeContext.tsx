// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type ThemeMode = 'light' | 'dark';
type ThemeColor = 'neon' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'cyan' | 'yellow' | 'teal' | 'indigo' | 'brown';

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  gradient: {
    primary: string;
    secondary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================
// COLORES MODO OSCURO
// ============================================

const darkColors = {
  // Colores existentes
  neon: {
    primary: '#00E676',
    secondary: '#00B0FF',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    success: '#00E676',
    error: '#FF1744',
    warning: '#FFEA00',
    info: '#2979FF',
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.1)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    background: '#0F071A',
    surface: '#1A0F2E',
    text: '#F8FAFC',
    textSecondary: '#A78BFA',
    border: 'rgba(139, 92, 246, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  green: {
    primary: '#059669',
    secondary: '#10B981',
    background: '#0F1A0F',
    surface: '#1A2E1A',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: 'rgba(5, 150, 105, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
  },
  red: {
    primary: '#EF4444',
    secondary: '#F97316',
    background: '#1A0F0F',
    surface: '#2D1A1A',
    text: '#FFFFFF',
    textSecondary: '#FCA5A5',
    border: 'rgba(239, 68, 68, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  orange: {
    primary: '#F97316',
    secondary: '#FBBF24',
    background: '#1A120F',
    surface: '#2D1E16',
    text: '#FFFFFF',
    textSecondary: '#FDE68A',
    border: 'rgba(249, 115, 22, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  pink: {
    primary: '#EC4899',
    secondary: '#F43F5E',
    background: '#1A0F1A',
    surface: '#2D1A2D',
    text: '#FFFFFF',
    textSecondary: '#F9A8D4',
    border: 'rgba(236, 72, 153, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  cyan: {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    background: '#0F1A1A',
    surface: '#1A2D2D',
    text: '#FFFFFF',
    textSecondary: '#67E8F9',
    border: 'rgba(6, 182, 212, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // ============================================
  // NUEVOS COLORES - MODO OSCURO
  // ============================================
  
  // 🟡 Amarillo vibrante
  yellow: {
    primary: '#EAB308',
    secondary: '#FBBF24',
    background: '#1A1A0F',
    surface: '#2D2D16',
    text: '#FFFFFF',
    textSecondary: '#FDE047',
    border: 'rgba(234, 179, 8, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // 🟢 Verde azulado (Teal)
  teal: {
    primary: '#14B8A6',
    secondary: '#2DD4BF',
    background: '#0F1A1A',
    surface: '#1A2D2D',
    text: '#FFFFFF',
    textSecondary: '#5EEAD4',
    border: 'rgba(20, 184, 166, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // 🔵 Índigo profundo
  indigo: {
    primary: '#6366F1',
    secondary: '#818CF8',
    background: '#0F0F1A',
    surface: '#1A1A2D',
    text: '#FFFFFF',
    textSecondary: '#A5B4FC',
    border: 'rgba(99, 102, 241, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // 🟤 Marrón cálido
  brown: {
    primary: '#78350F',
    secondary: '#B45309',
    background: '#1A0F0F',
    surface: '#2D1A16',
    text: '#FFFFFF',
    textSecondary: '#FDE68A',
    border: 'rgba(120, 53, 15, 0.2)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

// ============================================
// COLORES MODO CLARO
// ============================================

const lightColors = {
  // Colores existentes
  neon: {
    primary: '#00C853',
    secondary: '#0091EA',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    border: 'rgba(0, 0, 0, 0.1)',
    success: '#00C853',
    error: '#D50000',
    warning: '#FFD600',
    info: '#2962FF',
  },
  blue: {
    primary: '#2563EB',
    secondary: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: 'rgba(0, 0, 0, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#0891B2',
  },
  purple: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    text: '#2E1065',
    textSecondary: '#7E22CE',
    border: 'rgba(124, 58, 237, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#0891B2',
  },
  green: {
    primary: '#059669',
    secondary: '#10B981',
    background: '#ECFDF5',
    surface: '#FFFFFF',
    text: '#064E3B',
    textSecondary: '#047857',
    border: 'rgba(5, 150, 105, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#0891B2',
  },
  red: {
    primary: '#DC2626',
    secondary: '#EA580C',
    background: '#FEF2F2',
    surface: '#FFFFFF',
    text: '#7F1D1D',
    textSecondary: '#991B1B',
    border: 'rgba(220, 38, 38, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  orange: {
    primary: '#EA580C',
    secondary: '#F59E0B',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#7C2D12',
    textSecondary: '#9A3412',
    border: 'rgba(234, 88, 12, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  pink: {
    primary: '#DB2777',
    secondary: '#E11D48',
    background: '#FDF2F8',
    surface: '#FFFFFF',
    text: '#831843',
    textSecondary: '#9D174D',
    border: 'rgba(219, 39, 119, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  cyan: {
    primary: '#0891B2',
    secondary: '#06B6D4',
    background: '#ECFEFF',
    surface: '#FFFFFF',
    text: '#164E63',
    textSecondary: '#155E75',
    border: 'rgba(8, 145, 178, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  
  // ============================================
  // NUEVOS COLORES - MODO CLARO
  // ============================================
  
  // 🟡 Amarillo vibrante (modo claro)
  yellow: {
    primary: '#CA8A04',
    secondary: '#EAB308',
    background: '#FEFCE8',
    surface: '#FFFFFF',
    text: '#422006',
    textSecondary: '#854D0E',
    border: 'rgba(234, 179, 8, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  
  // 🟢 Verde azulado (Teal) - modo claro
  teal: {
    primary: '#0D9488',
    secondary: '#14B8A6',
    background: '#F0FDFA',
    surface: '#FFFFFF',
    text: '#134E4A',
    textSecondary: '#115E59',
    border: 'rgba(13, 148, 136, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  
  // 🔵 Índigo profundo (modo claro)
  indigo: {
    primary: '#4F46E5',
    secondary: '#6366F1',
    background: '#EEF2FF',
    surface: '#FFFFFF',
    text: '#312E81',
    textSecondary: '#4338CA',
    border: 'rgba(79, 70, 229, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
  
  // 🟤 Marrón cálido (modo claro)
  brown: {
    primary: '#78350F',
    secondary: '#B45309',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#422006',
    textSecondary: '#78350F',
    border: 'rgba(120, 53, 15, 0.1)',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
  },
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'dark';
  });
  
  const [color, setColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'neon';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-color', color);
    
    // Aplicar clase al body
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${mode}`);
    document.body.style.backgroundColor = mode === 'dark' ? darkColors[color].background : lightColors[color].background;
  }, [mode, color]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const isDark = mode === 'dark';
  const currentPalette = isDark ? darkColors[color] : lightColors[color];

  const colors = {
    primary: currentPalette.primary,
    secondary: currentPalette.secondary,
    background: currentPalette.background,
    surface: currentPalette.surface,
    text: currentPalette.text,
    textSecondary: currentPalette.textSecondary,
    border: currentPalette.border,
    success: currentPalette.success,
    error: currentPalette.error,
    warning: currentPalette.warning,
    info: currentPalette.info,
  };

  const gradient = {
    primary: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    secondary: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
  };

  const value = {
    mode,
    color,
    toggleMode,
    setMode,
    setColor,
    isDark,
    colors,
    gradient,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ============================================
// COMPONENTES DE ANIMACIÓN (exportados)
// ============================================

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export const ScaleOnHover: React.FC<ScaleOnHoverProps> = ({ children, scale = 1.05, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem' 
}) => {
  return (
    <motion.div
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};