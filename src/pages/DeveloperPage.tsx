// src/pages/DeveloperPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Code, 
  Star, 
  Shield, 
  Sparkles, 
  Globe, 
  Database, 
  Cloud, 
  Layout, 
  Zap, 
  GitBranch, 
  Code2, 
  Braces, 
  Server,
  Lock,
  RefreshCw,
  Download,
  Key,
  QrCode,
  Send,
  Bell,
  History,
  LogOut,
  Eye,
  Smartphone,
  Palette,
  Package,
  TrendingUp,
  Award,
  Users,
  AlertCircle,
  CheckSquare,
  Landmark,
  Wallet,
  Target,
  Calendar,
  Fingerprint,
  Box,
  Layers
} from 'lucide-react';

// Importar el avatar local
import developerAvatar from '../assets/developer-avatar.png';

// Interfaz para tecnología
interface Technology {
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  description: string;
  version?: string;
}

const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [showTechModal, setShowTechModal] = useState(false);

  // Stack tecnológico completo de Flutter Play
  const technologies: Technology[] = [
    // ============================================
    // FRONTEND CORE
    // ============================================
    { 
      name: 'React 18', 
      icon: <Code2 className="w-5 h-5" />, 
      color: 'blue', 
      category: 'frontend',
      description: 'Framework UI con Hooks, Concurrent Features y rendimiento optimizado',
      version: '18.2.0'
    },
    { 
      name: 'TypeScript', 
      icon: <Braces className="w-5 h-5" />, 
      color: 'blue', 
      category: 'frontend',
      description: 'Tipado estático, interfaces y seguridad en tiempo de compilación',
      version: '5.0.0'
    },
    { 
      name: 'Tailwind CSS', 
      icon: <Palette className="w-5 h-5" />, 
      color: 'cyan', 
      category: 'frontend',
      description: 'Utilidades CSS para diseño rápido, responsivo y personalizable',
      version: '3.4.0'
    },
    { 
      name: 'Framer Motion', 
      icon: <Sparkles className="w-5 h-5" />, 
      color: 'pink', 
      category: 'frontend',
      description: 'Animaciones fluidas, transiciones y gestures para UI interactiva',
      version: '10.16.0'
    },
    { 
      name: 'Vite', 
      icon: <Zap className="w-5 h-5" />, 
      color: 'yellow', 
      category: 'frontend',
      description: 'Build tool ultrarrápida con HMR y optimización de producción',
      version: '5.0.0'
    },
    { 
      name: 'React Router v6', 
      icon: <GitBranch className="w-5 h-5" />, 
      color: 'red', 
      category: 'frontend',
      description: 'Enrutamiento dinámico, rutas protegidas y lazy loading',
      version: '6.20.0'
    },
    { 
      name: 'Axios', 
      icon: <Cloud className="w-5 h-5" />, 
      color: 'blue', 
      category: 'frontend',
      description: 'Cliente HTTP con interceptores y manejo de errores',
      version: '1.6.0'
    },

    // ============================================
    // BACKEND & DATABASE
    // ============================================
    { 
      name: 'FastAPI', 
      icon: <Server className="w-5 h-5" />, 
      color: 'green', 
      category: 'backend',
      description: 'API REST asíncrona con Python, documentación automática OpenAPI',
      version: '0.100.0'
    },
    { 
      name: 'Supabase', 
      icon: <Database className="w-5 h-5" />, 
      color: 'green', 
      category: 'backend',
      description: 'Backend como servicio con PostgreSQL, autenticación y storage',
      version: '2.39.0'
    },
    { 
      name: 'PostgreSQL', 
      icon: <Database className="w-5 h-5" />, 
      color: 'blue', 
      category: 'backend',
      description: 'Base de datos relacional robusta con soporte JSON y RLS',
      version: '15.0'
    },
    { 
      name: 'SQLAlchemy', 
      icon: <Box className="w-5 h-5" />, 
      color: 'blue', 
      category: 'backend',
      description: 'ORM para Python con migraciones y relaciones complejas',
      version: '2.0.0'
    },
    { 
      name: 'Pydantic', 
      icon: <CheckSquare className="w-5 h-5" />, 
      color: 'green', 
      category: 'backend',
      description: 'Validación de datos, modelos y serialización',
      version: '2.5.0'
    },

    // ============================================
    // SEGURIDAD Y AUTENTICACIÓN
    // ============================================
    { 
      name: 'WebAuthn', 
      icon: <Fingerprint className="w-5 h-5" />, 
      color: 'purple', 
      category: 'security',
      description: 'Passkeys: huella digital, Face ID, Windows Hello para login biométrico',
      version: 'Level 3'
    },
    { 
      name: 'TOTP 2FA', 
      icon: <Lock className="w-5 h-5" />, 
      color: 'purple', 
      category: 'security',
      description: 'Google Authenticator, Authy, Microsoft Authenticator - códigos de 6 dígitos',
      version: 'RFC 6238'
    },
    { 
      name: 'QR Code', 
      icon: <QrCode className="w-5 h-5" />, 
      color: 'purple', 
      category: 'security',
      description: 'Generación de códigos QR para configuración rápida de 2FA',
      version: 'pyotp'
    },
    { 
      name: 'OTP Email', 
      icon: <Send className="w-5 h-5" />, 
      color: 'blue', 
      category: 'security',
      description: 'Verificación por código de 6 dígitos para login sin contraseña',
      version: 'Custom'
    },
    { 
      name: 'JWT Tokens', 
      icon: <Key className="w-5 h-5" />, 
      color: 'amber', 
      category: 'security',
      description: 'HS256 + ES256 para autenticación dual y refresh tokens',
      version: 'JWT'
    },
    { 
      name: 'Password History', 
      icon: <History className="w-5 h-5" />, 
      color: 'amber', 
      category: 'security',
      description: 'Últimas 5 contraseñas almacenadas, sin reutilización permitida',
      version: 'Custom'
    },
    { 
      name: 'Session Invalidation', 
      icon: <LogOut className="w-5 h-5" />, 
      color: 'amber', 
      category: 'security',
      description: 'Cierre automático de sesiones al cambiar contraseña o desactivar 2FA',
      version: 'Custom'
    },
    { 
      name: 'RLS Policies', 
      icon: <Shield className="w-5 h-5" />, 
      color: 'purple', 
      category: 'security',
      description: 'Seguridad a nivel de filas en Supabase, aislamiento de datos por usuario',
      version: 'Supabase RLS'
    },

    // ============================================
    // CARACTERÍSTICAS DE LA APP
    // ============================================
    { 
      name: 'Gestión de Gastos', 
      icon: <Wallet className="w-5 h-5" />, 
      color: 'green', 
      category: 'features',
      description: 'CRUD completo de gastos con categorías personalizables',
      version: 'v1.0'
    },
    { 
      name: 'Presupuestos', 
      icon: <Target className="w-5 h-5" />, 
      color: 'orange', 
      category: 'features',
      description: 'Presupuestos mensuales por categoría con alertas al 70% y 100%',
      version: 'v1.5'
    },
    { 
      name: 'Gastos Recurrentes', 
      icon: <RefreshCw className="w-5 h-5" />, 
      color: 'cyan', 
      category: 'features',
      description: 'Gastos diarios, semanales, mensuales o anuales automatizados',
      version: 'v1.5'
    },
    { 
      name: 'Dashboard Estadístico', 
      icon: <TrendingUp className="w-5 h-5" />, 
      color: 'blue', 
      category: 'features',
      description: 'Gráficos de barras, pastel y área con filtros por fecha/categoría',
      version: 'v1.0'
    },
    { 
      name: 'Calendario de Gastos', 
      icon: <Calendar className="w-5 h-5" />, 
      color: 'purple', 
      category: 'features',
      description: 'Visualización de gastos por día con montos en el calendario',
      version: 'v1.0'
    },
    { 
      name: 'Exportación de Datos', 
      icon: <Download className="w-5 h-5" />, 
      color: 'emerald', 
      category: 'features',
      description: 'Exportar gastos a CSV o JSON para respaldo',
      version: 'v1.5'
    },

    // ============================================
    // UI/UX Y DISEÑO
    // ============================================
    { 
      name: 'Modo Oscuro/Claro', 
      icon: <Eye className="w-5 h-5" />, 
      color: 'gray', 
      category: 'design',
      description: 'Tema oscuro/claro automático con persistencia en localStorage',
      version: 'v1.0'
    },
    { 
      name: '12 Temas de Color', 
      icon: <Palette className="w-5 h-5" />, 
      color: 'pink', 
      category: 'design',
      description: 'Neon, Azul, Púrpura, Verde, Rojo, Naranja, Rosa, Cian, Amarillo, Teal, Índigo, Marrón',
      version: 'v2.0'
    },
    { 
      name: 'Glassmorphism', 
      icon: <Layers className="w-5 h-5" />, 
      color: 'cyan', 
      category: 'design',
      description: 'Efectos de vidrio y backdrop-blur en toda la interfaz',
      version: 'v1.5'
    },
    { 
      name: 'Responsive Design', 
      icon: <Smartphone className="w-5 h-5" />, 
      color: 'green', 
      category: 'design',
      description: 'Adaptación a móvil, tablet y desktop con Tailwind',
      version: 'v1.0'
    },

    // ============================================
    // SESIONES Y SEGURIDAD
    // ============================================
    { 
      name: 'Sesiones Activas', 
      icon: <Users className="w-5 h-5" />, 
      color: 'blue', 
      category: 'sessions',
      description: 'Lista de dispositivos conectados con detalles (IP, navegador, SO)',
      version: 'v2.3'
    },
    { 
      name: 'Historial de Accesos', 
      icon: <History className="w-5 h-5" />, 
      color: 'purple', 
      category: 'sessions',
      description: 'Registro completo de inicios de sesión con filtros y exportación',
      version: 'v2.3'
    },
    { 
      name: 'Cambios de Seguridad', 
      icon: <Shield className="w-5 h-5" />, 
      color: 'amber', 
      category: 'sessions',
      description: 'Auditoría de cambios de contraseña y configuración 2FA',
      version: 'v2.3'
    },

    // ============================================
    // NOTIFICACIONES
    // ============================================
    { 
      name: 'Toast Notifications', 
      icon: <Bell className="w-5 h-5" />, 
      color: 'pink', 
      category: 'notifications',
      description: 'Notificaciones tipo toast con auto-cierre y tipos (éxito, error, advertencia, info)',
      version: 'v2.5'
    },
    { 
      name: 'Alertas en Tiempo Real', 
      icon: <Send className="w-5 h-5" />, 
      color: 'cyan', 
      category: 'notifications',
      description: 'Alertas de nuevos dispositivos y cambios de seguridad',
      version: 'v2.5'
    },

    // ============================================
    // HOSTING Y DESPLIEGUE
    // ============================================
    { 
      name: 'Render', 
      icon: <Cloud className="w-5 h-5" />, 
      color: 'blue', 
      category: 'hosting',
      description: 'Hosting de la API FastAPI con despliegue automático',
      version: 'Production'
    },
    { 
      name: 'Vercel', 
      icon: <Globe className="w-5 h-5" />, 
      color: 'black', 
      category: 'hosting',
      description: 'Hosting del frontend React con CDN global',
      version: 'Production'
    },
  ];

  // Categorías para filtrado
  const categories: { id: string; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', name: 'Todas', icon: <Package className="w-4 h-4" />, color: 'gray' },
    { id: 'frontend', name: 'Frontend', icon: <Layout className="w-4 h-4" />, color: 'blue' },
    { id: 'backend', name: 'Backend', icon: <Server className="w-4 h-4" />, color: 'green' },
    { id: 'security', name: 'Seguridad', icon: <Shield className="w-4 h-4" />, color: 'purple' },
    { id: 'features', name: 'Características', icon: <Star className="w-4 h-4" />, color: 'yellow' },
    { id: 'design', name: 'Diseño', icon: <Palette className="w-4 h-4" />, color: 'pink' },
    { id: 'sessions', name: 'Sesiones', icon: <Users className="w-4 h-4" />, color: 'indigo' },
    { id: 'notifications', name: 'Notificaciones', icon: <Bell className="w-4 h-4" />, color: 'orange' },
    { id: 'hosting', name: 'Hosting', icon: <Globe className="w-4 h-4" />, color: 'cyan' },
  ];

  // Tecnologías filtradas
  const filteredTechnologies = selectedCategory === 'all' 
    ? technologies 
    : technologies.filter(tech => tech.category === selectedCategory);

  // Contar tecnologías por categoría
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return technologies.length;
    return technologies.filter(tech => tech.category === categoryId).length;
  };

  // Obtener clases de color para tarjetas
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      black: 'bg-gray-800/10 text-gray-800 dark:text-gray-300 border-gray-800/20 dark:border-gray-700/40',
    };
    return colorMap[color] || colorMap.gray;
  };

  // Abrir modal con detalles de la tecnología
  const handleTechClick = (tech: Technology) => {
    setSelectedTech(tech);
    setShowTechModal(true);
  };

  // Estadísticas - ACTUALIZADO A 2.6.0
  const stats = {
    totalTech: technologies.length,
    categories: categories.filter(c => c.id !== 'all').length,
    versions: 'v2.6.0',
    commits: '200+',
    linesOfCode: '15k+'
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Header con efecto Liquid Glass */}
      <div 
        className="sticky top-0 z-20 backdrop-blur-xl border-b transition-all duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          borderColor: colors.border,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings')}
                className="p-2 rounded-xl transition-colors hover:bg-white/10 group"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                <h1 className="text-xl font-bold" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Perfil del Desarrollador
                </h1>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary, border: `1px solid ${colors.primary}30` }}>
              v{stats.versions}
            </div>
          </div>
        </div>
      </div>

      {/* Banner principal con gradiente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-64 w-full overflow-hidden rounded-2xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.primary}40` }} />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.secondary}40` }} />
            
            <div className="relative z-10 flex flex-col items-center space-y-4 px-4">
              <div className="flex items-center gap-3">
                <Landmark className="w-10 h-10 text-white drop-shadow-lg" />
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                  Flutter<span style={{ color: colors.primary === '#00E676' ? '#1a1a1a' : '#FFEA00' }}>Play</span>
                </h2>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-medium text-sm md:text-base">
                  Mi Banca Universitaria
                </span>
              </motion.div>
            </div>

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v{stats.versions}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Avatar posicionado sobre el banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative -mt-16 flex justify-center"
        >
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-full p-1 shadow-xl"
              style={{ backgroundColor: colors.surface, border: `2px solid ${colors.primary}` }}
            >
              <img 
                src={developerAvatar} 
                alt="Avatar desarrollador"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg"
              style={{ backgroundColor: colors.warning, borderColor: colors.surface }}
            >
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Información del desarrollador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
            José Pablo Miranda Quintanilla
          </h2>
          <p className="text-base mb-3" style={{ color: colors.primary }}>
            Desarrollador Full Stack
          </p>
          <p className="text-sm max-w-2xl mx-auto px-2" style={{ color: colors.textSecondary }}>
            Apasionado por la tecnología y la educación financiera. Creador de Flutter Play,
            una plataforma diseñada para ayudar a estudiantes universitarios a gestionar sus finanzas
            de manera inteligente y segura.
          </p>
        </motion.div>
      </div>

      {/* Filtro de categorías */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5`}
                style={{
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  color: isSelected ? '#ffffff' : colors.textSecondary,
                  border: `1px solid ${isSelected ? 'transparent' : colors.border}`
                }}
              >
                <span className="w-3.5 h-3.5">{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 ml-0.5">
                  ({getCategoryCount(cat.id)})
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Tecnologías utilizadas - Grid principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 backdrop-blur-sm"
          style={{ 
            backgroundColor: `${colors.surface}cc`,
            border: `1px solid ${colors.border}` 
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <Package className="w-3.5 h-3.5" style={{ color: colors.primary }} />
              Stack Tecnológico
              <span className="text-xs font-normal ml-1 opacity-60">
                ({filteredTechnologies.length} tecnologías)
              </span>
            </h3>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs transition-colors"
                style={{ color: colors.primary }}
              >
                Ver todas
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTechnologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => handleTechClick(tech)}
                className={`p-3 rounded-xl border ${getColorClasses(tech.color)} flex flex-col items-center text-center group cursor-pointer transition-all duration-200`}
              >
                <div className="p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <span className="text-xs font-medium mb-0.5" style={{ color: colors.text }}>
                  {tech.name}
                </span>
                <span className="text-[9px] opacity-70 hidden sm:block line-clamp-1" style={{ color: colors.textSecondary }}>
                  {tech.description.split('.')[0]}
                </span>
              </motion.div>
            ))}
          </div>

          {filteredTechnologies.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: colors.textSecondary }} />
              <p style={{ color: colors.textSecondary }}>No hay tecnologías en esta categoría</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: <Award className="w-6 h-6" />, value: stats.versions, label: 'Versión actual', color: colors.primary },
            { icon: <Package className="w-6 h-6" />, value: stats.totalTech, label: 'Tecnologías', color: colors.secondary },
            { icon: <GitBranch className="w-6 h-6" />, value: stats.commits, label: 'Commits', color: colors.success },
            { icon: <Code className="w-6 h-6" />, value: stats.linesOfCode, label: 'Líneas de código', color: colors.info },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4 text-center backdrop-blur-sm"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}` 
              }}
            >
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </div>
              <div className="text-xl font-bold" style={{ color: colors.text }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Características destacadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 backdrop-blur-sm"
          style={{ 
            backgroundColor: `${colors.primary}10`,
            border: `1px solid ${colors.primary}30`
          }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: colors.textSecondary }}>
            <Star className="w-3.5 h-3.5" style={{ color: colors.warning }} />
            Características Destacadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: <Shield />, text: 'Autenticación biométrica con WebAuthn', color: '#8B5CF6' },
              { icon: <Lock />, text: '2FA con Google Authenticator', color: colors.primary },
              { icon: <Target />, text: 'Presupuestos inteligentes con alertas', color: colors.success },
              { icon: <TrendingUp />, text: 'Estadísticas con gráficos interactivos', color: colors.info },
              { icon: <Download />, text: 'Exportación a CSV/JSON', color: colors.warning },
              { icon: <Smartphone />, text: 'Diseño totalmente responsivo', color: colors.secondary },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: `${colors.surface}cc` }}>
                <div className="p-1.5 rounded-full" style={{ backgroundColor: `${feature.color}20` }}>
                  <div style={{ color: feature.color }} className="w-4 h-4">{feature.icon}</div>
                </div>
                <span className="text-xs" style={{ color: colors.text }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sección "Conectar conmigo" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border-t pt-6" style={{ borderColor: colors.border }}
        >
          <h3 className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: colors.textSecondary }}>
            Conectar conmigo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* GitHub */}
            <motion.button
              whileHover={{ scale: 1.01, x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('https://github.com/JosePablo1996', '_blank')}
              className="w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200 group"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-sm block" style={{ color: colors.text }}>GitHub</span>
                <span className="text-xs" style={{ color: colors.textSecondary }}>@JosePablo1996</span>
              </div>
              <ArrowLeft className="w-5 h-5 rotate-180 opacity-50 group-hover:translate-x-1 transition-transform" style={{ color: colors.textSecondary }} />
            </motion.button>

            {/* Email */}
            <motion.button
              whileHover={{ scale: 1.01, x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = 'mailto:pabloboquintanilla988@gmail.com'}
              className="w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200 group"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-sm block" style={{ color: colors.text }}>Email</span>
                <span className="text-xs" style={{ color: colors.textSecondary }}>pabloboquintanilla988@gmail.com</span>
              </div>
              <ArrowLeft className="w-5 h-5 rotate-180 opacity-50 group-hover:translate-x-1 transition-transform" style={{ color: colors.textSecondary }} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modal de detalles de tecnología */}
      <AnimatePresence>
        {showTechModal && selectedTech && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowTechModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${getColorClasses(selectedTech.color)}`}>
                    {selectedTech.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: colors.text }}>{selectedTech.name}</h3>
                    {selectedTech.version && (
                      <p className="text-xs" style={{ color: colors.textSecondary }}>v{selectedTech.version}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-5">
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {selectedTech.description}
                  </p>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>
                    {categories.find(c => c.id === selectedTech.category)?.name || selectedTech.category}
                  </span>
                </div>

                <button
                  onClick={() => setShowTechModal(false)}
                  className="w-full py-2.5 rounded-xl font-medium transition-all"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff' }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer - ACTUALIZADO A 2.6.0 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-6">
        <p className="text-center text-xs" style={{ color: colors.textSecondary }}>
          Flutter Play v2.6.0 · Todos los derechos reservados · Desarrollado con React, FastAPI y Supabase
        </p>
      </div>
    </div>
  );
};

export default DeveloperPage;