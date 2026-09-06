// hooks/useAppNavigation.ts

'use client';

import { useState, useEffect } from 'react';
import { getTodayDateString } from '@/data/initialData';
import { AppMode } from '@/types';

export type AppTab =
  | 'pos'
  | 'quotations'
  | 'reports'
  | 'costs'
  | 'services'
  | 'inventory'
  | 'analytics'
  | 'chats'
  | 'campaigns'
  | 'clients'
  | 'ai_marketing';

export const POS_TABS: AppTab[] = ['pos', 'reports', 'costs', 'inventory', 'services', 'chats'];
export const MARKETING_TABS: AppTab[] = ['quotations', 'campaigns', 'clients', 'ai_marketing', 'analytics'];

export function useAppNavigation() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [appMode, setAppModeState] = useState<AppMode>('pos');
  const [activeTab, setActiveTabState] = useState<AppTab>('pos');

  // Load saved preference if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('magen_app_mode') as AppMode | null;
      if (savedMode === 'pos' || savedMode === 'marketing') {
        setAppModeState(savedMode);
        if (savedMode === 'marketing') {
          setActiveTabState('quotations');
        }
      }
    }
  }, []);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('magen_app_mode', mode);
    }

    if (mode === 'pos' && !POS_TABS.includes(activeTab)) {
      setActiveTabState('pos');
    } else if (mode === 'marketing' && !MARKETING_TABS.includes(activeTab)) {
      setActiveTabState('quotations');
    }
  };

  const setActiveTab = (tab: AppTab) => {
    setActiveTabState(tab);
    if (MARKETING_TABS.includes(tab) && appMode !== 'marketing') {
      setAppModeState('marketing');
      if (typeof window !== 'undefined') localStorage.setItem('magen_app_mode', 'marketing');
    } else if (POS_TABS.includes(tab) && appMode !== 'pos') {
      setAppModeState('pos');
      if (typeof window !== 'undefined') localStorage.setItem('magen_app_mode', 'pos');
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    appMode,
    setAppMode,
    activeTab,
    setActiveTab,
  };
}
