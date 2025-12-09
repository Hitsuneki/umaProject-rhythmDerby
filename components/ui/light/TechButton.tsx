import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface TechButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
}

export function TechButton({ 
  variant = 'primary', 
  size = 'md',
  children, 
  icon,
  loading = false,
  className = '',
  ...props 
}: TechButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'bg-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 
        ${sizeClasses[size]} ${variantClasses[variant]} 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="w-4 h-4">{icon}</span>
      )}
      {children}
    </motion.button>
  );
}
