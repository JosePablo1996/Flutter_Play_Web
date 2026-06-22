import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface NeonInputProps {
  label: string;
  type?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  success?: boolean;
  helperText?: string;
  autoFocus?: boolean;
}

export const NeonInput: React.FC<NeonInputProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  success = false,
  helperText,
  autoFocus = false
}) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  // Determinar el color del borde según el estado
  const getBorderColor = () => {
    if (error) return colors.error;
    if (success) return colors.success;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  // Determinar el color del label según el estado
  const getLabelColor = () => {
    if (error) return colors.error;
    if (success) return colors.success;
    if (isFocused) return colors.primary;
    return colors.textSecondary;
  };

  const borderColor = getBorderColor();
  const labelColor = getLabelColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <label 
        htmlFor={name}
        className="block text-sm font-medium mb-2 transition-colors duration-200"
        style={{ color: labelColor }}
      >
        {label} {required && <span style={{ color: colors.error }}>*</span>}
      </label>

      <div className="relative">
        {/* Icono izquierdo */}
        {icon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
            style={{ color: isFocused ? colors.primary : colors.textSecondary }}
          >
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-xl transition-all duration-300
            focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-4'}
            ${type === 'password' ? 'pr-10' : 'pr-4'}
          `}
          style={{
            backgroundColor: `${colors.surface}cc`,
            border: `2px solid ${borderColor}`,
            color: colors.text,
            backdropFilter: 'blur(8px)',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem'
          }}
        />

        {/* Icono de password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:opacity-80"
            style={{ color: colors.textSecondary }}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Icono de estado (éxito/error) */}
        {(success || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {success && (
              <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
            )}
            {error && (
              <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />
            )}
          </div>
        )}

        {/* Efecto de brillo al hacer focus */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow: `0 0 0 3px ${colors.primary}20`,
                border: `1px solid ${colors.primary}40`
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mensaje de error o ayuda */}
      <AnimatePresence>
        {(error || helperText || success) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-xs"
          >
            {error && (
              <p className="flex items-center gap-1" style={{ color: colors.error }}>
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </p>
            )}
            {success && !error && (
              <p className="flex items-center gap-1" style={{ color: colors.success }}>
                <CheckCircle className="w-3 h-3" />
                <span>Campo válido</span>
              </p>
            )}
            {helperText && !error && !success && (
              <p style={{ color: colors.textSecondary }}>{helperText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NeonInput;