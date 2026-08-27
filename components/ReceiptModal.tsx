import React from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Phone,
  Calendar,
  User,
  Scissors
} from 'lucide-react';
import { SaleReceipt } from '../types';
import { CompanyInfo } from '../services/storage';
import { exportReceiptPDF } from '../services/pdfGenerator';

interface ReceiptModalProps {
  receipt: SaleReceipt | null;
  company: CompanyInfo;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  company,
  onClose
}) => {
  if (!receipt) return null;

  const currency = company.currency || '$';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportReceiptPDF(receipt, company);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Action Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">Sale Receipt Ready</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Paper Thermal Receipt Container */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 font-mono text-xs text-slate-800 space-y-3">
          {/* Shop Header */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-sm tracking-tight text-slate-950 uppercase font-sans">
              {company.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">{company.tagline}</p>
            <p className="text-[10px] text-slate-500 font-sans">Tel: {company.phone}</p>
            <p className="text-[10px] text-slate-500 font-sans">{company.address}</p>
          </div>

          <div className="border-t border-dashed border-slate-300 my-2" />

          {/* Receipt Info */}
          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Receipt #:</span>
              <span className="font-bold">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date:</span>
              <span>{receipt.date.replace('T', ' ')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span>{receipt.customerName || 'Walk-in Client'}</span>
            </div>
            {receipt.customerPhone && (
              <div className="flex justify-between text-slate-600">
                <span>Phone:</span>
                <span>{receipt.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Teller:</span>
              <span>{receipt.tellerName}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 my-2" />

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 pb-1 border-b border-slate-200">
              <span>Item</span>
              <span>Total</span>
            </div>
            {receipt.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold text-slate-900 text-xs">
                  <span>{item.description}</span>
                  <span>{currency}{item.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{item.quantity}x @ {currency}{item.unitPrice.toFixed(2)}</span>
                  <span className="italic">{item.category.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 my-2" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{currency}{receipt.subtotal.toFixed(2)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-{currency}{receipt.discount.toFixed(2)}</span>
              </div>
            )}
            {receipt.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span>{currency}{receipt.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-300">
              <span>TOTAL PAID:</span>
              <span className="text-emerald-700">{currency}{receipt.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 text-right pt-0.5">
              Payment via {receipt.paymentMethod}
            </div>
          </div>

          {receipt.notes && (
            <div className="p-2 bg-slate-100 rounded text-[10px] text-slate-600">
              <strong>Notes:</strong> {receipt.notes}
            </div>
          )}

          <div className="border-t border-dashed border-slate-300 my-2" />

          <div className="text-center text-[10px] text-slate-500 font-sans space-y-1">
            <p>{company.receiptFooter}</p>
            <p className="font-bold tracking-widest">*** CUSTOMER COPY ***</p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-white grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
