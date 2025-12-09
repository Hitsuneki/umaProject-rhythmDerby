import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({
  type,
  title,
  message,
  isVisible,
  onClose
}: ToastProps) {
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: 'border-green-500 bg-green-50 text-green-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    info: 'border-cyan-500 bg-cyan-50 text-cyan-800',
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-cyan-600',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          className={`
            min-w-80 p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm
            ${colors[type]}
          `}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${iconColors[type]}`} />
            <div className="flex-1">
              <h4 className="text-display text-sm font-semibold mb-1">
                {title}
              </h4>
              {message && (
                <p className="text-sm opacity-90">{message}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
