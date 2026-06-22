import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  AlertTriangle, 
  LogOut, 
  Trash2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface DangerTabProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
  isLoggingOut: boolean;
}

const DangerTab: React.FC<DangerTabProps> = ({
  onLogout,
  onDeleteAccount,
  isLoggingOut
}) => {
  const { colors } = useTheme();
  
  return (
    <div className="p-4">
      {/* Advertencia */}
      <div 
        className="rounded-xl p-4 mb-4 text-center"
        style={{ 
          backgroundColor: `${colors.error}10`, 
          border: `1px solid ${colors.error}30`
        }}
      >
        <ShieldAlert className="w-12 h-12 mx-auto mb-3" style={{ color: colors.error }} />
        <p className="text-sm font-medium mb-1" style={{ color: colors.error }}>
          ¡Cuidado! Acciones irreversibles
        </p>
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          Las siguientes acciones son permanentes y no se pueden deshacer
        </p>
      </div>
      
      {/* Botones de acciones peligrosas */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ 
          backgroundColor: `${colors.surface}cc`,
          border: `1px solid ${colors.error}30` 
        }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
          <p className="text-xs font-semibold flex items-center gap-1" style={{ color: colors.error }}>
            <AlertTriangle className="w-3 h-3" />
            ZONA PELIGROSA
          </p>
        </div>
        
        {/* Cerrar sesión */}
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors group disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
            <LogOut className="w-5 h-5" style={{ color: colors.error }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium" style={{ color: colors.error }}>Cerrar sesión</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              Finalizar sesión en este dispositivo
            </p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </button>
        
        {/* Eliminar cuenta */}
        <button
          onClick={onDeleteAccount}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors group border-t" 
          style={{ borderColor: colors.border }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.error}20` }}>
            <Trash2 className="w-5 h-5" style={{ color: colors.error }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium" style={{ color: colors.error }}>Eliminar cuenta</p>
            <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
              Eliminar permanentemente tu cuenta y todos tus datos
            </p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </button>
      </div>
      
      {/* Información adicional */}
      <div 
        className="mt-4 rounded-xl p-3 text-center"
        style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
      >
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          Al eliminar tu cuenta, se borrarán todos tus datos de forma permanente.
          Esta acción no se puede deshacer.
        </p>
      </div>
    </div>
  );
};

export default DangerTab;