// src/pages/HelpPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  Star,
  BookOpen,
  Settings,
  Tag,
  Calendar,
  Cloud,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Shield,
  Users,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Lock,
  Heart,
  Info,
  Globe,
  Fingerprint,
  Save,
  BarChart,
  Target,
  DollarSign,
  Wallet,
  PiggyBank,
  Landmark,
  AlertTriangle
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

// ============================================
// COMPONENTES AUXILIARES
// ============================================


const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { colors } = useTheme();
  
  return (
    <motion.div 
      whileHover={{ boxShadow: `0 8px 30px rgba(0,0,0,0.12)` }}
      className={`rounded-2xl backdrop-blur-xl border overflow-hidden mb-6 ${className}`}
      style={{ 
        backgroundColor: `${colors.surface}cc`,
        borderColor: colors.border,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
      }}
    >
      {children}
    </motion.div>
  );
};


// ============================================
// COMPONENTE PRINCIPAL - FLUTTER PLAY HELP PAGE
// ============================================

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showSuccess, showInfo } = useNotification();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeTab, setActiveTab] = useState<'faq' | 'contacto' | 'about'>('faq');

  // Características principales de Flutter Play
  const features = [
    {
      icon: <Wallet className="w-5 h-5" style={{ color: colors.primary }} />,
      iconColor: `bg-gradient-to-br from-${colors.primary}/20 to-${colors.secondary}/20`,
      title: 'Gestión de Gastos',
      description: 'Controla tus finanzas con un CRUD completo de gastos.',
      details: 'Categorías personalizables, gastos recurrentes y filtros avanzados.'
    },
    {
      icon: <Cloud className="w-5 h-5" style={{ color: colors.info }} />,
      iconColor: `bg-gradient-to-br from-${colors.info}/20 to-${colors.primary}/20`,
      title: 'Sincronización en la Nube',
      description: 'Tus datos sincronizados automáticamente con Supabase.',
      details: 'Backup automático, restauración y disponibilidad en todos tus dispositivos.'
    },
    {
      icon: <Fingerprint className="w-5 h-5" style={{ color: colors.success }} />,
      iconColor: `bg-gradient-to-br from-${colors.success}/20 to-${colors.info}/20`,
      title: 'Seguridad Avanzada',
      description: 'Protege tu cuenta con 2FA y códigos de respaldo.',
      details: 'Autenticación de dos factores (TOTP) y códigos de respaldo.'
    },
    {
      icon: <Save className="w-5 h-5" style={{ color: colors.warning }} />,
      iconColor: `bg-gradient-to-br from-${colors.warning}/20 to-${colors.secondary}/20`,
      title: 'Presupuestos Inteligentes',
      description: 'Crea presupuestos mensuales por categoría.',
      details: 'Alertas cuando te acercas al límite (70% y 100%).'
    },
    {
      icon: <Calendar className="w-5 h-5" style={{ color: colors.primary }} />,
      iconColor: `bg-gradient-to-br from-${colors.primary}/20 to-${colors.success}/20`,
      title: 'Calendario y Estadísticas',
      description: 'Visualiza tus gastos y tendencias financieras.',
      details: 'Gráficos interactivos, estadísticas avanzadas y exportación CSV/JSON.'
    },
    {
      icon: <Share2 className="w-5 h-5" style={{ color: colors.secondary }} />,
      iconColor: `bg-gradient-to-br from-${colors.secondary}/20 to-${colors.warning}/20`,
      title: 'Exportación de Datos',
      description: 'Exporta tus gastos a CSV o JSON.',
      details: 'Comparte tus estadísticas o respalda tu información.'
    }
  ];

  // Categorías y FAQs para Flutter Play
  const categories = [
    { name: 'Todos', icon: <BookOpen className="w-4 h-4" />, color: 'blue' },
    { name: 'General', icon: <HelpCircle className="w-4 h-4" />, color: 'purple' },
    { name: 'Gastos', icon: <Wallet className="w-4 h-4" />, color: 'green' },
    { name: 'Categorías', icon: <Tag className="w-4 h-4" />, color: 'pink' },
    { name: 'Presupuestos', icon: <Target className="w-4 h-4" />, color: 'teal' },
    { name: 'Seguridad', icon: <Shield className="w-4 h-4" />, color: 'red' },
    { name: 'Estadísticas', icon: <BarChart className="w-4 h-4" />, color: 'indigo' },
    { name: 'Perfil', icon: <Settings className="w-4 h-4" />, color: 'orange' },
  ];

  const faqs = [
    // General
    {
      question: '¿Qué es Flutter Play - Mi Banca Universitaria?',
      answer: 'Flutter Play es una aplicación financiera diseñada especialmente para estudiantes universitarios. Te permite gestionar tus gastos, crear presupuestos, visualizar estadísticas y mantener el control de tus finanzas personales de forma segura y sencilla.',
      category: 'General',
      icon: <Landmark className="w-5 h-5" style={{ color: colors.primary }} />
    },
    {
      question: '¿Es gratuita la aplicación?',
      answer: 'Sí, Flutter Play es completamente gratuita para estudiantes universitarios. Puedes registrar todos tus gastos, crear presupuestos y acceder a todas las funcionalidades sin costo alguno.',
      category: 'General',
      icon: <PiggyBank className="w-5 h-5" style={{ color: colors.success }} />
    },
    // Gastos
    {
      question: '¿Cómo registro un nuevo gasto?',
      answer: [
        'Ve a la página de "Gastos" desde el menú lateral',
        'Haz clic en el botón "Nuevo Gasto"',
        'Completa el nombre, monto, fecha y categoría',
        'Opcionalmente, agrega una descripción y marca si es recurrente',
        'Haz clic en "Guardar" para registrar el gasto'
      ],
      category: 'Gastos',
      icon: <DollarSign className="w-5 h-5" style={{ color: colors.warning }} />
    },
    {
      question: '¿Cómo funcionan los gastos recurrentes?',
      answer: 'Al marcar un gasto como recurrente, puedes configurar su frecuencia (diaria, semanal, mensual o anual). El sistema lo registrará automáticamente en las fechas correspondientes, ahorrándote tiempo en gastos fijos como suscripciones, renta o servicios.',
      category: 'Gastos',
      icon: <RefreshCw className="w-5 h-5" style={{ color: colors.info }} />
    },
    // Categorías
    {
      question: '¿Puedo crear mis propias categorías?',
      answer: '¡Sí! Además de las 8 categorías predefinidas (Alimentación, Transporte, Materiales, Matrícula, Vivienda, Entretenimiento, Salud, Otros), puedes crear categorías personalizadas con tu propio icono y color. Ve a la página de "Categorías" y haz clic en "Nueva Categoría".',
      category: 'Categorías',
      icon: <Tag className="w-5 h-5" style={{ color: colors.warning }} />
    },
    // Presupuestos
    {
      question: '¿Cómo crear un presupuesto mensual?',
      answer: [
        'Ve a la página de "Presupuestos" desde el menú lateral',
        'Haz clic en "Nuevo Presupuesto"',
        'Selecciona la categoría que deseas presupuestar',
        'Ingresa el monto máximo que puedes gastar al mes',
        'Guarda el presupuesto y recibirás alertas cuando te acerques al límite'
      ],
      category: 'Presupuestos',
      icon: <Target className="w-5 h-5" style={{ color: colors.success }} />
    },
    {
      question: '¿Cuándo recibo alertas de presupuesto?',
      answer: 'Recibirás alertas visuales en tu dashboard cuando alcances el 70% de tu presupuesto (cerca del límite) y cuando lo excedas al 100%. Esto te ayudará a controlar tus gastos y ajustar tu presupuesto si es necesario.',
      category: 'Presupuestos',
      icon: <AlertTriangle className="w-5 h-5" style={{ color: colors.warning }} />
    },
    // Seguridad
    {
      question: '¿Cómo activar la autenticación de dos factores (2FA)?',
      answer: [
        'Ve a Configuración > Seguridad',
        'Expande la sección "Autenticación de Dos Factores (2FA)"',
        'Haz clic en "Configurar 2FA" y confirma tu contraseña',
        'Escanea el código QR con Google Authenticator o Authy',
        'Ingresa el código de 6 dígitos para verificar',
        'Guarda tus códigos de respaldo en un lugar seguro'
      ],
      category: 'Seguridad',
      icon: <Lock className="w-5 h-5" style={{ color: colors.primary }} />
    },
    {
      question: '¿Qué hago si pierdo acceso a mi aplicación de 2FA?',
      answer: 'Utiliza los códigos de respaldo que guardaste al activar 2FA. Cada código es de un solo uso y te permitirá acceder a tu cuenta. Si perdiste ambos, contacta a soporte para recuperar tu cuenta.',
      category: 'Seguridad',
      icon: <Shield className="w-5 h-5" style={{ color: colors.warning }} />
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: [
        'Ve a Configuración > Seguridad',
        'Haz clic en "Cambiar contraseña"',
        'Recibirás un código OTP a tu correo electrónico',
        'Ingresa el código de 6 dígitos',
        'Establece tu nueva contraseña segura'
      ],
      category: 'Seguridad',
      icon: <Lock className="w-5 h-5" style={{ color: colors.error }} />
    },
    // Estadísticas
    {
      question: '¿Qué tipo de estadísticas puedo ver?',
      answer: 'Flutter Play ofrece gráficos de barras para evolución mensual, gráficos circulares para distribución por categoría, gráficos de área para tendencias diarias/semanales/mensuales y estadísticas avanzadas con filtros por fecha y categoría.',
      category: 'Estadísticas',
      icon: <BarChart className="w-5 h-5" style={{ color: colors.info }} />
    },
    {
      question: '¿Cómo exportar mis datos?',
      answer: 'En la página de "Estadísticas" encontrarás botones para exportar tus datos filtrados a CSV o JSON. También puedes exportar desde el historial de accesos. Los archivos se descargarán automáticamente a tu dispositivo.',
      category: 'Estadísticas',
      icon: <Download className="w-5 h-5" style={{ color: colors.success }} />
    },
    // Perfil
    {
      question: '¿Cómo cambio mi moneda o presupuesto mensual?',
      answer: 'Ve a "Mi Perfil" desde el menú lateral, haz clic en "Editar" y podrás modificar tu moneda (USD, EUR, MXN, COP, etc.) y tu presupuesto mensual. Los cambios se reflejarán automáticamente en los gráficos y alertas.',
      category: 'Perfil',
      icon: <DollarSign className="w-5 h-5" style={{ color: colors.warning }} />
    },
    {
      question: '¿Cómo puedo ver mi historial de accesos?',
      answer: 'Ve a Configuración > Seguridad, encontrarás la sección "Historial de accesos". También puedes acceder directamente desde Configuración > Seguridad Bancaria > Historial de accesos. Allí verás todos los inicios de sesión en tu cuenta con detalles de dispositivo, IP y ubicación.',
      category: 'Seguridad',
      icon: <Globe className="w-5 h-5" style={{ color: colors.info }} />
    }
  ];

  // Funciones
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (Array.isArray(faq.answer) && faq.answer.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === 'Todos' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  const handleContactClick = (type: string) => {
    if (type === 'email') {
      window.location.href = 'mailto:soporte@flutterplay.com';
      showSuccess('📧 Correo preparado', 'Se abrirá tu cliente de correo');
    } else if (type === 'faq') {
      setActiveTab('faq');
      setSearchQuery('');
      showSuccess('📚 FAQ', 'Mostrando todas las preguntas frecuentes');
    } else if (type === 'feedback') {
      showInfo('📝 Feedback', 'Próximamente disponible');
    }
  };

  // Verificar si el color primary es claro u oscuro para el texto
  const isPrimaryLight = colors.primary === '#00E676' || colors.primary === '#10B981';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b transition-all duration-300" style={{ 
        background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
        borderColor: colors.border,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`
      }}>
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
                <ArrowLeft className="w-5 h-5 transition-colors" style={{ color: colors.textSecondary }} />
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                <h1 className="text-xl font-bold" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Centro de Ayuda
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DECORATIVO - ACTUALIZADO A 2.6.0 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-40 md:h-48 w-full overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="w-full h-full flex flex-col items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.primary}40` }} />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.secondary}40` }} />

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="flex items-center gap-3">
                <Landmark className="w-10 h-10 text-white drop-shadow-lg" />
                <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                  Flutter<span style={{ color: isPrimaryLight ? '#1a1a1a' : '#FFEA00' }}>Play</span>
                </h2>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-2xl"
              >
                <HelpCircle className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm md:text-base">
                  Centro de Ayuda y Soporte
                </span>
              </motion.div>
            </div>

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30 shadow-lg">
                v 2.6.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5`} style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: `${colors.surface}cc`,
                borderColor: colors.border,
                color: colors.text,
                ['--tw-ring-color' as string]: colors.primary
              }}
              placeholder-text-color={colors.textSecondary}
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 p-1.5 rounded-xl border mb-8 shadow-md overflow-x-auto"
          style={{ 
            backgroundColor: `${colors.surface}cc`,
            borderColor: colors.border
          }}
        >
          {[
            { id: 'faq', icon: <MessageCircle size={16} />, label: 'Preguntas Frecuentes' },
            { id: 'contacto', icon: <Mail size={16} />, label: 'Contacto' },
            { id: 'about', icon: <Info size={16} />, label: 'Acerca de' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={activeTab === tab.id ? {
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
              } : {
                color: colors.textSecondary,
                backgroundColor: 'transparent'
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </motion.div>

        {/* Contenido según tab */}
        <AnimatePresence mode="wait">
          {/* Tab: Preguntas Frecuentes */}
          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Categorías */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.name;
                  
                  return (
                    <motion.button
                      key={category.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border`}
                      style={isSelected ? {
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        color: '#ffffff',
                        borderColor: 'transparent'
                      } : {
                        backgroundColor: `${colors.surface}cc`,
                        color: colors.textSecondary,
                        borderColor: colors.border
                      }}
                    >
                      <span>{category.icon}</span>
                      <span className="text-xs font-medium">{category.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* FAQs */}
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border" style={{ 
                  backgroundColor: `${colors.surface}cc`,
                  borderColor: colors.border
                }}>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.surface}` }}>
                    <Search className="w-10 h-10" style={{ color: colors.textSecondary }} />
                  </div>
                  <p style={{ color: colors.textSecondary }}>
                    No se encontraron resultados para "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-sm hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <GlassCard>
                  {filteredFaqs.map((faq, index) => {
                    const isExpanded = expandedFaq === faq.question;
                    
                    return (
                      <div key={index} className="border-b last:border-b-0" style={{ borderColor: colors.border }}>
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.question)}
                          className="w-full px-5 py-4 flex items-center gap-3 text-left"
                        >
                          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${colors.primary}20` }}>
                            {faq.icon || <HelpCircle className="w-4 h-4" style={{ color: colors.primary }} />}
                          </div>
                          
                          <span className="flex-1 font-medium text-sm" style={{ color: colors.text }}>
                            {faq.question}
                          </span>
                          
                          <span className={`text-xs px-2 py-1 rounded-full ${isExpanded ? 'bg-opacity-100' : 'bg-opacity-20'}`} style={{ 
                            backgroundColor: isExpanded ? `${colors.primary}20` : `${colors.surface}`,
                            color: isExpanded ? colors.primary : colors.textSecondary
                          }}>
                            {faq.category}
                          </span>
                          
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary }} />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary }} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className={`px-5 pb-5 pt-2 text-sm border-t`} style={{ color: colors.textSecondary, borderColor: colors.border }}>
                                {Array.isArray(faq.answer) ? (
                                  <ul className="space-y-2.5">
                                    {faq.answer.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                                        <span className="leading-relaxed">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="leading-relaxed">{faq.answer}</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Tab: Contacto */}
          {activeTab === 'contacto' && (
            <motion.div
              key="contacto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard>
                <div className="p-6 md:p-8 space-y-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>¿Necesitas ayuda personalizada?</h3>
                    <p className="text-sm max-w-md mx-auto" style={{ color: colors.textSecondary }}>
                      Estamos aquí para ayudarte. Puedes contactarnos por cualquiera de estos medios.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleContactClick('email')}
                      className="p-5 rounded-xl border flex items-center gap-4 transition-all hover:shadow-lg"
                      style={{ 
                        backgroundColor: `${colors.surface}cc`,
                        borderColor: colors.border
                      }}
                    >
                      <div className="p-3.5 rounded-xl" style={{ backgroundColor: `${colors.error}20` }}>
                        <Mail className="w-6 h-6" style={{ color: colors.error }} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold" style={{ color: colors.text }}>Correo electrónico</h4>
                        <p className="text-sm break-all" style={{ color: colors.textSecondary }}>soporte@flutterplay.com</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleContactClick('feedback')}
                      className="p-5 rounded-xl border flex items-center gap-4 transition-all hover:shadow-lg"
                      style={{ 
                        backgroundColor: `${colors.surface}cc`,
                        borderColor: colors.border
                      }}
                    >
                      <div className="p-3.5 rounded-xl" style={{ backgroundColor: `${colors.warning}20` }}>
                        <Star className="w-6 h-6" style={{ color: colors.warning }} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold" style={{ color: colors.text }}>Feedback y sugerencias</h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Comparte tus ideas para mejorar Flutter Play</p>
                      </div>
                    </button>
                  </div>

                  {/* Tiempo de respuesta */}
                  <div className="border-t pt-6" style={{ borderColor: colors.border }}>
                    <h4 className="font-medium text-center mb-4" style={{ color: colors.text }}>
                      <Clock size={16} className="inline mr-2" />
                      Tiempo de respuesta estimado
                    </h4>
                    <div className="flex justify-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.success }}>&lt; 24h</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>Email</div>
                      </div>
                      <div className="w-px h-8" style={{ backgroundColor: colors.border }} />
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: colors.success }}>&lt; 48h</div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>Feedback</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Tab: Acerca de */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlassCard>
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 rounded-2xl shadow-xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                      <Landmark className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                        Tu banca universitaria inteligente
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                        <strong style={{ color: colors.text }}>Flutter Play - Mi Banca Universitaria</strong> es una aplicación financiera
                        diseñada especialmente para estudiantes universitarios que desean tomar el control de sus finanzas personales.
                        Con herramientas intuitivas y potentes, podrás gestionar tus gastos, crear presupuestos y visualizar estadísticas
                        de forma segura y sencilla.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border mb-6" style={{ 
                    backgroundColor: `${colors.primary}10`,
                    borderColor: `${colors.primary}30`
                  }}>
                    <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                      Desarrollada con tecnologías modernas como <strong style={{ color: colors.text }}>React + TypeScript</strong> en el
                      frontend y <strong style={{ color: colors.text }}>FastAPI + Supabase</strong> en el backend, Flutter Play
                      ofrece una experiencia fluida, segura y responsive para todos los estudiantes universitarios.
                    </p>
                  </div>

                  {/* Características */}
                  <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                    <Sparkles size={18} style={{ color: colors.success }} />
                    Características principales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl border transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: `${colors.surface}cc`,
                          borderColor: colors.border
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${feature.iconColor} flex-shrink-0`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h5 className="font-semibold text-sm" style={{ color: colors.text }}>{feature.title}</h5>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>{feature.description}</p>
                            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: colors.textSecondary }}>{feature.details}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Versión - ACTUALIZADO A 2.6.0 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl border"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`,
                  borderColor: `${colors.primary}30`
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                    <Info className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: colors.text }}>
                      Versión actual: v2.6.0
                    </h3>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>
                      Esta versión incluye gestión completa de gastos, presupuestos inteligentes,
                      autenticación de dos factores (2FA), estadísticas avanzadas, calendario de gastos,
                      sincronización en la nube y múltiples mejoras de seguridad y rendimiento.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - ACTUALIZADO A 2.6.0 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 pt-6 border-t text-center"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-5 h-5" style={{ color: colors.error, fill: colors.error }} />
            </motion.div>
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              Centro de ayuda de Flutter Play v2.6.0 - Mi Banca Universitaria
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="w-5 h-5" style={{ color: colors.error, fill: colors.error }} />
            </motion.div>
          </div>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            ¿No encuentras lo que buscas? Contáctanos directamente y te ayudaremos a resolver tu consulta.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;