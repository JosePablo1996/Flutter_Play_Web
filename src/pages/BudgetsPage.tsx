import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi, budgetsApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { BudgetWithSpent } from '../services/api';
import BudgetCard from '../components/Budgets/BudgetCard';
import BudgetSummary from '../components/Budgets/BudgetSummary';
import { NeonButton } from '../components/UI/NeonButton';
import { Plus, Target, CheckCircle } from 'lucide-react';

// Categorías predefinidas con iconos
const defaultCategories = [
  { name: 'Alimentación', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transporte', icon: '🚌', color: '#4ECDC4' },
  { name: 'Materiales', icon: '📚', color: '#45B7D1' },
  { name: 'Matrícula', icon: '🎓', color: '#96CEB4' },
  { name: 'Vivienda', icon: '🏠', color: '#FFEAA7' },
  { name: 'Entretenimiento', icon: '🎬', color: '#DDA0DD' },
  { name: 'Salud', icon: '🏥', color: '#98D8C8' },
  { name: 'Otros', icon: '📦', color: '#F7DC6F' },
];

// Tipo para los datos del perfil
interface ProfileData {
  currency: string;
  full_name?: string;
  email?: string;
}

const BudgetsPage: React.FC = () => {
  const { colors } = useTheme();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, budgetsRes] = await Promise.all([
        profileApi.get(),
        budgetsApi.getSummary(),
      ]);
      setProfile({
        currency: profileRes.data.currency,
        full_name: profileRes.data.full_name,
        email: profileRes.data.email,
      });
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Selecciona una categoría';
    if (!formData.amount) newErrors.amount = 'Ingresa un monto';
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'El monto debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingBudget) {
        await budgetsApi.update(editingBudget.category, { amount: parseFloat(formData.amount) });
      } else {
        await budgetsApi.create({
          category: formData.category,
          amount: parseFloat(formData.amount),
        });
      }
      resetForm();
      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error al guardar el presupuesto');
    }
  };

  const handleEdit = (budget: BudgetWithSpent) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (category: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el presupuesto para "${category}"?`)) {
      try {
        await budgetsApi.delete(category);
        await loadData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Error al eliminar el presupuesto');
      }
    }
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
    });
    setErrors({});
    setShowModal(false);
  };

  // Estadísticas totales
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const averagePercentage = budgets.length > 0
    ? budgets.reduce((sum, b) => sum + b.percentage, 0) / budgets.length
    : 0;

  // Obtener icono y color de categoría
  const getCategoryInfo = (categoryName: string) => {
    const cat = defaultCategories.find(c => c.name === categoryName);
    return cat || { name: categoryName, icon: '📦', color: '#666666' };
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
          <p style={{ color: colors.textSecondary }}>Cargando presupuestos...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Presupuestos</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Controla tus límites de gasto por categoría</p>
          </div>
          <NeonButton onClick={() => setShowModal(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </NeonButton>
        </div>

        {/* Mensaje de éxito */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: `${colors.success}15`, border: `1px solid ${colors.success}30` }}
            >
              <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
              <span className="text-sm" style={{ color: colors.success }}>Presupuesto guardado correctamente</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resumen general */}
        {budgets.length > 0 && (
          <div className="mb-8">
            <BudgetSummary
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
              averagePercentage={averagePercentage}
              currency={profile?.currency || 'USD'}
            />
          </div>
        )}

        {/* Lista de presupuestos */}
        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget, index) => {
              const categoryInfo = getCategoryInfo(budget.category);
              return (
                <motion.div
                  key={budget.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BudgetCard
                    category={budget.category}
                    icon={categoryInfo.icon}
                    color={categoryInfo.color}
                    budget={budget.amount}
                    spent={budget.spent}
                    percentage={budget.percentage}
                    currency={profile?.currency || 'USD'}
                    onEdit={() => handleEdit(budget)}
                    onDelete={() => handleDelete(budget.category)}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-12 text-center backdrop-blur-sm"
            style={{ 
              backgroundColor: `${colors.surface}cc`,
              border: `1px solid ${colors.border}` 
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
              <Target className="w-10 h-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="font-medium mb-2" style={{ color: colors.text }}>No tienes presupuestos configurados</h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Crea presupuestos para controlar tus gastos por categoría
            </p>
            <NeonButton onClick={() => setShowModal(true)} variant="primary">
              Crear primer presupuesto
            </NeonButton>
          </motion.div>
        )}

        {/* Modal de crear/editar presupuesto */}
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
                      {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Categoría */}
                    <div>
                      <label htmlFor="category" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                        Categoría *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={!!editingBudget}
                        className="w-full rounded-lg px-4 py-2 focus:outline-none transition-all duration-200 disabled:opacity-50"
                        style={{
                          backgroundColor: `${colors.background}cc`,
                          border: `1px solid ${errors.category ? colors.error : colors.border}`,
                          color: colors.text,
                        }}
                      >
                        <option value="">Selecciona una categoría</option>
                        {defaultCategories.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.category}</p>}
                    </div>

                    {/* Monto */}
                    <div>
                      <label htmlFor="amount" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                        Presupuesto mensual *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textSecondary }}>
                          {symbol}
                        </span>
                        <input
                          id="amount"
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          step="10"
                          className="w-full rounded-lg px-4 py-2 pl-7 focus:outline-none transition-all duration-200"
                          style={{
                            backgroundColor: `${colors.background}cc`,
                            border: `1px solid ${errors.amount ? colors.error : colors.border}`,
                            color: colors.text,
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.amount && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.amount}</p>}
                    </div>

                    {/* Información adicional */}
                    <div 
                      className="rounded-xl p-4"
                      style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.border}` }}
                    >
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        {editingBudget
                          ? 'Editar el presupuesto actualizará tu límite de gasto'
                          : 'Al crear un presupuesto, recibirás alertas cuando te acerques al límite'}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <NeonButton type="submit" variant="primary" fullWidth>
                        {editingBudget ? 'Actualizar' : 'Crear'}
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
      </div>
    </motion.div>
  );
};

export default BudgetsPage;