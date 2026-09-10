'use client';

import React from 'react';
import {
  ShoppingCart,
  BarChart3,
  Receipt,
  Package,
  Layers,
  MessageSquare,
  FileSpreadsheet,
  Megaphone,
  Users,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AppMode } from '@/types';
import { AppTab, POS_TABS, MARKETING_TABS } from '@/hooks/useAppNavigation';

export interface AppNavigationTabsProps {
  appMode: AppMode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lowStockCount?: number;
  unreadChatsCount?: number;
  isAdmin?: boolean;
  mobile?: boolean;
}

interface TabConfig {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
  badgeColor?: string;
  adminOnly?: boolean;
}

export function AppNavigation({
  appMode,
  activeTab,
  setActiveTab,
  lowStockCount = 0,
  unreadChatsCount = 0,
  isAdmin = false,
  mobile = false,
}: AppNavigationTabsProps) {
  const posTabsConfig: TabConfig[] = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'reports', label: 'Daily Reports', icon: BarChart3 },
    { id: 'costs', label: 'Daily Expenses', icon: Receipt },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'services', label: 'Services', icon: Layers },
    {
      id: 'chats',
      label: 'Workshop Chat',
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
  ];

  const marketingTabsConfig: TabConfig[] = [
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'clients', label: 'Client CRM', icon: Users },
    { id: 'ai_marketing', label: 'AI Marketing', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const tabs = (appMode === 'pos' ? posTabsConfig : marketingTabsConfig).filter(
    (tab) => !tab.adminOnly || isAdmin
  );

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1 w-full" aria-label="Mobile Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition
                ${
                  isActive
                    ? 'bg-[#0C2D64] text-white shadow-sm font-bold dark:bg-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>

              {tab.badge ? (
                <span
                  className={`
                    flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold
                    ${tab.badgeColor || 'bg-indigo-500 text-white'}
                  `}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="
        flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none
        border-t border-slate-100 dark:border-slate-800/80
      "
      aria-label="Desktop Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition
              ${
                isActive
                  ? 'bg-[#0C2D64] text-white shadow-sm font-bold dark:bg-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
              }
            `}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>

            {tab.badge ? (
              <span
                className={`
                  flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold
                  ${tab.badgeColor || 'bg-indigo-500 text-white'}
                `}
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
