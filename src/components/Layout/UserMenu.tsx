import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType } from '../../types';
import { 
  UserIcon, 
  LogOut, 
  ChevronDown, 
  Moon, 
  Sun,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Mail
} from 'lucide-react';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mode, toggleMode, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Obtener el rol correctamente
  const userRole = profile?.role || user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isVerified = user?.email !== undefined;

  // Cargar perfil para obtener el avatar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.get();
        setProfile(response.data);
      } catch (error) {
        console.error('Error loading profile for avatar:', error);
      }
    };
    loadProfile();
  }, []);

  // Calcular posición del menú cuando se abre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  // Obtener iniciales del usuario
  const getInitials = (): string => {
    const name = profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  };

  // Obtener nombre de usuario
  const getUserName = (): string => {
    return profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Usuario';
  };

  // Obtener email
  const getUserEmail = (): string => {
    return user?.email || 'usuario@email.com';
  };

  // Obtener URL del avatar
  const getAvatarUrl = (): string | null => {
    if (profile?.avatar_url && !avatarError) {
      return profile.avatar_url;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  const userName = getUserName();
  const userEmail = getUserEmail();

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Avatar - Botón para abrir el menú */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 focus:outline-none group"
          aria-label="Menú de usuario"
        >
          <div className="relative">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: isOpen ? `0 0 0 2px ${colors.primary}40` : 'none'
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {getInitials()}
                </span>
              )}
            </div>
            {/* Badge de verificación en el avatar */}
            {isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            )}
          </div>
          <span className="hidden md:block text-sm font-medium" style={{ color: colors.text }}>
            {userName}
          </span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-300 hidden md:block ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: colors.textSecondary }}
          />
        </button>

        {/* Menú desplegable */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[1000]"
              style={{
                top: menuPosition.top,
                right: menuPosition.right,
                minWidth: '300px',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto'
              }}
            >
              <div 
                className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3)`
                }}
              >
                {/* Header de la tarjeta con gradiente */}
                <div 
                  className="px-6 py-5 border-b sticky top-0 z-10"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`,
                    borderColor: colors.border,
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar grande con efectos */}
                    <div className="relative mb-3">
                      <div className="absolute -inset-1 rounded-full blur-md opacity-60" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                      <div 
                        className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <span className="text-white font-bold text-3xl">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      {/* Badge de verificación en avatar grande */}
                      {isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border-2 shadow-md" style={{ borderColor: colors.surface }}>
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Nombre del usuario */}
                    <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                      {userName}
                    </h3>
                    
                    {/* Email del usuario */}
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" style={{ color: colors.textSecondary }} />
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        {userEmail}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {/* Badge de cuenta verificada */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                          Verificada
                        </span>
                      </div>

                      {/* Badge de administrador */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                            Administrador
                          </span>
                          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-4">
                  {/* Estadísticas rápidas */}
                  <div 
                    className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="text-center">
                      <p className="text-xs" style={{ color: colors.textSecondary }}>Moneda</p>
                      <p className="font-semibold text-sm" style={{ color: colors.primary }}>
                        {profile?.currency || user?.currency || 'USD'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs" style={{ color: colors.textSecondary }}>Presupuesto</p>
                      <p className="font-semibold text-sm" style={{ color: colors.warning }}>
                        ${profile?.monthly_budget?.toFixed(2) || user?.monthly_budget?.toFixed(2) || '1000'}
                      </p>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                      <div className="flex items-center gap-3">
                        {mode === 'dark' ? <Moon className="w-4 h-4" style={{ color: colors.primary }} /> : <Sun className="w-4 h-4" style={{ color: colors.primary }} />}
                        <span className="text-sm" style={{ color: colors.text }}>Modo {mode === 'dark' ? 'Oscuro' : 'Claro'}</span>
                      </div>
                      <button
                        onClick={toggleMode}
                        className="w-12 h-6 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: mode === 'dark' ? colors.primary : 'rgba(255, 255, 255, 0.2)',
                          boxShadow: mode === 'dark' ? `0 0 10px ${colors.primary}40` : 'none'
                        }}
                      >
                        <motion.div
                          animate={{ x: mode === 'dark' ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="h-px my-2" style={{ backgroundColor: colors.border }} />

                  {/* Opciones del menú */}
                  <motion.button
                    whileHover={{ backgroundColor: `${colors.primary}10` }}
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <UserIcon className="w-4 h-4" style={{ color: colors.primary }} />
                    </div>
                    <span className="font-medium flex-1 text-left" style={{ color: colors.text }}>Mi Perfil</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ backgroundColor: `${colors.error}10` }}
                    onClick={() => {
                      setIsOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                      <LogOut className="w-4 h-4" style={{ color: colors.error }} />
                    </div>
                    <span className="font-medium flex-1 text-left" style={{ color: colors.error }}>Cerrar Sesión</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de confirmación de cierre de sesión - TOTALMENTE CENTRADO */}
      <AnimatePresence>
        {showLogoutModal && (
          <div 
            className="fixed inset-0 z-[2000]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutModal(false)}
            />
            
            {/* Modal centrado */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm mx-4 shadow-2xl overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.error}30`,
                backdropFilter: 'blur(20px)',
                borderRadius: '1rem'
              }}
            >
              <div className="p-6 text-center">
                {/* Avatar del usuario */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center border shadow-sm" style={{ borderColor: colors.surface }}>
                          <CheckCircle className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nombre del usuario */}
                <h3 className="font-bold text-base mb-0.5" style={{ color: colors.text }}>
                  {userName}
                </h3>
                
                {/* Email del usuario */}
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                  {userEmail}
                </p>

                {/* Badges en modal */}
                <div className="flex justify-center gap-2 mb-3">
                  {isVerified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15">
                      <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
                      <span className="text-[9px] font-medium text-green-500">Verificada</span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15">
                      <Crown className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-[9px] font-medium text-amber-500">Admin</span>
                    </div>
                  )}
                </div>

                {/* Línea decorativa */}
                <div className="w-10 h-px mx-auto my-3" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />

                {/* Icono de advertencia */}
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                  <LogOut className="w-6 h-6" style={{ color: colors.error }} />
                </div>

                {/* Título */}
                <h2 className="text-lg font-bold mb-1" style={{ color: colors.text }}>Cerrar Sesión</h2>
                
                {/* Mensaje */}
                <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
                  ¿Estás seguro de que deseas cerrar sesión?
                </p>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                  >
                    {isLoggingOut ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.error }} />
                        <span>Cerrando...</span>
                      </div>
                    ) : (
                      'Cerrar sesión'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserMenu;