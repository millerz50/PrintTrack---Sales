'use client';

import React from 'react';
import {
  Printer,
  WifiOff,
  RefreshCw,
  UserCheck,
  Shield,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Sliders,
  MessageSquare,
  BarChart3,
  Wrench,
  FileText,
  Database,
  Megaphone,
  Users,
  Sparkles,
  Globe,
  Lock,
} from 'lucide-react';

import { User, DailyFinancialSummary, AppMode } from '../types';
import { CompanyInfo } from '../services/storage';
import { MagenLogo } from './MagenLogo';
import { AppTab } from '../hooks/useAppNavigation';

interface HeaderProps {
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

export const Header: React.FC<HeaderProps> = ({
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
  onViewWebsite,
  onLockPos,
  unreadChatsCount = 0,
}) => {
  const currency = company.currency || '$';

  const buttonBase =
    'inline-flex items-center justify-center gap-1.5 min-h-10 sm:min-h-8 rounded-lg border text-xs font-medium transition-all active:scale-[0.98]';

  const navBase =
    'shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-sm font-medium transition-all';

  return (
    <header
      className="
        sticky top-0 z-40 w-full
        border-b
        bg-white/95 dark:bg-slate-950/95
        border-slate-200 dark:border-slate-800
        text-slate-900 dark:text-white
        shadow-sm dark:shadow-black/20
        backdrop-blur-xl
      "
    >
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 lg:px-8">

        {/* =========================================================
            BRAND + MOBILE ACTIONS
        ========================================================= */}
        <div className="flex items-center justify-between gap-3">

          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

            <div
              className="
                flex h-11 w-11 shrink-0 items-center justify-center
                overflow-hidden rounded-xl
                bg-white
                ring-1 ring-slate-200
                dark:bg-white
                dark:ring-slate-700
              "
            >
              <MagenLogo
                variant="monogram"
                size="sm"
                className="h-10 w-10"
              />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">

                <h1
                  className="
                    truncate
                    text-sm sm:text-base lg:text-lg
                    font-bold
                    tracking-tight
                    text-slate-900 dark:text-slate-100
                  "
                >
                  {company.name}
                </h1>

                <span
                  className="
                    hidden lg:inline-flex
                    shrink-0
                    rounded-full
                    border
                    border-emerald-500/30
                    bg-emerald-500/10
                    px-2 py-0.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-emerald-700
                    dark:text-emerald-300
                  "
                >
                  Media &amp; Print
                </span>
              </div>

              <p
                className="
                  mt-0.5 truncate
                  text-[10px] sm:text-xs
                  text-slate-500 dark:text-slate-400
                "
              >
                {company.tagline}
              </p>
            </div>
          </div>

          {/* Mobile user button */}
          <button
            type="button"
            onClick={onOpenAuth}
            aria-label="Switch user"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-lg
              hover:bg-slate-100
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:bg-slate-800
              sm:hidden
            "
          >
            {activeUser.avatar || '👤'}
          </button>
        </div>

        {/* =========================================================
            CONTROLS
        ========================================================= */}
        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
            sm:flex sm:flex-wrap sm:items-center
          "
        >

          {/* Date */}
          <label
            className="
              flex min-w-0 items-center gap-2
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              px-2.5
              py-2
              text-xs
              text-slate-600
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-300
              sm:w-auto
            "
          >
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="
                min-w-0 w-full
                bg-transparent
                text-xs
                text-slate-700
                outline-none
                dark:text-slate-200
                [color-scheme:light]
                dark:[color-scheme:dark]
              "
              title="Select Report Date"
            />
          </label>

          {/* Database status */}
          <button
            type="button"
            onClick={isOnline ? onSyncNow : undefined}
            disabled={!isOnline}
            className={`
              ${buttonBase}
              px-2.5
              ${
                isOnline
                  ? `
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-700
                    hover:bg-emerald-100
                    dark:border-emerald-900
                    dark:bg-emerald-950/60
                    dark:text-emerald-300
                    dark:hover:bg-emerald-950
                  `
                  : `
                    border-amber-200
                    bg-amber-50
                    text-amber-700
                    dark:border-amber-900
                    dark:bg-amber-950/50
                    dark:text-amber-300
                  `
              }
            `}
            title={
              isOnline
                ? 'Connected to SQLite database. Click to sync.'
                : 'Offline mode'
            }
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <Database className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">
                  SQLite Online
                </span>

                <span className="sm:hidden">
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>
                  Offline
                  {pendingSyncCount > 0
                    ? ` (${pendingSyncCount})`
                    : ''}
                </span>
              </>
            )}
          </button>

