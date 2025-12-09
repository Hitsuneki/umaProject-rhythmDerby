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
              <label className="tech-label text-gray-700">{label}</label>
            )}
            {coordinates && (
              <span className="coordinate-marker text-gray-500">{coordinates}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          className={`
            tech-input w-full px-4 py-3 
            focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]
            transition-all duration-200 body-font
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TechInput.displayName = 'TechInput';
