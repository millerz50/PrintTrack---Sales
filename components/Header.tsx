
'use client';

import React, { useState } from 'react';
import {
  Menu,
  X,
  Bell,
  UserCircle,
  Settings,
  Globe,
  Lock,
  CalendarDays,
  Database,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';

import { User, DailyFinancialSummary, AppMode } from '../types';
import { CompanyInfo } from '../services/storage';

import { HeaderBrand } from './HeaderBrand';
import { ThemeSwitcher } from './ThemeSwitcher';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { KpiStrip } from './KpiStrip';
import { AppNavigation } from '@components/navigation/AppNavigation';

import { AppTab } from '../hooks/useAppNavigation';

interface AppHeaderProps {
  activeUser: User;

  onOpenAuth: () => void;
  onOpenSettings: () => void;

  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;

  selectedDate: string;
  onDateChange: (date: string) => void;

  summary: DailyFinancialSummary;
  lowStockCount: number;

  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  company: CompanyInfo;

  unreadChatsCount?: number;

  onViewWebsite?: () => void;
  onLockPos?: () => void;
}

export function AppHeader({
  activeUser,
  onOpenAuth,
  onOpenSettings,

  isOnline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,

  selectedDate,
  onDateChange,

  summary,
  lowStockCount,

  appMode,
  setAppMode,

  activeTab,
  setActiveTab,

  company,

  unreadChatsCount = 0,

  onViewWebsite,
  onLockPos,
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className="
          sticky top-0 z-50 w-full
          border-b
          border-slate-200/80
          bg-white/90
          text-slate-900
          shadow-sm
          backdrop-blur-xl

          dark:border-slate-800
          dark:bg-slate-950/90
          dark:text-white
        "
      >
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">

          {/* =====================================================
              MAIN HEADER
          ===================================================== */}
          <div className="flex h-16 items-center justify-between gap-3">

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                text-slate-700
                transition
                hover:bg-slate-100

                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-200
                dark:hover:bg-slate-800

                lg:hidden
              "
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand */}
            <HeaderBrand
              company={company}
              appMode={appMode}
            />

            {/* Desktop workspace */}
            <div className="hidden lg:block">
              <WorkspaceSwitcher
                appMode={appMode}
                setAppMode={setAppMode}
              />
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

              {/* Online status desktop */}
              <DatabaseStatus
                isOnline={isOnline}
                pendingSyncCount={pendingSyncCount}
                onSyncNow={onSyncNow}
                isSyncing={isSyncing}
              />

              {/* Theme */}
              <ThemeSwitcher />

              {/* Notifications */}
              <button
                type="button"
                className="
                  relative
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  transition
                  hover:bg-slate-100

                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />

                {unreadChatsCount > 0 && (
                  <span
                    className="
                      absolute right-1.5 top-1.5
                      flex h-4 min-w-4
                      items-center justify-center
                      rounded-full
                      bg-emerald-500
                      px-1
                      text-[9px]
                      font-bold
                      text-white
                    "
                  >
                    {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
                  </span>
                )}
              </button>

              {/* User desktop */}
              <button
                type="button"
                onClick={onOpenAuth}
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-2.5
                  py-1.5
                  text-left
                  transition
                  hover:bg-slate-50

                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:bg-slate-800
                "
              >
                <span
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-slate-100
                    text-sm

                    dark:bg-slate-800
                  "
                >
                  {activeUser.avatar || '👤'}
                </span>

                <span className="max-w-[110px]">
                  <span
                    className="
                      block truncate
                      text-xs font-semibold
                      text-slate-800
                      dark:text-slate-200
                    "
                  >
                    {activeUser.name}
                  </span>

                  <span
                    className="
                      block
                      text-[10px]
                      capitalize
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {activeUser.role}
                  </span>
                </span>
              </button>

              {/* Mobile avatar */}
              <button
                type="button"
                onClick={onOpenAuth}
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-base

                  dark:border-slate-800
                  dark:bg-slate-900

                  lg:hidden
                "
                aria-label="Account"
              >
                {activeUser.avatar || '👤'}
              </button>
            </div>
          </div>

          {/* =====================================================
              DESKTOP SECONDARY BAR
          ===================================================== */}
          <div
            className="
              hidden
              border-t
              border-slate-100
              py-2.5

              dark:border-slate-900

              lg:block
            "
          >
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">
                <DatePicker
                  value={selectedDate}
                  onChange={onDateChange}
                />

                <DatabaseStatus
                  isOnline={isOnline}
                  pendingSyncCount={pendingSyncCount}
                  onSyncNow={onSyncNow}
                  isSyncing={isSyncing}
                  expanded
                />
              </div>

              <div className="flex items-center gap-2">
                {activeUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className={secondaryButton}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </button>
                )}

                {onViewWebsite && (
                  <button
                    type="button"
                    onClick={onViewWebsite}
                    className={secondaryButton}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </button>
                )}

                {onLockPos && (
                  <button
                    type="button"
                    onClick={onLockPos}
                    className={secondaryButton}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Lock POS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              KPI
          ===================================================== */}
          <div className="hidden lg:block">
            <KpiStrip
              summary={summary}
              lowStockCount={lowStockCount}
              currency={company.currency || '$'}
              onInventory={() => setActiveTab('inventory')}
            />
          </div>

          {/* =====================================================
              NAVIGATION
          ===================================================== */}
          <div className="hidden lg:block">
            <AppNavigation
              appMode={appMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              lowStockCount={lowStockCount}
              unreadChatsCount={unreadChatsCount}
              isAdmin={activeUser.role === 'admin'}
            />
          </div>
        </div>
      </header>

      {/* ==========================================================
          MOBILE MENU
      ========================================================== */}
      {mobileMenuOpen && (
        <MobileMenu
          activeUser={activeUser}
          appMode={appMode}
          setAppMode={(mode) => {
            setAppMode(mode);
            closeMenu();
          }}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            closeMenu();
          }}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          onSyncNow={onSyncNow}
          isSyncing={isSyncing}
          lowStockCount={lowStockCount}
          unreadChatsCount={unreadChatsCount}
          isAdmin={activeUser.role === 'admin'}
          onOpenAuth={() => {
            closeMenu();
            onOpenAuth();
          }}
          onOpenSettings={() => {
            closeMenu();
            onOpenSettings();
          }}
          onViewWebsite={
            onViewWebsite
              ? () => {
                  closeMenu();
                  onViewWebsite();
                }
              : undefined
          }
          onLockPos={
            onLockPos
              ? () => {
                  closeMenu();
                  onLockPos();
                }
              : undefined
          }
          onClose={closeMenu}
        />
      )}
    </>
  );
}

