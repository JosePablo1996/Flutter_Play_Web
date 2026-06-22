import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Smartphone, 
  Monitor, 
  Laptop, 
  Tablet, 
  Globe, 
  Eye,
  History,
  Loader2
} from 'lucide-react';
import type { LoginHistory } from '../../services/sessionService';

interface AccessHistoryTableProps {
  entries: LoginHistory[];
  loading: boolean;
  onViewDetail: (entry: LoginHistory) => void;
}

const AccessHistoryTable: React.FC<AccessHistoryTableProps> = ({ entries, loading, onViewDetail }) => {
  const { colors } = useTheme();
  
  const getDeviceIcon = (deviceType?: string) => {
    const type = deviceType?.toLowerCase() || '';
    if (type === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (type === 'tablet') return <Tablet className="w-4 h-4" />;
    if (type === 'laptop') return <Laptop className="w-4 h-4" />;
    if (type === 'desktop') return <Monitor className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };
  
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
          Éxito
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.error}20`, color: colors.error }}>
          Fallido
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}>
        Pendiente
      </span>
    );
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: colors.primary }} />
        <p className="text-sm mt-4" style={{ color: colors.textSecondary }}>Cargando historial...</p>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 mx-auto opacity-50" style={{ color: colors.textSecondary }} />
        <p className="text-sm mt-4" style={{ color: colors.textSecondary }}>No hay registros de acceso</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <th className="text-left py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>Fecha y hora</th>
            <th className="text-left py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>Tipo</th>
            <th className="text-left py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>Dispositivo</th>
            <th className="text-left py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>IP</th>
            <th className="text-left py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>Estado</th>
            <th className="text-center py-3 px-4 text-xs font-medium" style={{ color: colors.textSecondary }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td className="py-3 px-4 text-sm" style={{ color: colors.text }}>
                {new Date(entry.created_at).toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <span className="text-sm" style={{ color: colors.text }}>
                  {getLoginTypeText(entry.login_type)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(entry.device_type)}
                  <span className="text-sm" style={{ color: colors.text }}>
                    {entry.device_name || 'Desconocido'}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <code className="text-xs" style={{ color: colors.textSecondary }}>{entry.ip_address || 'N/A'}</code>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(entry.status)}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onViewDetail(entry)}
                  className="p-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: colors.primary }}
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessHistoryTable;