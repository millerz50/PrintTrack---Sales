import React from 'react';
import {
  Printer,
  Wifi,
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
  Bot,
  Wrench
} from 'lucide-react';
import { User, DailyFinancialSummary } from '../types';
import { CompanyInfo } from '../services/storage';

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
  activeTab: 'pos' | 'reports' | 'costs' | 'services' | 'inventory' | 'analytics' | 'chats';
  setActiveTab: (tab: 'pos' | 'reports' | 'costs' | 'services' | 'inventory' | 'analytics' | 'chats') => void;
  company: CompanyInfo;
  unreadChatsCount?: number;
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
  activeTab,
  setActiveTab,
  company
}) => {
  const currency = company.currency || '$';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 flex-shrink-0">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-none">
                  {company.name}
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Print POS & Stock
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {company.tagline}
              </p>
            </div>
          </div>

          {/* Controls: Date, Online/Offline Sync, Role Auth */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Date Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                title="Select Report Date"
              />
            </div>

            {/* Online / Offline Sync status pill */}
            <div className="flex items-center">
              {isOnline ? (
                <div className="flex items-center bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-medium space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center bg-amber-950/90 border border-amber-700 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-medium space-x-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline ({pendingSyncCount} queued)</span>
                </div>
              )}

              {/* Sync Trigger button if items pending or manual sync */}
              {pendingSyncCount > 0 && (
                <button
                  id="sync-now-button"
                  onClick={onSyncNow}
                  disabled={isSyncing || !isOnline}
                  className="ml-2 flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition shadow-sm"
                  title="Upload queued transactions to cloud"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync {pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* Active User Chip & Switcher */}
            <button
              id="switch-user-button"
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg transition text-xs group"
              title="Click to Switch User / Role"
            >
              <span className="text-base leading-none">{activeUser.avatar || '👤'}</span>
              <div className="text-left">
                <span className="text-slate-200 font-medium block leading-tight">
                  {activeUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 capitalize flex items-center gap-0.5">
                  {activeUser.role === 'admin' ? (
                    <Shield className="w-2.5 h-2.5 text-amber-400 inline" />
                  ) : (
                    <UserCheck className="w-2.5 h-2.5 text-blue-400 inline" />
                  )}
                  {activeUser.role}
                </span>
              </div>
            </button>

            {/* Settings */}
            {activeUser.role === 'admin' && (
              <button
                id="open-settings-button"
                onClick={onOpenSettings}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition"
                title="Business Settings & Branding"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip for Selected Date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Daily Revenue</p>
              <p className="text-base font-bold text-emerald-400">
                {currency}{summary.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Daily Costs & Exp.</p>
              <p className="text-base font-bold text-rose-400">
                {currency}{summary.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Net Profit</p>
              <p className={`text-base font-bold ${summary.netProfit >= 0 ? 'text-teal-300' : 'text-amber-400'}`}>
                {currency}{summary.netProfit.toFixed(2)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-800/50 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-400">
                {summary.totalRevenue > 0 ? `${Math.round((summary.netProfit / summary.totalRevenue) * 100)}%` : '0%'}
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('inventory')}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
          >
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Stock Status</p>
              <p className="text-base font-bold text-slate-100">
                {lowStockCount > 0 ? (
                  <span className="text-amber-400">{lowStockCount} Low Alert{lowStockCount > 1 ? 's' : ''}</span>
                ) : (
                  <span className="text-emerald-400">All Optimal</span>
                )}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-lg ${lowStockCount > 0 ? 'bg-amber-950 border-amber-800/50' : 'bg-slate-750 border-slate-700'} border flex items-center justify-center`}>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 mt-3 overflow-x-auto pb-1 text-xs sm:text-sm font-medium scrollbar-none">
          <button
            id="tab-pos"
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>New Sale / Receipt POS</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Summarized Reports</span>
          </button>

          <button
            id="tab-costs"
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'costs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Daily Costs & Expenses</span>
          </button>

          {activeUser.role === 'admin' && (
            <button
              id="tab-services"
              onClick={() => setActiveTab('services')}
              className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Services & Pricing</span>
            </button>
          )}

          <button
            id="tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Inventory & Stock Depletion</span>
            {lowStockCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center ml-1">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Graphs & Financials</span>
          </button>

          <button
            id="tab-chats"
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Workshop & AI Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </nav>
      </div>
    </header>
  );
};
