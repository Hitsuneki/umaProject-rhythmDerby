import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-(--grey-light) text-(--charcoal) border-(--border)',
    accent: 'bg-(--accent)/10 text-(--accent) border-(--accent)/30',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-display uppercase tracking-wide ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}