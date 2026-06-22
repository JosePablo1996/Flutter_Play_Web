import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: { name: string; amount: number }[];
  color: string;
}

interface CustomTooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { colors } = useTheme();

  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg p-3 shadow-lg backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
          {label}
        </p>
        <p className="text-lg font-bold" style={{ color: colors.primary }}>
          ${(payload[0].value).toFixed(2)}
        </p>
      </motion.div>
    );
  }
  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ data, color }) => {
  const { colors, isDark } = useTheme();

  // Mapeo de colores de Tailwind a colores del tema
  const getChartColor = () => {
    switch (color) {
      case '#FF1744':
        return colors.error;
      case '#00E676':
        return colors.success;
      case '#2979FF':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const chartColor = getChartColor();

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          No hay datos para mostrar
        </p>
        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          Agrega algunos gastos para ver tu tendencia
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#333333' : '#e0e0e0'} 
          />
          <XAxis 
            dataKey="name" 
            stroke={colors.textSecondary}
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            tickLine={{ stroke: colors.textSecondary }}
          />
          <YAxis 
            stroke={colors.textSecondary}
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            tickLine={{ stroke: colors.textSecondary }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColor, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={chartColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
            activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2, fill: colors.surface }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TrendChart;