import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Section({ children, title, subtitle, className = '' }: SectionProps) {
  return (
    <section className={`section ${className}`}>
      {(title || subtitle) && (
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
}
