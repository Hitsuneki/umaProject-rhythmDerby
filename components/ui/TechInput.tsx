import { InputHTMLAttributes, forwardRef } from 'react';

interface TechInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  coordinates?: string;
}

export const TechInput = forwardRef<HTMLInputElement, TechInputProps>(
  ({ label, error, coordinates, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || coordinates) && (
          <div className="flex items-center justify-between">
            {label && (
              <label className="tech-label">{label}</label>
            )}
            {coordinates && (
              <span className="coordinate-marker">{coordinates}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-primary) 
            text-(--text-primary) placeholder:text-(--text-tertiary)
            focus:outline-none focus:border-(--accent-primary) focus:shadow-[0_0_0_1px_var(--accent-primary)]
            transition-all duration-200 body-font
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-(--accent-danger)">{error}</p>
        )}
      </div>
    );
  }
);

TechInput.displayName = 'TechInput';
