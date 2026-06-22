import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { expensesApi, profileApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { Expense, User } from '../types';
import DateRangeSelector, { type DateRangeType } from '../components/Dashboard/DateRangeSelector';
import StatsCard from '../components/Dashboard/StatsCard';
import BudgetAlert from '../components/Dashboard/BudgetAlert';
import TrendChart from '../components/Dashboard/TrendChart';
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
} from 'recharts';
import { Wallet, TrendingUp, PieChart as PieChartIcon, ArrowUp } from 'lucide-react';

const COLORS = ['#FF1744', '#00E676', '#2979FF', '#D500F9', '#FFEA00', '#18FFFF', '#FF6B6B', '#4ECDC4'];

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface CustomTooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
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
        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
          ${(payload[0].value).toFixed(2)}
        </p>
      </motion.div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0, average: 0 });
  const [profile, setProfile] = useState<User | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType>('month');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, statsRes, profileRes] = await Promise.all([
        expensesApi.getAll(),
        expensesApi.getStats(),
        profileApi.get(),
      ]);
      setExpenses(expensesRes.data);
      setStats(statsRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Filtrar gastos por rango de fechas
  const getFilteredExpenses = useCallback((): Expense[] => {
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return expenses.filter(expense => new Date(expense.date) >= startDate);
  }, [expenses, dateRange]);

  const filteredExpenses = getFilteredExpenses();
  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const averageFiltered = filteredExpenses.length > 0 ? totalFiltered / filteredExpenses.length : 0;

  // Datos para gráficos
  const getCategoryData = (): CategoryData[] => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      const current = monthlyMap.get(monthYear) || 0;
      monthlyMap.set(monthYear, current + expense.amount);
    });
    return Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .slice(-6);
  };

  const getTrendData = (): { name: string; amount: number }[] => {
    const trendMap = new Map<string, number>();
    
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      // eslint-disable-next-line no-useless-assignment
      let trendKey = '';
      if (dateRange === 'week' || dateRange === 'month') {
        trendKey = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      } else {
        trendKey = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      }
      const current = trendMap.get(trendKey) || 0;
      trendMap.set(trendKey, current + expense.amount);
    });
    
    return Array.from(trendMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .slice(-(dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 12));
  };

  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();
  const trendData = getTrendData();
  const budgetPercentage = profile?.monthly_budget ? (stats.total / profile.monthly_budget) * 100 : 0;

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
          <p style={{ color: colors.textSecondary }}>Cargando tu billetera...</p>
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
        {/* Header con selector de fechas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Panel de Control</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Resumen de tus finanzas</p>
          </div>
          <DateRangeSelector selectedRange={dateRange} onRangeChange={setDateRange} />
        </div>

        {/* Alertas de presupuesto */}
        <AnimatePresence>
          {budgetPercentage > 70 && profile?.monthly_budget && (
            <BudgetAlert 
              spent={stats.total} 
              budget={profile.monthly_budget} 
              percentage={budgetPercentage}
              onClose={() => {}}
            />
          )}
        </AnimatePresence>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Gastado"
            value={`${profile?.currency === 'USD' ? '$' : ''}${totalFiltered.toFixed(2)}`}
            icon={<Wallet className="w-5 h-5" />}
            color="neon-green"
          />
          <StatsCard
            title="Número de Gastos"
            value={filteredExpenses.length}
            icon={<TrendingUp className="w-5 h-5" />}
            color="neon-blue"
          />
          <StatsCard
            title="Gasto Promedio"
            value={`${profile?.currency === 'USD' ? '$' : ''}${averageFiltered.toFixed(2)}`}
            icon={<ArrowUp className="w-5 h-5" />}
            color="neon-yellow"
          />
          <StatsCard
            title="Presupuesto Mensual"
            value={`${profile?.currency === 'USD' ? '$' : ''}${profile?.monthly_budget?.toFixed(2) || '1000'}`}
            icon={<PieChartIcon className="w-5 h-5" />}
            color="neon-purple"
            trend={budgetPercentage > 0 ? { value: budgetPercentage, isPositive: budgetPercentage < 100 } : undefined}
          />
        </div>

        {/* Gráfico de tendencias */}
        <div className="rounded-xl p-6 mb-8 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Tendencia de Gastos</h2>
          <TrendChart data={trendData} color="#FF1744" />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de barras */}
          <div className="rounded-xl p-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Gastos por Período</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="month" stroke={colors.textSecondary} />
                  <YAxis stroke={colors.textSecondary} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill={colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12" style={{ color: colors.textSecondary }}>No hay datos de gastos</p>
            )}
          </div>

          {/* Gráfico de pastel */}
          <div className="rounded-xl p-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Distribución por Categoría</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12" style={{ color: colors.textSecondary }}>No hay datos de categorías</p>
            )}
          </div>
        </div>

        {/* Lista de gastos recientes */}
        <div className="rounded-xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Gastos Recientes</h2>
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
                {filteredExpenses.slice(0, 5).map((expense) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>{expense.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-semibold" style={{ color: colors.primary }}>
                      {profile?.currency === 'USD' ? '$' : ''}{expense.amount.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center" style={{ color: colors.textSecondary }}>
                      No hay gastos registrados en este período. ¡Agrega tu primer gasto!
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

export default Dashboard;