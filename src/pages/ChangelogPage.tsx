// src/pages/ChangelogPage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Fingerprint, 
  Shield, 
  Tags, 
  Palette, 
  BarChart3, 
  Bug,
  Bell,
  TrendingUp,
  AlertTriangle,
  Settings,
  Monitor,
  Clock,
  Database,
  Key,
  Mail,
  Sparkles,
  Smartphone,
  User,
  DollarSign,
  PieChart,
  LayoutDashboard} from 'lucide-react';

interface ChangeItem {
  description: string;
  subItems?: string[];
}

interface ChangeCategory {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: ChangeItem[];
}

interface VersionData {
  version: string;
  date: string;
  title: string;
  gradientColors: string[];
  changes: ChangeCategory[];
  isLatest?: boolean;
  isInitial?: boolean;
}

const ChangelogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['2.6.0']));
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toggleVersion = (version: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  // Versiones completas de Flutter Play - Mi Banca Universitaria
  const versions: VersionData[] = [
    {
      version: '2.6.0',
      date: '15 Jun 2026',
      title: '🔐 Passkeys + Roles de Administrador + Categorías Personalizadas + 12 Temas de Color',
      gradientColors: ['#00E676', '#2979FF'],
      isLatest: true,
      changes: [
        {
          title: '🔐 Passkeys (Autenticación Biométrica)',
          icon: <Fingerprint className="w-5 h-5" />,
          color: '#00E676',
          items: [
            {
              description: 'Registro y autenticación con datos biométricos',
              subItems: [
                'Soporte para Windows Hello, Face ID y Touch ID',
                'Login sin necesidad de email ni contraseña',
                'Gestión completa de Passkeys: listar y eliminar credenciales',
                'Feature flags: disponible solo en desarrollo local',
              ],
            },
            {
              description: 'Registro completo en auditoría de seguridad',
              subItems: [
                'Los logins con Passkey se registran en login_history con tipo "passkey"',
                'Creación automática de sesiones activas',
                'Alertas por email para nuevos dispositivos con Passkey',
                'Endpoint /login/begin-without-email para autenticación simplificada',
              ],
            },
          ],
        },
        {
          title: '👑 Sistema de Roles (Administrador / Usuario)',
          icon: <Shield className="w-5 h-5" />,
          color: '#F59E0B',
          items: [
            {
              description: 'Roles y privilegios diferenciados',
              subItems: [
                'Columna "role" en tabla profiles (valores: "user" | "admin")',
                'Badge visual de administrador en avatar, UserMenu, WelcomeModal y Profile',
                'Endpoint GET /profile ahora devuelve el role del usuario',
                'Endpoints de administración: GET /admin/users y PUT /admin/role/{user_id}',
                'El role se incluye en el JWT y en respuestas de autenticación (2FA, OTP, Passkey)',
              ],
            },
          ],
        },
        {
          title: '🏷️ Categorías Personalizadas',
          icon: <Tags className="w-5 h-5" />,
          color: '#8B5CF6',
          items: [
            {
              description: 'CRUD completo de categorías',
              subItems: [
                '8 categorías predefinidas por defecto (no editables)',
                'Usuarios pueden crear sus propias categorías personalizadas',
                'Editar y eliminar categorías personalizadas',
                'Validación para evitar duplicados con categorías existentes',
                'Integración completa en ExpensesPage y formularios de gastos',
              ],
            },
          ],
        },
        {
          title: '🎨 12 Temas de Color',
          icon: <Palette className="w-5 h-5" />,
          color: '#EC4899',
          items: [
            {
              description: 'Selector de colores con 12 opciones',
              subItems: [
                'Colores existentes: Neon (Verde/Azul), Azul, Púrpura, Verde',
                'Nuevos colores: Rojo, Naranja, Rosa, Cian, Amarillo, Verde azulado, Índigo, Marrón',
                'Modal elegante de selección en SettingsPage',
                'Persistencia del tema seleccionado en localStorage',
              ],
            },
          ],
        },
        {
          title: '📈 Mejoras en Seguridad y Estadísticas',
          icon: <BarChart3 className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Puntuación de seguridad mejorada',
              subItems: [
                'Nuevo campo "has_passkey" en endpoint /security-stats',
                'Puntuación base: 40 puntos',
                '+10 por al menos 1 inicio de sesión',
                '+20 por tener 2 dispositivos únicos (o +10 por 5 dispositivos)',
                '+30 por 2FA activado',
                '+20 NUEVO por tener Passkey registrada (máximo 100 puntos)',
              ],
            },
            {
              description: 'Filtros en historial de accesos',
              subItems: [
                'Nuevo filtro "Passkey" en LoginHistoryTab y AccessHistoryPage',
                'Ícono de huella digital para identificar logins biométricos',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones y Mejoras Técnicas v2.6.0',
          icon: <Bug className="w-5 h-5" />,
          color: '#EF4444',
          items: [
            {
              description: 'Backend (FastAPI)',
              subItems: [
                'Corrección del flujo OTP con 2FA (TokenResponse con access_token opcional)',
                'Corrección del flujo de verificación 2FA en two_factor.py',
                'WebAuthn: endpoints /login/begin-without-email y /status',
                'Cambio de regex ? pattern por pattern (compatibilidad Pydantic V2)',
                'Actualización de issuer_name a "Flutter Play"',
              ],
            },
            {
              description: 'Frontend (React/TypeScript)',
              subItems: [
                'Conexión a API de Render con variables de entorno (.env / .env.development)',
                'Hook useFeatureFlags para control de funcionalidades por entorno',
                'Sincronización de estado entre SettingsPage y SecurityPage (2FA y Passkey)',
                'Corrección de bucle infinito en loadUserFromToken',
                'Archivo _redirects para SPA en Render',
                'Scrollbar personalizado en LeftMenu',
              ],
            },
            {
              description: 'Base de Datos (Supabase)',
              subItems: [
                'Nueva tabla: passkeys (almacenamiento de credenciales WebAuthn)',
                'Nueva tabla: categories (categorías por defecto + personalizadas)',
                'Columna "role" añadida a tabla profiles',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.5.0',
      date: '08 Jun 2026',
      title: '🔔 Notificaciones en Tiempo Real + Estadísticas de Seguridad',
      gradientColors: ['#F59E0B', '#EC4899'],
      changes: [
        {
          title: '🔔 Notificaciones en Tiempo Real',
          icon: <Bell className="w-5 h-5" />,
          color: '#F59E0B',
          items: [
            {
              description: 'Sistema de notificaciones Toast',
              subItems: [
                'Hook useNotifications para gestión centralizada',
                'ToastContainer para mostrar notificaciones visuales',
                'NotificationContext global para toda la app',
                'Tipos de notificación: éxito, error, advertencia, información',
                'Auto-cierre después de 5 segundos',
              ],
            },
            {
              description: 'Notificaciones en tiempo real',
              subItems: [
                'Polling cada 30 segundos como fallback',
                'WebSocket/SSE preparado para implementación futura',
                'Notificaciones de nuevos dispositivos detectados',
                'Alertas de inicios de sesión sospechosos',
              ],
            },
          ],
        },
        {
          title: '📊 Estadísticas de Seguridad',
          icon: <TrendingUp className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Tarjetas de estadísticas en SecurityPage',
              subItems: [
                'Total de inicios de sesión registrados',
                'Número de dispositivos únicos conectados',
                'Tasa de éxito de autenticación (porcentaje)',
                'Último acceso con ubicación estimada',
              ],
            },
            {
              description: 'Historial de accesos mejorado',
              subItems: [
                'Modal de detalles con IP, navegador, SO y ubicación',
                'Filtros por tipo de login (contraseña, OTP, 2FA)',
                'Filtros por estado (éxito, fallido, pendiente)',
                'Filtros por rango de fechas',
                'Exportación de historial a formato JSON',
              ],
            },
          ],
        },
        {
          title: '⚠️ Zona de Peligro',
          icon: <AlertTriangle className="w-5 h-5" />,
          color: '#EF4444',
          items: [
            {
              description: 'Gestión de sesiones peligrosas',
              subItems: [
                'Botón "Cerrar todas las sesiones" con modal de confirmación',
                'Redirección automática al login después de cerrar sesiones',
                'Opción "Eliminar cuenta" (frontend listo, backend pendiente)',
                'Confirmación de contraseña antes de acciones peligrosas',
              ],
            },
          ],
        },
        {
          title: '🐛 Correcciones y Mejoras v2.5.0',
          icon: <Settings className="w-5 h-5" />,
          color: '#8B5CF6',
          items: [
            {
              description: 'Backend',
              subItems: [
                'Corrección de RLS policies para 2FA',
                'Soporte para tokens HS256 y ES256',
                'CORS configurado con orígenes explícitos',
                'Manejo de errores en autenticación mejorado',
              ],
            },
            {
              description: 'Frontend',
              subItems: [
                'URLs absolutas en AuthProvider',
                'Archivo _redirects para SPA en Render',
                'Prevención de múltiples llamadas loadUserFromToken',
                'Corrección de bucle infinito',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.3.0',
      date: '06 Jun 2026',
      title: '🖥️ Sesiones Activas y Auditoría de Accesos',
      gradientColors: ['#3B82F6', '#8B5CF6'],
      changes: [
        {
          title: '🖥️ Gestión de Sesiones Activas',
          icon: <Monitor className="w-5 h-5" />,
          color: '#3B82F6',
          items: [
            {
              description: 'Lista de dispositivos conectados',
              subItems: [
                'Visualización de todas las sesiones activas',
                'Identificación del dispositivo actual',
                'Información: tipo, navegador, SO, IP, ubicación',
                'Fecha y hora de última actividad',
              ],
            },
            {
              description: 'Control de sesiones',
              subItems: [
                'Botón para revocar sesión individual',
                'Botón "Cerrar todas las sesiones" con confirmación',
                'Modal de confirmación antes de acciones destructivas',
                'Redirección al login después de cerrar sesiones',
              ],
            },
          ],
        },
        {
          title: '📋 Historial de Inicios de Sesión',
          icon: <Clock className="w-5 h-5" />,
          color: '#8B5CF6',
          items: [
            {
              description: 'Tabla completa de accesos',
              subItems: [
                'Historial de todos los inicios de sesión',
                'Columnas: fecha, tipo de login, estado, IP, ubicación',
                'Paginación para navegar entre páginas',
              ],
            },
            {
              description: 'Filtros avanzados',
              subItems: [
                'Filtro por tipo de login (contraseña, OTP, 2FA)',
                'Filtro por estado (éxito, fallido, pendiente)',
                'Filtro por rango de fechas',
              ],
            },
          ],
        },
        {
          title: '🗄️ Base de Datos - Nuevas Tablas',
          icon: <Database className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Nuevas tablas en Supabase',
              subItems: [
                'user_sessions - Sesiones activas',
                'login_history - Historial de inicios',
                'activity_log - Registro de actividades',
                'security_changes - Cambios de seguridad',
                'password_history - Historial de contraseñas',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '2.0.0',
      date: '04 Jun 2026',
      title: '🔐 Seguridad Avanzada - 2FA Completo y Alertas por Email',
      gradientColors: ['#8B5CF6', '#EC4899'],
      changes: [
        {
          title: '🔐 Autenticación de Dos Factores (2FA) Completa',
          icon: <Key className="w-5 h-5" />,
          color: '#8B5CF6',
          items: [
            {
              description: 'Configuración de 2FA con Google Authenticator',
              subItems: [
                'Generación de código QR para escanear',
                'Verificación de código TOTP de 6 dígitos',
                'Códigos expiran cada 30 segundos',
                'Soporte para Authy, Microsoft Authenticator',
              ],
            },
            {
              description: 'Códigos de respaldo (backup codes)',
              subItems: [
                '10 códigos de un solo uso',
                'Almacenamiento hasheado en base de datos',
                'Códigos regenerables desde configuración',
              ],
            },
          ],
        },
        {
          title: '📜 Historial de Contraseñas',
          icon: <Database className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Prevención de reutilización',
              subItems: [
                'Almacena las últimas 5 contraseñas',
                'No permite usar contraseñas anteriores',
                'Tabla password_history en Supabase',
              ],
            },
            {
              description: 'Invalidación de sesiones',
              subItems: [
                'Al cambiar contraseña, se invalidan todas las sesiones',
                'Requiere relogin después de cambios de seguridad',
              ],
            },
          ],
        },
        {
          title: '📧 Alertas por Email',
          icon: <Mail className="w-5 h-5" />,
          color: '#3B82F6',
          items: [
            {
              description: 'Notificaciones por email',
              subItems: [
                'Alerta cuando se cambia la contraseña',
                'Alerta cuando se activa/desactiva 2FA',
                'Alerta cuando se detecta un nuevo dispositivo',
                'Códigos OTP para recuperación',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.5.0',
      date: '03 Jun 2026',
      title: '🎨 Mejoras UI/UX - Liquid Glass y Animaciones',
      gradientColors: ['#06B6D4', '#3B82F6'],
      changes: [
        {
          title: '✨ Efecto Liquid Glass',
          icon: <Sparkles className="w-5 h-5" />,
          color: '#06B6D4',
          items: [
            {
              description: 'Efecto de vidrio esmerilado',
              subItems: [
                'backdrop-blur-xl en todas las tarjetas',
                'Fondos semitransparentes con gradientes',
                'Bordes con opacidad y sombras elegantes',
              ],
            },
          ],
        },
        {
          title: '🎬 Animaciones con Framer Motion',
          icon: <Smartphone className="w-5 h-5" />,
          color: '#8B5CF6',
          items: [
            {
              description: 'Transiciones implementadas',
              subItems: [
                'slideUp - Entrada de modales',
                'slideDown - Menú desplegable',
                'fadeIn - Overlays',
                'staggerChildren - Animación en cascada',
                'whileHover/whileTap - Efectos interactivos',
              ],
            },
          ],
        },
        {
          title: '🎨 Componentes UI Rediseñados',
          icon: <LayoutDashboard className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Nuevos componentes',
              subItems: [
                'NeonButton - 6 variantes',
                'NeonCard - 4 variantes',
                'NeonInput - Estados error/success',
                'UserMenu - Dropdown mejorado',
                'LeftMenu - Secciones coloreadas',
              ],
            },
          ],
        },
      ],
    },
    {
      version: '1.0.0',
      date: '01 Jun 2026',
      title: '🎉 Lanzamiento Base - Gestión de Gastos Universitaria',
      gradientColors: ['#3B82F6', '#10B981'],
      isInitial: true,
      changes: [
        {
          title: '🔐 Autenticación',
          icon: <Key className="w-5 h-5" />,
          color: '#3B82F6',
          items: [
            {
              description: 'Sistema completo de autenticación',
              subItems: [
                'Registro de usuario con email/contraseña',
                'Login tradicional con email/contraseña',
                'Login con código OTP (sin contraseña)',
                'Recuperación de contraseña con OTP (4 pasos)',
                'JWT con expiración (7 días)',
                'WelcomeModal con saludo personalizado',
                'Logout con confirmación',
              ],
            },
          ],
        },
        {
          title: '💰 Gestión de Gastos',
          icon: <DollarSign className="w-5 h-5" />,
          color: '#10B981',
          items: [
            {
              description: 'Funcionalidades completas',
              subItems: [
                'CRUD completo de gastos',
                'Categorías predefinidas (8) + personalizadas',
                'Gastos recurrentes',
                'Filtros por fecha y categoría',
              ],
            },
          ],
        },
        {
          title: '📈 Dashboard y Estadísticas',
          icon: <PieChart className="w-5 h-5" />,
          color: '#F59E0B',
          items: [
            {
              description: 'Visualización de datos',
              subItems: [
                'Dashboard con gráficos (BarChart, PieChart, AreaChart)',
                'Selector de fechas (semana/mes/año)',
                'Alertas de presupuesto (70% y 100%)',
                'Exportar datos a CSV/JSON',
              ],
            },
          ],
        },
        {
          title: '👤 Perfil de Usuario',
          icon: <User className="w-5 h-5" />,
          color: '#EC4899',
          items: [
            {
              description: 'Personalización',
              subItems: [
                'Ver y editar perfil de usuario',
                'Subir avatar a Supabase Storage',
                'Subir banner de perfil',
                'Cambiar moneda y presupuesto mensual',
                'Badges de verificación',
              ],
            },
          ],
        },
        {
          title: '🎨 Temas y Apariencia',
          icon: <Palette className="w-5 h-5" />,
          color: '#06B6D4',
          items: [
            {
              description: 'Modo oscuro/claro y temas',
              subItems: [
                'Modo oscuro/claro con ThemeContext',
                '4 temas de color: Neon, Azul, Púrpura, Verde',
                'Persistencia en localStorage',
              ],
            },
          ],
        },
      ],
    },
  ];

  // Calcular estadísticas
  const totalVersions = versions.length;
  const latestVersion = versions[0].version;
  const latestDate = versions[0].date;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      
      {/* ========== BANNER DECORATIVO SUPERIOR ========== */}
      <div className="relative overflow-hidden">
        {/* Gradiente de fondo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 animate-gradient" />
        
        {/* Patrón de puntos decorativos */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
        }} />
        
        {/* Círculos decorativos flotantes */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
        
        {/* Contenido del banner */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          {/* Etiqueta CHANGELOG */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">CHANGELOG</span>
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
            Registro de versiones y novedades
          </h1>
          
          {/* Línea decorativa */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-12 h-1 bg-white/60 rounded-full" />
            <div className="w-6 h-1 bg-white/40 rounded-full" />
            <div className="w-3 h-1 bg-white/20 rounded-full" />
          </div>
          
          {/* Badge de última versión */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Última versión:</span>
            </div>
            <span className="text-white text-xl sm:text-2xl font-bold">v{latestVersion}</span>
            <div className="w-px h-6 bg-white/30" />
            <span className="text-white/70 text-sm">{latestDate}</span>
          </div>
        </div>
        
        {/* Ola decorativa en la parte inferior del banner */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50 dark:text-gray-900" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </div>

      {/* Header con efecto glassmorphism */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="group p-2 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Volver a configuración"
              title="Volver"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Historial de Cambios - Flutter Play
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Evolución de Mi Banca Universitaria
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de versiones */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5">
        {versions.map((version) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = version.isLatest;
          const gradientStart = version.gradientColors[0];
          const gradientEnd = version.gradientColors[1];

          return (
            <div
              key={version.version}
              className={`
                relative overflow-hidden transition-all duration-500 ease-out
                ${isExpanded ? 'scale-100' : 'hover:scale-[1.01] hover:shadow-2xl'}
                rounded-xl sm:rounded-2xl
                ${isDark 
                  ? 'bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80' 
                  : 'bg-gradient-to-br from-white/90 via-white/80 to-gray-50/90'
                }
                backdrop-blur-lg border
                ${isLatest 
                  ? `border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20` 
                  : isDark 
                    ? 'border-gray-700/30 shadow-lg' 
                    : 'border-gray-200/50 shadow-lg'
                }
              `}
            >
              {/* Efectos decorativos para versión latest */}
              {isLatest && (
                <>
                  <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-br from-amber-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                </>
              )}

              {/* Header de la versión */}
              <div
                className="relative p-3 sm:p-6 cursor-pointer select-none"
                onClick={() => toggleVersion(version.version)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleVersion(version.version);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                    {/* Badge de versión */}
                    <div
                      className={`
                        px-2.5 sm:px-5 py-1 sm:py-2.5 rounded-full text-white font-bold text-[11px] sm:text-sm
                        transition-all duration-500
                        ${isExpanded ? 'scale-110 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                        relative overflow-hidden
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                      }}
                    >
                      <span className="relative z-10">v{version.version}</span>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full">
                      <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                        {version.date}
                      </span>
                    </div>

                    {/* Badge Latest */}
                    {isLatest && (
                      <div className="px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full text-white text-[9px] sm:text-xs font-bold shadow-lg animate-pulse">
                        ✨ Última versión
                      </div>
                    )}
                  </div>

                  {/* Botón expandir/colapsar */}
                  <button
                    onClick={(e) => toggleVersion(version.version, e)}
                    className={`
                      p-1.5 sm:p-3 rounded-full transition-all duration-500 cursor-pointer
                      hover:scale-110 active:scale-95 self-start sm:self-auto
                      ${isExpanded 
                        ? 'bg-gradient-to-r from-amber-500/20 to-pink-500/20 shadow-lg' 
                        : 'bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50'
                      }
                    `}
                    aria-label={isExpanded ? "Colapsar" : "Expandir"}
                  >
                    <svg
                      className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Título de la versión */}
                <div
                  className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${isExpanded ? 'max-h-32 opacity-100 mt-2 sm:mt-4' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-1 sm:py-2.5 rounded-lg"
                    style={{
                      backgroundColor: `${gradientStart}15`,
                      border: `1px solid ${gradientStart}25`,
                    }}
                  >
                    <span className="text-[10px] sm:text-sm font-medium" style={{ color: gradientStart }}>
                      {version.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              <div
                ref={(el) => {
                  if (el) contentRefs.current.set(version.version, el);
                  else contentRefs.current.delete(version.version);
                }}
                className={`
                  overflow-y-auto transition-all duration-500 ease-in-out
                  ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                  custom-scrollbar
                `}
              >
                <div className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-3 sm:space-y-6">
                    {version.changes.map((category, catIndex) => (
                      <div key={catIndex} className="space-y-1.5 sm:space-y-3">
                        {/* Título de categoría */}
                        <div className="flex items-center gap-1.5 sm:gap-3 sticky top-0 py-1 sm:py-2 z-10 rounded-lg">
                          <div
                            className="p-1 sm:p-2.5 rounded-lg"
                            style={{
                              backgroundColor: `${category.color}20`,
                            }}
                          >
                            <span style={{ color: category.color }} className="block">
                              {category.icon}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-lg">
                            {category.title}
                          </h3>
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5 sm:space-y-3 pl-2 sm:pl-6">
                          {category.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="p-2 sm:p-4 rounded-lg"
                              style={{
                                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                                border: `1px solid ${category.color}15`,
                              }}
                            >
                              <div className="flex items-start gap-1.5 sm:gap-3">
                                <div
                                  className="p-0.5 sm:p-1 rounded-lg mt-0.5 flex-shrink-0"
                                  style={{ backgroundColor: `${category.color}20` }}
                                >
                                  <svg
                                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                                    style={{ color: category.color }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <span className="text-[11px] sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {item.description}
                                </span>
                              </div>

                              {/* Sub-items */}
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="mt-1.5 sm:mt-3 ml-4 sm:ml-10 space-y-1 sm:space-y-2">
                                  {item.subItems.map((subItem, subIndex) => (
                                    <div key={subIndex} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                                      <span
                                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1 sm:mt-1.5 flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                      />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {subItem}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Badge versión inicial */}
                    {version.isInitial && (
                      <div className="mt-3 sm:mt-6 p-4 sm:p-6 rounded-xl text-center">
                        <span className="text-xs sm:text-base font-bold" style={{ color: gradientStart }}>
                          🎉 Lanzamiento de Flutter Play - Mi Banca Universitaria 🎉
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== FOOTER DECORATIVO ========== */}
      <footer className="relative mt-8 overflow-hidden">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-pink-800/30 to-orange-900/40" />
        
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }} />
        
        {/* Ola superior del footer */}
        <div className="absolute top-0 left-0 right-0 rotate-180">
          <svg className="w-full h-8 text-gray-50 dark:text-gray-900" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
        
        {/* Contenido del footer */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Título */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Registro de Versiones
            </h2>
            <div className="flex justify-center gap-2 mt-3">
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full" />
              <div className="w-3 h-0.5 bg-pink-500 rounded-full" />
            </div>
          </div>
          
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Total de versiones */}
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20">
              <div className="text-4xl sm:text-5xl font-bold text-purple-500">{totalVersions}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2">Versiones Totales</div>
            </div>
            
            {/* Última versión */}
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20">
              <div className="text-4xl sm:text-5xl font-bold text-pink-500">{latestVersion}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2">Última Versión</div>
            </div>
            
            {/* Última actualización */}
            <div className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold text-orange-500">{latestDate.slice(0, 2)}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2">Última actualización</div>
            </div>
          </div>
          
          {/* Mensaje de agradecimiento */}
          <div className="text-center pt-4 sm:pt-6 border-t border-white/20">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              🎉 ¡Gracias por usar Flutter Play! 🎉
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">
              Tu banca universitaria, siempre contigo
            </p>
          </div>
        </div>
      </footer>

      {/* Estilos adicionales para animaciones */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes float-delayed {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          border-radius: 10px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
        }
      `}</style>
    </div>
  );
};

export default ChangelogPage;