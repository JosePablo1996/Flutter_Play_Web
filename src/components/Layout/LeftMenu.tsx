import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType } from '../../types';
import {
  Home,
  Wallet,
  Tags,
  Calendar,
  Target,
  UserIcon,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  BookOpen,
  Lock,
  Crown,
  Mail,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
  isDestructive?: boolean;
  section?: 'main' | 'org' | 'config' | 'support';
}

const LeftMenu: React.FC<LeftMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Obtener el rol correctamente
  const userRole = profile?.role || user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isVerified = user?.email !== undefined;

  // Colores únicos para cada sección
  const sectionColors = {
    main: { 
      bg: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`, 
      icon: colors.primary, 
      active: `${colors.primary}15`,
      border: colors.primary,
      label: 'PRINCIPAL'
    },
    org: { 
      bg: `linear-gradient(135deg, ${colors.success}15, ${colors.success}05)`, 
      icon: colors.success, 
      active: `${colors.success}15`,
      border: colors.success,
      label: 'ORGANIZACIÓN'
    },
    config: { 
      bg: `linear-gradient(135deg, ${colors.warning}15, ${colors.warning}05)`, 
      icon: colors.warning, 
      active: `${colors.warning}15`,
      border: colors.warning,
      label: 'CONFIGURACIÓN'
    },
    support: { 
      bg: `linear-gradient(135deg, ${colors.info}15, ${colors.info}05)`, 
      icon: colors.info, 
      active: `${colors.info}15`,
      border: colors.info,
      label: 'INFORMACIÓN'
    },
  };

  // Colores para los iconos de cada item
  const getItemIconColor = (section: string, isActive: boolean) => {
    if (isActive) return colors.primary;
    switch (section) {
      case 'main': return colors.primary;
      case 'org': return colors.success;
      case 'config': return colors.warning;
      case 'support': return colors.info;
      default: return colors.textSecondary;
    }
  };

  // Cargar perfil para obtener avatar y datos actualizados
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.get();
        setProfile(response.data);
      } catch (error) {
        console.error('Error loading profile for left menu:', error);
      }
    };
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  // Manejar animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 0);
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
    onClose();
  }, [logout, navigate, onClose]);

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

  // Items del menú principal
  const mainMenuItems: MenuItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/dashboard',
      section: 'main',
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Gastos',
      path: '/expenses',
      section: 'main',
    },
    {
      icon: <Tags className="w-5 h-5" />,
      label: 'Categorías',
      path: '/categories',
      section: 'main',
    },
  ];

  // Items de organización
  const orgMenuItems: MenuItem[] = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Estadísticas',
      path: '/stats',
      section: 'org',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Calendario',
      path: '/calendar',
      section: 'org',
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Presupuestos',
      path: '/budgets',
      section: 'org',
    },
  ];

  // Items de configuración
  const configMenuItems: MenuItem[] = [
    {
      icon: <UserIcon className="w-5 h-5" />,
      label: 'Mi Perfil',
      path: '/profile',
      section: 'config',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Configuración',
      path: '/settings',
      section: 'config',
    },
    {
      icon: <Lock className="w-5 h-5" />,
      label: 'Seguridad',
      path: '/security',
      section: 'config',
    },
  ];

  // Items de información (antes soporte) - ELIMINADA la opción "Soporte"
  const infoMenuItems: MenuItem[] = [
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Centro de Ayuda',
      path: '/help',
      section: 'support',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Acerca de',
      path: '/developer',
      section: 'support',
    },
  ];

  if (!isOpen && !isAnimating) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con z-index alto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Menú lateral con z-index más alto que el header */}
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full z-[200] w-[340px] shadow-2xl overflow-hidden"
            style={{ 
              background: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.surface}cc 100%)`,
              borderRight: `1px solid ${colors.border}`,
              boxShadow: `20px 0 40px rgba(0, 0, 0, 0.2)`
            }}
          >
            <div className="h-full flex flex-col">
              {/* Header con información del usuario - Versión mejorada */}
              <div className="relative overflow-hidden">
                {/* Fondo degradado del header con efecto de brillo */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)` 
                  }}
                />
                
                {/* Círculos decorativos de fondo */}
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full opacity-30" style={{ backgroundColor: colors.primary }} />
                <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: colors.secondary }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: colors.primary }} />

                {/* Contenido del header */}
                <div className="relative px-5 pt-6 pb-4">
                  {/* Avatar con efectos */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative group">
                      {/* Anillo de brillo alrededor del avatar */}
                      <div className="absolute -inset-1 rounded-full blur-md opacity-60" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                      
                      <div 
                        className="relative w-20 h-20 rounded-full flex items-center justify-center border-3 shadow-xl overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          borderColor: colors.surface
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
                          <span className="text-white font-bold text-3xl">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      
                      {/* Badge de verificación - Diseño mejorado con icono verde */}
                      {isVerified && (
                        <div className="absolute -bottom-1 -right-1">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md bg-gradient-to-br from-green-500 to-green-600"
                            style={{ borderColor: colors.surface }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Información del usuario */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate" style={{ color: colors.text }}>
                        {getUserName()}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" style={{ color: colors.textSecondary }} />
                        <p className="text-xs truncate" style={{ color: colors.textSecondary }}>
                          {getUserEmail()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Badge de cuenta verificada - Verde brillante */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40 shadow-sm shadow-green-500/20">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                        Cuenta verificada
                      </span>
                    </div>

                    {/* Badge de administrador con decoración */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 shadow-sm shadow-amber-500/20">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                          Administrador
                        </span>
                        <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ola decorativa en la parte inferior del header */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg className="w-full h-3" preserveAspectRatio="none" viewBox="0 0 1200 120" fill={colors.surface}>
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
                  </svg>
                </div>
              </div>

              {/* Menú items con scroll */}
              <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                {/* Sección Principal */}
                <div className="mb-6">
                  <div className="px-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.textSecondary }}>
                        {sectionColors.main.label}
                      </span>
                    </div>
                  </div>
                  {mainMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path)}
                      sectionColor={sectionColors.main}
                      iconColor={getItemIconColor('main', location.pathname === item.path)}
                      colors={colors}
                    />
                  ))}
                </div>

                {/* Sección Organización */}
                <div className="mb-6">
                  <div className="px-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.success}, ${colors.success}dd)` }} />
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.textSecondary }}>
                        {sectionColors.org.label}
                      </span>
                    </div>
                  </div>
                  {orgMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path)}
                      sectionColor={sectionColors.org}
                      iconColor={getItemIconColor('org', location.pathname === item.path)}
                      colors={colors}
                    />
                  ))}
                </div>

                {/* Sección Configuración */}
                <div className="mb-6">
                  <div className="px-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.warning}, ${colors.warning}dd)` }} />
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.textSecondary }}>
                        {sectionColors.config.label}
                      </span>
                    </div>
                  </div>
                  {configMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path)}
                      sectionColor={sectionColors.config}
                      iconColor={getItemIconColor('config', location.pathname === item.path)}
                      colors={colors}
                    />
                  ))}
                </div>

                {/* Sección Información (antes Soporte) - SIN la opción "Soporte" */}
                <div className="mb-6">
                  <div className="px-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.info}, ${colors.info}dd)` }} />
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: colors.textSecondary }}>
                        {sectionColors.support.label}
                      </span>
                    </div>
                  </div>
                  {infoMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path)}
                      sectionColor={sectionColors.support}
                      iconColor={getItemIconColor('support', location.pathname === item.path)}
                      colors={colors}
                    />
                  ))}
                </div>

                {/* Versión - ACTUALIZADO A 2.6.0 */}
                <div className="px-3 py-4 mt-2">
                  <p className="text-center text-xs" style={{ color: colors.textSecondary }}>
                    Flutter Play v2.6.0
                  </p>
                </div>
              </div>

              {/* Footer con botón de cerrar sesión */}
              <div className="p-4 border-t mt-auto" style={{ borderColor: colors.border }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: `${colors.error}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                    <LogOut className="w-4 h-4" style={{ color: colors.error }} />
                  </div>
                  <span className="font-medium flex-1 text-left" style={{ color: colors.error }}>Cerrar Sesión</span>
                  <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
  sectionColor: {
    bg: string;
    icon: string;
    active: string;
    border: string;
    label: string;
  };
  iconColor: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, onClick, sectionColor, iconColor, colors }) => {
  const isDestructive = item.isDestructive || false;
  
  return (
    <motion.button
      whileHover={{ x: 4, backgroundColor: `${sectionColor.icon}10` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive ? 'border-l-4' : ''
      }`}
      style={{
        borderLeftColor: isActive ? sectionColor.border : 'transparent',
        backgroundColor: isActive ? sectionColor.active : 'transparent'
      }}
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300"
        style={{ color: isActive ? colors.primary : iconColor }}
      >
        {item.icon}
      </div>
      <span 
        className="flex-1 text-left text-sm font-medium"
        style={{ color: isActive ? colors.text : (isDestructive ? colors.error : colors.textSecondary) }}
      >
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 && (
        <span 
          className="px-2 py-0.5 text-xs font-semibold rounded-full"
          style={{ backgroundColor: `${sectionColor.icon}20`, color: sectionColor.icon }}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
      {!item.badge && !isActive && (
        <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
      )}
    </motion.button>
  );
};

export default LeftMenu;