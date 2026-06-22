import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { sessionService, type LoginHistory } from '../services/sessionService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  History, 
  Calendar, 
  Filter, 
  Download,
  RefreshCw,
  Smartphone,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Fingerprint
} from 'lucide-react';
import DeviceInfo from '../components/UI/DeviceInfo';

// ============================================
// COMPONENTES INTERNOS
// ============================================

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
    { label: 'Accesos última semana', value: stats.lastWeek, icon: <Calendar className="w-5 h-5" />, color: colors.primary },
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

interface AccessHistoryFiltersProps {
  filters: {
    type: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

const AccessHistoryFilters: React.FC<AccessHistoryFiltersProps> = ({ filters, onFilterChange, onReset, onApply }) => {
  const { colors } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  
  const loginTypes = [
    { value: 'all', label: 'Todos', icon: null },
    { value: 'password', label: 'Contraseña', icon: null },
    { value: 'otp', label: 'Código OTP', icon: null },
    { value: 'passkey', label: 'Passkey', icon: <Fingerprint className="w-4 h-4" /> },
    { value: '2fa', label: 'Autenticación 2FA', icon: <Shield className="w-4 h-4" /> },
    { value: '2fa_pending', label: '2FA Pendiente', icon: null }
  ];
  
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'success', label: 'Exitosos' },
    { value: 'failed', label: 'Fallidos' },
    { value: 'pending', label: 'Pendientes' }
  ];
  
  const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';
  
  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-3"
        style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
        )}
      </button>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 overflow-hidden"
            style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Tipo de login
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => onFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  {loginTypes.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textSecondary }}>
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.text }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              >
                Limpiar
              </button>
              <button
                onClick={onApply}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Aplicar filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccessHistoryTableProps {
  entries: LoginHistory[];
  loading: boolean;
  onViewDetail: (entry: LoginHistory) => void;
}

