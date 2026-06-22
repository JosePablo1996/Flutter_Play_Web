import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { expensesApi, profileApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { Expense, User } from '../types';
import FilterBar from '../components/Stats/FilterBar';
import ExportButtons from '../components/Stats/ExportButtons';
import StatsSummary from '../components/Stats/StatsSummary';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const COLORS = ['#FF1744', '#00E676', '#2979FF', '#D500F9', '#FFEA00', '#18FFFF', '#FF6B6B', '#4ECDC4'];

interface CustomTooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { colors } = useTheme();

  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-lg p-2 shadow-lg backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          ${(payload[0].value).toFixed(2)}
        </p>
      </motion.div>
    );
  }
  return null;
};

// Tipo para datos exportables
interface ExportableData {
  [key: string]: string | number | boolean;
}

const StatsPage: React.FC = () => {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Filtros
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, profileRes] = await Promise.all([
        expensesApi.getAll(),
        profileApi.get(),
      ]);
      setExpenses(expensesRes.data);
      setProfile(profileRes.data);
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(expensesRes.data.map(e => e.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Función para actualizar filtros
  const updateFilteredExpenses = useCallback(() => {
    let filtered = [...expenses];
    
    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }
    
    setFilteredExpenses(filtered);
  }, [expenses, startDate, endDate, selectedCategory]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateFilteredExpenses();
  }, [updateFilteredExpenses]);

  const resetFilters = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setSelectedCategory('all');
  };

  // Estadísticas
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const count = filteredExpenses.length;
  const average = count > 0 ? total / count : 0;
  const max = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0;
  const min = filteredExpenses.length > 0 ? Math.min(...filteredExpenses.map(e => e.amount)) : 0;

  // Datos por categoría
  const categoryData = () => {
    const map = new Map<string, number>();
    filteredExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  };

  // Datos mensuales
  const monthlyData = () => {
    const map = new Map<string, number>();
    filteredExpenses.forEach(e => {
      const date = new Date(e.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      map.set(monthYear, (map.get(monthYear) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Datos diarios para tendencia
  const dailyData = () => {
    const map = new Map<string, number>();
    filteredExpenses.forEach(e => {
      map.set(e.date, (map.get(e.date) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Top 5 gastos
  const topExpenses = [...filteredExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const categoryChartData = categoryData();
  const monthlyChartData = monthlyData();
  const dailyChartData = dailyData();

  // Preparar datos para exportación
  const exportData: ExportableData[] = filteredExpenses.map(e => ({
    ID: e.id,
    Nombre: e.name,
    Monto: e.amount,
    Fecha: e.date,
    Categoría: e.category,
    Descripción: e.description || '',
    Recurrente: e.is_recurring ? 'Sí' : 'No',
  }));

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Estadísticas Avanzadas</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Análisis detallado de tus finanzas</p>
          </div>
          <ExportButtons data={exportData} filename={`estadisticas_${new Date().toISOString().split('T')[0]}`} />
        </div>

        {/* Filtros */}
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          selectedCategory={selectedCategory}
          categories={categories}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onCategoryChange={setSelectedCategory}
          onReset={resetFilters}
        />

        {/* Resumen */}
        <div className="mb-8">
          <StatsSummary
            total={total}
            count={count}
            average={average}
            max={max}
            min={min}
            currency={profile?.currency || 'USD'}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Evolución mensual */}
          <div className="rounded-xl p-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>Evolución Mensual</h2>
            </div>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="month" stroke={colors.textSecondary} />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill={colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12" style={{ color: colors.textSecondary }}>No hay datos</p>
            )}
          </div>

          {/* Distribución por categoría */}
          <div className="rounded-xl p-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5" style={{ color: colors.primary }} />
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>Distribución por Categoría</h2>
            </div>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12" style={{ color: colors.textSecondary }}>No hay datos</p>
            )}
          </div>
        </div>

        {/* Tendencia diaria */}
        <div className="rounded-xl p-6 mb-8 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Tendencia Diaria</h2>
          </div>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="date" stroke={colors.textSecondary} />
                <YAxis stroke={colors.textSecondary} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ fill: colors.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12" style={{ color: colors.textSecondary }}>No hay datos</p>
          )}
        </div>

        {/* Top gastos */}
        <div className="rounded-xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Top 5 Gastos más Altos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0" style={{ backgroundColor: colors.surface }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.border }}>
                <AnimatePresence>
                  {topExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>{expense.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                          {expense.category}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{new Date(expense.date).toLocaleDateString()} </td>
                      <td className="px-6 py-4 text-right font-semibold" style={{ color: colors.primary }}>
                        ${expense.amount.toFixed(2)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {topExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center" style={{ color: colors.textSecondary }}>
                      No hay gastos registrados en el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPage;