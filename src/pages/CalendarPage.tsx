/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import { expensesApi, profileApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { Expense, User } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, X } from 'lucide-react';

// Estilos inline para el calendario (reemplazando el CSS externo)

interface DayExpenses {
  date: string;
  total: number;
  expenses: Expense[];
}

const CalendarPage: React.FC = () => {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayExpenses, setDayExpenses] = useState<DayExpenses | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, profileRes] = await Promise.all([
        expensesApi.getAll(),
        profileApi.get(),
      ]);
      setExpenses(expensesRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
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

  // Calcular total del mes seleccionado
  useEffect(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const monthExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    setMonthlyTotal(total);
  }, [expenses, selectedMonth]);

  // Obtener gastos del día seleccionado
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayExpenseList = expenses.filter(e => e.date === dateStr);
    const total = dayExpenseList.reduce((sum, e) => sum + e.amount, 0);
    
    setDayExpenses({
      date: dateStr,
      total: total,
      expenses: dayExpenseList,
    });
  }, [selectedDate, expenses]);

  // Marcar días con gastos en el calendario
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenseList = expenses.filter(e => e.date === dateStr);
    
    if (dayExpenseList.length === 0) return null;
    
    const total = dayExpenseList.reduce((sum, e) => sum + e.amount, 0);
    
    return (
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <span className="text-[10px] font-medium" style={{ color: colors.primary }}>
          ${total.toFixed(0)}
        </span>
      </div>
    );
  };

  // Clase para días con gastos
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenseList = expenses.filter(e => e.date === dateStr);
    
    if (dayExpenseList.length === 0) return '';
    
    return 'has-expenses';
  };

  const handleDateChange = (value: unknown) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setShowDetailsModal(true);
    }
  };

  const handleMonthChange = (activeStartDate: Date | null) => {
    if (activeStartDate) {
      setSelectedMonth(activeStartDate);
    }
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today);
    setSelectedDate(today);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          <p style={{ color: colors.textSecondary }}>Cargando calendario...</p>
        </div>
      </div>
    );
  }

  const symbol = profile?.currency === 'USD' ? '$' : profile?.currency === 'EUR' ? '€' : '$';

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Calendario de Gastos</h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Visualiza tus gastos por día</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna del calendario */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-6 backdrop-blur-sm"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}` 
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                  {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: `${colors.surface}`, color: colors.textSecondary }}
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToToday}
                    className="px-3 py-1 rounded-lg text-sm transition-colors"
                    style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                  >
                    Hoy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: `${colors.surface}`, color: colors.textSecondary }}
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                onActiveStartDateChange={({ activeStartDate }) => handleMonthChange(activeStartDate)}
                tileContent={getTileContent}
                tileClassName={getTileClassName}
                locale="es-ES"
                className="w-full border-0 bg-transparent"
              />
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center" style={{ borderColor: colors.border }}>
                <div>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Total del mes</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {symbol}{monthlyTotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${colors.primary}30`, border: `1px solid ${colors.primary}` }} />
                  <span className="text-xs" style={{ color: colors.textSecondary }}>Días con gastos</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Columna de detalles del día (versión desktop) */}
          <div className="lg:col-span-1 hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-xl p-6 sticky top-24 backdrop-blur-sm"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}` 
              }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                {dayExpenses ? formatDate(dayExpenses.date) : 'Selecciona un día'}
              </h2>
              
              {dayExpenses && dayExpenses.expenses.length > 0 ? (
                <>
                  <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: `${colors.background}cc` }}>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Total del día</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {symbol}{dayExpenses.total.toFixed(2)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      {dayExpenses.expenses.length} {dayExpenses.expenses.length === 1 ? 'gasto' : 'gastos'}
                    </p>
                  </div>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {dayExpenses.expenses.map((expense, index) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-xl p-3 transition-colors hover:bg-white/5"
                        style={{ backgroundColor: `${colors.background}cc` }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: colors.text }}>{expense.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                                {expense.category}
                              </span>
                              {expense.is_recurring && (
                                <span className="text-[10px]" style={{ color: colors.success }}>🔄</span>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold text-sm" style={{ color: colors.primary }}>
                            {symbol}{expense.amount.toFixed(2)}
                          </p>
                        </div>
                        {expense.description && (
                          <p className="text-xs mt-2 truncate" style={{ color: colors.textSecondary }}>
                            {expense.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : dayExpenses ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                    <DollarSign className="w-8 h-8" style={{ color: colors.primary }} />
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>No hay gastos registrados</p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>en este día</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.secondary}20` }}>
                    <CalendarIcon className="w-8 h-8" style={{ color: colors.secondary }} />
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Selecciona un día</p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>en el calendario</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de detalles para móvil */}
      <AnimatePresence>
        {showDetailsModal && dayExpenses && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Header del modal */}
              <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: colors.border }}>
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {formatDate(dayExpenses.date)}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 rounded-lg transition-colors hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: `${colors.background}cc` }}>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Total del día</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {symbol}{dayExpenses.total.toFixed(2)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    {dayExpenses.expenses.length} {dayExpenses.expenses.length === 1 ? 'gasto' : 'gastos'}
                  </p>
                </div>

                <div className="space-y-3">
                  {dayExpenses.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="rounded-xl p-3"
                      style={{ backgroundColor: `${colors.background}cc` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: colors.text }}>{expense.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                              {expense.category}
                            </span>
                            {expense.is_recurring && (
                              <span className="text-[10px]" style={{ color: colors.success }}>🔄</span>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-sm" style={{ color: colors.primary }}>
                          {symbol}{expense.amount.toFixed(2)}
                        </p>
                      </div>
                      {expense.description && (
                        <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                          {expense.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Estilos globales para el calendario (reemplazo del CSS externo) */}
      <style>{`
        .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
          width: 100% !important;
        }
        .react-calendar__navigation {
          display: none !important;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          cursor: default;
        }
        .react-calendar__tile {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0.75rem;
          padding: 0.75rem 0.5rem;
          margin: 0.25rem;
          color: white;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
          aspect-ratio: 1 / 1;
        }
        .react-calendar__tile:enabled:hover {
          background: rgba(0, 230, 118, 0.2);
          transform: scale(0.98);
        }
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #FF1744, #00E676) !important;
          color: white !important;
          box-shadow: 0 0 15px rgba(255, 23, 68, 0.3);
        }
        .react-calendar__tile--now {
          background: rgba(0, 230, 118, 0.2);
          border: 1px solid rgba(0, 230, 118, 0.3);
        }
        .react-calendar__tile--now.react-calendar__tile--active {
          background: linear-gradient(135deg, #FF1744, #00E676) !important;
        }
        .has-expenses {
          background: rgba(0, 230, 118, 0.1);
          border: 1px solid rgba(0, 230, 118, 0.2);
        }
        .has-expenses.react-calendar__tile--active {
          background: linear-gradient(135deg, #FF1744, #00E676) !important;
          border: none;
        }
        @media (max-width: 640px) {
          .react-calendar__tile {
            padding: 0.5rem 0.25rem;
            font-size: 0.75rem;
          }
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default CalendarPage;