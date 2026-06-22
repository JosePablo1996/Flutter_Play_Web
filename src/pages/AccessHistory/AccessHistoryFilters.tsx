import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';

interface AccessHistoryFiltersProps {
  filters: {
    type: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

const AccessHistoryFilters: React.FC<AccessHistoryFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  onApply 
}) => {
  const { colors } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  
  const loginTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'password', label: 'Contraseña' },
    { value: 'otp', label: 'Código OTP' },
    { value: '2fa', label: 'Autenticación 2FA' },
    { value: '2fa_pending', label: '2FA Pendiente' }
  ];
  
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'success', label: 'Exitosos' },
    { value: 'failed', label: 'Fallidos' },
    { value: 'pending', label: 'Pendientes' }
  ];
  
  const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';
  
  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-3"
        style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
        )}
      </button>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 overflow-hidden"
            style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Tipo de login
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  {loginTypes.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              >
                Limpiar
              </button>
              <button
                onClick={onApply}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessHistoryFilters;