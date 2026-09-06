'use client';

import React, { useState, useMemo } from 'react';
import {
  Quotation,
  QuotationItem,
  QuotationStatus,
  ServiceItem,
  InventoryItem,
  User,
  PaymentMethod,
  SaleReceipt
} from '@/types';
import { CompanyInfo, storage } from '@/services/storage';
import { exportQuotationPDF } from '@/services/pdfGenerator';
import { MagenLogo } from './MagenLogo';
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Trash2,
  Printer,
  Sparkles,
  Calendar,
  DollarSign,
  UserCheck,
  Building,
  Check
} from 'lucide-react';

interface QuotationManagerProps {
  quotations: Quotation[];
  services: ServiceItem[];
  inventory: InventoryItem[];
  activeUser: User;
  company: CompanyInfo;
  onSelectQuotation: (quotation: Quotation) => void;
  onConvertToReceipt: (quotation: Quotation, paymentMethod: PaymentMethod) => void;
  onReceiptCreated?: (receipt: SaleReceipt) => void;
}

export function QuotationManager({
  quotations,
  services,
  inventory,
  activeUser,
  company,
  onSelectQuotation,
  onConvertToReceipt,
  onReceiptCreated
}: QuotationManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Quotation Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(company.taxRate || 0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. Valid for 14 calendar days from date of issue.\n' +
    '2. 50% deposit required upon order confirmation; balance on delivery.\n' +
    '3. Production turnaround begins after signed proof approval.'
  );

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const get14DaysLaterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTodayStr());
  const [validUntil, setValidUntil] = useState(get14DaysLaterStr());

  // Form Items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: `qitem_${Date.now()}_1`,
      description: '',
      category: 'Paper Printing',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      unit: 'job'
    }
  ]);

  const currency = company.currency || '$';

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        q.quoteNumber.toLowerCase().includes(search) ||
        q.customerName.toLowerCase().includes(search) ||
        (q.customerPhone && q.customerPhone.includes(search)) ||
        (q.customerEmail && q.customerEmail.toLowerCase().includes(search)) ||
        q.items.some(i => i.description.toLowerCase().includes(search));
      return matchStatus && matchSearch;
    });
  }, [quotations, statusFilter, searchTerm]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = quotations.length;
    const accepted = quotations.filter(q => q.status === 'Accepted' || q.status === 'Converted');
    const acceptedValue = accepted.reduce((sum, q) => sum + q.totalAmount, 0);
    const pending = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft');
    const pendingValue = pending.reduce((sum, q) => sum + q.totalAmount, 0);

    return {
      totalCount,
      acceptedCount: accepted.length,
      acceptedValue,
      pendingCount: pending.length,
      pendingValue
    };
  }, [quotations]);

  // Form item manipulation
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `qitem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        description: '',
        category: 'Paper Printing',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        unit: 'job'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) || 0 : item.quantity;
        const price = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
        item.totalPrice = Math.max(0, qty * price);
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSelectPredefinedService = (index: number, serviceId: string) => {
    const s = services.find(srv => srv.id === serviceId);
    if (!s) return;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        description: s.name,
        category: s.category,
        unitPrice: s.price,
        unit: s.unit || 'unit',
        totalPrice: updated[index].quantity * s.price,
        notes: s.notes || ''
      };
      return updated;
    });
  };

  // Form Calculations
  const formSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  }, [items]);

  const formTaxAmount = useMemo(() => {
    const discounted = Math.max(0, formSubtotal - (discount || 0));
    return (discounted * (taxRate || 0)) / 100;
  }, [formSubtotal, discount, taxRate]);

  const formGrandTotal = useMemo(() => {
    const discounted = Math.max(0, formSubtotal - (discount || 0));
    return discounted + formTaxAmount;
  }, [formSubtotal, discount, formTaxAmount]);

  const handleCreateQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer or organization name.');
      return;
    }

    if (items.length === 0 || !items.some(i => i.description.trim())) {
      alert('Please include at least one item description with pricing.');
      return;
    }

    const validItems = items
      .filter(i => i.description.trim())
      .map(i => ({
        ...i,
        quantity: Math.max(1, i.quantity),
        unitPrice: Math.max(0, i.unitPrice),
        totalPrice: Math.max(0, i.quantity * i.unitPrice)
      }));

    const quoteNumber = storage.getNextQuoteNumber();

    const created = storage.saveQuotation({
      quoteNumber,
      date,
      validUntil,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      items: validItems,
      subtotal: formSubtotal,
      discount: discount || 0,
      taxRate,
      taxAmount: formTaxAmount,
      totalAmount: formGrandTotal,
      status: 'Sent',
      notes: notes.trim() || undefined,
      terms,
      preparedBy: activeUser.name
    });

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setDiscount(0);
    setNotes('');
    setItems([
      {
        id: `qitem_${Date.now()}_1`,
        description: '',
        category: 'Paper Printing',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        unit: 'job'
      }
    ]);
    setIsCreateModalOpen(false);

    // Open created quotation
    onSelectQuotation(created);
  };

  const statusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Check className="w-3 h-3 text-purple-600" />
            Converted
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            Sent
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <MagenLogo variant="monogram" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#0C2D64] tracking-tight">
                  Quotations &amp; Cotations
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  Magen Sales Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate professional formal price estimates, export branded A4 PDFs with logo colors, or convert to sales receipts in one click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0C2D64] hover:bg-[#081e44] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              New Quotation / Cotation
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Quotes</span>
            <div className="text-xl font-black text-[#0C2D64] mt-0.5">{metrics.totalCount}</div>
            <span className="text-[10px] text-slate-500">Issued to clients</span>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/80">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">Accepted / Won</span>
            <div className="text-xl font-black text-emerald-800 mt-0.5">
              {currency}{metrics.acceptedValue.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-600">{metrics.acceptedCount} quote{metrics.acceptedCount !== 1 ? 's' : ''} confirmed</span>
          </div>

          <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200/80">
            <span className="text-[11px] font-semibold text-blue-700 uppercase">Awaiting Client</span>
            <div className="text-xl font-black text-blue-800 mt-0.5">
              {currency}{metrics.pendingValue.toFixed(2)}
            </div>
            <span className="text-[10px] text-blue-600">{metrics.pendingCount} quote{metrics.pendingCount !== 1 ? 's' : ''} active</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Branding &amp; Spec</span>
            <div className="text-xs font-bold text-[#0C2D64] mt-1.5 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0C2D64]"></span>
              <span className="w-3 h-3 rounded-full bg-[#388E3C]"></span>
              <span className="text-slate-700 font-medium">Magen Palette</span>
            </div>
            <span className="text-[10px] text-slate-500">Full A4 PDF &amp; Thermal</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search quote #, customer, item..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C2D64]/20 transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Draft', 'Sent', 'Accepted', 'Converted', 'Declined'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#0C2D64] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'All Quotes' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Quotations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'No quotations match the active search criteria.'
                : 'Create your first price estimate quotation using Magen Integrated Solutions logo colors.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0C2D64] hover:bg-[#081e44] text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Create Quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Quote Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 hidden md:table-cell">Items Summary</th>
                  <th className="py-3 px-4 text-center">Dates</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0C2D64]">
                      <div className="flex items-center gap-1.5">
                        <span>{quote.quoteNumber}</span>
                        {quote.source === 'web' && (
                          <span className="px-1.5 py-0.2 text-[9px] uppercase font-sans font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded">
                            🌐 Web Request
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{quote.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        {quote.customerPhone && <span>{quote.customerPhone}</span>}
                        {quote.customerEmail && <span>• {quote.customerEmail}</span>}
                      </div>
                      {quote.clientNotes && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 max-w-xs">
                          {quote.clientNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell max-w-xs truncate">
                      <span className="font-semibold text-slate-800">{quote.items.length} item{quote.items.length !== 1 ? 's' : ''}:</span>{' '}
                      {quote.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                    </td>

                    <td className="py-3.5 px-4 text-center text-[11px] text-slate-600">
                      <div>Issued: <strong className="text-slate-700">{quote.date}</strong></div>
                      <div className="text-slate-400">Valid: {quote.validUntil}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      {currency}{quote.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {statusBadge(quote.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectQuotation(quote)}
                          className="p-1.5 text-[#0C2D64] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View & Print Cotation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => exportQuotationPDF(quote, company)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download Branded PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {quote.status !== 'Converted' && (
                          <button
                            onClick={() => onConvertToReceipt(quote, 'Cash')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-bold transition-colors"
                            title="Convert to Paid Receipt"
                          >
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            To Receipt
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Delete quotation ${quote.quoteNumber}?`)) {
                              storage.deleteQuotation(quote.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE QUOTATION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0C2D64] text-white">
              <div className="flex items-center gap-3">
                <MagenLogo variant="monogram" size="sm" lightText />
                <div>
                  <h3 className="text-base font-bold">New Formal Quotation / Cotation</h3>
                  <p className="text-xs text-slate-300">
                    Magen Integrated Solutions • Media, Print &amp; Environmental Consultancy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateQuotationSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Information Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-[#0C2D64] uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  Client &amp; Organization Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Client / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. GreenEarth Trust / Horizon Academy"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D64]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+263 77 ..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D64]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="client@organization.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D64]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Physical Address / Branch
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="City, District, Floor"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2D64]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quotation Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Valid Until Date
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items & Services Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#0C2D64] uppercase tracking-wider">
                    Service Items &amp; Pricing
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Line Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-600">
                          Line #{idx + 1}
                        </span>

                        {/* Quick choose from catalog */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">Preset:</span>
                          <select
                            onChange={e => handleSelectPredefinedService(idx, e.target.value)}
                            defaultValue=""
                            className="text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 max-w-[180px] text-slate-700"
                          >
                            <option value="" disabled>Choose service catalog...</option>
                            {services.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({currency}{s.price})
                              </option>
                            ))}
                          </select>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            required
                            placeholder="Description / Specification *"
                            value={item.description}
                            onChange={e => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-right"
                          />
                        </div>

                        <div className="sm:col-span-1 flex items-center justify-end px-2 font-bold text-xs text-[#0C2D64]">
                          {currency}{(item.totalPrice || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Optional line note / specs"
                          value={item.notes || ''}
                          onChange={e => handleItemChange(idx, 'notes', e.target.value)}
                          className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600"
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g. pages, copies, modules, jobs)"
                          value={item.unit || ''}
                          onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                          className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Discounts Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Terms &amp; Order Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg resize-none"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{currency}{formSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Discount ({currency})</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-right font-semibold text-rose-600"
                    />
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>VAT / Tax (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-right"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-[#0C2D64]">
                    <span>Total Cotation</span>
                    <span className="text-base">{currency}{formGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0C2D64] hover:bg-[#081e44] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Generate &amp; Preview Cotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
