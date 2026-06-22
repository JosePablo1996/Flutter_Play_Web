import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from '../../services/api';
import { motion } from 'framer-motion';
import type { User } from '../../types';
import { 
  Shield, 
  CheckCircle, 
  Sparkles, 
  Mail, 
  DollarSign, 
  Target,
  Crown,
  ShieldCheck,
  UserCircle
} from 'lucide-react';

interface UserProfileCardProps {
  onNavigateToProfile?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ onNavigateToProfile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useTheme();
  const [profile, setProfile] = useState<User | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.get();
        setProfile(response.data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  const userRole = profile?.role || user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isVerified = user?.email !== undefined || profile?.email !== undefined;

  const getFullName = (): string => {
    return profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Usuario';
  };

  const getUserEmail = (): string => {
    return user?.email || profile?.email || 'usuario@email.com';
  };

  const getAvatarUrl = (): string | null => {
    if (profile?.avatar_url && !avatarError) {
      return profile.avatar_url;
    }
    return null;
  };

  const getCurrencySymbol = (): string => {
    const currency = profile?.currency || user?.currency || 'USD';
    return currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$';
  };

  const avatarUrl = getAvatarUrl();
  const currencySymbol = getCurrencySymbol();
  const monthlyBudget = profile?.monthly_budget || user?.monthly_budget || 1000;
  const userCurrency = profile?.currency || user?.currency || 'USD';

  const handleNavigateToProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      navigate('/profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl shadow-2xl mb-4 cursor-pointer group"
      onClick={handleNavigateToProfile}
    >
      {/* Fondo con gradiente moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl" />
      </div>

      {/* Efecto de brillo al hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative px-6 py-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar con badges inferiores */}
          <div className="relative flex-shrink-0 mb-3">
            {/* Anillo exterior brillante */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Avatar */}
            <div 
              className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 border-4 border-white/20"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`Avatar de ${getFullName()}`}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <UserCircle className="w-16 h-16 text-purple-600" strokeWidth={1.5} />
              )}
            </div>

            {/* Badge de verificación - inferior izquierda (solo ícono) */}
            {isVerified && (
              <div className="absolute -bottom-1 -left-2">
                <div 
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg border border-green-300/50"
                  aria-label="Cuenta verificada"
                >
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            {/* Badge de administrador - inferior derecha (solo ícono) */}
            {isAdmin && (
              <div className="absolute -bottom-1 -right-2">
                <div 
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 shadow-lg border border-amber-300/50"
                  aria-label="Administrador"
                >
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Nombre */}
          <h2 className="font-bold text-xl mb-1 text-white drop-shadow-lg">
            {getFullName()}
          </h2>

          {/* Email */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-purple-300" />
            <p className="text-sm text-purple-200">
              {getUserEmail()}
            </p>
          </div>

          {/* Estadísticas rápidas centradas */}
          <div className="flex gap-2 mb-4">
            {/* Moneda */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
              aria-label="Moneda"
            >
              <DollarSign className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-sm font-semibold text-white">
                {userCurrency}
              </span>
            </div>

            {/* Presupuesto */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
              aria-label="Presupuesto mensual"
            >
              <Target className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-sm font-semibold text-white">
                {currencySymbol}{monthlyBudget.toFixed(0)}
              </span>
            </div>

            {/* Protegida - con color verde */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md bg-green-500/20 border border-green-400/40 shadow-lg"
              aria-label="Cuenta protegida"
            >
              <Shield className="w-3.5 h-3.5 text-green-300" />
              <span className="text-sm font-semibold text-green-100">
                Protegida
              </span>
            </div>
          </div>

          {/* Separador decorativo */}
          <div className="w-full h-px my-2 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

          {/* Badges de estado - versión completa */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {isVerified && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-md border border-green-400/40"
              >
                <ShieldCheck className="w-4 h-4 text-green-300" />
                <span className="text-xs font-semibold text-green-100">
                  Cuenta verificada
                </span>
              </div>
            )}

            {isAdmin && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-amber-100">
                  Administrador
                </span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;