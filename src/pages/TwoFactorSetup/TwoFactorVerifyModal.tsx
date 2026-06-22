// TwoFactorVerifyModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, Smartphone, Key, CheckCircle, ArrowLeft, X, User, Lock, HelpCircle, Sparkles, Crown, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TwoFactorVerifyModalProps {
  isOpen: boolean;
  email: string;
  tempToken: string;
  userFullName?: string;
  userAvatar?: string;
  userRole?: string;
  isVerified?: boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export const TwoFactorVerifyModal: React.FC<TwoFactorVerifyModalProps> = ({
  isOpen,
  email,
  tempToken,
  userFullName,
  userAvatar,
  userRole,
  isVerified = true,
  onSuccess,
  onError,
  onBack
}) => {
  const { colors } = useTheme();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // ✅ Prevenir llamadas duplicadas
  const hasCalledSuccess = useRef<boolean>(false);

  // ✅ URL de la API en Render (producción)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://flutter-play-api.onrender.com';
  
  // Determinar si es administrador
  const isAdmin = userRole === 'admin';

  // ✅ Efecto para manejar foco cuando se abre el modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // ✅ Resetear estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setError('');
      setAttempts(0);
      setCode(['', '', '', '', '', '']);
      setIsSuccess(false);
      hasCalledSuccess.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (index: number, value: string): void => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      const newCode = [...code];
      for (let i = 0; i < digits.length; i++) {
        if (i < 6) {
          newCode[i] = digits[i];
        }
      }
      setCode(newCode);
      
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const getFullCode = (): string => {
    return code.join('');
  };

  // ✅ handleVerify CORREGIDO - Evita llamadas duplicadas
  const handleVerify = async (): Promise<void> => {
    const fullCode = getFullCode();
    
    if (fullCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    // ✅ PREVENIR MÚLTIPLES LLAMADAS
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Verificando código 2FA...');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/2fa/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: fullCode, 
          temp_token: tempToken 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Código 2FA inválido');
      }
      
      // ✅ Verificar access_token en lugar de success
      if (data.access_token) {
        setIsSuccess(true);
        
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // ✅ LLAMAR onSuccess UNA SOLA VEZ
        if (!hasCalledSuccess.current) {
          hasCalledSuccess.current = true;
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      const errorMsg = err instanceof Error ? err.message : 'Código 2FA inválido';
      
      if (newAttempts >= 3) {
        setError('Demasiados intentos fallidos. Por favor, vuelve a iniciar sesión.');
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setError(errorMsg);
        onError(errorMsg);
      }
      
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
    // ✅ NO resetear loading aquí - se mantiene true hasta que onSuccess redirige
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const colorsList = [
      `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      `linear-gradient(135deg, ${colors.success}, ${colors.success}dd)`,
      `linear-gradient(135deg, ${colors.warning}, ${colors.warning}dd)`,
      `linear-gradient(135deg, ${colors.info}, ${colors.info}dd)`,
      `linear-gradient(135deg, ${colors.error}, ${colors.error}dd)`,
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorsList[Math.abs(index) % colorsList.length];
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null): void => {
    inputRefs.current[index] = el;
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.background}, ${colors.surface})`, backdropFilter: 'blur(8px)' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 0 30px ${colors.primary}50` }}
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.warning }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>¡Verificación exitosa!</h2>
          <p className="text-sm mb-4" style={{ color: colors.primary }}>Redirigiendo al dashboard...</p>
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: colors.primary }} />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${colors.background}cc, ${colors.surface}99)`, backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-5xl"
          >
            <div 
              className="relative rounded-3xl shadow-2xl overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Efectos de fondo */}
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}05)` }} />
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.primary}10` }} />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: `${colors.secondary}10` }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${colors.primary}05` }} />
              
              {/* Header con gradiente */}
              <div className="relative p-4 border-b" style={{ borderColor: colors.border }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                    <h2 className="text-lg font-bold" style={{ color: colors.text }}>Verificación 2FA</h2>
                  </div>
                  <button 
                    onClick={onBack} 
                    className="p-1 rounded-lg hover:bg-white/10 transition"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  </button>
                </div>
              </div>

              <div className="relative z-10 p-6 lg:p-8 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                  
                  {/* LADO IZQUIERDO - INFORMACIÓN DEL USUARIO */}
                  <div className="flex-1 text-center">
                    {/* Logo Flutter Play */}
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                        <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm" />
                        <Shield className="w-10 h-10 text-white relative z-10" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-center gap-2 mb-6">
                      <div
                        className="px-5 py-2.5 rounded-full shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                          border: `1px solid ${colors.primary}40`
                        }}
                      >
                        <h1 className="text-xl lg:text-2xl font-bold drop-shadow-md" style={{ color: colors.text }}>
                          Verificación 2FA
                        </h1>
                      </div>
                      <p className="text-sm font-light" style={{ color: colors.primary }}>
                        Flutter Play protege tu cuenta
                      </p>
                    </div>

                    {/* Tarjeta de usuario */}
                    <div className="relative group max-w-sm mx-auto">
                      <div 
                        className="absolute -inset-0.5 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      />
                      
                      <div className="relative rounded-2xl p-6 shadow-xl backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
                        {/* Avatar */}
                        <div className="flex justify-center -mt-12 mb-4">
                          <div className="relative">
                            <div 
                              className="absolute -inset-1 rounded-full blur-md opacity-60"
                              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                            />
                            {userAvatar && !avatarError ? (
                              <img 
                                src={userAvatar} 
                                alt={userFullName || email}
                                className="relative w-24 h-24 rounded-full border-4 shadow-xl object-cover"
                                style={{ borderColor: colors.surface }}
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              <div 
                                className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl`}
                                style={{ background: getAvatarColor(userFullName || email), borderColor: colors.surface }}
                              >
                                {userFullName ? (
                                  <span className="text-3xl font-bold text-white">
                                    {getInitials(userFullName)}
                                  </span>
                                ) : (
                                  <User className="w-12 h-12 text-white" />
                                )}
                              </div>
                            )}
                            
                            {/* Badge de verificado */}
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
                            
                            {/* Badge de administrador */}
                            {isAdmin && (
                              <div className="absolute -bottom-1 -left-1">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md bg-gradient-to-br from-amber-500 to-yellow-500"
                                  style={{ borderColor: colors.surface }}
                                >
                                  <Crown className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Nombre del usuario */}
                        {userFullName ? (
                          <h3 className="text-xl font-bold mb-1 text-center" style={{ color: colors.text }}>
                            {userFullName}
                          </h3>
                        ) : (
                          <h3 className="text-xl font-bold mb-1 text-center" style={{ color: colors.text }}>
                            {email.split('@')[0]}
                          </h3>
                        )}
                        
                        {/* Email */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Lock size={14} style={{ color: colors.primary }} />
                          <p className="text-sm font-medium break-all" style={{ color: colors.textSecondary }}>
                            {email}
                          </p>
                        </div>

                        {/* Badges inline */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {isVerified && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500/15 to-green-600/15 border border-green-500/30">
                              <ShieldCheck className="w-3 h-3 text-green-500" />
                              <span className="text-[9px] font-semibold text-green-600 dark:text-green-400">
                                Cuenta verificada
                              </span>
                            </div>
                          )}
                          
                          {isAdmin && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span className="text-[9px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                                Administrador
                              </span>
                              <Sparkles className="w-2 h-2 text-yellow-500" />
                            </div>
                          )}
                        </div>

                        {/* Línea divisoria */}
                        <div className="w-12 h-0.5 rounded-full mx-auto mb-3" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />

                        {/* Badge de verificación requerida */}
                        <div className="flex justify-center">
                          <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
                            style={{
                              backgroundColor: `${colors.primary}10`,
                              borderColor: `${colors.primary}30`
                            }}
                          >
                            <Shield size={14} style={{ color: colors.primary }} />
                            <span className="text-xs font-medium" style={{ color: colors.primary }}>
                              Verificación requerida
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LADO DERECHO - FORMULARIO DE VERIFICACIÓN */}
                  <div className="flex-1 w-full max-w-md">
                    <div className="rounded-2xl shadow-xl p-6 lg:p-8 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                          <Smartphone className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                          Ingresa el código
                        </h2>
                        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                          Código de 6 dígitos de Google Authenticator
                        </p>
                      </div>

                      {/* Campos de código */}
                      <div className="mb-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {code.map((digit, index) => (
                            <input
                              key={index}
                              ref={setInputRef(index)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleCodeChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              onPaste={index === 0 ? handlePaste : undefined}
                              onFocus={() => setFocusedInput(index)}
                              onBlur={() => setFocusedInput(null)}
                              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none"
                              style={{
                                backgroundColor: `${colors.background}cc`,
                                borderColor: focusedInput === index 
                                  ? colors.primary 
                                  : digit 
                                    ? colors.primary 
                                    : colors.border,
                                color: colors.text,
                                boxShadow: focusedInput === index ? `0 0 10px ${colors.primary}40` : 'none'
                              }}
                              disabled={loading}
                              autoComplete="off"
                              aria-label={`Dígito ${index + 1} del código de verificación`}
                              placeholder="•"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Mensaje de error */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl p-3 mb-4"
                          style={{ backgroundColor: `${colors.error}10`, border: `1px solid ${colors.error}30` }}
                        >
                          <div className="flex items-start gap-2" style={{ color: colors.error }}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Intentos restantes */}
                      {attempts > 0 && attempts < 3 && (
                        <div
                          className="rounded-xl p-3 mb-4"
                          style={{ backgroundColor: `${colors.warning}10`, border: `1px solid ${colors.warning}30` }}
                        >
                          <div className="flex items-center gap-2" style={{ color: colors.warning }}>
                            <Key className="w-4 h-4" />
                            <span className="text-sm">
                              Intentos restantes: <strong>{3 - attempts}</strong> de 3
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Botón de verificación */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerify}
                        disabled={loading || getFullCode().length !== 6}
                        className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-base"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          boxShadow: getFullCode().length === 6 ? `0 4px 15px ${colors.primary}40` : 'none'
                        }}
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            Verificar y acceder
                            <CheckCircle size={18} />
                          </>
                        )}
                      </motion.button>

                      {/* Botón para volver */}
                      {onBack && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onBack}
                          disabled={loading}
                          className="w-full mt-4 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm"
                          style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Volver al login
                        </motion.button>
                      )}

                      {/* Sección de ayuda */}
                      <div className="mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
                        <details className="group">
                          <summary className="cursor-pointer text-sm text-center list-none flex items-center justify-center gap-1" style={{ color: colors.textSecondary }}>
                            <HelpCircle size={14} style={{ color: colors.primary }} />
                            <span>¿Cómo obtener el código?</span>
                            <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-3 p-4 rounded-xl space-y-3" style={{ backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                                <span className="text-white text-xs font-bold">1</span>
                              </div>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                <strong className="text-white">Abre Google Authenticator</strong><br />
                                <span>O cualquier app compatible (Authy, Microsoft Authenticator)</span>
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                                <span className="text-white text-xs font-bold">2</span>
                              </div>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                <strong className="text-white">Busca la cuenta de Flutter Play</strong><br />
                                <span>Identificada con tu correo electrónico</span>
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                                <span className="text-white text-xs font-bold">3</span>
                              </div>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                <strong className="text-white">Ingresa el código de 6 dígitos</strong><br />
                                <span>El código se actualiza cada 30 segundos</span>
                              </p>
                            </div>
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: `${colors.primary}20` }}>
                              <p className="text-xs flex items-start gap-2" style={{ color: colors.primary }}>
                                <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                                <span>Si no configuraste 2FA, usa un código de respaldo o contacta a soporte.</span>
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TwoFactorVerifyModal;