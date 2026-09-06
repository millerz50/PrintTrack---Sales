// hooks/useAppNavigation.ts

'use client';

import { useState } from 'react';
import { getTodayDateString } from '@/data/initialData';

export type AppTab =
  | 'pos'
  | 'quotations'
  | 'reports'
  | 'costs'
  | 'services'
  | 'inventory'
  | 'analytics'
  | 'chats';

export function useAppNavigation() {
  const [selectedDate, setSelectedDate] =
    useState(getTodayDateString());

  const [activeTab, setActiveTab] =
    useState<AppTab>('pos');

  return {
    selectedDate,
    setSelectedDate,

    activeTab,
    setActiveTab,
  };
}
