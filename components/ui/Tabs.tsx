import React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue);
  const currentTab = value !== undefined ? value : selectedTab;

  const handleSelect = (tab: string) => {
    if (value === undefined) setSelectedTab(tab);
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleSelect }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl bg-surface-subtle p-1 border border-sub-border', className)}>
      {children}
    </div>
  );
}

export function TabTrigger({
  value,
  children,
  badge,
  className,
}: {
  value: string;
  children: React.ReactNode;
  badge?: number | string;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');
  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all',
        isActive
          ? 'bg-white text-brand shadow-2xs font-semibold'
          : 'text-sub-muted hover:text-sub-base hover:bg-surface-hover',
        className
      )}
    >
      {children}
      {badge !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.2 text-xs font-semibold',
            isActive ? 'bg-brand-50 text-brand' : 'bg-slate-200 text-slate-700'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function TabContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');
  if (context.activeTab !== value) return null;

  return <div className={cn('mt-4 focus-visible:outline-none', className)}>{children}</div>;
}
