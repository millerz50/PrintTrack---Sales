'use client';

import React, { useState } from 'react';
import { Quotation, QuotationStatus, PaymentMethod } from '@/types';
import { CompanyInfo } from '@/services/storage';
import { exportQuotationPDF } from '@/services/pdfGenerator';
import { MagenLogo } from './MagenLogo';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Check
} from 'lucide-react';

interface QuotationModalProps {
  quotation: Quotation | null;
  company: CompanyInfo;
  onClose: () => void;
  onConvertToReceipt?: (quotation: Quotation, paymentMethod: PaymentMethod) => void;
  onUpdateStatus?: (id: string, status: QuotationStatus) => void;
}

export function QuotationModal({
  quotation,
  company,
  onClose,
  onConvertToReceipt,
  onUpdateStatus
}: QuotationModalProps) {
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<PaymentMethod>('Cash');

  if (!quotation) return null;

  const currency = company.currency || '$';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportQuotationPDF(quotation, company);
  };

  const handleCopySummary = () => {
    const summary = `*QUOTATION: ${quotation.quoteNumber}*\n` +
      `*Magen Integrated Solutions*\n` +
      `Client: ${quotation.customerName}\n` +
      `Date: ${quotation.date} (Valid until: ${quotation.validUntil})\n\n` +
      `*Items:*\n` +
      quotation.items.map(i => `• ${i.description} (${i.quantity}x @ ${currency}${i.unitPrice.toFixed(2)}) = ${currency}${i.totalPrice.toFixed(2)}`).join('\n') +
      `\n\n*Total Quote: ${currency}${quotation.totalAmount.toFixed(2)}*\n` +
      `Payment terms: 50% deposit on confirmation. Valid for 14 days.\n` +
      `Contact: ${company.phone} | ${company.email}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmConvert = () => {
    if (onConvertToReceipt) {
      onConvertToReceipt(quotation, convertPaymentMethod);
      setIsConverting(false);
      onClose();
    }
  };

  const statusColors: Record<QuotationStatus, { bg: string; text: string; border: string }> = {
    Draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    Sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Declined: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    Converted: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
  };

  const currentStatusStyle = statusColors[quotation.status] || statusColors.Draft;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0C2D64] text-white print:hidden">
          <div className="flex items-center gap-3">
            <MagenLogo variant="monogram" size="sm" lightText />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-wide">Quotation / Cotation Preview</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                  {quotation.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300">Ref: {quotation.quoteNumber} • {quotation.customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStatus && quotation.status !== 'Converted' && (
              <select
                value={quotation.status}
                onChange={(e) => onUpdateStatus(quotation.id, e.target.value as QuotationStatus)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none cursor-pointer"
              >
                <option value="Draft" className="text-slate-900">Mark Draft</option>
                <option value="Sent" className="text-slate-900">Mark Sent</option>
                <option value="Accepted" className="text-slate-900">Mark Accepted</option>
                <option value="Declined" className="text-slate-900">Mark Declined</option>
              </select>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 print:bg-white print:p-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 text-slate-900">
            {/* Header with Magen Logo */}
            <div className="border-b-2 border-[#0C2D64] pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <MagenLogo variant="monogram" size="lg" />
                  <div>
                    <h1 className="text-2xl font-black tracking-wider text-[#0C2D64] leading-none">
                      MAGEN
                    </h1>
                    <div className="text-xs font-black tracking-[0.18em] text-slate-800 uppercase mt-0.5">
                      INTEGRATED SOLUTIONS
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#0C2D64]">MEDIA &amp; PRINT SOLUTIONS</span>
                      <span className="text-emerald-500 font-bold">|</span>
                      <span>ENVIRONMENTAL CONSULTANCY</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800">{company.address}</div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <Phone className="w-3 h-3 text-[#0C2D64]" />
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <Mail className="w-3 h-3 text-[#0C2D64]" />
                    <span>{company.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Title & Meta Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Formal Quotation / Cotation
                </span>
                <div className="mt-2 text-xl font-black text-[#0C2D64] tracking-tight">
                  {quotation.quoteNumber}
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date Issued: <strong className="text-slate-800">{quotation.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Valid Until: <strong className="text-slate-800">{quotation.validUntil}</strong> (14 Days)</span>
                  </div>
                  <div>
                    <span>Prepared By: <strong className="text-slate-800">{quotation.preparedBy}</strong></span>
                  </div>
                </div>
              </div>

              <div className="sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Client / Customer Details
                </span>
                <div className="mt-1 text-base font-bold text-slate-900">
                  {quotation.customerName}
                </div>
                <div className="mt-1.5 space-y-1 text-xs text-slate-600">
                  {quotation.customerPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quotation.customerPhone}</span>
                    </div>
                  )}
                  {quotation.customerEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quotation.customerEmail}</span>
                    </div>
                  )}
                  {quotation.customerAddress && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quotation.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0C2D64] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Service Description / Spec</th>
                    <th className="py-3 px-3 w-28 hidden sm:table-cell">Category</th>
                    <th className="py-3 px-3 w-20 text-center">Qty</th>
                    <th className="py-3 px-3 w-24 text-right">Unit Rate</th>
                    <th className="py-3 px-3 w-24 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        {item.notes && <div className="text-[11px] text-slate-500 mt-0.5 italic">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 hidden sm:table-cell">{item.category}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {currency}{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {currency}{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation & Terms Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Terms & Conditions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                <h4 className="font-bold text-[#0C2D64] mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Terms &amp; Order Conditions
                </h4>
                <div className="text-slate-600 space-y-1 text-[11px] leading-relaxed">
                  <p>• Quotation valid for 14 calendar days from issue date.</p>
                  <p>• 50% deposit required upon confirmation; balance due upon delivery.</p>
                  <p>• Production turnaround commences following artwork approval and deposit.</p>
                  <p>• All printed goods adhere to Magen high-precision eco-sustainability standards.</p>
                  {quotation.notes && (
                    <p className="pt-1 font-medium text-slate-800 border-t border-slate-200 mt-1">
                      Note: {quotation.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{currency}{quotation.subtotal.toFixed(2)}</span>
                </div>
                {quotation.discount && quotation.discount > 0 ? (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Applied</span>
                    <span className="font-semibold">-{currency}{quotation.discount.toFixed(2)}</span>
                  </div>
                ) : null}
                {quotation.taxAmount && quotation.taxAmount > 0 ? (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax ({quotation.taxRate || 0}%)</span>
                    <span className="font-semibold text-slate-900">{currency}{quotation.taxAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-slate-300 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0C2D64]">Total Quotation</span>
                  <span className="text-lg font-black text-[#0C2D64]">
                    {currency}{quotation.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures Block */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
              <div>
                <div className="h-10 border-b border-dashed border-slate-300"></div>
                <div className="pt-1.5 font-bold text-slate-800">Authorized Signatory &amp; Stamp</div>
                <div className="text-[11px] text-slate-500">Magen Integrated Solutions</div>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-300"></div>
                <div className="pt-1.5 font-bold text-slate-800">Client Acceptance Signature</div>
                <div className="text-[11px] text-slate-500">Date: ________________________</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons - Hidden in Print */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-[#0C2D64]" />
              Print Quotation
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              Download PDF
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onConvertToReceipt && quotation.status !== 'Converted' ? (
              isConverting ? (
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-medium text-slate-600 pl-1">Payment:</span>
                  <select
                    value={convertPaymentMethod}
                    onChange={(e) => setConvertPaymentMethod(e.target.value as PaymentMethod)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white font-medium text-slate-800"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EcoCash">EcoCash</option>
                    <option value="Cash">Cash</option>
                  </select>
                  <button
                    onClick={handleConfirmConvert}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Confirm &amp; Issue Receipt
                  </button>
                  <button
                    onClick={() => setIsConverting(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConverting(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C2D64] hover:bg-[#081e44] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  Convert to Paid Receipt
                </button>
              )
            ) : quotation.status === 'Converted' ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                Converted to Official Receipt
              </span>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
