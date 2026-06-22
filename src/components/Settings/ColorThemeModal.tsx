// src/components/Settings/ColorThemeModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Palette, CheckCircle, X } from 'lucide-react';

interface ColorThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Definir el tipo de color para que coincida con ThemeContext
type ThemeColorType = 'neon' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'cyan' | 'yellow' | 'teal' | 'indigo' | 'brown';

interface ColorOption {
  id: ThemeColorType;
  name: string;
  primary: string;
  secondary: string;
  preview: string;
}

const colorOptions: ColorOption[] = [
  // Colores originales
  { id: 'neon', name: 'Neon', primary: '#00E676', secondary: '#00B0FF', preview: 'bg-gradient-to-r from-[#00E676] to-[#00B0FF]' },
  { id: 'blue', name: 'Azul', primary: '#3B82F6', secondary: '#60A5FA', preview: 'bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]' },
  { id: 'purple', name: 'Púrpura', primary: '#8B5CF6', secondary: '#A78BFA', preview: 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]' },
  { id: 'green', name: 'Verde', primary: '#059669', secondary: '#10B981', preview: 'bg-gradient-to-r from-[#059669] to-[#10B981]' },
  { id: 'red', name: 'Rojo', primary: '#EF4444', secondary: '#F97316', preview: 'bg-gradient-to-r from-[#EF4444] to-[#F97316]' },
  { id: 'orange', name: 'Naranja', primary: '#F97316', secondary: '#FBBF24', preview: 'bg-gradient-to-r from-[#F97316] to-[#FBBF24]' },
  { id: 'pink', name: 'Rosa', primary: '#EC4899', secondary: '#F43F5E', preview: 'bg-gradient-to-r from-[#EC4899] to-[#F43F5E]' },
  { id: 'cyan', name: 'Cian', primary: '#06B6D4', secondary: '#22D3EE', preview: 'bg-gradient-to-r from-[#06B6D4] to-[#22D3EE]' },
  
  // NUEVOS COLORES
  { id: 'yellow', name: 'Amarillo', primary: '#EAB308', secondary: '#FBBF24', preview: 'bg-gradient-to-r from-[#EAB308] to-[#FBBF24]' },
  { id: 'teal', name: 'Verde azulado', primary: '#14B8A6', secondary: '#2DD4BF', preview: 'bg-gradient-to-r from-[#14B8A6] to-[#2DD4BF]' },
  { id: 'indigo', name: 'Índigo', primary: '#6366F1', secondary: '#818CF8', preview: 'bg-gradient-to-r from-[#6366F1] to-[#818CF8]' },
  { id: 'brown', name: 'Marrón', primary: '#78350F', secondary: '#B45309', preview: 'bg-gradient-to-r from-[#78350F] to-[#B45309]' },
];

const ColorThemeModal: React.FC<ColorThemeModalProps> = ({ isOpen, onClose }) => {
  const { colors, color, setColor } = useTheme();
  // Usar el tipo ThemeColorType para selectedColor
  const [selectedColor, setSelectedColor] = useState<ThemeColorType>(color as ThemeColorType);

  const handleApply = () => {
    setColor(selectedColor);
    onClose();
  };

  if (!isOpen) return null;

  // Obtener el color seleccionado para la vista previa
  const selectedColorData = colorOptions.find(c => c.id === selectedColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Header con gradiente */}
        <div className="relative px-6 py-4 border-b" style={{ borderColor: colors.border }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                <Palette className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.text }}>Personalizar colores</h2>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Elige el tema que más te guste</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </button>
          </div>
        </div>
        
        {/* Vista previa del color seleccionado - CON NOMBRE */}
        <div className="px-6 pt-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${colors.background}cc` }}>
            <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Vista previa</p>
            <div className={`w-full h-20 rounded-xl ${selectedColorData?.preview}`} />
            <p className="text-sm font-medium mt-2" style={{ color: colors.text }}>
              {selectedColorData?.name}
            </p>
          </div>
        </div>
        
        {/* Selector de colores en grid - SIN NOMBRES DEBAJO */}
        <div className="p-6">
          <p className="text-sm font-medium mb-3" style={{ color: colors.text }}>Selecciona un color:</p>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedColor(option.id)}
                className="relative h-14 rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  boxShadow: selectedColor === option.id ? `0 0 0 2px ${colors.surface}, 0 0 0 4px ${colors.primary}` : 'none'
                }}
                title={option.name}
                aria-label={`Seleccionar tema ${option.name}`}
              >
                <div className={`w-full h-full ${option.preview}`} />
                {selectedColor === option.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Footer con botones */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: colors.border }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
          >
            Aplicar tema
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ColorThemeModal;