const AccessHistoryTable: React.FC<AccessHistoryTableProps> = ({ entries, loading, onViewDetail }) => {
  const { colors } = useTheme();
  
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>Éxito</span>;
    }
    if (status === 'failed') {
      return <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.error}20`, color: colors.error }}>Fallido</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}>Pendiente</span>;
  };
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === 'passkey') return 'Passkey';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: colors.primary }} />
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
                <span className="text-sm flex items-center gap-1" style={{ color: colors.text }}>
                  {entry.login_type === 'passkey' && <Fingerprint className="w-3 h-3" />}
                  {getLoginTypeText(entry.login_type)}
                </span>
              </td>
              <td className="py-3 px-4">
                <DeviceInfo
                  deviceType={entry.device_type}
                  deviceBrand={entry.device_brand}
                  deviceModel={entry.device_model}
                  deviceName={entry.device_name}
                  browser={entry.browser}
                  os={entry.os}
                  showBrowser={true}
                  showOs={true}
                  showIp={false}
                  showLastActivity={false}
                  size="sm"
                />
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

interface AccessHistoryDetailProps {
  entry: LoginHistory | null;
  onClose: () => void;
}

const AccessHistoryDetail: React.FC<AccessHistoryDetailProps> = ({ entry, onClose }) => {
  const { colors } = useTheme();
  
  if (!entry) return null;
  
  const getLoginTypeText = (loginType: string) => {
    if (loginType === 'password') return 'Contraseña';
    if (loginType === 'otp') return 'Código OTP';
    if (loginType === 'passkey') return 'Passkey (Biométrico)';
    if (loginType === '2fa') return 'Autenticación 2FA';
    if (loginType === '2fa_pending') return '2FA Pendiente';
    return loginType;
  };
  
  const getStatusText = (status: string) => {
    if (status === 'success') return 'Exitoso';
    if (status === 'failed') return 'Fallido';
    return 'Pendiente';
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'success') return colors.success;
    if (status === 'failed') return colors.error;
    return colors.warning;
  };
  
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
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Tipo de acceso */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Tipo de acceso</span>
              <span className="text-sm font-medium" style={{ color: colors.primary }}>
                {getLoginTypeText(entry.login_type)}
              </span>
            </div>
            
            {/* DeviceInfo completo */}
            <div className="py-2 border-b" style={{ borderColor: colors.border }}>
              <DeviceInfo
                deviceType={entry.device_type}
                deviceBrand={entry.device_brand}
                deviceModel={entry.device_model}
                deviceName={entry.device_name}
                browser={entry.browser}
                os={entry.os}
                ipAddress={entry.ip_address}
                location={entry.location}
                lastActivity={entry.created_at}
                showBrowser={true}
                showOs={true}
                showIp={true}
                showLocation={true}
                showLastActivity={true}
                size="md"
              />
            </div>
            
            {/* Estado */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Estado</span>
              <span className="text-sm font-medium" style={{ color: getStatusColor(entry.status) }}>
                {getStatusText(entry.status)}
              </span>
            </div>
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

// ============================================
// PÁGINA PRINCIPAL
// ============================================

const AccessHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { showError } = useNotification();
  
  const [entries, setEntries] = useState<LoginHistory[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<LoginHistory | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    uniqueDevices: 0,
    successRate: 0,
    lastWeek: 0,
    mostUsedDevice: ''
  });
  
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  // ✅ CORRECCIÓN: Calcular estadísticas agrupando por tipo de dispositivo + SO
  const calculateStats = useCallback((data: LoginHistory[]) => {
    const total = data.length;
    const successCount = data.filter(e => e.status === 'success').length;
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    
    // ✅ Agrupar por combinación de device_type + os (ignorar navegador y método de login)
    const uniqueDeviceKeys = new Set<string>();
    
    data.forEach(e => {
      const deviceKey = `${e.device_type || 'unknown'}|${e.os || 'unknown'}`;
      uniqueDeviceKeys.add(deviceKey);
    });
    
    const uniqueDevices = uniqueDeviceKeys.size;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeek = data.filter(e => new Date(e.created_at) >= weekAgo).length;
    
    // Contar dispositivo más usado
    const deviceCount: Record<string, number> = {};
    data.forEach(e => {
      const deviceKey = `${e.device_type || 'unknown'}|${e.os || 'unknown'}`;
      deviceCount[deviceKey] = (deviceCount[deviceKey] || 0) + 1;
    });
    
    let mostUsedDevice = 'N/A';
    let maxCount = 0;
    for (const [key, count] of Object.entries(deviceCount)) {
      if (count > maxCount) {
        maxCount = count;
        const parts = key.split('|');
        const deviceType = parts[0];
        const os = parts[1];
        if (deviceType === 'Desktop') {
          mostUsedDevice = `PC (${os})`;
        } else if (deviceType === 'Mobile') {
          mostUsedDevice = `Móvil (${os})`;
        } else if (deviceType === 'Tablet') {
          mostUsedDevice = `Tablet (${os})`;
        } else {
          mostUsedDevice = `${deviceType} (${os})`;
        }
      }
    }
    
    setStats({ total, uniqueDevices, successRate, lastWeek, mostUsedDevice });
  }, []);
  
  const applyFilters = useCallback((data: LoginHistory[], currentFilters: typeof filters) => {
    let filtered = [...data];
    
    if (currentFilters.type !== 'all') {
      filtered = filtered.filter(e => e.login_type === currentFilters.type);
    }
    
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(e => e.status === currentFilters.status);
    }
    
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      filtered = filtered.filter(e => new Date(e.created_at) >= fromDate);
    }
    
    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(e => new Date(e.created_at) <= toDate);
    }
    
    setFilteredEntries(filtered);
  }, []);
  
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionService.getLoginHistory(200, 0);
      setEntries(data);
      applyFilters(data, filters);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading access history:', error);
      showError('Error', 'No se pudo cargar el historial de accesos');
    } finally {
      setLoading(false);
    }
  }, [showError, applyFilters, filters, calculateStats]);
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApplyFilters = () => {
    applyFilters(entries, filters);
  };
  
  const handleResetFilters = () => {
    const resetFilters = { type: 'all', status: 'all', dateFrom: '', dateTo: '' };
    setFilters(resetFilters);
    setFilteredEntries(entries);
  };
  
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `accesos_${new Date().toISOString().slice(0, 19)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  useEffect(() => {
    const init = async () => {
      await loadHistory();
    };
    init();
  }, [loadHistory]);
  
  // Paginación
  const startIndex = (pagination.page - 1) * pagination.limit;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pagination.limit);
  const totalPages = Math.ceil(filteredEntries.length / pagination.limit);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="px-4 py-4 border-b sticky top-0 z-10" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: colors.textSecondary }}
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: colors.text }}>Historial de Accesos</h1>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Revisa todos los inicios de sesión en tu cuenta</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadHistory}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: colors.textSecondary }}
                title="Refrescar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: colors.textSecondary }}
                title="Exportar"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Estadísticas */}
          <AccessHistoryStats stats={stats} />
          
          {/* Filtros */}
          <AccessHistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
          
          {/* Tabla */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
            <AccessHistoryTable
              entries={paginatedEntries}
              loading={loading}
              onViewDetail={setSelectedEntry}
            />
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 border-t" style={{ borderColor: colors.border }}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg transition-colors disabled:opacity-50 hover:bg-white/10"
                  style={{ color: colors.textSecondary }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm" style={{ color: colors.text }}>
                  Página {pagination.page} de {totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={pagination.page === totalPages}
                  className="p-2 rounded-lg transition-colors disabled:opacity-50 hover:bg-white/10"
                  style={{ color: colors.textSecondary }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de detalles */}
      <AnimatePresence>
        {selectedEntry && (
          <AccessHistoryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccessHistoryPage;