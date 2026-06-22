import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Key, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ChevronRight,
  Filter,
  Fingerprint
} from 'lucide-react';
import type { LoginHistory } from '../../services/sessionService';
import DeviceInfo from '../../components/UI/DeviceInfo';

interface LoginHistoryTabProps {
  loginHistory: LoginHistory[];
  loadingLoginHistory: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const LoginHistoryTab: React.FC<LoginHistoryTabProps> = ({
  loginHistory,
  loadingLoginHistory,
  onLoadMore,
  hasMore
}) => {
  const { colors } = useTheme();
  const [filterType, setFilterType] = useState<string>('all');
  
  const getLoginIcon = (loginType: string) => {
    if (loginType === 'password') return <Key className="w-4 h-4" style={{ color: colors.primary }} />;
    if (loginType === 'otp') return <Smartphone className="w-4 h-4" style={{ color: colors.primary }} />;
    if (loginType === 'passkey') return <Fingerprint className="w-4 h-4" style={{ color: colors.primary }} />;
    if (loginType === '2fa') return <Shield className="w-4 h-4" style={{ color: colors.success }} />;
    return <Key className="w-4 h-4" style={{ color: colors.primary }} />;
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === 'passkey') return 'Passkey (Biométrico)';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  const filteredHistory = filterType === 'all' 
    ? loginHistory 
    : loginHistory.filter(item => item.login_type === filterType);
  
  const filterOptions = [
    { value: 'all', label: 'Todos', icon: null },
    { value: 'password', label: 'Contraseña', icon: <Key className="w-3 h-3" /> },
    { value: 'otp', label: 'OTP', icon: <Smartphone className="w-3 h-3" /> },
    { value: 'passkey', label: 'Passkey', icon: <Fingerprint className="w-3 h-3" /> },
    { value: '2fa', label: '2FA', icon: <Shield className="w-3 h-3" /> }
  ];
  
  return (
    <div className="p-4">
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
      >
        {/* Filtros */}
        <div className="px-4 py-3 border-b flex items-center gap-2 overflow-x-auto" style={{ borderColor: colors.border }}>
          <Filter className="w-4 h-4" style={{ color: colors.textSecondary }} />
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value)}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap flex items-center gap-1 ${
                filterType === option.value 
                  ? 'bg-white/10 font-medium' 
                  : 'hover:bg-white/5'
              }`}
              style={{ 
                color: filterType === option.value ? colors.primary : colors.textSecondary,
                backgroundColor: filterType === option.value ? `${colors.primary}20` : 'transparent'
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
        
        {loadingLoginHistory ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: colors.primary }} />
            <p className="text-sm mt-3" style={{ color: colors.textSecondary }}>Cargando historial...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: colors.textSecondary }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {filterType !== 'all' 
                ? `No hay registros de tipo "${getLoginTypeText(filterType)}"` 
                : 'No hay inicios de sesión registrados'}
            </p>
            {filterType !== 'all' && (
              <button
                onClick={() => setFilterType('all')}
                className="text-xs mt-2 underline"
                style={{ color: colors.primary }}
              >
                Ver todos los tipos
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredHistory.map((login) => (
              <div key={login.id} className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: colors.border }}>
                {/* Icono del tipo de login */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                  {getLoginIcon(login.login_type)}
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  {/* Tipo de login y estado */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium" style={{ color: colors.text }}>
                      {getLoginTypeText(login.login_type)}
                    </p>
                    {login.status === 'success' ? (
                      <CheckCircle className="w-3 h-3" style={{ color: colors.success }} />
                    ) : login.status === 'pending' ? (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}>
                        Pendiente
                      </span>
                    ) : (
                      <XCircle className="w-3 h-3" style={{ color: colors.error }} />
                    )}
                  </div>
                  
                  {/* DeviceInfo muestra: icono con color de marca, nombre del dispositivo, navegador, SO, IP y fecha */}
                  <DeviceInfo
                    deviceType={login.device_type}
                    deviceBrand={login.device_brand}
                    deviceModel={login.device_model}
                    deviceName={login.device_name}
                    browser={login.browser}
                    os={login.os}
                    ipAddress={login.ip_address}
                    lastActivity={login.created_at}
                    showBrowser={true}
                    showOs={true}
                    showIp={true}
                    showLastActivity={true}
                    size="sm"
                  />
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button
                onClick={onLoadMore}
                className="w-full px-4 py-3 text-center text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                style={{ color: colors.primary }}
              >
                Ver más
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryTab;