import { motion } from 'framer-motion';

interface TechToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function TechToggle({ checked, onChange, label, disabled = false }: TechToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={() => !disabled && onChange(!checked)}
        className={`
          tech-toggle w-12 h-6 rounded-full relative
          ${checked ? 'active' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        <motion.div
          animate={{
            x: checked ? 24 : 2,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="tech-toggle-thumb w-5 h-5 rounded-full absolute top-0.5"
        />
      </motion.button>
      {label && (
        <span className="tech-label text-gray-700">{label}</span>
      )}
    </div>
  );
}
}

export function TechToggle({ checked, onChange, label, disabled = false }: TechToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={() => !disabled && onChange(!checked)}
        className={`
          tech-toggle w-12 h-6 rounded-full relative
          ${checked ? 'active' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        <motion.div
          animate={{
            x: checked ? 24 : 2,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="tech-toggle-thumb w-5 h-5 rounded-full absolute top-0.5"
        />
      </motion.button>
      {label && (
        <span className="tech-label text-gray-700">{label}</span>
      )}
    </div>
  );
}
