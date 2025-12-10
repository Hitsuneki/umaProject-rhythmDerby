import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ActivityLogProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  data: Record<string, string | number>;
  gains?: Record<string, string>;
  delay?: number;
}

export function ActivityLog({
  title,
  icon,
  iconColor = 'text-cyan-600',
  data,
  gains,
  delay = 0
}: ActivityLogProps) {
  return (
    <motion.div 
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-4 h-4 ${iconColor}`}>{icon}</span>
        <p className="font-mono text-xs font-bold uppercase tracking-wide text-gray-700">
          [LOG] {title}
        </p>
      </div>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-600 uppercase">{key}:</span>
            <span className={`font-mono text-xs font-bold uppercase ${
              key === 'RESULT' && value === 'SUCCESS' ? 'text-green-600' :
              key === 'RESULT' && value !== 'SUCCESS' ? 'text-red-600' :
              key === 'PLACEMENT' ? 'text-orange-600' :
              'text-gray-900'
            }`}>
              {value}
            </span>
          </div>
        ))}
        
        {gains && (
          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(gains).map(([stat, gain]) => (
                <div key={stat}>
                  <p className={`font-mono text-xs font-bold ${
                    stat === 'speed' ? 'text-cyan-600' :
                    stat === 'stamina' ? 'text-green-600' :
                    'text-orange-600'
                  }`}>
                    {gain}
                  </p>
                  <p className="font-mono text-xs text-gray-500 uppercase">
                    {stat.substring(0, 3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