/* ================================================================
   DATE PICKER
================================================================ */

function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="
        inline-flex
        h-9
        items-center
        gap-2
        rounded-lg
        border
        border-slate-200
        bg-slate-50
        px-3
        text-xs
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          bg-transparent
          text-xs
          text-slate-700
          outline-none

          dark:text-slate-200

          [color-scheme:light]
          dark:[color-scheme:dark]
        "
      />
    </label>
  );
}

/* ================================================================
   DATABASE STATUS
================================================================ */

function DatabaseStatus({
  isOnline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,
  expanded = false,
}: {
  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSyncNow}
      disabled={!isOnline || isSyncing}
      title={
        isOnline
          ? 'Database ready'
          : 'Offline - waiting for connection'
      }
      className="
        inline-flex
        h-9
        items-center
        gap-2
        rounded-lg
        border
        border-slate-200
        bg-slate-50
        px-2.5
        text-[11px]
        font-medium
        text-slate-600
        transition

        hover:bg-slate-100

        disabled:cursor-not-allowed

        dark:border-slate-800
        dark:bg-slate-900
        dark:text-slate-300
        dark:hover:bg-slate-800
      "
    >
      {isOnline ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-amber-500" />
      )}

      {expanded && (
        <span>
          {isOnline ? 'Database Ready' : 'Offline'}
        </span>
      )}

      {pendingSyncCount > 0 && (
        <span
          className="
            rounded-full
            bg-amber-500
            px-1.5
            py-0.5
            text-[9px]
            font-bold
            text-white
          "
        >
          {pendingSyncCount}
        </span>
      )}

      {expanded && isOnline && (
        <RefreshCw
          className={`h-3 w-3 ${
            isSyncing ? 'animate-spin' : ''
          }`}
        />
      )}
    </button>
  );
}

const secondaryButton = `
  inline-flex h-9 items-center gap-1.5
  rounded-lg border
  border-slate-200
  bg-white
  px-3
  text-[11px] font-medium
  text-slate-600
  transition
  hover:bg-slate-50

  dark:border-slate-800
  dark:bg-slate-900
  dark:text-slate-300
  dark:hover:bg-slate-800
`;
