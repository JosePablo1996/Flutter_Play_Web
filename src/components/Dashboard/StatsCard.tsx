import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend }) => {
  const { colors } = useTheme();

  // Mapeo de colores de Tailwind a colores del tema
  const getColorStyle = () => {
    switch (color) {
      case 'neon-green':
        return { bg: `${colors.success}15`, border: `${colors.success}30`, text: colors.success };
      case 'neon-blue':
        return { bg: `${colors.info}15`, border: `${colors.info}30`, text: colors.info };
      case 'neon-yellow':
        return { bg: `${colors.warning}15`, border: `${colors.warning}30`, text: colors.warning };
      case 'neon-purple':
        return { bg: `${colors.secondary}15`, border: `${colors.secondary}30`, text: colors.secondary };
      default:
        return { bg: `${colors.primary}15`, border: `${colors.primary}30`, text: colors.primary };
    }
  };

  const colorStyle = getColorStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-xl p-5 backdrop-blur-sm transition-all duration-300"
      style={{
        backgroundColor: colorStyle.bg,
        border: `1px solid ${colorStyle.border}`,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.text }}>
            {value}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-neon-green' : 'text-neon-red'}`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" style={{ color: colors.success }} />
              ) : (
                <TrendingDown className="w-3 h-3" style={{ color: colors.error }} />
              )}
              <span style={{ color: trend.isPositive ? colors.success : colors.error }}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-white/40">vs mes anterior</span>
            </div>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colorStyle.text}20` }}
        >
          <div style={{ color: colorStyle.text }}>
            {icon}
          </div>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${colorStyle.text}10, transparent 70%)`,
        }}
      />
    </motion.div>
  );
};

export default StatsCard;