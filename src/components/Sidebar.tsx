import React from 'react';
import { cn } from '@/utils/tailwind';
import { Button } from './ui/button';
import { Spline, Filter, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TabKey = 'address-splitter' | 'filter' | 'settings';

interface SidebarProps {
  isCollapsed: boolean;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export default function Sidebar({ isCollapsed, activeTab, setActiveTab }: SidebarProps) {
  const { t } = useTranslation();

  const navItems = [
    { key: 'address-splitter' as TabKey, label: t('titleAddressSplitterPage'), icon: Spline },
    { key: 'filter' as TabKey, label: t('titleFilterToolPage'), icon: Filter },
    { key: 'settings' as TabKey, label: t('titleSettingsPage'), icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-muted/40 border-r transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
        <div className={cn('flex items-center border-b', isCollapsed ? 'justify-center h-[53px]' : 'justify-start h-[53px] pl-7')}>
            {!isCollapsed && <span className="text-lg font-bold">Seru</span>}
        </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant={activeTab === item.key ? 'secondary' : 'ghost'}
                className={cn('w-full h-12 justify-start', isCollapsed && 'justify-center')}
                onClick={() => setActiveTab(item.key)}
                title={item.label}
              >
                <Icon className={cn('h-5 w-5', !isCollapsed && 'mr-4')} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Button>
            );
        })}
      </nav>
    </aside>
  );
} 