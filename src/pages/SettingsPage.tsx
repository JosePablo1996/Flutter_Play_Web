import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/UI/NeonButton';
import UserProfileCard from '../components/Settings/UserProfileCard';
import ColorThemeModal from '../components/Settings/ColorThemeModal';
import PasskeySection from '../components/Security/PasskeySection';
import { TwoFactorSetupPage } from './TwoFactorSetup';
import { twoFactorService } from '../services/twoFactorService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Bell,
  BellRing,
  DollarSign,
  Key,
  Shield,
  History,
  Info,
  Gift,
  HelpCircle,
  User,
  LogOut,
  AlertTriangle,
  Smartphone,
  Award,
  ChevronRight,
  Palette,
  Sparkles,
} from 'lucide-react';

// ============================================
// COMPONENTES AUXILIARES CON LIQUID GLASS
// ============================================

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => {
  const { colors } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 px-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-1 h-5 rounded-full"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        />
        <span className="text-xs tracking-wider" style={{ color: colors.textSecondary }}>
          {icon}
        </span>
        <span className="text-xs tracking-wider font-semibold" style={{ color: colors.textSecondary }}>
          {title}
        </span>
      </div>
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl"
        style={{ 
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  expandable?: boolean;
  isExpanded?: boolean;
  danger?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  children,
  onClick,
  showArrow = true,
  expandable = false,
  isExpanded = false,
  danger = false,
}) => {
  const { colors } = useTheme();
  
  return (
    <>
      <motion.div
        whileHover={{ backgroundColor: `${colors.primary}08` }}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 ${
          expandable && isExpanded ? 'border-b' : ''
        } ${expandable ? 'active:scale-[0.99]' : ''}`}
        style={{ borderColor: colors.border }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300" style={{ backgroundColor: `${colors.primary}15` }}>
          {icon}
        </div>
        <div className="flex-1">
          <p className={`font-medium text-sm ${danger ? 'text-red-500' : ''}`} style={{ color: danger ? colors.error : colors.text }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            {subtitle}
          </p>
        </div>
        {children}
        {showArrow && !children && !danger && onClick && (
          <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
        )}
      </motion.div>
      {expandable && isExpanded && children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-b last:border-b-0"
          style={{ borderColor: colors.border }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

interface SwitchToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
}

const SwitchToggle: React.FC<SwitchToggleProps> = ({ value, onToggle }) => {
  const { colors } = useTheme();
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggle(!value)}
      className="w-12 h-6 rounded-full transition-all duration-300"
      style={{ 
        backgroundColor: value ? colors.primary : 'rgba(255, 255, 255, 0.2)',
        boxShadow: value ? `0 0 10px ${colors.primary}40` : 'none'
      }}
      aria-label={value ? 'Desactivar' : 'Activar'}
      title={value ? 'Desactivar' : 'Activar'}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
      />
    </motion.button>
  );
};

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  const { colors } = useTheme();
  
  return (
    <button
      onClick={onToggle}
      className="w-20 h-9 rounded-full relative overflow-hidden hover:scale-105 active:scale-95 transition-transform duration-300"
      style={{ backgroundColor: `${colors.primary}20` }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div
        className={`absolute top-0.5 w-8 h-8 rounded-full bg-gradient-to-br transition-all duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-10 from-neon-purple to-neon-blue' : 'translate-x-0.5 from-amber-500 to-orange-500'
        }`}
      >
        {isDark ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-white" />}
      </div>
    </button>
  );
};

// ============================================
// MODAL DE CAMBIO DE CONTRASEÑA
// ============================================

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose, email }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  if (!isOpen) return null;

  const handleReset = () => {
    onClose();
    setTimeout(() => {
      navigate('/reset-password');
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative rounded-2xl w-full max-w-sm shadow-2xl backdrop-blur-xl"
        style={{ 
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`
        }}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
            <Key className="w-8 h-8" style={{ color: colors.error }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>¿Olvidaste tu contraseña?</h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Te ayudaremos a restablecer tu contraseña mediante un código de verificación OTP.
          </p>
          <p className="text-xs mt-3" style={{ color: colors.textSecondary }}>
            Se enviará un código de 6 dígitos a <span style={{ color: colors.primary }}>{email}</span>
          </p>
        </div>
        <div className="p-4 border-t flex gap-3" style={{ borderColor: colors.border }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            style={{ backgroundColor: `${colors.text}10`, color: colors.textSecondary }}
          >
            Cancelar
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
            style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
          >
            Restablecer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
// ============================================

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative rounded-2xl w-full max-w-sm shadow-2xl backdrop-blur-xl"
        style={{ 
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.error}30`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`
        }}
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
              <LogOut className="w-8 h-8" style={{ color: colors.error }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>Cerrar Sesión</h2>
            <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
              ¿Estás seguro de que deseas cerrar sesión?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
              style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
            >
              {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleMode, colors, color } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
  const [show2FADropdown, setShow2FADropdown] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // ✅ DETECTAR ENTORNO: Solo mostrar Passkey en desarrollo
  const isDevelopment = import.meta.env.DEV;

  // Función para obtener el nombre del color actual
  const getCurrentColorName = () => {
    switch (color) {
      case 'neon': return 'Neon (Verde/Azul)';
      case 'blue': return 'Azul';
      case 'purple': return 'Púrpura';
      case 'green': return 'Verde';
      case 'red': return 'Rojo';
      case 'orange': return 'Naranja';
      case 'pink': return 'Rosa';
      case 'cyan': return 'Cian';
      case 'yellow': return 'Amarillo';
      case 'teal': return 'Verde azulado';
      case 'indigo': return 'Índigo';
      case 'brown': return 'Marrón';
      default: return 'Neon (Verde/Azul)';
    }
  };

  // Verificar estado de 2FA
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const data = await twoFactorService.getStatus();
        setTwoFactorEnabled(data.enabled);
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };
    check2FAStatus();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
    setIsLoggingOut(false);
    setShowLogoutModal(false);
  };

  const getUserEmail = () => {
    return user?.email || 'usuario@email.com';
  };

  const handleDisable2FA = async () => {
    if (!confirm('¿Estás seguro? Desactivar 2FA hará tu cuenta menos segura.')) return;
    
    try {
      await twoFactorService.disable();
      setTwoFactorEnabled(false);
      alert('2FA desactivado correctamente');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Error al desactivar 2FA');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-8 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header con efecto Liquid Glass */}
      <div 
        className="sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-6 transition-colors duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          borderColor: colors.border,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
            <Sparkles className="w-6 h-6" style={{ color: colors.primary }} />
            Configuración
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Personaliza tu experiencia en Flutter Play - Mi Banca Universitaria
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tarjeta de perfil de usuario */}
        <div className="px-4 mt-6">
          <UserProfileCard onNavigateToProfile={() => navigate('/profile')} />
        </div>

        {/* Sección Apariencia */}
        <SettingsSection title="Apariencia" icon={<Palette className="w-3 h-3" />}>
          <SettingsItem
            icon={mode === 'dark' ? <Moon className="w-4 h-4" style={{ color: colors.primary }} /> : <Sun className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Modo oscuro"
            subtitle="Cambiar entre tema claro y oscuro"
          >
            <ThemeToggle isDark={mode === 'dark'} onToggle={toggleMode} />
          </SettingsItem>
          
          {/* Item de color de tema - ABRE EL MODAL */}
          <SettingsItem
            icon={<Palette className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Color de tema"
            subtitle={getCurrentColorName()}
            onClick={() => setShowColorModal(true)}
            showArrow
          />
        </SettingsSection>

        {/* Sección Notificaciones */}
        <SettingsSection title="Notificaciones" icon={<Bell className="w-3 h-3" />}>
          <SettingsItem
            icon={notificationsEnabled ? <BellRing className="w-4 h-4" style={{ color: colors.primary }} /> : <Bell className="w-4 h-4" style={{ color: colors.textSecondary }} />}
            title="Notificaciones push"
            subtitle="Recibir alertas sobre tus movimientos"
          >
            <SwitchToggle value={notificationsEnabled} onToggle={setNotificationsEnabled} />
          </SettingsItem>
          <SettingsItem
            icon={<DollarSign className="w-4 h-4" style={{ color: colors.warning }} />}
            title="Alertas de presupuesto"
            subtitle="Notificar cuando te acerques al límite"
          >
            <SwitchToggle value={budgetAlertsEnabled} onToggle={setBudgetAlertsEnabled} />
          </SettingsItem>
        </SettingsSection>

        {/* Sección Seguridad Bancaria */}
        <SettingsSection title="Seguridad Bancaria" icon={<Shield className="w-3 h-3" />}>
          <SettingsItem
            icon={<Key className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Cambiar contraseña"
            subtitle="Restablece tu contraseña con verificación OTP"
            onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
            expandable
            isExpanded={showPasswordDropdown}
          />
          {showPasswordDropdown && (
            <div className="px-4 pb-4">
              <div 
                className="rounded-xl p-4 backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${colors.background}cc`,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05)`
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" style={{ color: colors.warning }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    Recibirás un código de verificación (OTP) a tu correo electrónico
                  </p>
                </div>
                <NeonButton
                  onClick={() => setShowPasswordResetModal(true)}
                  variant="primary"
                  fullWidth
                >
                  Restablecer contraseña con OTP
                </NeonButton>
                <p className="text-xs text-center mt-2" style={{ color: colors.textSecondary }}>
                  Recibirás un código OTP en {getUserEmail()}
                </p>
              </div>
            </div>
          )}

          <SettingsItem
            icon={<Shield className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Autenticación en Dos Pasos (2FA)"
            subtitle={twoFactorEnabled ? "Protección activada" : "Añade capa extra de seguridad"}
            onClick={() => setShow2FADropdown(!show2FADropdown)}
            expandable
            isExpanded={show2FADropdown}
          >
            {twoFactorEnabled && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                Activado
              </span>
            )}
          </SettingsItem>
          {show2FADropdown && (
            <div className="px-4 pb-4">
              <div 
                className="rounded-xl p-4 backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${colors.background}cc`,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05)`
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4" style={{ color: colors.primary }} />
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {twoFactorEnabled 
                      ? "Tu cuenta está protegida con autenticación de dos factores"
                      : "Protege tu cuenta con un segundo factor de autenticación"}
                  </p>
                </div>
                {!twoFactorEnabled ? (
                  <NeonButton
                    onClick={() => setShow2FASetup(true)}
                    variant="secondary"
                    fullWidth
                  >
                    Configurar 2FA
                  </NeonButton>
                ) : (
                  <button
                    onClick={handleDisable2FA}
                    className="w-full px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                    style={{ border: `1px solid ${colors.error}30`, color: colors.error }}
                  >
                    Desactivar 2FA
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ✅ Passkey Section - SOLO EN DESARROLLO */}
          {isDevelopment && (
            <>
              <PasskeySection />
              <div className="h-px my-1" style={{ backgroundColor: colors.border }} />
            </>
          )}

          {/* Enlace a Historial de Accesos */}
          <SettingsItem
            icon={<History className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Historial de accesos"
            subtitle="Revisa todos los inicios de sesión en tu cuenta"
            onClick={() => navigate('/access-history')}
            showArrow
          />
        </SettingsSection>

        {/* Sección Acerca de */}
        <SettingsSection title="Acerca de" icon={<Info className="w-3 h-3" />}>
          <SettingsItem
            icon={<Award className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Versión"
            subtitle="Flutter Play v2.6.0"
            showArrow={false}
          />
          <SettingsItem
            icon={<Gift className="w-4 h-4" style={{ color: colors.warning }} />}
            title="Registro de cambios"
            subtitle="Ver todas las novedades"
            onClick={() => navigate('/changelog')}
          />
          <SettingsItem
            icon={<HelpCircle className="w-4 h-4" style={{ color: colors.primary }} />}
            title="Centro de ayuda"
            subtitle="Preguntas frecuentes y soporte"
            onClick={() => navigate('/help')}
          />
        </SettingsSection>

        {/* Sección Información del desarrollador */}
        <SettingsSection title="Información del desarrollador" icon={<User className="w-3 h-3" />}>
          <div 
            className="rounded-xl p-6 text-center mx-4 my-3 transition-all duration-300 backdrop-blur-sm"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05)`
            }}
          >
            <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>Desarrollado con ❤️ por</p>
            <p className="font-bold text-lg" style={{ color: colors.text }}>José Pablo Miranda Quintanilla</p>
          </div>
        </SettingsSection>

        {/* Botón de cerrar sesión */}
        <div className="px-4 pb-8 mt-4">
          <div 
            className="rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl"
            style={{ 
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05)`
            }}
          >
            <motion.button
              whileHover={{ backgroundColor: `${colors.error}15` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogoutModal(true)}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-4 transition-all duration-300"
              style={{ backgroundColor: `${colors.error}08` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                <LogOut className="w-4 h-4" style={{ color: colors.error }} />
              </div>
              <span className="font-medium flex-1 text-left" style={{ color: colors.error }}>
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* MODALES */}
      <AnimatePresence>
        {/* Modal de selección de colores */}
        <ColorThemeModal isOpen={showColorModal} onClose={() => setShowColorModal(false)} />

        {/* Modal de cambio de contraseña */}
        <PasswordResetModal
          isOpen={showPasswordResetModal}
          onClose={() => setShowPasswordResetModal(false)}
          email={getUserEmail()}
        />

        {/* Modal de cierre de sesión */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
        />
      </AnimatePresence>

      {/* Modal de 2FA */}
      <TwoFactorSetupPage
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onComplete={() => {
          setTwoFactorEnabled(true);
          setShow2FASetup(false);
        }}
      />
    </motion.div>
  );
};

export default SettingsPage;