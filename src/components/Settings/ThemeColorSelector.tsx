// src/components/Settings/ThemeColorSelector.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle } from 'lucide-react';

type ThemeColorType = 'neon' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'cyan' | 'yellow' | 'teal' | 'indigo' | 'brown';

interface ColorOption {
  id: ThemeColorType;
  name: string;
  color1: string;
  color2: string;
  description: string;
}

const colorOptions: ColorOption[] = [
  // Colores existentes
  { id: 'neon', name: 'Neon', color1: '#00E676', color2: '#00B0FF', description: 'Verde / Azul' },
  { id: 'blue', name: 'Azul', color1: '#3B82F6', color2: '#60A5FA', description: 'Azul claro' },
  { id: 'purple', name: 'Púrpura', color1: '#8B5CF6', color2: '#A78BFA', description: 'Púrpura vibrante' },
  { id: 'green', name: 'Verde', color1: '#059669', color2: '#10B981', description: 'Verde esmeralda' },
  { id: 'red', name: 'Rojo', color1: '#EF4444', color2: '#F97316', description: 'Rojo vibrante' },
  { id: 'orange', name: 'Naranja', color1: '#F97316', color2: '#FBBF24', description: 'Naranja cálido' },
  { id: 'pink', name: 'Rosa', color1: '#EC4899', color2: '#F43F5E', description: 'Rosa moderno' },
  { id: 'cyan', name: 'Cian', color1: '#06B6D4', color2: '#22D3EE', description: 'Cian brillante' },
  
  // ============================================
  // NUEVOS COLORES
  // ============================================
  
  // 🟡 Amarillo vibrante
  { id: 'yellow', name: 'Amarillo', color1: '#EAB308', color2: '#FBBF24', description: 'Amarillo vibrante' },
  
  // 🟢 Verde azulado (Teal)
  { id: 'teal', name: 'Verde azulado', color1: '#14B8A6', color2: '#2DD4BF', description: 'Verde azulado' },
  
  // 🔵 Índigo profundo
  { id: 'indigo', name: 'Índigo', color1: '#6366F1', color2: '#818CF8', description: 'Índigo profundo' },
  
  // 🟤 Marrón cálido
  { id: 'brown', name: 'Marrón', color1: '#78350F', color2: '#B45309', description: 'Marrón cálido' },
];

interface ThemeColorSelectorProps {
  variant?: 'full' | 'compact';
  onColorSelected?: () => void;
}

const ThemeColorSelector: React.FC<ThemeColorSelectorProps> = ({ 
  variant = 'full',
  onColorSelected 
}) => {
  const { color, setColor, colors } = useTheme();

  const handleColorSelect = (selectedId: ThemeColorType) => {
    setColor(selectedId);
    if (onColorSelected) {
      onColorSelected();
    }
  };

  // Versión compacta (para UserMenu)
  if (variant === 'compact') {
    return (
      <div className="p-2">
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorSelect(option.id)}
              className="relative w-10 h-10 rounded-xl overflow-hidden transition-all duration-200 group"
              style={{
                background: `linear-gradient(135deg, ${option.color1}, ${option.color2})`,
                boxShadow: color === option.id ? `0 0 0 2px ${colors.surface}, 0 0 0 4px ${colors.primary}` : 'none',
              }}
              title={option.name}
              aria-label={`Seleccionar tema ${option.name}`}
            >
              {color === option.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Versión completa (para SettingsPage)
  return (
    <div className="p-4">
      <p className="text-sm mb-3" style={{ color: colors.text }}>
        Selecciona el color principal de la aplicación
      </p>
      <div className="grid grid-cols-2 gap-3">
        {colorOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleColorSelect(option.id)}
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: color === option.id ? `${colors.primary}15` : 'transparent',
              border: `1px solid ${color === option.id ? colors.primary : colors.border}`
            }}
          >
            <div className="flex items-center gap-1">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ background: `linear-gradient(135deg, ${option.color1}, ${option.color2})` }}
              />
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: option.color1 }}
              />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium" style={{ color: colors.text }}>
                {option.name}
              </span>
              <p className="text-xs opacity-70" style={{ color: colors.textSecondary }}>
                {option.description}
              </p>
            </div>
            {color === option.id && (
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ThemeColorSelector;