          {/* Sync */}
          <button
            id="sync-now-button"
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing || !isOnline}
            className="
              col-span-2
              sm:col-span-1
              min-h-10
              sm:min-h-8
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-[#0C2D64]
              bg-[#0C2D64]
              px-3
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-[#0a2552]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            title="Sync now with SQLite database"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-emerald-300 ${
                isSyncing ? 'animate-spin' : ''
              }`}
            />

            <span>
              {isSyncing
                ? 'Syncing...'
                : pendingSyncCount > 0
                  ? `Sync (${pendingSyncCount})`
                  : 'Sync DB'}
            </span>
          </button>

          {/* User */}
          <button
            id="switch-user-button"
            type="button"
            onClick={onOpenAuth}
            className="
              hidden
              sm:flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              px-2.5
              py-1.5
              text-xs
              transition
              hover:bg-slate-100
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:bg-slate-800
            "
            title="Switch user / role"
          >
            <span className="text-base">
              {activeUser.avatar || '👤'}
            </span>

            <div className="text-left">
              <span
                className="
                  block max-w-[100px] truncate
                  font-semibold
                  text-slate-800
                  dark:text-slate-200
                "
              >
                {activeUser.name.split(' ')[0]}
              </span>

              <span
                className="
                  flex items-center gap-1
                  text-[10px]
                  capitalize
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {activeUser.role === 'admin' ? (
                  <Shield className="h-2.5 w-2.5 text-amber-500" />
                ) : (
                  <UserCheck className="h-2.5 w-2.5 text-blue-500" />
                )}

                {activeUser.role}
              </span>
            </div>
          </button>

          {/* Settings */}
          {activeUser.role === 'admin' && (
            <button
              id="open-settings-button"
              type="button"
              onClick={onOpenSettings}
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                text-slate-600
                transition
                hover:bg-slate-100
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:bg-slate-800
                sm:h-8
                sm:w-8
              "
              title="Business Settings & Branding"
            >
              <Sliders className="h-4 w-4" />
            </button>
          )}

          {/* Public website */}
          {onViewWebsite && (
            <button
              id="header-view-website-btn"
              type="button"
              onClick={onViewWebsite}
              className="
                inline-flex
                min-h-10
                sm:min-h-8
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-emerald-200
                bg-emerald-50
                px-3
                text-xs
                font-semibold
                text-emerald-700
                transition
                hover:bg-emerald-100
                dark:border-emerald-900
                dark:bg-emerald-950/50
                dark:text-emerald-300
                dark:hover:bg-emerald-950
              "
              title="Open public customer website"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Website</span>
            </button>
          )}

          {/* Lock POS */}
          {onLockPos && (
            <button
              id="header-lock-pos-btn"
              type="button"
              onClick={onLockPos}
              className="
                inline-flex
                min-h-10
                sm:min-h-8
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-3
                text-xs
                font-medium
                text-slate-600
                transition
                hover:border-rose-200
                hover:bg-rose-50
                hover:text-rose-600
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-rose-900
                dark:hover:bg-rose-950/50
                dark:hover:text-rose-300
              "
              title="Lock POS Terminal"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock</span>
            </button>
          )}
        </div>

        {/* =========================================================
            KPI STRIP
        ========================================================= */}
        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
            border-t
            border-slate-200
            pt-3
            dark:border-slate-800
            sm:grid-cols-4
            sm:gap-2.5
          "
        >

          {/* Revenue */}
          <KpiCard
            label="Daily Revenue"
            value={`${currency}${summary.totalRevenue.toFixed(2)}`}
            valueClass="text-emerald-600 dark:text-emerald-400"
            icon={
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            }
            iconClass="
              bg-emerald-50
              border-emerald-200
              dark:bg-emerald-950/60
              dark:border-emerald-900
            "
          />

          {/* Expenses */}
          <KpiCard
            label="Daily Costs"
            value={`${currency}${summary.totalExpenses.toFixed(2)}`}
            valueClass="text-rose-600 dark:text-rose-400"
            icon={
              <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            }
            iconClass="
              bg-rose-50
              border-rose-200
              dark:bg-rose-950/60
              dark:border-rose-900
            "
          />

          {/* Profit */}
          <KpiCard
            label="Net Profit"
            value={`${currency}${summary.netProfit.toFixed(2)}`}
            valueClass={
              summary.netProfit >= 0
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-amber-600 dark:text-amber-400'
            }
            icon={
              <span
                className={
                  summary.netProfit >= 0
                    ? 'text-xs font-bold text-teal-600 dark:text-teal-400'
                    : 'text-xs font-bold text-amber-600 dark:text-amber-400'
                }
              >
                {summary.totalRevenue > 0
                  ? `${Math.round(
                      (summary.netProfit / summary.totalRevenue) * 100
                    )}%`
                  : '0%'}
              </span>
            }
            iconClass="
              bg-teal-50
              border-teal-200
              dark:bg-teal-950/60
              dark:border-teal-900
            "
          />

          {/* Stock */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className="
              flex
              min-w-0
              items-center
              justify-between
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-2.5
              text-left
              transition
              hover:bg-slate-100
              dark:border-slate-800
              dark:bg-slate-900/70
              dark:hover:bg-slate-900
            "
          >
            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[10px] sm:text-[11px]
                  font-medium
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Stock Status
              </p>

              {lowStockCount > 0 ? (
                <p className="truncate text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                  {lowStockCount} Low Alert
                  {lowStockCount > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="truncate text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                  All Optimal
                </p>
              )}
            </div>

            <div
              className={`
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                ${
                  lowStockCount > 0
                    ? `
                      border-amber-200
                      bg-amber-50
                      dark:border-amber-900
                      dark:bg-amber-950/60
                    `
                    : `
                      border-slate-200
                      bg-white
                      dark:border-slate-700
                      dark:bg-slate-800
                    `
                }
              `}
            >
              <AlertTriangle
                className={`
                  h-4 w-4
                  ${
                    lowStockCount > 0
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }
                `}
              />
            </div>
          </button>
        </div>

        {/* =========================================================
            WORKSPACE SWITCHER
        ========================================================= */}
        <div
          className="
            mt-3
            border-t
            border-slate-200
            pt-3
            dark:border-slate-800
          "
        >
          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                w-full
                overflow-x-auto
                rounded-xl
                border
                border-slate-200
                bg-slate-100
                p-1
                dark:border-slate-800
                dark:bg-slate-900
                sm:w-auto
              "
            >
              <button
                id="mode-pos-button"
                type="button"
                onClick={() => setAppMode('pos')}
                className={`
                  flex
                  min-w-max
                  flex-1
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-bold
                  transition
                  sm:flex-none
                  ${
                    appMode === 'pos'
                      ? `
                        bg-emerald-600
                        text-white
                        shadow-sm
                      `
                      : `
                        text-slate-600
                        hover:bg-white
                        dark:text-slate-400
                        dark:hover:bg-slate-800
                      `
                  }
                `}
              >
                <Printer className="h-3.5 w-3.5" />

                <span>POS</span>

                <span className="hidden sm:inline text-[10px] uppercase opacity-70">
                  Counter &amp; Till
                </span>
              </button>

              <button
                id="mode-marketing-button"
                type="button"
                onClick={() => setAppMode('marketing')}
                className={`
                  flex
                  min-w-max
                  flex-1
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-bold
                  transition
                  sm:flex-none
                  ${
                    appMode === 'marketing'
                      ? `
                        bg-[#0C2D64]
                        text-white
                        shadow-sm
                      `
                      : `
                        text-slate-600
                        hover:bg-white
                        dark:text-slate-400
                        dark:hover:bg-slate-800
                      `
                  }
                `}
              >
                <Megaphone className="h-3.5 w-3.5 text-emerald-500" />

                <span>Marketing</span>

                <span className="hidden sm:inline text-[10px] uppercase opacity-70">
                  B2B &amp; Quotes
                </span>
              </button>
            </div>

            <div className="hidden text-right text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Current Workspace:
              <span
                className={`
                  ml-2
                  rounded-md
                  border
                  px-2
                  py-1
                  font-semibold
                  ${
                    appMode === 'pos'
                      ? `
                        border-emerald-200
                        bg-emerald-50
                        text-emerald-700
                        dark:border-emerald-900
                        dark:bg-emerald-950/50
                        dark:text-emerald-300
                      `
                      : `
                        border-blue-200
                        bg-blue-50
                        text-blue-700
                        dark:border-blue-900
                        dark:bg-blue-950/50
                        dark:text-blue-300
                      `
                  }
                `}
              >
                {appMode === 'pos'
                  ? 'Front Counter / POS'
                  : 'Marketing & Client Proposals'}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            NAVIGATION
        ========================================================= */}
        {appMode === 'pos' ? (
          <nav
            aria-label="POS navigation"
            className="
              -mx-3
              mt-2
              flex
              gap-1
              overflow-x-auto
              px-3
              pb-1
              scrollbar-none
              sm:-mx-5
              sm:px-5
              lg:-mx-8
              lg:px-8
            "
          >
            <NavButton
              active={activeTab === 'pos'}
              onClick={() => setActiveTab('pos')}
              icon={<Printer />}
              label="New Sale / POS"
              activeClass="bg-emerald-600 text-white"
            />

            <NavButton
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
              icon={<Calendar />}
              label="Daily Reports"
            />

            <NavButton
              active={activeTab === 'costs'}
              onClick={() => setActiveTab('costs')}
              icon={<TrendingUp />}
              label="Costs & Expenses"
            />

            <NavButton
              active={activeTab === 'inventory'}
              onClick={() => setActiveTab('inventory')}
              icon={<AlertTriangle />}
              label="Inventory"
              badge={lowStockCount > 0 ? lowStockCount : undefined}
            />

            {activeUser.role === 'admin' && (
              <NavButton
                active={activeTab === 'services'}
                onClick={() => setActiveTab('services')}
                icon={<Wrench />}
                label="Services & Pricing"
              />
            )}

            <NavButton
              active={activeTab === 'chats'}
              onClick={() => setActiveTab('chats')}
              icon={<MessageSquare />}
              label="Workshop & AI Chat"
              badge={
                unreadChatsCount > 0
                  ? unreadChatsCount
                  : undefined
              }
              live
            />
          </nav>
        ) : (
          <nav
            aria-label="Marketing navigation"
            className="
              -mx-3
              mt-2
              flex
              gap-1
              overflow-x-auto
              px-3
              pb-1
              scrollbar-none
              sm:-mx-5
              sm:px-5
              lg:-mx-8
              lg:px-8
            "
          >
            <NavButton
              active={activeTab === 'quotations'}
              onClick={() => setActiveTab('quotations')}
              icon={<FileText />}
              label="Quotations"
            />

            <NavButton
              active={activeTab === 'campaigns'}
              onClick={() => setActiveTab('campaigns')}
              icon={<Megaphone />}
              label="Campaigns"
            />

            <NavButton
              active={activeTab === 'clients'}
              onClick={() => setActiveTab('clients')}
              icon={<Users />}
              label="Client CRM"
            />

            <NavButton
              active={activeTab === 'ai_marketing'}
              onClick={() => setActiveTab('ai_marketing')}
              icon={<Sparkles />}
              label="AI Marketing"
            />

            <NavButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart3 />}
              label="Performance"
            />
          </nav>
        )}
      </div>
    </header>
  );
};

/* ===============================================================
   KPI CARD
================================================================ */

interface KpiCardProps {
  label: string;
  value: string;
  valueClass: string;
  icon: React.ReactNode;
  iconClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  valueClass,
  icon,
  iconClass,
}) => {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        justify-between
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-2.5
        dark:border-slate-800
        dark:bg-slate-900/70
      "
    >
      <div className="min-w-0">
        <p
          className="
            truncate
            text-[10px] sm:text-[11px]
            font-medium
            text-slate-500
            dark:text-slate-400
          "
        >
          {label}
        </p>

        <p
          className={`
            truncate
            text-sm sm:text-base
            font-bold
            ${valueClass}
          `}
        >
          {value}
        </p>
      </div>

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          ${iconClass}
        `}
      >
        {icon}
      </div>
    </div>
  );
};

/* ===============================================================
   NAV BUTTON
================================================================ */

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  live?: boolean;
  activeClass?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  badge,
  live = false,
  activeClass,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        shrink-0
        inline-flex
        min-h-10
        sm:min-h-9
        items-center
        gap-1.5
        rounded-lg
        px-3
        py-2
        text-xs
        sm:text-sm
        font-medium
        whitespace-nowrap
        transition-all
        ${
          active
            ? activeClass ||
              `
                bg-[#0C2D64]
                text-white
                shadow-sm
                ring-1
                ring-emerald-400/40
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
      <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <span>{label}</span>

      {badge !== undefined && (
        <span
          className="
            flex
            min-w-5
            h-5
            items-center
            justify-center
            rounded-full
            bg-amber-500
            px-1
            text-[10px]
            font-bold
            text-slate-950
          "
        >
          {badge}
        </span>
      )}

      {live && (
        <span
          className="
            h-2
            w-2
            shrink-0
            rounded-full
            bg-emerald-400
            shadow-[0_0_8px_rgba(52,211,153,0.7)]
          "
        />
      )}
    </button>
  );
};
