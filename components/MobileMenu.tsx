'use client';

import React from 'react';
import {
  X,
  CalendarDays,
  Database,
  Settings,
  Globe,
  Lock,
  UserCircle,
  ChevronRight,
} from 'lucide-react';

import { User, AppMode } from '../types';
import { AppTab } from '../hooks/useAppNavigation';

import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { AppNavigation } from './AppNavigation';
import { ThemeSwitcher } from './ThemeSwitcher';

interface MobileMenuProps {
  activeUser: User;

  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  selectedDate: string;
  onDateChange: (date: string) => void;

  isOnline: boolean;
  pendingSyncCount: number;
  onSyncNow: () => void;
  isSyncing: boolean;

  lowStockCount: number;
  unreadChatsCount: number;

  isAdmin: boolean;

  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onViewWebsite?: () => void;
  onLockPos?: () => void;

  onClose: () => void;
}

export function MobileMenu({
  activeUser,

  appMode,
  setAppMode,

  activeTab,
  setActiveTab,

  selectedDate,
  onDateChange,

  isOnline,
  pendingSyncCount,
  onSyncNow,
  isSyncing,

  lowStockCount,
  unreadChatsCount,

  isAdmin,

  onOpenAuth,
  onOpenSettings,
  onViewWebsite,
  onLockPos,

  onClose,
}: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-[100] lg:hidden">

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="
          absolute inset-0
          bg-slate-950/50
          backdrop-blur-sm
        "
      />

      {/* Drawer */}
      <aside
        className="
          absolute
          left-0
          top-0
          flex
          h-full
          w-[min(88vw,380px)]
          flex-col
          overflow-hidden

          bg-white
          text-slate-900
          shadow-2xl

          dark:bg-slate-950
          dark:text-white
        "
      >

        {/* Header */}
        <div
          className="
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-200
            px-4

            dark:border-slate-800
          "
        >
          <div>
            <p className="text-sm font-bold">
              Magen
            </p>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Business Management
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-slate-100
              text-slate-600

              dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="
            mx-4
            mt-4
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            p-3
            text-left

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-white
              text-lg
              dark:bg-slate-800
            "
          >
            {activeUser.avatar || '👤'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">
              {activeUser.name}
            </p>

            <p className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
              {activeUser.role}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

          {/* Workspace */}
          <section className="mt-5">
            <p
              className="
                mb-2
                px-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Workspace
            </p>

            <WorkspaceSwitcher
              appMode={appMode}
              setAppMode={setAppMode}
            />
          </section>

          {/* Date */}
          <section className="mt-5">
            <p
              className="
                mb-2
                px-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Report Date
            </p>

            <label
              className="
                flex
                h-11
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3

                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <CalendarDays className="h-4 w-4 text-slate-400" />

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="
                  flex-1
                  bg-transparent
                  text-sm
                  outline-none

                  [color-scheme:light]
                  dark:[color-scheme:dark]
                "
              />
            </label>
          </section>

          {/* Database */}
          <section className="mt-5">
            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3

                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    ${
                      isOnline
                        ? 'bg-emerald-500/10'
                        : 'bg-amber-500/10'
                    }
                  `}
                >
                  <Database
                    className={`
                      h-4 w-4
                      ${
                        isOnline
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }
                    `}
                  />
                </span>

                <div>
                  <p className="text-xs font-semibold">
                    {isOnline
                      ? 'Database Ready'
                      : 'Offline Mode'}
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pendingSyncCount
                      ? `${pendingSyncCount} pending sync`
                      : 'Everything is synchronized'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSyncNow}
                disabled={!isOnline || isSyncing}
                className="
                  rounded-lg
                  bg-[#0C2D64]
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-white
                  disabled:opacity-50
                "
              >
                {isSyncing ? 'Sync...' : 'Sync'}
              </button>
            </div>
          </section>

          {/* Navigation */}
          <section className="mt-5">
            <p
              className="
                mb-2
                px-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Navigation
            </p>

            <AppNavigation
              appMode={appMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              lowStockCount={lowStockCount}
              unreadChatsCount={unreadChatsCount}
              isAdmin={isAdmin}
              mobile
            />
          </section>

          {/* Preferences */}
          <section className="mt-5">
            <p
              className="
                mb-2
                px-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Preferences
            </p>

            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3

                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div>
                <p className="text-xs font-semibold">
                  Appearance
                </p>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Light, dark or system
                </p>
              </div>

              <ThemeSwitcher />
            </div>
          </section>

          {/* Actions */}
          <section className="mt-5 space-y-2">

            {isAdmin && (
              <MobileAction
                icon={<Settings />}
                label="Business Settings"
                onClick={onOpenSettings}
              />
            )}

            {onViewWebsite && (
              <MobileAction
                icon={<Globe />}
                label="View Public Website"
                onClick={onViewWebsite}
              />
            )}

            {onLockPos && (
              <MobileAction
                icon={<Lock />}
                label="Lock POS"
                danger
                onClick={onLockPos}
              />
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}

function MobileAction({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        border
        p-3
        text-left
        text-xs
        font-semibold
        transition

        ${
          danger
            ? `
              border-rose-200
              bg-rose-50
              text-rose-700

              dark:border-rose-900
              dark:bg-rose-950/30
              dark:text-rose-300
            `
            : `
              border-slate-200
              bg-slate-50
              text-slate-700
              hover:bg-slate-100

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            `
        }
      `}
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      {label}

      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
    </button>
  );
}
