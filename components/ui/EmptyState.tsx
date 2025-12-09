import { ReactNode } from 'react';
"import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ 
  icon = <Search className="w-12 h-12" />, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-display text-lg text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  );
}
