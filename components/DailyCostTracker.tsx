import React, { useState } from 'react';
import {
  TrendingDown,
  PlusCircle,
  Trash2,
  Calendar,
  CreditCard,
  DollarSign,
  Tag,
  Receipt,
  PieChart,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { DailyExpense, ExpenseCategory, User, DailyFinancialSummary, PaymentMethod } from '../types';
import { CompanyInfo, storage } from '../services/storage';
import { createExpenseAction, deleteExpenseAction } from '@/app/actions/expenses';

interface DailyCostTrackerProps {
  expenses: DailyExpense[];
  activeUser: User;
  company: CompanyInfo;
  selectedDate: string;
  onDateChange: (date: string) => void;
  summary: DailyFinancialSummary;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Raw Materials & Stock',
  'Inks & Toners',
  'Machine Maintenance',
  'Electricity & Utilities',
  'Rent & Workspace',
  'Staff & Wages',
  'Logistics & Transport',
  'Packaging & Supplies',
  'Miscellaneous'
];

export const DailyCostTracker: React.FC<DailyCostTrackerProps> = ({
  expenses,
  activeUser,
  company,
  selectedDate,
  onDateChange,
  summary
}) => {
  const currency = company.currency || '$';

  // New Expense Form state
  const [category, setCategory] = useState<ExpenseCategory>('Inks & Toners');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [receiptRef, setReceiptRef] = useState('');
  const [expenseDate, setExpenseDate] = useState(selectedDate);

  // Filter expenses by selected date
  const dateExpenses = expenses.filter(e => e.date === selectedDate);
  const totalDailyExpense = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for visual breakdown
  const categoryTotals: Record<string, number> = {};
  dateExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter a brief description for this expense.');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newExpense = storage.createExpense({
      date: expenseDate,
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod,
      recordedBy: activeUser.name,
      tellerRole: activeUser.role,
      receiptRef: receiptRef.trim() || undefined
    });

    createExpenseAction(newExpense).catch(err => {
      console.warn('[Expenses] DB write fallback:', err);
    });

    // Reset form
    setDescription('');
    setAmount('');
    setReceiptRef('');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to remove this cost entry?')) {
      storage.deleteExpense(id);
      deleteExpenseAction(id).catch(err => {
        console.warn('[Expenses] DB delete fallback:', err);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Barometer */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Daily Operational & Material Cost Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Log workshop materials, generator fuel, ink refills, machine maintenance, wages, and store expenses for <span className="font-semibold text-slate-700">{selectedDate}</span>.
            </p>
          </div>

          {/* Quick Date Sync */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Audit Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                onDateChange(e.target.value);
                setExpenseDate(e.target.value);
              }}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Financial KPI comparison for date */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Total Expenses for {selectedDate}
            </span>
            <div className="text-xl font-black text-rose-600 mt-0.5">
              {currency}{totalDailyExpense.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">
              {dateExpenses.length} expense transactions
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Daily Revenue Generated
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {currency}{summary.totalRevenue.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">
              From sales & printing orders
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Expense Ratio
            </span>
            <div className="text-xl font-bold text-slate-700 mt-0.5">
              {summary.totalRevenue > 0
                ? `${Math.round((totalDailyExpense / summary.totalRevenue) * 100)}%`
                : '100%'}
            </div>
            <span className="text-[10px] text-slate-400">
              Costs as % of today's revenue
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Cash Drawer Outflow
            </span>
            <div className="text-xl font-bold text-slate-800 mt-0.5">
              {currency}{summary.cashExpenses.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">
              Paid straight from register cash
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Expense Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Enter Daily Cost Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4"
          >
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Record New Daily Expense / Cost
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost / Expense Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Purpose *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Bought 2 Liters Cyan Eco-Solvent Ink, Generator diesel top-up..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || '')}
                  placeholder="0.00"
                  className="w-full text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EcoCash">EcoCash</option>
                  <option value="Cash">Cash (Drawer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt / Supplier Voucher Ref # (Optional)
              </label>
              <input
                type="text"
                value={receiptRef}
                onChange={e => setReceiptRef(e.target.value)}
                placeholder="e.g. INV-9902, PETTY-04"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="submit-expense-button"
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center justify-center space-x-2 text-xs"
              >
                <TrendingDown className="w-4 h-4" />
                <span>Save Expense Entry</span>
              </button>
              <span className="block text-[11px] text-center text-slate-400 mt-1.5">
                Logged under {activeUser.name} ({activeUser.role})
              </span>
            </div>
          </form>

          {/* Category Breakdown Mini-Card */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-slate-500" />
                Category Distribution ({selectedDate})
              </h4>
              <div className="space-y-2">
                {Object.entries(categoryTotals).map(([cat, total]) => {
                  const pct = Math.round((total / totalDailyExpense) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className="font-medium truncate max-w-[200px]">{cat}</span>
                        <span className="font-bold text-rose-600">
                          {currency}{total.toFixed(2)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 7 cols: Table of Logged Expenses for Date */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Logged Cost Entries for {selectedDate} ({dateExpenses.length})
              </h3>
              <span className="text-xs font-bold text-rose-600">
                Sum: {currency}{totalDailyExpense.toFixed(2)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Paid Via</th>
                    <th className="py-3 px-3">Recorded By</th>
                    <th className="py-3 px-3 text-right font-bold">Amount</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dateExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No expenses logged yet for {selectedDate}. Use the form on the left to enter daily costs.
                      </td>
                    </tr>
                  ) : (
                    dateExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <p className="font-medium text-slate-900">{exp.description}</p>
                          {exp.receiptRef && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Ref: {exp.receiptRef}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {exp.paymentMethod}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {exp.recordedBy}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-600 text-sm">
                          {currency}{exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {activeUser.role === 'admin' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Delete Expense Entry (Admin Only)"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
