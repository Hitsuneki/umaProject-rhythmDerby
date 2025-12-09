import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface NotificationToastProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
}

export function NotificationToastLight({
  type,
  title,
  message,
  isVisible,
  onClose
}: NotificationToastProps) {
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: 'border-green-500 text-green-700 bg-green-50',
    warning: 'border-yellow-500 text-yellow-700 bg-yellow-50',
    error: 'border-red-500 text-red-700 bg-red-50',
    info: 'border-blue-500 text-blue-700 bg-blue-50',
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
            bg-white border shadow-lg p-4 min-w-80 border-l-4 ${colors[type]}
            animate-slide-in-right
          `}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${colors[type]}`} />
            <div className="flex-1">
              <h4 className="display-font text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h4>
              {message && (
                <p className="text-sm text-gray-600">{message}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
