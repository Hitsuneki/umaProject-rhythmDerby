import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TechButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TechButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className = ''
}: TechButtonProps) {
  const baseClasses = "font-mono font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-transparent hover:bg-cyan-50 text-cyan-600 border-2 border-cyan-600 hover:border-cyan-700",
    ghost: "bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400"
  };

  const sizeClasses = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-4 text-sm",
    lg: "py-4 px-6 text-base"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </motion.button>
  );
}
