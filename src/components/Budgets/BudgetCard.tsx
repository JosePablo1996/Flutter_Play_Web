import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface BudgetCardProps {
  category: string;
  icon: string;
  color: string;
  budget: number;
  spent: number;
  percentage: number;
  currency: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  icon,
  color: propColor,
  budget,
  spent,
  percentage,
  currency,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const isOverBudget = spent > budget;
  const isNearLimit = percentage >= 80 && !isOverBudget;
  const remaining = budget - spent;
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$';

  // Determinar estado y colores
  // eslint-disable-next-line no-useless-assignment
  let statusColor = '';
  // eslint-disable-next-line no-useless-assignment
  let statusText = '';
  // eslint-disable-next-line no-useless-assignment
  let progressColor = '';
  // eslint-disable-next-line no-useless-assignment
  let statusIcon = null;

  if (isOverBudget) {
    statusColor = colors.error;
    statusText = 'Excedido';
    progressColor = colors.error;
    statusIcon = <AlertTriangle className="w-4 h-4" />;
  } else if (isNearLimit) {
    statusColor = colors.warning;
    statusText = 'Cerca del límite';
    progressColor = colors.warning;
    statusIcon = <TrendingUp className="w-4 h-4" />;
  } else {
    statusColor = colors.success;
    statusText = 'Dentro del presupuesto';
    progressColor = colors.success;
    statusIcon = <CheckCircle className="w-4 h-4" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-xl p-4 backdrop-blur-sm overflow-hidden group"
      style={{
        backgroundColor: `${colors.surface}cc`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Efecto de brillo en hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${statusColor}10, transparent 80%)`,
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${propColor}20`, border: `1px solid ${propColor}` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-sm" style={{ color: colors.text }}>
              {category}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              {statusIcon}
              <p className="text-xs" style={{ color: statusColor }}>
                {statusText}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs" style={{ color: statusColor }}>
            {percentage.toFixed(0)}%
          </p>
          {isOverBudget && (
            <p className="text-xs mt-0.5" style={{ color: statusColor }}>
              +{symbol}{Math.abs(remaining).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: colors.textSecondary }}>
          <span>Progreso</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${statusColor}20` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Montos */}
      <div className="flex justify-between text-sm mb-4">
        <div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Presupuesto</p>
          <p className="font-semibold text-sm" style={{ color: colors.text }}>
            {symbol}{budget.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: colors.textSecondary }}>Gastado</p>
          <p className={`font-semibold text-sm ${isOverBudget ? 'text-neon-red' : 'text-neon-green'}`}
             style={{ color: isOverBudget ? colors.error : colors.success }}>
            {symbol}{spent.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: colors.textSecondary }}>Restante</p>
          <p className={`font-semibold text-sm`} style={{ color: remaining >= 0 ? colors.success : colors.error }}>
            {symbol}{Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: colors.border }}>
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: `${colors.info}20`, color: colors.info }}
              aria-label="Editar presupuesto"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
              aria-label="Eliminar presupuesto"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BudgetCard;