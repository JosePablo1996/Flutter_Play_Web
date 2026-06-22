import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface SecurityBadgeProps {
  status: 'success' | 'warning' | 'error' | 'pending';
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ status, text, size = 'sm' }) => {
  const { colors } = useTheme();
  
  const statusConfig = {
    success: { icon: CheckCircle, color: colors.success, bg: `${colors.success}15` },
    warning: { icon: AlertTriangle, color: colors.warning, bg: `${colors.warning}15` },
    error: { icon: XCircle, color: colors.error, bg: `${colors.error}15` },
    pending: { icon: Clock, color: colors.warning, bg: `${colors.warning}15` }
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  };
  
  const { icon: Icon, color, bg } = statusConfig[status];
  
  return (
    <div 
      className={`inline-flex items-center rounded-full ${sizes[size]}`}
      style={{ backgroundColor: bg, color }}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      <span>{text}</span>
    </div>
  );
};

export default SecurityBadge;