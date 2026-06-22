import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import type { SecurityChange } from '../../services/sessionService';

interface SecurityChangesTabProps {
  securityChanges: SecurityChange[];
  loadingSecurityChanges: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const SecurityChangesTab: React.FC<SecurityChangesTabProps> = ({
  securityChanges,
  loadingSecurityChanges,
  onLoadMore,
  hasMore
}) => {
  const { colors } = useTheme();
  const [filterType, setFilterType] = useState<string>('all');
  
  // Calcular tiempo del último cambio usando useMemo
  const lastChangeTimeAgo = useMemo(() => {
    if (securityChanges.length === 0) return null;
    
    const lastChangeDate = new Date(securityChanges[0].created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastChangeDate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'hace menos de un minuto';
    if (diffMinutes === 1) return 'hace 1 minuto';
    if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
    if (diffMinutes < 120) return 'hace 1 hora';
    if (diffMinutes < 1440) return `hace ${Math.floor(diffMinutes / 60)} horas`;
    return `hace ${Math.floor(diffMinutes / 1440)} días`;
  }, [securityChanges]);
  
  const getChangeIcon = (changeType: string) => {
    if (changeType === 'password_change' || changeType === 'password_reset') {
      return <Key className="w-4 h-4" style={{ color: colors.warning }} />;
    }
    if (changeType === '2fa_enable') {
      return <Smartphone className="w-4 h-4" style={{ color: colors.success }} />;
    }
    if (changeType === '2fa_disable') {
      return <Smartphone className="w-4 h-4" style={{ color: colors.error }} />;
    }
    return <Shield className="w-4 h-4" style={{ color: colors.primary }} />;
  };
  
  const getChangeTypeText = (changeType: string) => {
    if (changeType === 'password_change') return 'Cambio de contraseña';
    if (changeType === 'password_reset') return 'Recuperación de contraseña';
    if (changeType === '2fa_enable') return 'Activación de 2FA';
    if (changeType === '2fa_disable') return 'Desactivación de 2FA';
    return changeType.replace(/_/g, ' ');
  };
  
  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'password_change', label: 'Cambio de contraseña' },
    { value: '2fa_enable', label: 'Activación 2FA' },
    { value: '2fa_disable', label: 'Desactivación 2FA' }
  ];
  
  const filteredChanges = filterType === 'all' 
    ? securityChanges 
    : securityChanges.filter(item => item.change_type === filterType);
  
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
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                filterType === option.value 
                  ? 'bg-white/10 font-medium' 
                  : 'hover:bg-white/5'
              }`}
              style={{ 
                color: filterType === option.value ? colors.primary : colors.textSecondary,
                backgroundColor: filterType === option.value ? `${colors.primary}20` : 'transparent'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {loadingSecurityChanges ? (
          <div className="px-4 py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: colors.primary }} />
            <p className="text-sm mt-3" style={{ color: colors.textSecondary }}>Cargando cambios de seguridad...</p>
          </div>
        ) : filteredChanges.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: colors.textSecondary }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>No hay cambios de seguridad registrados</p>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Los cambios de contraseña y configuración 2FA aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            {filteredChanges.map((change) => (
              <div key={change.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0" style={{ borderColor: colors.border }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.warning}15` }}>
                  {getChangeIcon(change.change_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: colors.text }}>
                      {getChangeTypeText(change.change_type)}
                    </p>
                    {change.status === 'success' ? (
                      <CheckCircle className="w-3 h-3" style={{ color: colors.success }} />
                    ) : (
                      <XCircle className="w-3 h-3" style={{ color: colors.error }} />
                    )}
                  </div>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    IP: {change.ip_address || 'IP desconocida'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    {new Date(change.created_at).toLocaleString()}
                  </p>
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
      
      {/* Alerta en tiempo real */}
      {securityChanges.length > 0 && lastChangeTimeAgo && (
        <div 
          className="mt-4 rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: `${colors.warning}10`, border: `1px solid ${colors.warning}30` }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: colors.warning }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: colors.warning }}>Cambio reciente detectado</p>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Hubo un cambio de seguridad {lastChangeTimeAgo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityChangesTab;