import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Tablet, 
  Globe, 
  X,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { LoginHistory } from '../../services/sessionService';

interface AccessHistoryDetailProps {
  entry: LoginHistory | null;
  onClose: () => void;
}

const AccessHistoryDetail: React.FC<AccessHistoryDetailProps> = ({ entry, onClose }) => {
  const { colors } = useTheme();
  
  if (!entry) return null;
  
  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type === 'mobile') return <Smartphone className="w-12 h-12" />;
    if (type === 'tablet') return <Tablet className="w-12 h-12" />;
    if (type === 'laptop') return <Laptop className="w-12 h-12" />;
    if (type === 'desktop') return <Monitor className="w-12 h-12" />;
    return <Globe className="w-12 h-12" />;
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />;
    if (status === 'failed') return <XCircle className="w-5 h-5" style={{ color: colors.error }} />;
    return <Clock className="w-5 h-5" style={{ color: colors.warning }} />;
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  const getStatusText = (status: string) => {
    if (status === 'success') return 'Exitoso';
    if (status === 'failed') return 'Fallido';
    return 'Pendiente';
  };
  
  const detailSections = [
    { label: 'Tipo de acceso', value: getLoginTypeText(entry.login_type), icon: null },
    { label: 'Dispositivo', value: entry.device_name || 'Desconocido', icon: null },
    { label: 'Tipo de dispositivo', value: entry.device_type || 'Desconocido', icon: null },
    { label: 'Navegador', value: entry.browser || 'Desconocido', icon: null },
    { label: 'Sistema operativo', value: entry.os || 'Desconocido', icon: null },
    { label: 'Dirección IP', value: entry.ip_address || 'Desconocida', icon: null },
    { label: 'Ubicación', value: entry.location || 'No disponible', icon: null },
    { label: 'Estado', value: getStatusText(entry.status), icon: getStatusIcon(entry.status) },
    { label: 'Fecha y hora', value: new Date(entry.created_at).toLocaleString(), icon: null },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                {getDeviceIcon(entry.device_type)}
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: colors.text }}>Detalle del acceso</h2>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Información completa del dispositivo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {detailSections.map((section, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
                <span className="text-sm" style={{ color: colors.textSecondary }}>{section.label}</span>
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="text-sm font-medium" style={{ color: colors.text }}>{section.value}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessHistoryDetail;