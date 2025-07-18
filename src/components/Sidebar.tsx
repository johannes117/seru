import React from 'react';
import { cn } from '@/utils/tailwind';
import { Button } from './ui/button';
import { Spline, Filter, Settings, Combine, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TabKey = 'address-splitter' | 'filter' | 'record-splitter' | 'ai-assistant' | 'settings';

interface NavItem {
  key: TabKey;
  labelKey: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { key: 'address-splitter', labelKey: 'titleAddressSplitterPage', icon: Spline },
  { key: 'filter', labelKey: 'titleFilterToolPage', icon: Filter },
  { key: 'record-splitter', labelKey: 'titleRecordSplitterPage', icon: Combine },
  { key: 'ai-assistant', labelKey: 'titleAIAssistantPage', icon: Bot },
  { key: 'settings', labelKey: 'titleSettingsPage', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  activeTab: TabKey;
  setActiveTab: (key: TabKey) => void;
}

export default function Sidebar({ isCollapsed, activeTab, setActiveTab }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        'flex flex-col border-r transition-all duration-300',
        isCollapsed ? 'w-16 items-center' : 'w-64',
      )}
    >
      <div className="flex h-[53px] flex-shrink-0 items-center justify-center border-b">
        <h1
          className={cn(
            'font-tomorrow text-xl font-bold',
            isCollapsed && 'hidden',
          )}
        >
          {t('appName')}
        </h1>
        <h1
          className={cn(
            'font-tomorrow text-xl font-bold',
            !isCollapsed && 'hidden',
          )}
        >
          S
        </h1>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant={activeTab === item.key ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              isCollapsed && 'h-12 w-12 justify-center',
            )}
            onClick={() => setActiveTab(item.key)}
            title={t(item.labelKey)}
          >
            <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
            {!isCollapsed && <span>{t(item.labelKey)}</span>}
          </Button>
        ))}
      </nav>
    </aside>
  );
} 