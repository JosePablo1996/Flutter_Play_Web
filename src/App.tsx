import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme, PageTransition } from './context/ThemeContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import LeftMenu from './components/Layout/LeftMenu';
import ToastContainer from './components/UI/ToastContainer';
import type { ToastProps } from './components/UI/Toast';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/auth/LoginPage';
import LoginOTPPage from './pages/auth/LoginOTPPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/Expenses';
import ProfilePage from './pages/Profile';
import CategoriesPage from './pages/CategoriesPage';
import StatsPage from './pages/StatsPage';
import CalendarPage from './pages/CalendarPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';
import SecurityPage from './pages/SecurityPage';
import AccessHistoryPage from './pages/AccessHistoryPage';
import ChangelogPage from './pages/ChangelogPage';
import HelpPage from './pages/HelpPage';
import DeveloperPage from './pages/DeveloperPage';
import { TwoFactorSetupPage } from './pages/TwoFactorSetup';
import './index.css';

// Componente para rutas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar splash screen mientras carga la autenticación
  if (loading) {
    return <SplashPage minimumDisplayTime={1500} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar splash screen mientras carga la autenticación
  if (loading) {
    return <SplashPage minimumDisplayTime={1500} />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente interno que usa notificaciones
const NotificationAwareLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, removeNotification } = useNotification();
  
  // Convertir Notification[] a ToastProps[]
  const toasts: ToastProps[] = notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    duration: notification.duration,
    icon: notification.icon,
    onClose: removeNotification
  }));
  
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeNotification} />
    </>
  );
};

// Layout principal con menú lateral
const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const { colors } = useTheme();

  return (
    <NotificationAwareLayout>
      <LeftMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        <main className="pt-4">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/access-history" element={<AccessHistoryPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/developer" element={<DeveloperPage />} />
                <Route path="/two-factor" element={
                  <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                      <button
                        onClick={() => setShow2FASetup(true)}
                        className="mb-4 px-4 py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                      >
                        Configurar 2FA
                      </button>
                    </div>
                  </div>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      
      <TwoFactorSetupPage
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onComplete={() => {
          setShow2FASetup(false);
          console.log('2FA configurado exitosamente');
        }}
      />
    </NotificationAwareLayout>
  );
};

// Layout para páginas públicas (login, register, etc.)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationAwareLayout>
      {children}
    </NotificationAwareLayout>
  );
};

// Componente principal de rutas
const AppContent: React.FC = () => {
  const [showInitialSplash, setShowInitialSplash] = useState(true);

  // Mostrar splash screen al inicio de la aplicación
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showInitialSplash) {
    return <SplashPage minimumDisplayTime={2500} />;
  }

  return (
    <Routes>
      <Route path="/login" element={
        <PublicLayout>
          <PublicRoute><LoginPage /></PublicRoute>
        </PublicLayout>
      } />
      <Route path="/login-otp" element={
        <PublicLayout>
          <PublicRoute><LoginOTPPage /></PublicRoute>
        </PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout>
          <PublicRoute><RegisterPage /></PublicRoute>
        </PublicLayout>
      } />
      <Route path="/forgot-password" element={
        <PublicLayout>
          <PublicRoute><ForgotPasswordPage /></PublicRoute>
        </PublicLayout>
      } />
      <Route path="/reset-password" element={
        <PublicLayout>
          <PublicRoute><ResetPasswordPage /></PublicRoute>
        </PublicLayout>
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;