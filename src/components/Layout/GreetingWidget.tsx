import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../services/api';
import type { User } from '../../types';

interface GreetingWidgetProps {
  className?: string;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Cargar perfil para obtener nombre
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileApi.get();
        setProfile(response.data);
      } catch (error) {
        console.error('Error loading profile for greeting:', error);
      }
    };
    loadProfile();
  }, []);

  // Obtener saludo según la hora
  const getGreeting = (): string => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 18) return 'Buenas tardes';
    if (hour >= 18 && hour < 22) return 'Buenas noches';
    return 'Buenas noches';
  };

  // Obtener momento del día para colores
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // Obtener colores del gradiente según la hora (estilo neon)
  const getGradientColors = (): { from: string; to: string } => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'morning':
        return { from: '#F59E0B', to: '#EA580C' };
      case 'afternoon':
        return { from: '#0EA5E9', to: '#3B82F6' };
      case 'evening':
        return { from: '#6366F1', to: '#8B5CF6' };
      default:
        return { from: '#7C3AED', to: '#DB2777' };
    }
  };

  // Obtener icono de Sol/Luna según la hora
  const getSunMoonIcon = (): string => {
    const timeOfDay = getTimeOfDay();
    return timeOfDay === 'morning' || timeOfDay === 'afternoon' ? '☀️' : '🌙';
  };

  // Formatear hora (12 horas)
  const formatTime = (): string => {
    let hour = currentTime.getHours();
    const minute = currentTime.getMinutes().toString().padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${period}`;
  };

  // Formatear fecha
  const formatDate = (): string => {
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${weekdays[currentTime.getDay()]}, ${currentTime.getDate()} de ${months[currentTime.getMonth()]}`;
  };

  // Obtener nombre del usuario
  const getUserName = (): string => {
    const name = profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Usuario';
    if (name.length > 30) return name.substring(0, 30) + '...';
    return name;
  };

  const greeting = getGreeting();
  const sunMoonIcon = getSunMoonIcon();
  const displayName = getUserName();
  const gradientColors = getGradientColors();
  const timeOfDay = getTimeOfDay();

  const getDecorativeText = (): string => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      default: return '🌙';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Gradiente de fondo estilo neon */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`,
          boxShadow: `0 0 20px ${gradientColors.from}40`
        }}
      />
      
      {/* Texto decorativo de fondo */}
      <div className="absolute bottom-0 right-2 text-4xl opacity-10 pointer-events-none">
        {getDecorativeText()}
      </div>

      {/* Contenido principal */}
      <div className="relative px-4 py-2">
        {/* Icono esquina superior izquierda (Sol/Luna) */}
        <div className="absolute top-1.5 left-2">
          <div className="bg-white/20 rounded-lg p-1">
            <span className="text-xs">{sunMoonIcon}</span>
          </div>
        </div>

        {/* Contenido centrado */}
        <div className="flex flex-col items-center text-center">
          {/* Hora */}
          <div className="bg-white/20 rounded-full px-2 py-0.5 border border-white/25">
            <span className="text-white font-bold text-xs tracking-wide">
              {formatTime()}
            </span>
          </div>

          {/* Fecha */}
          <p className="text-white/85 text-[10px] font-medium mt-1">
            {formatDate()}
          </p>

          {/* Línea decorativa */}
          <div className="w-8 h-px my-1 bg-gradient-to-r from-white/40 to-white/10 rounded-full" />

          {/* Saludo */}
          <p className="text-white/90 font-medium text-[10px]">
            {greeting}
          </p>

          {/* Nombre del usuario */}
          <h2 className="text-white font-bold text-xs mt-0.5">
            {displayName}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default GreetingWidget;