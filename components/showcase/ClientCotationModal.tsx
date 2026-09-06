'use client';

import React, { useState } from 'react';
import {
  FileText,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Send,
  Printer,
  Sparkles,
  Phone,
  Mail,
  Building,
  User as UserIcon,
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  ArrowRight
} from 'lucide-react';
import { ServiceItem, QuotationItem, Quotation } from '@/types';
import { CompanyInfo, storage } from '@/services/storage';

interface ClientCotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  company: CompanyInfo;
  initialItems?: QuotationItem[];
  initialPromoCode?: string;
}

export function ClientCotationModal({
  isOpen,
  onClose,
  services,
  company,
  initialItems = [],
  initialPromoCode = ''
}: ClientCotationModalProps) {
  if (!isOpen) return null;

  const currency = company.currency || '$';

  // Client Details
  const [customerName, setCustomerName] = useState('');
  const [customerOrg, setCustomerOrg] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [promoCode, setPromoCode] = useState(initialPromoCode);

  // Quote Items
  const [items, setItems] = useState<QuotationItem[]>(
    initialItems.length > 0
      ? initialItems
      : services.length > 0
      ? [
          {
            id: `item_${Date.now()}`,
            description: services[0].name,
            category: services[0].category,
            quantity: 10,
            unitPrice: services[0].price,
            totalPrice: services[0].price * 10,
            unit: services[0].unit,
            inventoryItemId: services[0].inventoryItemId
          }
        ]
      : []
  );

  // Selector for adding another item
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [addQuantity, setAddQuantity] = useState<number>(10);

  // Submission State
  const [submittedQuote, setSubmittedQuote] = useState<Quotation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Discount computation based on promo
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  let discountPercent = 0;
  if (promoCode.trim().toUpperCase() === 'SCHOOL2026') discountPercent = 15;
  else if (promoCode.trim().toUpperCase() === 'CORPBRAND10') discountPercent = 10;
  else if (promoCode.trim().toUpperCase() === 'ENVCONSULT') discountPercent = 12;
  else if (promoCode.trim().toUpperCase() === 'FAITH20') discountPercent = 20;

  const discountAmount = Math.round((subtotal * (discountPercent / 100)) * 100) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleAddItem = () => {
    const s = services.find(item => item.id === selectedServiceId);
    if (!s) return;

    const qty = Math.max(1, addQuantity);
    const existingIdx = items.findIndex(i => i.description === s.name);

    if (existingIdx >= 0) {
      const updated = [...items];
      const newQty = updated[existingIdx].quantity + qty;
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: newQty,
        totalPrice: newQty * updated[existingIdx].unitPrice
      };
      setItems(updated);
    } else {
      const newItem: QuotationItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        description: s.name,
        category: s.category,
        quantity: qty,
        unitPrice: s.price,
        totalPrice: s.price * qty,
        unit: s.unit,
        inventoryItemId: s.inventoryItemId
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    const val = Math.max(1, qty);
    setItems(
      items.map(item =>
        item.id === id
          ? { ...item, quantity: val, totalPrice: val * item.unitPrice }
          : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name or the contact person name.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Please enter your phone or WhatsApp number so our teller can follow up.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one service item to your cotation request.');
      return;
    }

    const fullName = customerOrg.trim()
      ? `${customerName.trim()} (${customerOrg.trim()})`
      : customerName.trim();

    try {
      const created = storage.submitWebClientQuotation({
        customerName: fullName,
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        items,
        clientNotes: clientNotes.trim() || undefined,
        promoCode: promoCode.trim() || undefined,
        discount: discountAmount
      });

      setSubmittedQuote(created);
    } catch {
      setErrorMsg('Could not submit quotation request. Please try again.');
    }
  };

  const generateWhatsAppUrl = (quote: Quotation) => {
    const targetPhone = company.phone?.split('/')[0]?.replace(/[^0-9]/g, '') || '263771234567';
    const lines = [
      `*NEW COTATION / QUOTATION REQUEST*`,
      `*Reference:* ${quote.quoteNumber}`,
      `*Client:* ${quote.customerName}`,
      `*Phone:* ${quote.customerPhone || 'N/A'}`,
      `*Items Requested:*`,
      ...quote.items.map(i => `• ${i.quantity}x ${i.description} @ ${currency}${i.unitPrice.toFixed(2)} = ${currency}${i.totalPrice.toFixed(2)}`),
      `*Estimated Subtotal:* ${currency}${quote.subtotal.toFixed(2)}`,
      quote.discount ? `*Discount (${discountPercent}%):* -${currency}${quote.discount.toFixed(2)}` : null,
      `*Estimated Total:* ${currency}${quote.totalAmount.toFixed(2)}`,
      quote.clientNotes ? `*Notes:* ${quote.clientNotes}` : null,
      ``,
      `Hello Magen Media & Print Team! I have just submitted this quotation request on your website. Please review and confirm final pricing and turnaround. Thank you!`
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${targetPhone}?text=${message}`;
  };

  return (
    <div
      id="client-cotation-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="client-cotation-modal"
        className="w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#0C2D64] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Request a Free Cotation / Quotation
              </h2>
              <p className="text-xs text-slate-300">
                Direct client proposal request &bull; Reviewed promptly by Magen sales tellers
              </p>
            </div>
          </div>
          <button
            id="close-client-cotation-btn"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedQuote ? (
          /* Submission Confirmation View */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Cotation Request Received
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5">
                Quote Reference: {submittedQuote.quoteNumber}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-1.5">
                Thank you, <span className="font-semibold text-slate-900">{submittedQuote.customerName}</span>! Your request has been queued in our sales register.
              </p>
            </div>

            {/* Breakdown Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 max-w-lg mx-auto text-xs">
              <div className="flex justify-between text-slate-500 border-b border-slate-200 pb-1.5">
                <span>Items Requested:</span>
                <span className="font-semibold text-slate-800">{submittedQuote.items.length} item(s)</span>
              </div>
              <div className="space-y-1 py-1 max-h-40 overflow-y-auto">
                {submittedQuote.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{it.quantity}x {it.description}</span>
                    <span className="font-mono font-medium">{currency}{it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Estimated Total:</span>
                <span className="text-emerald-700 font-mono">{currency}{submittedQuote.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left flex items-start space-x-2.5 max-w-lg mx-auto">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> A Magen sales teller will check material availability and confirm your final quotation via phone/WhatsApp within 30 minutes.
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                id="send-quote-whatsapp-btn"
                href={generateWhatsAppUrl(submittedQuote)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Request on WhatsApp</span>
              </a>

              <button
                id="print-quote-summary-btn"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Summary</span>
              </button>

              <button
                id="done-quote-btn"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Cotation Request Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Client Contact Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#0C2D64]" />
                <span>1. Your Contact &amp; Organization Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    placeholder="e.g. Mr. Farai Mukamuri"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    School / Company / Org (Optional)
                  </label>
                  <input
                    id="client-org-input"
                    type="text"
                    placeholder="e.g. Chitepo Secondary / EcoTech Ltd"
                    value={customerOrg}
                    onChange={e => setCustomerOrg(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <input
                      id="client-phone-input"
                      type="tel"
                      required
                      placeholder="+263 77 ..."
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full text-xs py-2 pl-8 pr-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="client-email-input"
                      type="email"
                      placeholder="client@organization.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full text-xs py-2 pl-8 pr-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Address / Town (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="client-address-input"
                      type="text"
                      placeholder="e.g. Harare CBD / Collection at Magen Hub"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full text-xs py-2 pl-8 pr-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Selected Services & Items */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Services &amp; Quantities Requested</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  {items.length} item(s) in quote
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">{item.description}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.category} &bull; Rate: {currency}{item.unitPrice.toFixed(2)} per {item.unit || 'unit'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                      <div className="flex items-center space-x-1.5">
                        <label className="text-[11px] text-slate-500">Qty:</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => handleQuantityChange(item.id, Number(e.target.value))}
                          className="w-16 py-1 px-2 text-xs font-bold text-center bg-white border border-slate-300 rounded-md focus:border-[#0C2D64] outline-none"
                        />
                      </div>

                      <div className="text-right w-20">
                        <p className="text-xs font-mono font-bold text-slate-900">
                          {currency}{item.totalPrice.toFixed(2)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Another Service */}
              <div className="p-3 bg-slate-100/80 border border-dashed border-slate-300 rounded-xl flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full sm:flex-1 text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.category}] {s.name} - {currency}{s.price.toFixed(2)} / {s.unit}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min={1}
                    value={addQuantity}
                    onChange={e => setAddQuantity(Number(e.target.value))}
                    placeholder="Qty"
                    className="w-20 text-xs py-2 px-2 bg-white border border-slate-300 rounded-lg text-center outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-[#0C2D64] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Custom Project Specifications / Notes */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Custom Job Specifications or Deadline Notes
              </label>
              <textarea
                rows={2}
                placeholder="Specify paper weights (e.g. 80gsm/120gsm), cover finishes (gloss/matte), binding style (spiral/hardcover), or delivery target dates..."
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#0C2D64] focus:ring-1 focus:ring-[#0C2D64] outline-none"
              />
            </div>

            {/* Step 4: Promo Code & Price Calculation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Have a promo code? (e.g. SCHOOL2026)"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-lg uppercase font-mono tracking-wider outline-none"
                />
                {discountPercent > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-300">
                    {discountPercent}% OFF APPLIED
                  </span>
                )}
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Subtotal (Estimated):</span>
                <span className="font-mono">{currency}{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Special Promotional Discount:</span>
                  <span className="font-mono">-{currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Estimated Cotation:</span>
                <span className="text-emerald-700 font-mono text-base">{currency}{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-cotation-request-btn"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Cotation Request to Magen Tellers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                No payment required now. Our teller will review specs, verify stock, and provide your formal binding quotation.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
