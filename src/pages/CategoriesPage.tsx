import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesApi, type Category, type CategoryCreate } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/UI/NeonButton';
import { Plus, Edit2, Trash2, Check, Grid3x3 } from 'lucide-react';

// Tipos para las props de los componentes
interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  text: string;
  textSecondary: string;
  border: string;
  surface: string;
  background: string;
}

// Colores predefinidos para categorías
const presetColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9F43', '#54A0FF',
  '#5F27CD', '#00D2D3', '#FF6B6B', '#FF9FF3', '#FECA57',
];

// Iconos predefinidos
const presetIcons = [
  '🍔', '🚌', '📚', '🎓', '🏠', '🎬', '🏥', '📦', '🛒', '💻',
  '☕', '🍕', '🎮', '✈️', '💪', '🎵', '📺', '🎁', '🐶', '🌮',
];

// Props para DefaultCategoryCard
interface DefaultCategoryCardProps {
  category: Category;
  colors: ThemeColors;
}

// Props para CustomCategoryCard
interface CustomCategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  colors: ThemeColors;
}

const CategoriesPage: React.FC = () => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<CategoryCreate>({
    name: '',
    icon: '📦',
    color: '#666666',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (isMounted) {
        await loadCategories();
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, [loadCategories]);

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

  const handleIconSelect = (icon: string) => {
    setFormData({ ...formData, icon });
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, color });
  };

  // ✅ VALIDACIÓN MEJORADA - Evita duplicación de nombres
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else {
      // Normalizar el nombre para comparación (case-insensitive)
      const newNameNormalized = formData.name.toLowerCase().trim();
      
      // Verificar si el nombre ya existe en categorías por defecto
      const defaultCategoryNames = categories
        .filter(c => c.is_default)
        .map(c => c.name.toLowerCase().trim());
      
      if (defaultCategoryNames.includes(newNameNormalized)) {
        newErrors.name = `Ya existe una categoría por defecto llamada "${formData.name}"`;
      }
      
      // Verificar si el nombre ya existe en categorías personalizadas del usuario
      // Excluir la categoría que se está editando
      const customCategoryNames = categories
        .filter(c => !c.is_default && c.id !== editingCategory?.id)
        .map(c => c.name.toLowerCase().trim());
      
      if (customCategoryNames.includes(newNameNormalized)) {
        newErrors.name = `Ya tienes una categoría personalizada llamada "${formData.name}"`;
      }
    }
    
    if (!formData.icon) newErrors.icon = 'Selecciona un icono';
    if (!formData.color) newErrors.color = 'Selecciona un color';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      resetForm();
      await loadCategories();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving category:', error);
      // Manejar error de duplicado desde el backend
      if (error.response?.data?.detail) {
        setErrors({ name: error.response.data.detail });
      } else {
        alert('Error al guardar la categoría');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string, isDefault: boolean) => {
    if (isDefault) {
      alert('No puedes eliminar una categoría por defecto');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) {
      try {
        await categoriesApi.delete(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '📦',
      color: '#666666',
    });
    setErrors({});
    setShowModal(false);
  };

  // Separar categorías por defecto y personalizadas
  const defaultCategories = categories.filter(c => c.is_default);
  const customCategories = categories.filter(c => !c.is_default);

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
          <p style={{ color: colors.textSecondary }}>Cargando categorías...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Categorías</h1>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Gestiona tus categorías de gastos</p>
          </div>
          <NeonButton onClick={() => setShowModal(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
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
              <Check className="w-4 h-4" style={{ color: colors.success }} />
              <span className="text-sm" style={{ color: colors.success }}>Categoría guardada correctamente</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categorías por defecto */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Categorías por defecto</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.border}`, color: colors.textSecondary }}>
              No editables
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {defaultCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <DefaultCategoryCard category={category} colors={colors as unknown as ThemeColors} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Categorías personalizadas */}
        {customCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.success}, ${colors.info})` }} />
              <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Mis categorías</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.border}`, color: colors.textSecondary }}>
                {customCategories.length} categorías
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {customCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CustomCategoryCard
                    category={category}
                    onEdit={() => handleEdit(category)}
                    onDelete={() => handleDelete(category.id, category.name, false)}
                    colors={colors as unknown as ThemeColors}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay categorías personalizadas */}
        {customCategories.length === 0 && (
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
              <Grid3x3 className="w-10 h-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="font-medium mb-2" style={{ color: colors.text }}>No tienes categorías personalizadas</h3>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Crea tus propias categorías para organizar mejor tus gastos
            </p>
            <NeonButton onClick={() => setShowModal(true)} variant="primary">
              Crear primera categoría
            </NeonButton>
          </motion.div>
        )}
      </div>

      {/* Modal de crear/editar categoría */}
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
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm mb-1" style={{ color: colors.textSecondary }}>
                      Nombre de la categoría *
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
                      placeholder="Ej: Supermercado, Cine, Gasolina"
                      autoComplete="off"
                    />
                    {errors.name && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.name}</p>}
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      No puedes crear categorías con nombres que ya existan
                    </p>
                  </div>

                  {/* Icono */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>
                      Icono *
                    </label>
                    <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 rounded-lg" style={{ backgroundColor: `${colors.background}cc` }}>
                      {presetIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className="w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all duration-200"
                          style={{
                            backgroundColor: formData.icon === icon ? `${colors.primary}20` : 'transparent',
                            border: formData.icon === icon ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
                            transform: formData.icon === icon ? 'scale(1.05)' : 'scale(1)'
                          }}
                          aria-label={`Seleccionar icono ${icon}`}
                          title={`Icono ${icon}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    {errors.icon && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.icon}</p>}
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>
                      Color *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorSelect(color)}
                          className="w-8 h-8 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: color,
                            boxShadow: formData.color === color ? `0 0 0 2px ${colors.surface}, 0 0 0 4px ${colors.primary}` : 'none',
                            transform: formData.color === color ? 'scale(1.1)' : 'scale(1)'
                          }}
                          aria-label={`Seleccionar color ${color}`}
                          title={`Color ${color}`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label htmlFor="customColor" className="text-xs" style={{ color: colors.textSecondary }}>Personalizado:</label>
                      <input
                        id="customColor"
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-10 h-8 rounded cursor-pointer"
                        style={{ backgroundColor: 'transparent' }}
                        aria-label="Color personalizado"
                      />
                      <span className="text-xs font-mono" style={{ color: colors.textSecondary }}>{formData.color}</span>
                    </div>
                    {errors.color && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.color}</p>}
                  </div>

                  {/* Vista previa */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: `${colors.background}cc`, border: `1px solid ${colors.border}` }}>
                    <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Vista previa</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-200"
                        style={{ backgroundColor: `${formData.color}20`, border: `1px solid ${formData.color}` }}
                      >
                        {formData.icon}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: colors.text }}>{formData.name || 'Nombre'}</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>Categoría personalizada</p>
                      </div>
                    </div>
                  </div>

                  {/* Advertencia de duplicación */}
                  {formData.name && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.warning}10`, border: `1px solid ${colors.warning}30` }}>
                      <p className="text-xs" style={{ color: colors.warning }}>
                        ⚠️ Asegúrate de que el nombre no exista ya en tus categorías
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <NeonButton type="submit" variant="primary" fullWidth>
                      {editingCategory ? 'Actualizar' : 'Crear'}
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

// Componente de tarjeta de categoría por defecto
const DefaultCategoryCard: React.FC<DefaultCategoryCardProps> = ({ category, colors }) => {
  const cardStyle = {
    backgroundColor: `${category.color}20`,
    border: `1px solid ${category.color}`
  };

  return (
    <div
      className="rounded-xl p-4 text-center transition-all duration-300 cursor-default"
      style={cardStyle}
    >
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3">
          {category.icon}
        </div>
        <p className="font-medium text-sm" style={{ color: colors.text }}>{category.name}</p>
        <span className="text-[10px] mt-1" style={{ color: colors.textSecondary }}>Por defecto</span>
      </div>
    </div>
  );
};

// Componente de tarjeta de categoría personalizada
const CustomCategoryCard: React.FC<CustomCategoryCardProps> = ({ category, onEdit, onDelete, colors }) => {
  const [showActions, setShowActions] = useState(false);
  const cardStyle = {
    backgroundColor: `${category.color}20`,
    border: `1px solid ${category.color}`
  };

  return (
    <div
      className="relative rounded-xl p-4 text-center transition-all duration-300"
      style={cardStyle}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3">
          {category.icon}
        </div>
        <p className="font-medium text-sm" style={{ color: colors.text }}>{category.name}</p>
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onEdit}
            className="p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
            aria-label="Editar categoría"
            title="Editar"
          >
            <Edit2 className="w-3 h-3" />
          </motion.button>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onDelete}
            className="p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
            aria-label="Eliminar categoría"
            title="Eliminar"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;