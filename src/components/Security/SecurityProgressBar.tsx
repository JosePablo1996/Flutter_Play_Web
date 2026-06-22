import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface SecurityProgressBarProps {
  score: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SecurityProgressBar: React.FC<SecurityProgressBarProps> = ({ 
  score, 
  showPercentage = true,
  size = 'lg'
}) => {
  const { colors } = useTheme();
  
  // Calcular color según el puntaje
  const getScoreColor = () => {
    if (score < 40) return colors.error;
    if (score < 70) return colors.warning;
    return colors.success;
  };
  
  // Calcular texto del nivel
  const getScoreLevel = () => {
    if (score < 40) return 'Bajo';
    if (score < 70) return 'Medio';
    return 'Alto';
  };
  
  // Tamaños de la barra
  const sizes = {
    sm: { height: 'h-2', text: 'text-xs' },
    md: { height: 'h-3', text: 'text-sm' },
    lg: { height: 'h-4', text: 'text-base' }
  };
  
  const scoreColor = getScoreColor();
  const scoreLevel = getScoreLevel();
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${sizes[size].text}`} style={{ color: colors.text }}>
          Nivel de seguridad
        </span>
        {showPercentage && (
          <span className={`font-bold ${sizes[size].text}`} style={{ color: scoreColor }}>
            {score}% - {scoreLevel}
          </span>
        )}
      </div>
      
      <div 
        className={`w-full ${sizes[size].height} rounded-full overflow-hidden`}
        style={{ backgroundColor: `${colors.border}` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${sizes[size].height}`}
          style={{ 
            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`,
            boxShadow: `0 0 8px ${scoreColor}80`
          }}
        />
      </div>
      
      {/* Leyenda de colores */}
      <div className="flex justify-between mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.error }} />
          <span style={{ color: colors.textSecondary }}>0-40%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.warning }} />
          <span style={{ color: colors.textSecondary }}>41-70%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
          <span style={{ color: colors.textSecondary }}>71-100%</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityProgressBar;