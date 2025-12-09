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

export function NotificationToast({
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
    success: 'border-(--accent-success) text-(--accent-success)',
    warning: 'border-(--accent-warning) text-(--accent-warning)',
    error: 'border-(--accent-danger) text-(--accent-danger)',
    info: 'border-(--accent-primary) text-(--accent-primary)',
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
            hud-element p-4 min-w-80 border-l-4 ${colors[type]}
            animate-slide-in-right
          `}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${colors[type]}`} />
            <div className="flex-1">
              <h4 className="display-font text-sm font-semibold text-(--text-primary) mb-1">
                {title}
              </h4>
              {message && (
                <p className="text-sm text-(--text-secondary)">{message}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
