// src/components/UI/DeviceIcon.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Laptop} from 'lucide-react';

interface DeviceIconProps {
  deviceType?: string;
  deviceBrand?: string;
  size?: number;
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
const brandNames: Record<string, string> = {
  'Apple': 'Apple',
  'Samsung': 'Samsung',
  'Xiaomi': 'Xiaomi',
  'POCO': 'POCO',
  'OnePlus': 'OnePlus',
  'Google': 'Google',
  'Huawei': 'Huawei',
  'Honor': 'Honor',
  'Lenovo': 'Lenovo',
  'Dell': 'Dell',
  'HP': 'HP',
  'ASUS': 'ASUS',
  'Microsoft': 'Microsoft',
  'Motorola': 'Motorola',
  'Nokia': 'Nokia',
  'Sony': 'Sony',
};

const DeviceIcon: React.FC<DeviceIconProps> = ({ 
  deviceType, 
  deviceBrand, 
  size = 5,
  className = ''
}) => {
  const { colors } = useTheme();
  
  // Obtener el color de la marca o usar color primario del tema
  const brandColor = deviceBrand ? brandColors[deviceBrand] : colors.primary;
  const brandName = deviceBrand ? brandNames[deviceBrand] || deviceBrand : 'Dispositivo';
  
  // Obtener el icono según el tipo de dispositivo
  const getIcon = () => {
    const iconSize = size === 5 ? 'w-5 h-5' : 
                     size === 4 ? 'w-4 h-4' : 
                     size === 6 ? 'w-6 h-6' : 
                     `w-${size} h-${size}`;
    
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className={iconSize} />;
      case 'tablet':
        return <Tablet className={iconSize} />;
      case 'desktop':
        return <Monitor className={iconSize} />;
      case 'laptop':
        return <Laptop className={iconSize} />;
      default:
        return <Laptop className={iconSize} />;
    }
  };
  
  // Si hay marca, mostrar el icono con el color de la marca
  if (deviceBrand && brandColors[deviceBrand]) {
    return (
      <div 
        className={`flex items-center justify-center rounded-xl ${className}`}
        style={{ 
          backgroundColor: `${brandColor}15`,
          color: brandColor
        }}
        title={brandName}
      >
        {getIcon()}
      </div>
    );
  }
  
  // Si no hay marca, mostrar icono genérico con color de tema
  return (
    <div 
      className={`flex items-center justify-center rounded-xl ${className}`}
      style={{ 
        backgroundColor: `${colors.primary}15`,
        color: colors.primary
      }}
      title="Dispositivo"
    >
      {getIcon()}
    </div>
  );
};

export default DeviceIcon;