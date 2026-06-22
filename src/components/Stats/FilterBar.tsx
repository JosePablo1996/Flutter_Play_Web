import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Filter, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  startDate: string;
  endDate: string;
  selectedCategory: string;
  categories: string[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  startDate,
  endDate,
  selectedCategory,
  categories,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange,
  onReset,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasActiveFilters = startDate !== '' || endDate !== '' || selectedCategory !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 mb-6 backdrop-blur-sm"
      style={{
        backgroundColor: `${colors.surface}cc`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header del filtro */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: colors.primary }} />
          <span className="text-sm font-medium" style={{ color: colors.text }}>
            Filtros
          </span>
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReset}
              className="px-2 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
              style={{ color: colors.error }}
              aria-label="Restablecer filtros"
            >
              <X className="w-3 h-3" />
              Limpiar
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg transition-colors md:hidden"
            style={{ color: colors.textSecondary }}
            aria-label={isExpanded ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Contenido de filtros - responsive */}
      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 768) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Fecha inicio */}
              <div>
                <label htmlFor="startDate" className="block text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Fecha inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textSecondary }} />
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: `${colors.background}cc`,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Fecha fin */}
              <div>
                <label htmlFor="endDate" className="block text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Fecha fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textSecondary }} />
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: `${colors.background}cc`,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="category" className="block text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Categoría
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.background}cc`,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón reset (visible en desktop) */}
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReset}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.error}15`,
                    border: `1px solid ${colors.error}30`,
                    color: colors.error,
                  }}
                  aria-label="Restablecer filtros"
                >
                  Restablecer filtros
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterBar;