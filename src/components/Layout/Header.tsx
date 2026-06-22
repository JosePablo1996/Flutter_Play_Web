import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import UserMenu from './UserMenu';
import GreetingWidget from './GreetingWidget';
import { motion } from 'framer-motion';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton = false, 
  onMenuClick
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
      style={{ 
        background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
        borderColor: colors.border,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
      }}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left section - Menu button */}
          <div className="flex items-center gap-2 min-w-[60px]">
            {onMenuClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuClick}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.textSecondary }}
                aria-label="Abrir menú"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            )}
            
            {showBackButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm transition-colors"
                style={{ color: colors.textSecondary }}
                aria-label="Volver"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </motion.button>
            )}
          </div>

          {/* Center section - Greeting Widget */}
          <div className="flex-1">
            <GreetingWidget className="w-full" />
          </div>

          {/* Right section - Solo User Menu (sin botón de tema) */}
          <div className="min-w-[60px] flex justify-end items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;