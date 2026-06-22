// src/components/UI/DeviceInfo.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Smartphone, Monitor, Tablet, Laptop, Globe, Wifi, Clock } from 'lucide-react';

interface DeviceInfoProps {
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  lastActivity?: string;
  showBrowser?: boolean;
  showOs?: boolean;
  showIp?: boolean;
  showLocation?: boolean;
  showLastActivity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Mapeo de marcas a colores
const brandColors: Record<string, string> = {
  'Apple': '#A2AAAD',
  'Samsung': '#1428A0',
  'Xiaomi': '#FF6900',
  'POCO': '#FF6900',
  'OnePlus': '#EB0029',
  'Google': '#4285F4',
  'Huawei': '#FF0000',
  'Honor': '#005EFF',
  'Lenovo': '#E2231A',
  'Dell': '#007DB8',
  'HP': '#0096D6',
  'ASUS': '#005AA9',
  'Microsoft': '#F25022',
  'Motorola': '#5B5B5B',
  'Nokia': '#124191',
  'Sony': '#000000',
};

// Mapeo de marcas a nombres legibles

// Mapeo de marcas a emojis
const brandEmojis: Record<string, string> = {
  'Apple': '🍎',
  'Samsung': '📱',
  'Xiaomi': '📱',
  'POCO': '📱',
  'OnePlus': '📱',
  'Google': '🔍',
  'Huawei': '📱',
  'Honor': '📱',
  'Lenovo': '💻',
  'Dell': '💻',
  'HP': '💻',
  'ASUS': '💻',
  'Microsoft': '🪟',
  'Motorola': '📱',
  'Nokia': '📱',
  'Sony': '📱',
};

// Mapeo de tipos de dispositivo a iconos
const getDeviceIcon = (deviceType?: string, size: string = 'w-4 h-4') => {
  const type = deviceType?.toLowerCase() || '';
  
  if (type === 'mobile') return <Smartphone className={size} />;
  if (type === 'tablet') return <Tablet className={size} />;
  if (type === 'desktop') return <Monitor className={size} />;
  return <Laptop className={size} />;
};

const DeviceInfo: React.FC<DeviceInfoProps> = ({
  deviceType,
  deviceBrand,
  deviceModel,
  deviceName,
  browser,
  os,
  ipAddress,
  location,
  lastActivity,
  showBrowser = true,
  showOs = true,
  showIp = false,
  showLocation = false,
  showLastActivity = false,
  size = 'md',
  className = ''
}) => {
  const { colors } = useTheme();
  
  // Obtener el color de la marca
  const brandColor = deviceBrand ? brandColors[deviceBrand] : colors.primary;
  const brandEmoji = deviceBrand ? brandEmojis[deviceBrand] || '💻' : '💻';
  
  // Tamaños de texto
  const textSizes = {
    sm: {
      title: 'text-xs',
      detail: 'text-[10px]',
      icon: 'w-3 h-3',
      padding: 'p-1.5'
    },
    md: {
      title: 'text-sm',
      detail: 'text-xs',
      icon: 'w-4 h-4',
      padding: 'p-2'
    },
    lg: {
      title: 'text-base',
      detail: 'text-sm',
      icon: 'w-5 h-5',
      padding: 'p-2.5'
    }
  };
  
  const currentSize = textSizes[size];
  
  // Obtener nombre legible del dispositivo
  const getDeviceDisplayName = (): string => {
    if (deviceModel && deviceModel !== "Dispositivo Desconocido") {
      if (deviceBrand && deviceBrand !== "Desconocido") {
        return `${deviceBrand} ${deviceModel}`;
      }
      return deviceModel;
    }
    return deviceName || 'Dispositivo desconocido';
  };
  
  const deviceDisplayName = getDeviceDisplayName();
  
  // Formatear fecha si está presente
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Icono del dispositivo con color de marca */}
      <div 
        className={`rounded-xl ${currentSize.padding} flex items-center justify-center flex-shrink-0`}
        style={{ 
          backgroundColor: `${brandColor}15`,
          color: brandColor
        }}
      >
        {getDeviceIcon(deviceType, currentSize.icon)}
      </div>
      
      {/* Información del dispositivo */}
      <div className="flex-1 min-w-0">
        {/* Nombre del dispositivo */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base" style={{ fontSize: '1rem' }}>{brandEmoji}</span>
          <p className={`font-medium ${currentSize.title}`} style={{ color: colors.text }}>
            {deviceDisplayName}
          </p>
        </div>
        
        {/* Detalles de navegador y SO */}
        {(showBrowser || showOs) && (browser || os) && (
          <p className={`${currentSize.detail} mt-0.5`} style={{ color: colors.textSecondary }}>
            {showBrowser && browser && browser !== 'Unknown' && browser}
            {showBrowser && showOs && browser && os && ' • '}
            {showOs && os && os !== 'Unknown' && os}
          </p>
        )}
        
        {/* Dirección IP y ubicación */}
        {(showIp || showLocation) && (ipAddress || location) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {showIp && ipAddress && (
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" style={{ color: colors.textSecondary }} />
                <span className={`${currentSize.detail}`} style={{ color: colors.textSecondary }}>
                  {ipAddress}
                </span>
              </div>
            )}
            {showLocation && location && location !== 'Ubicación desconocida' && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" style={{ color: colors.textSecondary }} />
                <span className={`${currentSize.detail}`} style={{ color: colors.textSecondary }}>
                  {location}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Última actividad */}
        {showLastActivity && lastActivity && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" style={{ color: colors.textSecondary }} />
            <span className={`${currentSize.detail}`} style={{ color: colors.textSecondary }}>
              Última actividad: {formatDate(lastActivity)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceInfo;