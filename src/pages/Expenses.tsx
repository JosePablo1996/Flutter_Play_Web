import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { expensesApi, categoriesApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { Expense, Category } from '../types';
import { NeonButton } from '../components/UI/NeonButton';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw } from 'lucide-react';

// Tipos para el formulario
interface ExpenseFormData {
  name: string;
  amount: string;
  date: string;
  category: string;
  description: string;
  is_recurring: boolean;
  recurrence_pattern: string;
}

const recurrenceOptions = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

const ExpensesPage: React.FC = () => {
  const { colors } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    is_recurring: false,
    recurrence_pattern: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await expensesApi.getAll();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (isMounted) {
        await Promise.all([loadExpenses(), loadCategories()]);
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, [loadExpenses, loadCategories]);

  // Filtrar gastos
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Obtener lista de categorías para el selector (combinadas)
  const categoryOptions = categories.map(cat => ({
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.is_default
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.amount) newErrors.amount = 'El monto es requerido';
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = (): void => {
    setEditingExpense(null);
    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      is_recurring: false,
      recurrence_pattern: '',
    });
    setErrors({});
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        description: formData.description || undefined,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : undefined,
      };

      if (editingExpense) {
        await expensesApi.update(editingExpense.id, expenseData);
      } else {
        await expensesApi.create(expenseData);
      }
      
      resetForm();
      await loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense: Expense): void => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category,
      description: expense.description || '',
      is_recurring: expense.is_recurring,
      recurrence_pattern: expense.recurrence_pattern || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await expensesApi.delete(id);
        await loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getCategoryInfo = (categoryName: string): { icon: string; color: string } => {
    const cat = categories.find(c => c.name === categoryName);
    if (cat) {
      return { icon: cat.icon, color: cat.color };
    }
    return { icon: '📦', color: '#F7DC6F' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Gastos</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Gestiona tus gastos y transacciones</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: '#ffffff'
            }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Gasto
          </motion.button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textSecondary }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            >
              <option value="all">Todas las categorías</option>
              {categoryOptions.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200"
            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar
          </motion.button>
        </div>

        {/* Resumen */}
        <div className="rounded-xl p-6 mb-8 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>Total de Gastos</p>
              <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>Número de Transacciones</p>
              <p className="text-3xl font-bold" style={{ color: colors.text }}>{filteredExpenses.length}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>Gasto Promedio</p>
              <p className="text-3xl font-bold" style={{ color: colors.info }}>
                ${filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(2) : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de gastos */}
        <div className="rounded-xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0" style={{ backgroundColor: colors.surface }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Recurrente</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Monto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: colors.textSecondary }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.border }}>
                <AnimatePresence>
                  {filteredExpenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category);
                    return (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium" style={{ color: colors.text }}>{expense.name}</p>
                            {expense.description && (
                              <p className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: colors.textSecondary }}>{expense.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                            style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                          >
                            <span>{categoryInfo.icon}</span>
                            <span>{expense.category}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.textSecondary }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {expense.is_recurring ? (
                            <span className="text-xs" style={{ color: colors.success }}>
                              🔄 {expense.recurrence_pattern}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: colors.textSecondary }}>No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold" style={{ color: colors.primary }}>
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(expense)}
                              className="p-1 rounded-lg transition-colors"
                              style={{ color: colors.info }}
                              aria-label="Editar gasto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(expense.id)}
                              className="p-1 rounded-lg transition-colors"
                              style={{ color: colors.error }}
                              aria-label="Eliminar gasto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center" style={{ color: colors.textSecondary }}>
                      No hay gastos registrados. ¡Agrega tu primer gasto!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de crear/editar gasto */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={resetForm}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                    {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-2xl hover:opacity-70 transition-opacity"
                    style={{ color: colors.textSecondary }}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Nombre *
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${errors.name ? colors.error : colors.border}`,
                        color: colors.text,
                      }}
                      placeholder="Ej: Compra en supermercado"
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Monto *
                    </label>
                    <input
                      id="amount"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${errors.amount ? colors.error : colors.border}`,
                        color: colors.text,
                      }}
                      placeholder="0.00"
                    />
                    {errors.amount && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.amount}</p>}
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Fecha *
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${errors.date ? colors.error : colors.border}`,
                        color: colors.text,
                      }}
                    />
                    {errors.date && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.date}</p>}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Categoría *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${errors.category ? colors.error : colors.border}`,
                        color: colors.text,
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.category}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200 resize-none"
                      style={{
                        backgroundColor: `${colors.background}cc`,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      }}
                      placeholder="Detalles adicionales..."
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label htmlFor="is_recurring" className="text-sm cursor-pointer" style={{ color: colors.textSecondary }}>
                      Gasto recurrente
                    </label>
                    <div className="relative inline-flex items-center">
                      <input
                        id="is_recurring"
                        type="checkbox"
                        name="is_recurring"
                        checked={formData.is_recurring}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{ backgroundColor: formData.is_recurring ? colors.primary : colors.border }}
                      />
                    </div>
                  </div>

                  {formData.is_recurring && (
                    <div>
                      <label htmlFor="recurrence_pattern" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                        Frecuencia
                      </label>
                      <select
                        id="recurrence_pattern"
                        name="recurrence_pattern"
                        value={formData.recurrence_pattern}
                        onChange={handleChange}
                        className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: `${colors.background}cc`,
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      >
                        <option value="">Selecciona frecuencia</option>
                        {recurrenceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <NeonButton type="submit" variant="primary" fullWidth>
                      {editingExpense ? 'Actualizar' : 'Guardar'}
                    </NeonButton>
                    <NeonButton type="button" variant="secondary" onClick={resetForm} fullWidth>
                      Cancelar
                    </NeonButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExpensesPage;