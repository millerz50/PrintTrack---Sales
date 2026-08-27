import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  ArrowUpDown,
  PlusCircle
} from 'lucide-react';
import {
  SaleReceipt,
  DailyExpense,
  InventoryItem,
  User,
  DailyFinancialSummary,
  PrintingCategory
} from '../types';
import { CompanyInfo, storage } from '../services/storage';
import { exportDailySummaryPDF } from '../services/pdfGenerator';

interface DailyReportsViewProps {
  sales: SaleReceipt[];
  expenses: DailyExpense[];
  inventory: InventoryItem[];
  activeUser: User;
  company: CompanyInfo;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSelectReceiptForPreview: (receipt: SaleReceipt) => void;
  onNavigateToPOS: () => void;
  onNavigateToCosts: () => void;
}

export const DailyReportsView: React.FC<DailyReportsViewProps> = ({
  sales,
  expenses,
  inventory,
  activeUser,
  company,
  selectedDate,
  onDateChange,
  onSelectReceiptForPreview,
  onNavigateToPOS,
  onNavigateToCosts
}) => {
  const currency = company.currency || '$';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'itemized' | 'receipts'>('itemized');

  // Filter sales for the selected date
  const dateSales = sales.filter(s => s.date.startsWith(selectedDate));
  const dateExpenses = expenses.filter(e => e.date === selectedDate);
  const dailySummary: DailyFinancialSummary = storage.getDailySummary(selectedDate);

  // Flattened itemized rows for the summarized receipt format requested by user:
  // "summarized receipt format description ,qnty,unit prize,date,total price"
  const flattenedItemRows = dateSales.flatMap(receipt => {
    return receipt.items.map(item => ({
      receiptId: receipt.id,
      receiptNumber: receipt.receiptNumber,
      customerName: receipt.customerName || 'Walk-in Client',
      customerPhone: receipt.customerPhone,
      date: receipt.date,
      paymentMethod: receipt.paymentMethod,
      tellerName: receipt.tellerName,
      synced: receipt.synced,
      rawReceipt: receipt,
      // Item fields
      itemId: item.id,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }));
  });

  // Apply search and category filter
  const filteredItemRows = flattenedItemRows.filter(row => {
    const matchesSearch =
      row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || row.category === selectedCategory;
    const matchesPayment = selectedPayment === 'all' || row.paymentMethod === selectedPayment;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  const filteredReceipts = dateSales.filter(receipt => {
    const matchesSearch =
      (receipt.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.items.some(i => i.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPayment = selectedPayment === 'all' || receipt.paymentMethod === selectedPayment;
    return matchesSearch && matchesPayment;
  });

  // Export Daily Summary PDF
  const handleExportPDF = () => {
    const lowStockAlerts = inventory
      .filter(i => i.currentStock <= i.minThreshold)
      .map(i => ({
        name: i.name,
        currentStock: i.currentStock,
        unit: i.unit,
        minThreshold: i.minThreshold
      }));

    exportDailySummaryPDF(
      selectedDate,
      dateSales,
      dateExpenses,
      dailySummary,
      company,
      lowStockAlerts,
      activeUser.name
    );
  };

  const handleDeleteReceipt = (id: string, receiptNum: string) => {
    if (activeUser.role !== 'admin') {
      alert('Only administrators can void or delete completed sales receipts.');
      return;
    }
    if (confirm(`Are you sure you want to void receipt ${receiptNum}? This will remove it from the daily financial tally.`)) {
      storage.deleteSaleReceipt(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Audit Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Daily Sales & Receipt Audit Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Summarized daily transaction log, itemized line items, cost balance, and cash register audit for <span className="font-semibold text-slate-700">{selectedDate}</span>.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              id="export-pdf-summary-btn"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Daily Summary (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToPOS}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>New POS Sale</span>
            </button>
          </div>
        </div>

        {/* Daily Financial Balancing Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Total Revenue
            </span>
            <span className="text-base font-bold text-emerald-600">
              {currency}{dailySummary.totalRevenue.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {dailySummary.totalTransactions} transactions
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Cost of Goods (Est.)
            </span>
            <span className="text-base font-bold text-slate-700">
              {currency}{dailySummary.totalCostOfGoods.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Raw stock consumed
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Daily Expenses / Costs
            </span>
            <span className="text-base font-bold text-rose-600">
              {currency}{dailySummary.totalExpenses.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {dateExpenses.length} expense entries
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Net Profit
            </span>
            <span className={`text-base font-bold ${dailySummary.netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              {currency}{dailySummary.netProfit.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Revenue - (COGS + Exp)
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Cash in Drawer
            </span>
            <span className="text-base font-bold text-blue-600">
              {currency}{dailySummary.closingCashInDrawer.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Cash In ({currency}{dailySummary.cashSales.toFixed(0)}) - Out ({currency}{dailySummary.cashExpenses.toFixed(0)})
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Digital / M-Pesa
            </span>
            <span className="text-base font-bold text-indigo-600">
              {currency}{dailySummary.digitalSales.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Cards & Transfers
            </span>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search description, customer, receipt #..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Service Categories</option>
              <option value="T-Shirt Printing">T-Shirt Printing</option>
              <option value="Paper Printing">Paper Printing</option>
              <option value="Book Printing">Book Printing</option>
              <option value="Banners & Signage">Banners & Signage</option>
              <option value="Merchandise & Branding">Merchandise & Branding</option>
              <option value="Photocopy & Lamination">Photocopy & Lamination</option>
              <option value="Other Services">Other Services</option>
            </select>

            <select
              value={selectedPayment}
              onChange={e => setSelectedPayment(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money (M-Pesa)">Mobile Money (M-Pesa)</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('itemized')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  viewMode === 'itemized'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Summarized Items
              </button>
              <button
                type="button"
                onClick={() => setViewMode('receipts')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  viewMode === 'receipts'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Summarized Receipt Format */}
      {viewMode === 'itemized' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Itemized Daily Sales Table ({filteredItemRows.length} items logged)
            </h3>
            <span className="text-[11px] text-slate-500">
              Format: Description • Quantity • Unit Price • Date • Total Price
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Description / Service</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Quantity (Qnty)</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right font-bold">Total Price</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Receipt Ref #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItemRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No sales records found matching the filters for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  filteredItemRows.map(row => (
                    <tr key={`${row.receiptId}_${row.itemId}`} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.description}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {row.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {currency}{row.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        {currency}{row.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {row.date.split('T')[1] || row.date}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-indigo-600 font-medium">
                        {row.receiptNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {row.customerName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-600">
                          {row.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectReceiptForPreview(row.rawReceipt)}
                          className="p-1 text-slate-500 hover:text-indigo-600 rounded transition"
                          title="View / Print Receipt"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredItemRows.length > 0 && (
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-3 px-4">
                      Daily Total ({filteredItemRows.length} items)
                    </td>
                    <td className="py-3 px-3 text-center">
                      {filteredItemRows.reduce((sum, r) => sum + r.quantity, 0)} units
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">-</td>
                    <td className="py-3 px-3 text-right text-emerald-700 text-sm font-black">
                      {currency}{filteredItemRows.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(2)}
                    </td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* Receipts Grouped View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Customer Receipts Grouped View ({filteredReceipts.length} total receipts)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3 text-center">Line Items</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Teller</th>
                  <th className="py-3 px-3 text-right font-bold">Total Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No customer receipts found for {selectedDate}.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map(receipt => (
                    <tr key={receipt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {receipt.receiptNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {receipt.date.split('T')[1] || receipt.date}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {receipt.customerName || 'Walk-in'}
                        {receipt.customerPhone && (
                          <span className="block text-[10px] text-slate-400">
                            {receipt.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {receipt.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">
                        {receipt.items.length}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {receipt.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {receipt.tellerName}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 text-sm">
                        {currency}{receipt.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectReceiptForPreview(receipt)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition"
                          title="View / Print Receipt"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        {activeUser.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReceipt(receipt.id, receipt.receiptNumber)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Void / Delete Receipt"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
