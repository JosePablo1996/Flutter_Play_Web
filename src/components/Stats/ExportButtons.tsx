import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileJson, Check, AlertCircle } from 'lucide-react';
import * as Papa from 'papaparse';

// Definir el tipo para los datos exportables
interface ExportableData {
  [key: string]: string | number | boolean;
}

interface ExportButtonsProps {
  data: ExportableData[];
  filename: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, filename }) => {
  const { colors } = useTheme();
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showTemporaryMessage = (type: 'success' | 'error', message?: string) => {
    if (type === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(message || 'Error al exportar');
      setTimeout(() => setError(null), 3000);
    }
  };

  const exportToCSV = async () => {
    if (data.length === 0) {
      showTemporaryMessage('error', 'No hay datos para exportar');
      return;
    }

    setExporting('csv');
    try {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showTemporaryMessage('success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showTemporaryMessage('error', 'Error al exportar CSV');
    } finally {
      setExporting(null);
    }
  };

  const exportToJSON = async () => {
    if (data.length === 0) {
      showTemporaryMessage('error', 'No hay datos para exportar');
      return;
    }

    setExporting('json');
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `${filename}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showTemporaryMessage('success');
    } catch (err) {
      console.error('Error exporting JSON:', err);
      showTemporaryMessage('error', 'Error al exportar JSON');
    } finally {
      setExporting(null);
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-2"
      >
        {/* Botón CSV */}
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={exportToCSV}
          disabled={exporting !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: `${colors.success}15`,
            border: `1px solid ${colors.success}30`,
            color: colors.success,
          }}
          title="Exportar a CSV"
          aria-label="Exportar a CSV"
        >
          {exporting === 'csv' ? (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.success }} />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          CSV
        </motion.button>

        {/* Botón JSON */}
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={exportToJSON}
          disabled={exporting !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: `${colors.info}15`,
            border: `1px solid ${colors.info}30`,
            color: colors.info,
          }}
          title="Exportar a JSON"
          aria-label="Exportar a JSON"
        >
          {exporting === 'json' ? (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.info }} />
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          JSON
        </motion.button>
      </motion.div>

      {/* Mensaje de éxito temporal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.success}30`,
              color: colors.success,
            }}
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">Exportado correctamente</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de error temporal */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-xl"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.error}30`,
              color: colors.error,
            }}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExportButtons;