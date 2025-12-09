import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TechTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function TechTabs({ tabs, activeTab, onTabChange, children }: TechTabsProps) {
  return (
    <div className="space-y-6">
      <div className="flex border-b border-(--border-primary)">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-6 py-3 display-font text-sm transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-(--accent-primary)' 
                : 'text-(--text-secondary) hover:text-(--text-primary)'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent-primary)"
              />
            )}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}
