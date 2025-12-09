import { ReactNode } from 'react';

interface HUDWidgetProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function HUDWidget({ label, value, icon, className = '' }: HUDWidgetProps) {
  return (
    <div className={`hud-element ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && (
          <span className="w-4 h-4" style={{ width: '16px', height: '16px' }}>
            {icon}
          </span>
        )}
        <span className="hud-label">{label}</span>
      </div>
      <div className="hud-value">{value}</div>
    </div>
  );
}