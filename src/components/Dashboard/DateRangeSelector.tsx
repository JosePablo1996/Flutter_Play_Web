import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, CalendarDays } from 'lucide-react';

export type DateRangeType = 'week' | 'month' | 'year';

interface DateRangeSelectorProps {
  selectedRange: DateRangeType;
  onRangeChange: (range: DateRangeType) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ selectedRange, onRangeChange }) => {
  const { colors } = useTheme();

  const options: { value: DateRangeType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'week', 
      label: 'Semana', 
      icon: <CalendarDays className="w-4 h-4" />,
      description: 'Últimos 7 días'
    },
    { 
      value: 'month', 
      label: 'Mes', 
      icon: <Calendar className="w-4 h-4" />,
      description: 'Últimos 30 días'
    },
    { 
      value: 'year', 
      label: 'Año', 
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Últimos 12 meses'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 rounded-xl p-1 backdrop-blur-sm"
      style={{
        backgroundColor: `${colors.surface}cc`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onRangeChange(option.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden"
          style={{
            backgroundColor: selectedRange === option.value ? `${colors.primary}20` : 'transparent',
            color: selectedRange === option.value ? colors.primary : colors.textSecondary,
          }}
          aria-label={`Ver ${option.label}`}
          title={option.description}
        >
          {/* Efecto de brillo en hover */}
          {selectedRange !== option.value && (
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${colors.primary}10, transparent 80%)`,
              }}
            />
          )}

          {/* Indicador de selección */}
          {selectedRange === option.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: `${colors.primary}10` }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}

          <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
            {option.icon}
            {option.label}
          </span>

          {/* Badge de selección */}
          {selectedRange === option.value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default DateRangeSelector;