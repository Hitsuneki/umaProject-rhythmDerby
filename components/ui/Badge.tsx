import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default',
  className = '' 
}: BadgeProps) {
  const variantClasses = {
    default: 'badge-default',
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}