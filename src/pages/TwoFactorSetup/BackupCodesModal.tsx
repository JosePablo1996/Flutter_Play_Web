import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Copy,
  Check,
  Download,
  X,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Printer
} from 'lucide-react';

interface BackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupCodes: string[];
  onRegenerate?: () => Promise<void>;
}

export const BackupCodesModal: React.FC<BackupCodesModalProps> = ({
  isOpen,
  onClose,
  backupCodes,
  onRegenerate
}) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!isOpen) return null;

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const downloadCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flutterplay_backup_codes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const codesHtml = backupCodes.map(code => `
      <div style="
        padding: 12px;
        margin: 8px;
        background: linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10);
        border-radius: 8px;
        font-family: monospace;
        font-size: 16px;
        letter-spacing: 2px;
        text-align: center;
        border: 1px solid ${colors.primary}30;
      ">
        ${code}
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Códigos de Respaldo - Flutter Play</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: ${colors.background};
            color: ${colors.text};
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 30px;
          }
          h1 {
            color: ${colors.primary};
            margin: 0 0 8px;
          }
          .warning {
            background: ${colors.error}10;
            border: 1px solid ${colors.error}30;
            border-radius: 8px;
            padding: 12px;
            margin: 20px 0;
            font-size: 12px;
            color: ${colors.error};
          }
          .codes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: ${colors.textSecondary};
            margin-top: 30px;
            border-top: 1px solid ${colors.border};
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐</div>
            <h1>Flutter Play</h1>
            <p>Códigos de Respaldo - 2FA</p>
          </div>
          <p><strong>📌 Guarda estos códigos en un lugar seguro</strong></p>
          <p>Cada código puede usarse una sola vez. Si pierdes acceso a tu app de autenticación, usa estos códigos para acceder a tu cuenta.</p>
          <div class="codes-grid">
            ${codesHtml}
          </div>
          <div class="warning">
            ⚠️ No compartas estos códigos con nadie. Cada código es de un solo uso.
          </div>
          <div class="footer">
            Generado el ${new Date().toLocaleString()}<br>
            Flutter Play - Mi Banca Universitaria
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    
    setRegenerating(true);
    try {
      await onRegenerate();
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Error al regenerar códigos:', error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.surface}cc, ${colors.surface}99)`,
              border: `1px solid ${colors.border}`,
              backdropFilter: 'blur(20px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-5 border-b" style={{ borderColor: colors.border }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.primary}20` }}>
                    <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: colors.text }}>Códigos de Respaldo</h2>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {backupCodes.length} códigos disponibles
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Advertencia */}
              <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}10`, border: `1px solid ${colors.primary}20` }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                  <div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>Importante</h3>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Guarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez.
                      Si pierdes acceso a Google Authenticator, estos códigos te permitirán acceder a tu cuenta.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón mostrar/ocultar códigos */}
              <button
                onClick={() => setShowCodes(!showCodes)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all mb-4"
                style={{
                  backgroundColor: `${colors.primary}10`,
                  border: `1px solid ${colors.primary}30`,
                  color: colors.primary
                }}
                aria-label={showCodes ? "Ocultar códigos" : "Mostrar códigos"}
                title={showCodes ? "Ocultar códigos" : "Mostrar códigos"}
              >
                {showCodes ? <EyeOff size={16} /> : <Eye size={16} />}
                {showCodes ? 'Ocultar códigos' : 'Mostrar códigos'}
              </button>

              {/* Grid de códigos */}
              <div
                className={`bg-black/30 rounded-xl border transition-all duration-300 overflow-hidden ${
                  showCodes ? '' : 'blur-sm select-none'
                }`}
                style={{ borderColor: `${colors.primary}30` }}
              >
                <div className="grid grid-cols-2 gap-2 p-4">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="py-2.5 px-3 bg-white/5 rounded-lg text-center font-mono text-sm tracking-wider"
                      style={{ color: colors.text, border: `1px solid ${colors.primary}20` }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {!showCodes && backupCodes.length > 0 && (
                <p className="text-xs text-center mt-2" style={{ color: colors.textSecondary }}>
                  Haz clic en "Mostrar códigos" para verlos
                </p>
              )}

              {/* Acciones */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={copyCodes}
                  disabled={backupCodes.length === 0}
                  className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition disabled:opacity-50"
                  style={{
                    color: colors.primary,
                    border: `1px solid ${colors.primary}50`,
                    backgroundColor: `${colors.primary}08`
                  }}
                  aria-label="Copiar todos los códigos"
                  title="Copiar todos los códigos"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '¡Copiado!' : 'Copiar todos'}
                </button>
                <button
                  onClick={downloadCodes}
                  disabled={backupCodes.length === 0}
                  className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition disabled:opacity-50"
                  style={{
                    color: colors.primary,
                    border: `1px solid ${colors.primary}50`,
                    backgroundColor: `${colors.primary}08`
                  }}
                  aria-label="Descargar códigos"
                  title="Descargar códigos"
                >
                  <Download size={14} />
                  Descargar
                </button>
                <button
                  onClick={printCodes}
                  disabled={backupCodes.length === 0}
                  className="flex-1 text-xs font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition disabled:opacity-50"
                  style={{
                    color: colors.primary,
                    border: `1px solid ${colors.primary}50`,
                    backgroundColor: `${colors.primary}08`
                  }}
                  aria-label="Imprimir códigos"
                  title="Imprimir códigos"
                >
                  <Printer size={14} />
                  Imprimir
                </button>
              </div>

              {/* Regenerar códigos */}
              {onRegenerate && (
                <div className="mt-5 pt-4 border-t" style={{ borderColor: colors.border }}>
                  {!showRegenerateConfirm ? (
                    <button
                      onClick={() => setShowRegenerateConfirm(true)}
                      className="w-full text-xs font-medium flex items-center justify-center gap-2 py-2.5 rounded-lg transition"
                      style={{
                        color: colors.error,
                        border: `1px solid ${colors.error}50`,
                        backgroundColor: `${colors.error}08`
                      }}
                      aria-label="Regenerar códigos"
                      title="Regenerar códigos"
                    >
                      <RefreshCw size={14} />
                      Regenerar códigos
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor: `${colors.error}10`,
                          border: `1px solid ${colors.error}30`
                        }}
                      >
                        <p className="text-xs flex items-start gap-2" style={{ color: colors.error }}>
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>
                            Los códigos anteriores dejarán de funcionar. Asegúrate de guardar los nuevos códigos.
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRegenerateConfirm(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition"
                          style={{
                            border: `1px solid ${colors.primary}30`,
                            color: colors.primary
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleRegenerate}
                          disabled={regenerating}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
                          style={{
                            background: `linear-gradient(135deg, ${colors.error}, ${colors.error}dd)`,
                            color: 'white'
                          }}
                        >
                          {regenerating ? 'Regenerando...' : 'Sí, regenerar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BackupCodesModal;