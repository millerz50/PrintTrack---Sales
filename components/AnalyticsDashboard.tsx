import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  Package,
  ShoppingBag,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { SaleReceipt, DailyExpense, InventoryItem } from '../types';
import { CompanyInfo, storage } from '../services/storage';

interface AnalyticsDashboardProps {
  sales: SaleReceipt[];
  expenses: DailyExpense[];
  inventory: InventoryItem[];
  company: CompanyInfo;
  selectedDate: string;
}

const CATEGORY_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#64748b'];
const EXPENSE_COLORS = ['#f43f5e', '#fb923c', '#eab308', '#a855f7', '#06b6d4', '#64748b'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sales,
  expenses,
  inventory,
  company,
  selectedDate
}) => {
  const currency = company.currency || '$';
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const daysCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;

  // 1. Dynamic Multi-Day Financial Trend (Revenue, Operational Expenses, COGS, Net Profit)
  const trendData = useMemo(() => {
    const dates: string[] = [];
    const currentDate = new Date(selectedDate || new Date().toISOString().split('T')[0]);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map(dateStr => {
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      const dayExpenses = expenses.filter(e => e.date === dateStr);

      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const expenseTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Calculate COGS
      let cogs = 0;
      daySales.forEach(s => {
        s.items.forEach(item => {
          if (item.inventoryItemId) {
            const inv = inventory.find(i => i.id === item.inventoryItemId);
            if (inv) {
              cogs += inv.unitCost * (item.stockDeductionQty || 1) * item.quantity;
            }
          }
        });
      });

      const grossProfit = revenue - cogs;
      const netProfit = revenue - (cogs + expenseTotal);

      const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return {
        date: dateLabel,
        fullDate: dateStr,
        Revenue: Number(revenue.toFixed(2)),
        Expenses: Number(expenseTotal.toFixed(2)),
        COGS: Number(cogs.toFixed(2)),
        NetProfit: Number(netProfit.toFixed(2)),
        Transactions: daySales.length
      };
    });
  }, [sales, expenses, inventory, selectedDate, daysCount]);

  // Totals for selected timeframe
  const totalPeriodRevenue = trendData.reduce((sum, d) => sum + d.Revenue, 0);
  const totalPeriodExpenses = trendData.reduce((sum, d) => sum + d.Expenses, 0);
  const totalPeriodNetProfit = trendData.reduce((sum, d) => sum + d.NetProfit, 0);
  const totalPeriodOrders = trendData.reduce((sum, d) => sum + d.Transactions, 0);
  const averageNetMargin = totalPeriodRevenue > 0 ? ((totalPeriodNetProfit / totalPeriodRevenue) * 100).toFixed(1) : '0';

  // 2. Hourly Sales Rush & Order Peak Inflow
  const hourlyRushData = useMemo(() => {
    // Hours from 08:00 to 18:00
    const hourSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const currentSales = sales.filter(s => s.date.startsWith(selectedDate));

    return hourSlots.map(slot => {
      const slotHour = parseInt(slot.split(':')[0], 10);
      const matching = currentSales.filter(s => {
        if (!s.date.includes('T')) return false;
        const timePart = s.date.split('T')[1];
        const h = parseInt(timePart.split(':')[0], 10);
        return h === slotHour;
      });

      const volume = matching.reduce((sum, s) => sum + s.totalAmount, 0);
      return {
        hour: slot,
        Revenue: Number(volume.toFixed(2)),
        Orders: matching.length
      };
    });
  }, [sales, selectedDate]);

  // 3. Stock Depletion Velocity & Days of Buffer
  const stockDepletionData = useMemo(() => {
    const analysis = storage.getStockDepletionAnalysis();
    return analysis
      .sort((a, b) => b.depletionRate - a.depletionRate)
      .slice(0, 7)
      .map(item => ({
        name: item.item.name.length > 20 ? item.item.name.slice(0, 18) + '...' : item.item.name,
        fullName: item.item.name,
        currentStock: item.item.currentStock,
        depletionRate: item.depletionRate,
        daysLeft: Math.min(item.daysOfStockLeft, 45),
        status: item.status,
        unit: item.item.unit
      }));
  }, [inventory]);

  // 4. Printing Category Revenue Distribution
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        catMap[item.category] = (catMap[item.category] || 0) + item.totalPrice;
      });
    });

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  }, [sales]);

  // 5. Expense Breakdown Structure
  const expenseBreakdownData = useMemo(() => {
    const expMap: Record<string, number> = {};
    expenses.forEach(exp => {
      expMap[exp.category] = (expMap[exp.category] || 0) + exp.amount;
    });

    return Object.entries(expMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  }, [expenses]);

  // 6. Payment Methods Distribution
  const paymentData = useMemo(() => {
    const payMap: Record<string, number> = {};
    sales.forEach(sale => {
      payMap[sale.paymentMethod] = (payMap[sale.paymentMethod] || 0) + sale.totalAmount;
    });

    return Object.entries(payMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  }, [sales]);

  return (
    <div className="space-y-6">
      {/* Top Header & Timeframe Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Financial Graphs & Stock Depletion Intelligence
              </h2>
              <p className="text-xs text-slate-500">
                Real-time visual telemetry on cash velocity, operational burn rates, profit margins & peak hours.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Chart Style Toggles */}
        <div className="flex items-center space-x-2">
          {/* Chart Style Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                chartType === 'bar' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Bar Chart Mode"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                chartType === 'area' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Area Chart Mode"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === '7d' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('14d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === '14d' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === '30d' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip for Selected Timeframe */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Period Total Revenue
            </span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {currency}{totalPeriodRevenue.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <ShoppingBag className="w-3 h-3 text-slate-400" />
              {totalPeriodOrders} total receipts issued
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Period Total Expenses
            </span>
            <p className="text-xl font-black text-rose-600 mt-0.5">
              {currency}{totalPeriodExpenses.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-rose-400" />
              Operating costs & utilities
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Period Net Profit
            </span>
            <p className={`text-xl font-black mt-0.5 ${totalPeriodNetProfit >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
              {currency}{totalPeriodNetProfit.toFixed(2)}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
              <Percent className="w-3 h-3" />
              {averageNetMargin}% average net margin
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Catalog Stock Valuation
            </span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {currency}{storage.getStockDepletionAnalysis().reduce((sum, i) => sum + i.stockValuation, 0).toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Package className="w-3 h-3 text-slate-400" />
              {inventory.length} tracked materials & SKUs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 1: Main Financial Trajectory Graph & Stock Depletion Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Revenue vs Expenses vs Net Profit Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Financial Trajectory ({timeframe.toUpperCase()}: Revenue vs Expenses vs Net Profit)
              </h3>
              <p className="text-[11px] text-slate-400">
                Daily sales inflow contrasted against operational costs and net business margin
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`]}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Revenue" fill="#10b981" name="Gross Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" name="Operating Costs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NetProfit" fill="#6366f1" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`]}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                  <Area type="monotone" dataKey="NetProfit" stroke="#6366f1" fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                  <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} name="Operating Costs" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Depletion Burn Rate Velocity Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stock Burn Velocity & Days Remaining
              </h3>
              <p className="text-[11px] text-slate-400">
                Daily material consumption rate vs estimated days before run-out
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockDepletionData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} ${name === 'depletionRate' ? 'units/day' : 'days left'}`,
                    name === 'depletionRate' ? 'Daily Depletion Velocity' : 'Days of Stock Left'
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="depletionRate" fill="#f59e0b" name="Daily Depletion (Units/Day)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="daysLeft" fill="#3b82f6" name="Days Stock Left (Cap 45d)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Hourly Sales Rush Peak Chart + Expense Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Rush Hours & Inflow Peak */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Hourly Workshop Rush & Peak Order Hours ({selectedDate})
              </h3>
              <p className="text-[11px] text-slate-400">
                Identifies busy printing hours to optimize heat-press, printer warmup & staff shifts
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyRushData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`, 'Sales Inflow']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorHourly)" name="Hourly Sales Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Expense Breakdown Pie */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-rose-500" />
            Operating Expense Structure
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Allocation across Inks, Utilities, Logistics & Machine Maintenance
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`, 'Cost Amount']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Printing Category Revenue Share & Payment Channels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            Revenue Share by Printing Category
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            T-Shirts vs Paper & Flyers vs Books vs Large Format Banners vs Merch
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Split */}
        <div className="md:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            Payment Channel Split & Cash Drawer Velocity
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Physical Cash in drawer vs Mobile Money (M-Pesa) vs Cards & Bank Transfer
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-pay-${index}`} fill={['#10b981', '#06b6d4', '#6366f1', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${currency}${Number(value).toFixed(2)}`, 'Collected Amount']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
