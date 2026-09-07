'use client';

import React from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { DailyFinancialSummary } from '../types';

interface KpiStripProps {
  summary: DailyFinancialSummary;
  lowStockCount: number;
  currency: string;
  onInventory: () => void;
}

export function KpiStrip({
  summary,
  lowStockCount,
  currency,
  onInventory,
}: KpiStripProps) {
  const profitMargin =
    summary.totalRevenue > 0
      ? Math.round(
          (summary.netProfit /
            summary.totalRevenue) *
            100
        )
      : 0;

  return (
    <div
      className="
        grid
        grid-cols-4
        gap-2
        border-t
        border-slate-100
        py-2.5

        dark:border-slate-900
      "
    >
      <Kpi
        label="Revenue"
        value={`${currency}${summary.totalRevenue.toFixed(2)}`}
        icon={<DollarSign />}
        type="success"
      />

      <Kpi
        label="Expenses"
        value={`${currency}${summary.totalExpenses.toFixed(2)}`}
        icon={<TrendingDown />}
        type="danger"
      />

      <Kpi
        label={`Net Profit · ${profitMargin}%`}
        value={`${currency}${summary.netProfit.toFixed(2)}`}
        icon={<TrendingUp />}
        type={
          summary.netProfit >= 0
            ? 'success'
            : 'warning'
        }
      />

      <button
        type="button"
        onClick={onInventory}
        className="
          flex
          min-w-0
          items-center
          justify-between
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-3
          py-2
          text-left
          transition
          hover:bg-slate-100

          dark:border-slate-800
          dark:bg-slate-900
          dark:hover:bg-slate-800
        "
      >
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Inventory
          </p>

          <p
            className={`
              truncate
              text-xs
              font-bold
              ${
                lowStockCount
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            `}
          >
            {lowStockCount
              ? `${lowStockCount} Low Stock`
              : 'Stock Optimal'}
          </p>
        </div>

        <AlertTriangle
          className={`
            h-4 w-4 shrink-0
            ${
              lowStockCount
                ? 'text-amber-500'
                : 'text-slate-400'
            }
          `}
        />
      </button>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  type: 'success' | 'danger' | 'warning';
}) {
  const styles = {
    success:
      'text-emerald-600 dark:text-emerald-400',
    danger:
      'text-rose-600 dark:text-rose-400',
    warning:
      'text-amber-600 dark:text-amber-400',
  };

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        justify-between
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        px-3
        py-2

        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="min-w-0">
        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p
          className={`truncate text-sm font-bold ${styles[type]}`}
        >
          {value}
        </p>
      </div>

      <span className={styles[type]}>
        <span className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </span>
    </div>
  );
}
