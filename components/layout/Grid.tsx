import { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  className?: string;
}

export function Grid({ children, className = '' }: GridProps) {
  return (
    <div className={`grid-main ${className}`}>
      {children}
    </div>
  );
}
