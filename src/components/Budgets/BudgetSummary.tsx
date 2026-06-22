import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, PieChart, DollarSign, Target } from 'lucide-react';

interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  averagePercentage: number;
  currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalSpent,
  totalRemaining,
  averagePercentage,
  currency,
}) => {
  const { colors } = useTheme();
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$';
  const isOverBudget = totalSpent > totalBudget;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  const summaryItems = [
    {
      label: 'Presupuesto total',
      value: `${symbol}${totalBudget.toFixed(2)}`,
      icon: <Wallet className="w-5 h-5" />,
      color: colors.primary,
      description: 'Suma de todos tus presupuestos'
    },
    {
      label: 'Total gastado',
      value: `${symbol}${totalSpent.toFixed(2)}`,
      icon: <TrendingDown className="w-5 h-5" />,
      color: isOverBudget ? colors.error : colors.warning,
      description: 'Total gastado hasta ahora'
    },
    {
      label: 'Presupuesto restante',
      value: `${symbol}${Math.abs(totalRemaining).toFixed(2)}`,
      icon: <Target className="w-5 h-5" />,
      color: totalRemaining >= 0 ? colors.success : colors.error,
      description: totalRemaining >= 0 ? 'Disponible para gastar' : 'Has excedido tu presupuesto'
    },
    {
      label: 'Uso promedio',
      value: `${averagePercentage.toFixed(0)}%`,
      icon: <PieChart className="w-5 h-5" />,
      color: averagePercentage >= 80 ? colors.warning : colors.info,
      description: 'Promedio de uso entre categorías'
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
      className="rounded-xl p-6 backdrop-blur-sm overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}05)`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Efecto de brillo de fondo */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${colors.primary}10, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
          Resumen de Presupuestos
        </h2>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="relative rounded-xl p-4 text-center backdrop-blur-sm overflow-hidden group"
            style={{
              backgroundColor: `${colors.surface}cc`,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Efecto de brillo en hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${item.color}15, transparent 80%)`,
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

            {/* Tooltip */}
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
      </div>

      {/* Barra de progreso general */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: colors.textSecondary }}>Uso general del presupuesto</span>
          <span style={{ color: percentageUsed >= 80 ? colors.warning : colors.primary }}>
            {percentageUsed.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.border}` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${colors.primary}, ${percentageUsed >= 80 ? colors.warning : colors.success})`
            }}
          />
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: colors.textSecondary }}>
          {totalRemaining >= 0 
            ? `Te quedan ${symbol}${totalRemaining.toFixed(2)} para completar tu presupuesto`
            : `Has excedido tu presupuesto en ${symbol}${Math.abs(totalRemaining).toFixed(2)}`
          }
        </p>
      </div>
    </motion.div>
  );
};

export default BudgetSummary;