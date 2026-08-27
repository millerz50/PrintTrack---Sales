import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Clock,
  Edit2,
  Trash2,
  Layers,
  Archive,
  BarChart2,
  TrendingDown
} from 'lucide-react';
import {
  InventoryItem,
  PrintingCategory,
  StockMovement,
  User
} from '../types';
import { CompanyInfo, storage } from '../services/storage';
import { exportStockReportPDF } from '../services/pdfGenerator';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  activeUser: User;
  company: CompanyInfo;
}

const CATEGORIES: PrintingCategory[] = [
  'T-Shirt Printing',
  'Paper Printing',
  'Book Printing',
  'Banners & Signage',
  'Merchandise & Branding',
  'Photocopy & Lamination',
  'Other Services'
];

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  stockMovements,
  activeUser,
  company
}) => {
  const currency = company.currency || '$';

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'movements'>('inventory');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<InventoryItem | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'T-Shirt Printing',
    unit: 'pieces',
    currentStock: 10,
    minThreshold: 5,
    unitCost: 0,
    sellingPrice: 0,
    location: '',
    sku: ''
  });

  // Restock Form State
  const [restockQty, setRestockQty] = useState<number | ''>('');
  const [restockUnitCost, setRestockUnitCost] = useState<number | ''>('');
  const [restockNotes, setRestockNotes] = useState('');

  // Stock Depletion Analysis
  const inventoryAnalysis = storage.getStockDepletionAnalysis();

  const totalInventoryValuation = inventoryAnalysis.reduce((sum, i) => sum + i.stockValuation, 0);
  const lowStockItems = inventoryAnalysis.filter(i => i.status === 'critical' || i.status === 'low');

  // Filtered inventory list
  const filteredItems = inventoryAnalysis.filter(({ item, status }) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItemForRestock(item);
    setRestockQty('');
    setRestockUnitCost(item.unitCost);
    setRestockNotes('');
    setShowRestockModal(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRestock || !restockQty || restockQty <= 0) return;

    storage.restockItem(
      selectedItemForRestock.id,
      Number(restockQty),
      restockUnitCost ? Number(restockUnitCost) : selectedItemForRestock.unitCost,
      restockNotes,
      activeUser.name
    );

    setShowRestockModal(false);
    setSelectedItemForRestock(null);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.unit) return;

    const sku = newItem.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;
    const createdItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newItem.name.trim(),
      category: (newItem.category as PrintingCategory) || 'T-Shirt Printing',
      unit: newItem.unit.trim(),
      currentStock: Number(newItem.currentStock) || 0,
      minThreshold: Number(newItem.minThreshold) || 5,
      unitCost: Number(newItem.unitCost) || 0,
      sellingPrice: Number(newItem.sellingPrice) || 0,
      location: newItem.location?.trim() || 'Workshop Main Rack',
      sku,
      lastRestocked: new Date().toISOString().split('T')[0],
      depletionRatePerDay: 1.0
    };

    storage.saveInventoryItem(createdItem);
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: 'T-Shirt Printing',
      unit: 'pieces',
      currentStock: 10,
      minThreshold: 5,
      unitCost: 0,
      sellingPrice: 0,
      location: '',
      sku: ''
    });
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (activeUser.role !== 'admin') {
      alert('Only administrators can remove items from the catalog.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      storage.deleteInventoryItem(id);
    }
  };

  const handleExportPDF = () => {
    exportStockReportPDF(inventoryAnalysis, company, activeUser.name);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Real-Time Inventory & Stock Depletion Monitoring
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live material balances, automatic sales depletion deductions, velocity run-rate calculations, and reorder alerts.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              id="export-stock-pdf-btn"
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export Stock Audit (PDF)</span>
            </button>

            {activeUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                id="add-stock-item-btn"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Material / Stock</span>
              </button>
            )}
          </div>
        </div>

        {/* Inventory KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Total Stock Items
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {inventory.length} SKUs
            </div>
            <span className="text-[10px] text-slate-400">
              In printing workshop catalog
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Total Stock Valuation
            </span>
            <div className="text-xl font-black text-indigo-600 mt-0.5">
              {currency}{totalInventoryValuation.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">
              At current unit purchase cost
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Low / Critical Stock Alert
            </span>
            <div className="text-xl font-bold text-amber-600 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStockItems.length} Material{lowStockItems.length === 1 ? '' : 's'}</span>
            </div>
            <span className="text-[10px] text-amber-700">
              Below safety threshold
            </span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Average Depletion Rate
            </span>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {(
                inventoryAnalysis.reduce((sum, i) => sum + i.depletionRate, 0) /
                (inventoryAnalysis.length || 1)
              ).toFixed(1)} /day
            </div>
            <span className="text-[10px] text-slate-400">
              Calculated from sales velocity
            </span>
          </div>
        </div>
      </div>

      {/* View Sub-Tabs & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sub-tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('inventory')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeSubTab === 'inventory'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inventory & Depletion Table
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('movements')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeSubTab === 'movements'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Movement Audit Log ({stockMovements.length})
            </button>
          </div>

          {/* Search & Category filter */}
          {activeSubTab === 'inventory' && (
            <div className="flex items-center flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search item, SKU..."
                  className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All Depletion Statuses</option>
                <option value="critical">Critical (0 In Stock)</option>
                <option value="low">Low Stock (Reorder)</option>
                <option value="healthy">Healthy</option>
                <option value="overstocked">Overstocked</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Real-Time Stock Table */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Current Stock</th>
                  <th className="py-3 px-3 text-center">Min Safety</th>
                  <th className="py-3 px-3 text-center">Depletion Rate</th>
                  <th className="py-3 px-3 text-center">Est. Run-Out</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3 text-right font-bold">Valuation</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No inventory items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(({ item, depletionRate, daysOfStockLeft, status, stockValuation }) => {
                    const isLow = status === 'low' || status === 'critical';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>SKU: {item.sku}</span>
                            {item.location && <span>• {item.location}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-sm">
                          <span className={isLow ? 'text-rose-600 font-black' : 'text-slate-800'}>
                            {item.currentStock}
                          </span>
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            {item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500">
                          {item.minThreshold} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-700">
                          <span className="inline-flex items-center gap-0.5 text-slate-800 font-semibold">
                            <TrendingDown className="w-3 h-3 text-rose-500" />
                            {depletionRate} {item.unit}/day
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">
                          {daysOfStockLeft <= 3 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              {daysOfStockLeft === 0 ? 'Out of Stock' : `${daysOfStockLeft} days left`}
                            </span>
                          ) : daysOfStockLeft <= 7 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {daysOfStockLeft} days left
                            </span>
                          ) : daysOfStockLeft > 365 ? (
                            <span className="text-slate-400 text-[11px]">&gt; 1 year</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">{daysOfStockLeft} days</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 font-medium">
                          {currency}{item.unitCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          {currency}{stockValuation.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {status === 'critical' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              OUT OF STOCK
                            </span>
                          ) : status === 'low' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                              REORDER
                            </span>
                          ) : status === 'overstocked' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                              OVERSTOCKED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              HEALTHY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenRestock(item)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition"
                            title="Add Stock / Restock"
                          >
                            + Restock
                          </button>
                          {activeUser.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Movement Audit Log */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Stock In & Out Audit Trail ({stockMovements.length} logged movements)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3 text-center">Movement Type</th>
                  <th className="py-3 px-3 text-center">Quantity Delta</th>
                  <th className="py-3 px-3">Reason / Reference Notes</th>
                  <th className="py-3 px-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockMovements.map(mov => (
                    <tr key={mov.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {mov.date.replace('T', ' ')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {mov.itemName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {mov.type === 'restock' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1 w-fit mx-auto">
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            RESTOCK INTAKE
                          </span>
                        ) : mov.type === 'sale_deduction' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 flex items-center justify-center gap-1 w-fit mx-auto">
                            <ArrowDownRight className="w-3 h-3 text-rose-500" />
                            SALE DEDUCTION
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 flex items-center justify-center gap-1 w-fit mx-auto">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            WASTE / DAMAGE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sm">
                        <span className={mov.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {mov.notes || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {mov.performedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Restock Item */}
      {showRestockModal && selectedItemForRestock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Restock: {selectedItemForRestock.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Current Balance: <strong className="text-slate-800">{selectedItemForRestock.currentStock} {selectedItemForRestock.unit}</strong>
            </p>

            <form onSubmit={handleSaveRestock} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity to Add ({selectedItemForRestock.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  autoFocus
                  value={restockQty}
                  onChange={e => setRestockQty(parseInt(e.target.value) || '')}
                  placeholder="e.g. 50"
                  className="w-full text-sm font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Unit Purchase Cost ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={restockUnitCost}
                  onChange={e => setRestockUnitCost(parseFloat(e.target.value) || '')}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Batch Reference Notes
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={e => setRestockNotes(e.target.value)}
                  placeholder="e.g. Invoice #PO-902, Prime Textiles"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Inventory Item */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Add New Material or Stock Item
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add raw blanks, papers, inks, binding casements, or merchandise blanks into tracking.
            </p>

            <form onSubmit={handleSaveNewItem} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Material / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. 100% Ring-Spun Cotton T-Shirt (Navy, M)"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newItem.category}
                    onChange={e =>
                      setNewItem({ ...newItem, category: e.target.value as PrintingCategory })
                    }
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measurement *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="pieces, reams, rolls, boxes..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.currentStock}
                    onChange={e =>
                      setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Reorder Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.minThreshold}
                    onChange={e =>
                      setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) || 5 })
                    }
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Purchase Cost ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.unitCost}
                    onChange={e =>
                      setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Selling Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.sellingPrice}
                    onChange={e =>
                      setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU / Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="e.g. TSH-NVY-100"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Storage Location / Bay
                  </label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="e.g. Shelf A - Bin 3"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Save Material Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
