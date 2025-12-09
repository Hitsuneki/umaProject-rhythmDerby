import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block tech-label mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`input appearance-none pr-10 ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }}
          />
        </div>
        {error && (
          <p className="text-xs mt-1" style={{ color: 'var(--accent-danger)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';