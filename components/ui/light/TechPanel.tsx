import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TechPanelProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  title?: string;
  subtitle?: string;
  coordinates?: string;
  className?: string;
}

export function TechPanel({ 
  children, 
  variant = 'primary',
  title,
  subtitle,
  coordinates,
  className = '' 
}: TechPanelProps) {
  const variantClasses = {
    primary: 'panel-primary',
    secondary: 'panel-secondary',
    accent: 'panel-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variantClasses[variant]} ${className}`}
    >
      {(title || coordinates) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            {title && (
              <h3 className="display-font text-lg text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="tech-label mt-1 text-gray-600">{subtitle}</p>
            )}
          </div>
          {coordinates && (
            <span className="coordinate-marker text-gray-500">{coordinates}</span>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
