import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Activity, Smartphone, Shield, Calendar } from 'lucide-react';

interface AccessHistoryStatsProps {
  stats: {
    total: number;
    uniqueDevices: number;
    successRate: number;
    lastWeek: number;
    mostUsedDevice: string;
  };
}

const AccessHistoryStats: React.FC<AccessHistoryStatsProps> = ({ stats }) => {
  const { colors } = useTheme();
  
  const statCards = [
    { label: 'Total accesos', value: stats.total, icon: <Activity className="w-5 h-5" />, color: colors.primary },
    { label: 'Dispositivos únicos', value: stats.uniqueDevices, icon: <Smartphone className="w-5 h-5" />, color: colors.success },
    { label: 'Tasa de éxito', value: `${stats.successRate}%`, icon: <Shield className="w-5 h-5" />, color: stats.successRate > 90 ? colors.success : colors.warning },
    { label: 'Accesos última semana', value: stats.lastWeek, icon: <Calendar className="w-5 h-5" />, color: colors.info || colors.primary },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl p-4"
          style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.text }}>{card.value}</p>
          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AccessHistoryStats;