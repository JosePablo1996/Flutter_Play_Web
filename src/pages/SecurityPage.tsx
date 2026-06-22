import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useNotifications } from '../hooks/useNotifications';
import { twoFactorService } from '../services/twoFactorService';
import { webauthnService } from '../services/webauthnService';
import { sessionService, type Session, type LoginHistory, type SecurityChange, type SecurityStats } from '../services/sessionService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Globe, 
  History, 
  AlertTriangle, 
  ArrowLeft,
  LogOut
} from 'lucide-react';
import TabNavigation, { type TabItem } from '../components/Security/TabNavigation';
import {
  GeneralTab,
  AuthTab,
  SessionsTab,
  LoginHistoryTab,
  SecurityChangesTab,
  DangerTab
} from './Security';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colors } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const {
    notifySessionRevoked,
    notifyAllSessionsRevoked
  } = useNotifications();
  
  // ✅ DETECTAR ENTORNO: Solo mostrar Passkey en desarrollo
  const isDevelopment = import.meta.env.DEV;
  
  // ============================================
  // ESTADOS
  // ============================================
  
  // UI
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  
  // Autenticación
  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [, setIsLoading2FA] = useState(true);
  const [, setIsLoadingPasskey] = useState(true);
  
  // Sesiones
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [errorSessions, setErrorSessions] = useState<string | null>(null);
  
  // Historiales
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [securityChanges, setSecurityChanges] = useState<SecurityChange[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);
  const [loadingSecurityChanges, setLoadingSecurityChanges] = useState(false);
  
  // Paginación
  const [loginHistoryLimit, setLoginHistoryLimit] = useState(10);
  const [securityChangesLimit, setSecurityChangesLimit] = useState(10);
  const [hasMoreLoginHistory, setHasMoreLoginHistory] = useState(true);
  const [hasMoreSecurityChanges, setHasMoreSecurityChanges] = useState(true);
  
  // ============================================
  // CÁLCULOS DE SEGURIDAD
  // ============================================
  
  const calculateSecurityScore = useCallback(() => {
    let score = 40; // Base
    
    if (is2FAEnabled) score += 30;
    if (isPasskeyEnabled) score += 20;
    // Alertas por correo siempre activadas por ahora
    score += 10;
    
    console.log(`🔐 [SecurityPage] Score calculado: ${score} (2FA: ${is2FAEnabled}, Passkey: ${isPasskeyEnabled})`);
    
    return Math.min(score, 100);
  }, [is2FAEnabled, isPasskeyEnabled]);
  
  const securityScore = calculateSecurityScore();
  
  const getLastLogin = useCallback(() => {
    if (securityStats?.last_login?.date) {
      return new Date(securityStats.last_login.date).toLocaleString();
    }
    if (loginHistory.length > 0) {
      return new Date(loginHistory[0].created_at).toLocaleString();
    }
    return 'No disponible';
  }, [securityStats, loginHistory]);
  
  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================
  
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setErrorSessions(null);
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setErrorSessions('Error al cargar las sesiones activas');
      showError('Error', 'No se pudieron cargar las sesiones activas');
    } finally {
      setLoadingSessions(false);
    }
  }, [showError]);
  
  const loadLoginHistory = useCallback(async () => {
    setLoadingLoginHistory(true);
    try {
      const data = await sessionService.getLoginHistory(loginHistoryLimit, 0);
      setLoginHistory(data);
      setHasMoreLoginHistory(data.length === loginHistoryLimit);
    } catch (error) {
      console.error('Error loading login history:', error);
      showError('Error', 'No se pudo cargar el historial de inicios de sesión');
    } finally {
      setLoadingLoginHistory(false);
    }
  }, [loginHistoryLimit, showError]);
  
  const loadMoreLoginHistory = useCallback(async () => {
    const newLimit = loginHistoryLimit + 10;
    setLoginHistoryLimit(newLimit);
    setLoadingLoginHistory(true);
    try {
      const data = await sessionService.getLoginHistory(newLimit, 0);
      setLoginHistory(data);
      setHasMoreLoginHistory(data.length === newLimit);
    } catch (error) {
      console.error('Error loading more login history:', error);
      showError('Error', 'No se pudieron cargar más registros');
    } finally {
      setLoadingLoginHistory(false);
    }
  }, [loginHistoryLimit, showError]);
  
  const loadSecurityChanges = useCallback(async () => {
    setLoadingSecurityChanges(true);
    try {
      const data = await sessionService.getSecurityChanges(securityChangesLimit, 0);
      setSecurityChanges(data);
      setHasMoreSecurityChanges(data.length === securityChangesLimit);
    } catch (error) {
      console.error('Error loading security changes:', error);
      showError('Error', 'No se pudo cargar el historial de cambios de seguridad');
    } finally {
      setLoadingSecurityChanges(false);
    }
  }, [securityChangesLimit, showError]);
  
  const loadMoreSecurityChanges = useCallback(async () => {
    const newLimit = securityChangesLimit + 10;
    setSecurityChangesLimit(newLimit);
    setLoadingSecurityChanges(true);
    try {
      const data = await sessionService.getSecurityChanges(newLimit, 0);
      setSecurityChanges(data);
      setHasMoreSecurityChanges(data.length === newLimit);
    } catch (error) {
      console.error('Error loading more security changes:', error);
      showError('Error', 'No se pudieron cargar más registros');
    } finally {
      setLoadingSecurityChanges(false);
    }
  }, [securityChangesLimit, showError]);
  
  const loadSecurityStats = useCallback(async () => {
    try {
      const data = await sessionService.getSecurityStats();
      setSecurityStats(data);
      console.log('📊 [SecurityPage] Estadísticas de seguridad cargadas:', data);
    } catch (error) {
      console.error('Error loading security stats:', error);
    }
  }, []);
  
  // ============================================
  // FUNCIONES DE CARGA Y SINCRONIZACIÓN DE 2FA Y PASSKEY
  // ============================================
  
  const load2FAStatus = useCallback(async () => {
    try {
      setIsLoading2FA(true);
      const status = await twoFactorService.getStatus();
      console.log('🔐 [SecurityPage] Estado 2FA cargado:', status.enabled);
      setIs2FAEnabled(status.enabled);
    } catch (error) {
      console.error('❌ [SecurityPage] Error loading 2FA status:', error);
      setIs2FAEnabled(false);
    } finally {
      setIsLoading2FA(false);
    }
  }, []);
  
  const loadPasskeyStatus = useCallback(async () => {
    try {
      setIsLoadingPasskey(true);
      const status = await webauthnService.getPasskeyStatus();
      console.log('🔐 [SecurityPage] Estado Passkey cargado:', status.enabled);
      setIsPasskeyEnabled(status.enabled);
    } catch (error) {
      console.error('❌ [SecurityPage] Error loading Passkey status:', error);
      setIsPasskeyEnabled(false);
    } finally {
      setIsLoadingPasskey(false);
    }
  }, []);
  
  const refresh2FAStatus = useCallback(async () => {
    await load2FAStatus();
  }, [load2FAStatus]);
  
  const refreshPasskeyStatus = useCallback(async () => {
    await loadPasskeyStatus();
  }, [loadPasskeyStatus]);
  
  // ============================================
  // FUNCIONES DE ACCIONES
  // ============================================
  
  const handleRevokeSession = useCallback(async (sessionId: string) => {
    if (!window.confirm('¿Cerrar sesión en este dispositivo?')) return;
    
    setRevokingSession(sessionId);
    try {
      const session = sessions.find(s => s.id === sessionId);
      await sessionService.revokeSession(sessionId);
      await loadSessions();
      notifySessionRevoked(session?.device_name, false);
      showSuccess('Sesión cerrada', `Se ha cerrado la sesión en ${session?.device_name || 'el dispositivo'}`);
    } catch (error) {
      console.error('Error revoking session:', error);
      setErrorSessions('Error al cerrar la sesión del dispositivo');
      showError('Error', 'No se pudo cerrar la sesión del dispositivo');
      setTimeout(() => setErrorSessions(null), 3000);
    } finally {
      setRevokingSession(null);
    }
  }, [sessions, loadSessions, notifySessionRevoked, showSuccess, showError]);
  
  const handleRevokeAllSessions = useCallback(async () => {
    console.log('🔴 [SecurityPage] Abriendo modal de confirmación');
    setShowRevokeAllConfirm(true);
  }, []);
  
  const executeRevokeAllSessions = useCallback(async () => {
    console.log('✅ Usuario confirmó, procediendo a cerrar sesiones...');
    setShowRevokeAllConfirm(false);
    setRevokingAll(true);
    
    try {
      console.log('🔴 Llamando a sessionService.revokeAllSessions()...');
      const result = await sessionService.revokeAllSessions();
      console.log('✅ Respuesta del servicio:', result);
      
      const sessionsCount = sessions.length;
      notifyAllSessionsRevoked(sessionsCount);
      showWarning('Sesiones cerradas', `Se han cerrado ${sessionsCount} sesiones activas. Serás redirigido al login.`);
      
      console.log('🔴 Redirigiendo al login en 2 segundos...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('❌ Error revoking all sessions:', error);
      setErrorSessions('Error al cerrar todas las sesiones');
      showError('Error', 'No se pudieron cerrar todas las sesiones');
      setTimeout(() => setErrorSessions(null), 3000);
    } finally {
      setRevokingAll(false);
    }
  }, [sessions.length, notifyAllSessionsRevoked, showWarning, showError, logout, navigate]);
  
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    showInfo('Sesión cerrada', 'Has cerrado sesión correctamente');
  }, [logout, navigate, showInfo]);
  
  const handleDeleteAccount = useCallback(() => {
    alert('Función en desarrollo. Próximamente disponible.');
    setShowDeleteAccountModal(false);
  }, []);
  
  const handleNavigateTo2FA = useCallback(() => {
    console.log('🔐 [SecurityPage] Navegando a /two-factor');
    navigate('/two-factor');
  }, [navigate]);
  
  // Manejar cambio de estado de 2FA desde el AuthTab
  const handle2FAStatusChange = useCallback((enabled: boolean) => {
    console.log('🔄 [SecurityPage] Estado 2FA actualizado desde AuthTab:', enabled);
    setIs2FAEnabled(enabled);
    loadSecurityStats();
  }, [loadSecurityStats]);
  
  // Manejar cambio de estado de Passkey desde el AuthTab
  const handlePasskeyStatusChange = useCallback((enabled: boolean) => {
    console.log('🔄 [SecurityPage] Estado Passkey actualizado:', enabled);
    setIsPasskeyEnabled(enabled);
  }, []);
  
  // ============================================
  // EFECTO PARA CARGAR DATOS INICIALES Y ESCUCHAR EVENTOS
  // ============================================
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        load2FAStatus(),
        loadPasskeyStatus(),
        loadSessions(),
        loadLoginHistory(),
        loadSecurityChanges(),
        loadSecurityStats()
      ]);
    };
    
    loadInitialData();
  }, [load2FAStatus, loadPasskeyStatus, loadSessions, loadLoginHistory, loadSecurityChanges, loadSecurityStats]);
  
  // Escuchar evento personalizado para cambios en 2FA
  useEffect(() => {
    const handle2FAChange = () => {
      console.log('🔄 [SecurityPage] Evento 2FA detectado, refrescando estado...');
      refresh2FAStatus();
    };
    
    window.addEventListener('2fa-status-changed', handle2FAChange);
    
    return () => {
      window.removeEventListener('2fa-status-changed', handle2FAChange);
    };
  }, [refresh2FAStatus]);
  
  // Escuchar evento personalizado para cambios en Passkey
  useEffect(() => {
    const handlePasskeyChange = () => {
      console.log('🔄 [SecurityPage] Evento Passkey detectado, refrescando estado...');
      refreshPasskeyStatus();
    };
    
    window.addEventListener('passkey-status-changed', handlePasskeyChange);
    
    return () => {
      window.removeEventListener('passkey-status-changed', handlePasskeyChange);
    };
  }, [refreshPasskeyStatus]);
  
  // ============================================
  // CONFIGURACIÓN DE PESTAÑAS
  // ============================================
  
  const tabs: TabItem[] = [
    { id: 'general', label: 'General', icon: <Shield className="w-4 h-4" /> },
    { id: 'auth', label: 'Autenticación', icon: <Lock className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sesiones', icon: <Globe className="w-4 h-4" /> },
    { id: 'login-history', label: 'Inicios de sesión', icon: <History className="w-4 h-4" /> },
    { id: 'security-changes', label: 'Cambios de seguridad', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'danger', label: 'Peligro', icon: <AlertTriangle className="w-4 h-4" /> }
  ];
  
  // ============================================
  // RENDERIZADO
  // ============================================
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralTab
            securityScore={securityScore}
            securityStats={securityStats}
            is2FAEnabled={is2FAEnabled}
            lastLogin={getLastLogin()}
            isPasskeyEnabled={isPasskeyEnabled}
            // ✅ NO pasar isDevelopment - no es necesario
          />
        );
      case 'auth':
        return (
          <AuthTab
            is2FAEnabled={is2FAEnabled}
            isPasskeyEnabled={isPasskeyEnabled}
            onTogglePasskey={setIsPasskeyEnabled}
            onNavigateTo2FA={handleNavigateTo2FA}
            on2FAStatusChange={handle2FAStatusChange}
            onPasskeyStatusChange={handlePasskeyStatusChange}
            isDevelopment={isDevelopment}  // ✅ PASAR LA VARIABLE DE ENTORNO
          />
        );
      case 'sessions':
        return (
          <SessionsTab
            sessions={sessions}
            loadingSessions={loadingSessions}
            revokingSession={revokingSession}
            revokingAll={revokingAll}
            errorSessions={errorSessions}
            onRevokeSession={handleRevokeSession}
            onRevokeAllSessions={handleRevokeAllSessions}
            onReload={loadSessions}
          />
        );
      case 'login-history':
        return (
          <LoginHistoryTab
            loginHistory={loginHistory}
            loadingLoginHistory={loadingLoginHistory}
            onLoadMore={loadMoreLoginHistory}
            hasMore={hasMoreLoginHistory}
          />
        );
      case 'security-changes':
        return (
          <SecurityChangesTab
            securityChanges={securityChanges}
            loadingSecurityChanges={loadingSecurityChanges}
            onLoadMore={loadMoreSecurityChanges}
            hasMore={hasMoreSecurityChanges}
          />
        );
      case 'danger':
        return (
          <DangerTab
            onLogout={() => setShowLogoutModal(true)}
            onDeleteAccount={() => setShowDeleteAccountModal(true)}
            isLoggingOut={isLoggingOut}
          />
        );
      default:
        return null;
    }
  };
  
  // Calcular si hay sesión actual para mostrar mensaje
  const hasCurrentSession = sessions.some(s => s.is_current);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="px-4 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: colors.textSecondary }}
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.text }}>Seguridad</h1>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Protege tu cuenta y tus datos</p>
            </div>
          </div>
        </div>
        
        {/* Navegación de pestañas - Centrada */}
        <div className="sticky top-[73px] z-10 flex justify-center" style={{ backgroundColor: colors.background }}>
          <div className="w-full max-w-2xl">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
        
        {/* Contenido de la pestaña activa */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación para cerrar todas las sesiones */}
      <AnimatePresence>
        {showRevokeAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowRevokeAllConfirm(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.warning}30`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.warning}20` }}>
                  <AlertTriangle className="w-8 h-8" style={{ color: colors.warning }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Cerrar todas las sesiones</h2>
                <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                  Esta acción cerrará tu sesión en <strong>{sessions.length}</strong> dispositivo{sessions.length !== 1 ? 's' : ''}.
                  {hasCurrentSession && ' También se cerrará tu sesión actual.'}
                </p>
                <p className="text-xs mb-6" style={{ color: colors.warning }}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Serás redirigido al inicio de sesión.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRevokeAllConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeRevokeAllSessions}
                    disabled={revokingAll}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}
                  >
                    {revokingAll ? 'Cerrando...' : 'Cerrar todas'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Modal de confirmación de cierre de sesión */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowLogoutModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.error}30`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                  <LogOut className="w-8 h-8" style={{ color: colors.error }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Cerrar Sesión</h2>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>¿Estás seguro de que deseas cerrar sesión?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                  >
                    {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Modal de confirmación de eliminación de cuenta */}
      <AnimatePresence>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowDeleteAccountModal(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.error}30`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
                  <AlertTriangle className="w-8 h-8" style={{ color: colors.error }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Eliminar cuenta</h2>
                <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                  Esta acción es irreversible. Se eliminarán todos tus datos, gastos, presupuestos y configuraciones.
                </p>
                <p className="text-xs mb-6" style={{ color: colors.warning }}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  ¿Estás absolutamente seguro?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteAccountModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SecurityPage;