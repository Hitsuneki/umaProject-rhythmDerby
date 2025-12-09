import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div className="space-y-6">
      <div className="tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab ${isActive ? 'tab-active' : ''}`}
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <span className="w-4 h-4" style={{ width: '16px', height: '16px' }}>
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
      <div>{children}</div>
    </div>
  );
}