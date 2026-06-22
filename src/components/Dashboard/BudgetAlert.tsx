import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, X } from 'lucide-react';

interface BudgetAlertProps {
  spent: number;
  budget: number;
  percentage: number;
  category?: string;
  onClose?: () => void;
}

const BudgetAlert: React.FC<BudgetAlertProps> = ({ 
  spent, 
  budget, 
  percentage, 
  category = 'total',
  onClose 
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = React.useState(true);

  const isOverBudget = spent > budget;
  const isNearBudget = percentage >= 80 && !isOverBudget;
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if ((percentage < 70 && !isOverBudget) || !isVisible) return null;

  let alertColor = '';
  let alertBg = '';
  let alertBorder = '';
  let message = '';
  let icon = null;

  if (isOverBudget) {
    alertColor = colors.error;
    alertBg = `${colors.error}15`;
    alertBorder = `${colors.error}30`;
    message = `Has excedido tu presupuesto ${category === 'total' ? 'mensual' : `de ${category}`} en $${Math.abs(spent - budget).toFixed(2)}`;
    icon = <TrendingUp className="w-5 h-5" />;
  } else if (isNearBudget) {
    alertColor = colors.warning;
    alertBg = `${colors.warning}15`;
    alertBorder = `${colors.warning}30`;
    message = `Estás cerca de tu presupuesto ${category === 'total' ? 'mensual' : `de ${category}`} (${percentage.toFixed(0)}% usado)`;
    icon = <AlertTriangle className="w-5 h-5" />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl p-4 mb-6 relative overflow-hidden"
        style={{
          backgroundColor: alertBg,
          border: `1px solid ${alertBorder}`,
        }}
      >
        {/* Efecto Liquid Glass */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${alertColor}10, transparent 80%)`,
          }}
        />

        {/* Botón de cerrar */}
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-lg transition-colors hover:bg-white/10"
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" style={{ color: alertColor }} />
          </button>
        )}

        <div className="flex items-center gap-3 pr-6">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${alertColor}20` }}
          >
            <div style={{ color: alertColor }}>
              {icon}
            </div>
          </div>
          
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: alertColor }}>
              {message}
            </p>
            
            {/* Barra de progreso */}
            <div className="mt-3 w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: `${alertColor}20` }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-1.5 rounded-full"
                style={{ backgroundColor: alertColor }}
              />
            </div>
            
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: colors.textSecondary }}>
                Gastado: ${spent.toFixed(2)}
              </span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>
                Presupuesto: ${budget.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BudgetAlert;