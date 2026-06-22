import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface SecurityCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

const SecurityCard: React.FC<SecurityCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendValue,
  onClick
}) => {
  const { colors } = useTheme();
  
  const trendColors = {
    up: colors.success,
    down: colors.error,
    neutral: colors.warning
  };
  
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };
  
  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      className="rounded-xl p-4 transition-all cursor-pointer"
      style={{ 
        backgroundColor: `${colors.surface}cc`,
        border: `1px solid ${colors.border}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
          {icon}
        </div>
        {trend && trendValue && (
          <span className="text-xs font-medium" style={{ color: trendColors[trend] }}>
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: colors.text }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{title}</p>
      {subtitle && (
        <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>{subtitle}</p>
      )}
    </motion.div>
  );
};

export default SecurityCard;