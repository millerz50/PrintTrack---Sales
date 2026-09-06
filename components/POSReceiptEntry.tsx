import React, { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Receipt,
  User as UserIcon,
  Phone,
  Tag,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  SaleItem,
  SaleReceipt,
  PrintingCategory,
  PaymentMethod,
  InventoryItem,
  User,
  ServiceItem
} from '../types';
import { storage, CompanyInfo } from '../services/storage';

interface POSReceiptEntryProps {
  inventory: InventoryItem[];
  services: ServiceItem[];
  activeUser: User;
  company: CompanyInfo;
  onReceiptCreated: (receipt: SaleReceipt) => void;
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

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Mobile Money (M-Pesa)',
  'Card',
  'Bank Transfer'
];

export const POSReceiptEntry: React.FC<POSReceiptEntryProps> = ({
  inventory,
  services,
  activeUser,
  company,
  onReceiptCreated
}) => {
  const currency = company.currency || '$';

  const activeServices = useMemo(() => services.filter(s => s.active), [services]);

  // Receipt form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Items in current receipt
  const [items, setItems] = useState<SaleItem[]>([
    {
      id: `item_${Date.now()}_1`,
      description: '',
      category: 'T-Shirt Printing',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
  ]);

  // Selected quick preset helper
  const handleAddService = (service: ServiceItem) => {
    const newItem: SaleItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: service.name,
      category: service.category,
      quantity: 1,
      unitPrice: service.price,
      totalPrice: service.price,
      inventoryItemId: service.inventoryItemId,
      stockDeductionQty: service.inventoryItemId ? 1 : 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleAddItem = () => {
    const newItem: SaleItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: '',
      category: 'T-Shirt Printing',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<SaleItem>) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate item total price
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          const qty = updates.quantity !== undefined ? updates.quantity : item.quantity;
          const price = updates.unitPrice !== undefined ? updates.unitPrice : item.unitPrice;
          updated.totalPrice = Number((qty * price).toFixed(2));
        }

        // If inventory item selected, automatically sync stock deduction
        if (updates.inventoryItemId !== undefined) {
          const matchedInv = inventory.find(i => i.id === updates.inventoryItemId);
          if (matchedInv) {
            if (!item.description || item.description === '') {
              updated.description = matchedInv.name;
            }
            updated.category = matchedInv.category;
            if (item.unitPrice === 0) {
              updated.unitPrice = matchedInv.sellingPrice;
              updated.totalPrice = Number((item.quantity * matchedInv.sellingPrice).toFixed(2));
            }
            updated.stockDeductionQty = 1;
          }
        }

        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      // Keep at least 1 empty row
      setItems([{
        id: `item_${Date.now()}`,
        description: '',
        category: 'T-Shirt Printing',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      }]);
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Financial calculations
  const subtotal = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  const taxAmount = company.taxRate > 0 ? Number(((subtotal - discount) * (company.taxRate / 100)).toFixed(2)) : 0;
  const totalAmount = Math.max(0, Number((subtotal - discount + taxAmount).toFixed(2)));

  const handleSaveAndIssueReceipt = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate items
    const validItems = items.filter(i => i.description.trim() !== '' && i.quantity > 0);
    if (validItems.length === 0) {
      alert('Please enter at least one valid item description and quantity.');
      return;
    }

    const receiptNumber = storage.getNextReceiptNumber();

    const newReceipt = storage.createSaleReceipt({
      receiptNumber,
      date: receiptDate,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      items: validItems,
      subtotal,
      discount,
      tax: taxAmount,
      totalAmount,
      paymentMethod,
      tellerId: activeUser.id,
      tellerName: activeUser.name,
      notes: notes.trim() || undefined
    });

    // Notify parent to trigger modal
    onReceiptCreated(newReceipt);

    // Reset Form for next client
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setNotes('');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setReceiptDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
    setItems([{
      id: `item_${Date.now()}`,
      description: '',
      category: 'T-Shirt Printing',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Quick Service Presets Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Quick Services
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Admin-managed services & prices — click to add
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {activeServices.map(service => {
            const inv = inventory.find(i => i.id === service.inventoryItemId);
            const isLowStock = inv && inv.currentStock <= inv.minThreshold;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleAddService(service)}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/50 transition flex flex-col justify-between group h-full shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {service.code}
                    </span>
                    {inv && (
                      <span className={`text-[10px] font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-500'}`} title={`Current available stock: ${inv.currentStock} ${inv.unit}`}>
                        {inv.currentStock} left
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1.5 line-clamp-2 group-hover:text-indigo-700">{service.name}</p>
                </div>
                <div className="mt-2 text-xs font-bold text-indigo-600">
                  {currency}{service.price.toFixed(2)}
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">/{service.unit}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main POS Receipt Creator Layout */}
      <form onSubmit={handleSaveAndIssueReceipt} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Itemized Receipt Builder */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Itemized Service & Product Breakdown
                </h3>
              </div>
              <button
                type="button"
                id="add-item-row"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            {/* Item Rows Table / Card Grid for mobile */}
            <div className="p-4 space-y-3">
              {items.map((item, index) => {
                const linkedStock = inventory.find(i => i.id === item.inventoryItemId);
                const isInsufficient =
                  linkedStock &&
                  (item.stockDeductionQty || 1) * item.quantity > linkedStock.currentStock;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-slate-300 transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        Item #{index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        {linkedStock && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              isInsufficient
                                ? 'bg-rose-100 text-rose-700 font-bold'
                                : linkedStock.currentStock <= linkedStock.minThreshold
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            Stock: {linkedStock.currentStock} {linkedStock.unit}
                            {isInsufficient && ' (Exceeds stock!)'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Row 1: Description & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-7">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Description / Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, { description: e.target.value })}
                          placeholder="e.g. DTF T-Shirt White L, A4 Glossy Flyer 100s"
                          className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={e =>
                            handleUpdateItem(item.id, {
                              category: e.target.value as PrintingCategory
                            })
                          }
                          className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Inputs Row 2: Link Inventory, Quantity, Unit Price, Total */}
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-2 items-center">
                      <div className="col-span-2 md:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Deduct Stock From Inventory (Optional)
                        </label>
                        <select
                          value={item.inventoryItemId || ''}
                          onChange={e =>
                            handleUpdateItem(item.id, {
                              inventoryItemId: e.target.value || undefined
                            })
                          }
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">-- No stock deduction --</option>
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} ({inv.currentStock} {inv.unit} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={item.quantity}
                          onChange={e =>
                            handleUpdateItem(item.id, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1)
                            })
                          }
                          className="w-full text-xs sm:text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Unit Price ({currency}) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={e =>
                            handleUpdateItem(item.id, {
                              unitPrice: Math.max(0, parseFloat(e.target.value) || 0)
                            })
                          }
                          className="w-full text-xs sm:text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 md:col-span-3 text-right">
                        <span className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                          Total Line Price
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {currency}{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details & Receipt Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-slate-500" />
              Customer Information & Job Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer / Organization Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. St. Jude High School, Walk-in"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 0192"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Receipt Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={receiptDate}
                  onChange={e => setReceiptDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Order Notes / Specifications (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Gloss lamination finish, 24h rush turnaround"
                className="w-full px-3 py-1.5 text-xs bg-slate-50/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Payment Method, Summary, Final Submit */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
              Payment & Checkout
            </h3>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition text-left flex items-center justify-between ${
                      paymentMethod === method
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Discounts */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Discount ({currency})</span>
                <Tag className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={discount || ''}
                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal ({items.length} line items):</span>
                <span className="font-semibold text-white">
                  {currency}{subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-rose-400">
                  <span>Discount Applied:</span>
                  <span>-{currency}{discount.toFixed(2)}</span>
                </div>
              )}

              {company.taxRate > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>VAT / Sales Tax ({company.taxRate}%):</span>
                  <span>{currency}{taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200">TOTAL DUE:</span>
                <span className="text-2xl font-black text-emerald-400">
                  {currency}{totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                Paid via {paymentMethod} • Recorded by {activeUser.name}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                id="submit-sale-button"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center space-x-2 text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Save & Issue Customer Receipt</span>
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Instantly updates inventory levels and records in daily summary log
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
