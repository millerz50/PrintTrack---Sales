'use client';

import React from 'react';

import {
  Printer,
  CalendarDays,
  Receipt,
  Package,
  Wrench,
  MessageSquare,
  FileText,
  Megaphone,
  Users,
  Sparkles,
  BarChart3,
} from 'lucide-react';

import { AppMode } from '../types';
import { AppTab } from '../hooks/useAppNavigation';

interface AppNavigationProps {
  appMode: AppMode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  lowStockCount: number;
  unreadChatsCount: number;

  isAdmin: boolean;

  mobile?: boolean;
}

export function AppNavigation({
  appMode,
  activeTab,
  setActiveTab,
  lowStockCount,
  unreadChatsCount,
  isAdmin,
  mobile = false,
}: AppNavigationProps) {
  const items =
    appMode === 'pos'
      ? [
          {
            id: 'pos' as AppTab,
            label: 'New Sale',
            icon: <Printer />,
          },
          {
            id: 'reports' as AppTab,
            label: 'Daily Reports',
            icon: <CalendarDays />,
          },
          {
            id: 'costs' as AppTab,
            label: 'Expenses',
            icon: <Receipt />,
          },
          {
            id: 'inventory' as AppTab,
            label: 'Inventory',
            icon: <Package />,
            badge: lowStockCount,
          },
          ...(isAdmin
            ? [
                {
                  id: 'services' as AppTab,
                  label: 'Services',
                  icon: <Wrench />,
                },
              ]
            : []),
          {
            id: 'chats' as AppTab,
            label: 'Workshop & AI',
            icon: <MessageSquare />,
            badge: unreadChatsCount,
          },
        ]
      : [
          {
            id: 'quotations' as AppTab,
            label: 'Quotations',
            icon: <FileText />,
          },
          {
            id: 'campaigns' as AppTab,
            label: 'Campaigns',
            icon: <Megaphone />,
          },
          {
            id: 'clients' as AppTab,
            label: 'Client CRM',
            icon: <Users />,
          },
          {
            id: 'ai_marketing' as AppTab,
            label: 'AI Marketing',
            icon: <Sparkles />,
          },
          {
            id: 'analytics' as AppTab,
            label: 'Performance',
            icon: <BarChart3 />,
          },
        ];

  return (
    <nav
      className={
        mobile
          ? 'space-y-1'
          : `
            flex
            gap-1
            overflow-x-auto
            border-t
            border-slate-100
            py-1.5

            dark:border-slate-900
          `
      }
    >
      {items.map((item) => {
        const active = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`
              group
              flex
              items-center
              gap-3
              rounded-lg
              text-left
              text-xs
              font-medium
              transition

              ${
                mobile
                  ? `
                    w-full
                    px-3
                    py-3
                  `
                  : `
                    shrink-0
                    px-3
                    py-2
                  `
              }

              ${
                active
                  ? `
                    bg-[#0C2D64]
                    text-white
                    shadow-sm
                  `
                  : `
                    text-slate-600
                    hover:bg-slate-100
                    hover:text-slate-900

                    dark:text-slate-400
                    dark:hover:bg-slate-900
                    dark:hover:text-white
                  `
              }
            `}
          >
            <span
              className={`
                shrink-0
                [&>svg]:h-4
                [&>svg]:w-4

                ${
                  active
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }
              `}
            >
              {item.icon}
            </span>

            <span>{item.label}</span>

            {item.badge !== undefined &&
              item.badge > 0 && (
                <span
                  className="
                    ml-auto
                    min-w-5
                    rounded-full
                    bg-amber-500
                    px-1.5
                    py-0.5
                    text-center
                    text-[9px]
                    font-bold
                    text-white
                  "
                >
                  {item.badge > 99
                    ? '99+'
                    : item.badge}
                </span>
              )}

            {mobile && (
              <ChevronRight
                className="ml-auto h-4 w-4 opacity-40"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function ChevronRight({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
