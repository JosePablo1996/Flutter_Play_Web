import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Award } from 'lucide-react';

interface StatsSummaryProps {
  total: number;
  count: number;
  average: number;
  max: number;
  min: number;
  currency: string;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({
  total,
  count,
  average,
  max,
  min,
  currency,
}) => {
  const { colors } = useTheme();
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$';

  const summaryItems = [
    { 
      label: 'Total', 
      value: `${symbol}${total.toFixed(2)}`, 
      color: colors.primary,
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Suma total de gastos'
    },
    { 
      label: 'Transacciones', 
      value: count, 
      color: colors.info,
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Número total de transacciones'
    },
    { 
      label: 'Promedio', 
      value: `${symbol}${average.toFixed(2)}`, 
      color: colors.warning,
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Gasto promedio por transacción'
    },
    { 
      label: 'Máximo', 
      value: `${symbol}${max.toFixed(2)}`, 
      color: colors.error,
      icon: <TrendingDown className="w-5 h-5" />,
      description: 'Gasto más alto registrado'
    },
    { 
      label: 'Mínimo', 
      value: `${symbol}${min.toFixed(2)}`, 
      color: colors.success,
      icon: <Award className="w-5 h-5" />,
      description: 'Gasto más bajo registrado'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-5 gap-4"
    >
      {summaryItems.map((item) => (
        <motion.div
          key={item.label}
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative rounded-xl p-4 text-center backdrop-blur-sm overflow-hidden group cursor-default"
          style={{
            backgroundColor: `${item.color}10`,
            border: `1px solid ${item.color}30`,
          }}
        >
          {/* Efecto de brillo en hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${item.color}20, transparent 80%)`,
            }}
          />

          {/* Icono */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${item.color}20` }}
          >
            <div style={{ color: item.color }}>
              {item.icon}
            </div>
          </div>

          {/* Valor */}
          <p className="text-xl font-bold mb-1" style={{ color: item.color }}>
            {item.value}
          </p>

          {/* Label */}
          <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            {item.label}
          </p>

          {/* Tooltip en hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
            style={{
              backgroundColor: `${colors.surface}cc`,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              backdropFilter: 'blur(8px)'
            }}
          >
            {item.description}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsSummary;