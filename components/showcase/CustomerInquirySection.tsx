'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  Calendar,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Download,
  Smartphone,
  Monitor,
  ShieldCheck,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { CompanyInfo, storage } from '@/services/storage';
import { ServiceItem, Quotation, PrintingCategory } from '@/types';
import { createQuotationAction } from '@/app/actions/quotations';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { exportQuotationPDF } from '@/services/pdfGenerator';

interface CustomerInquirySectionProps {
  company: CompanyInfo;
  services: ServiceItem[];
  onQuoteRequested?: (quotation: Quotation) => void;
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

export function CustomerInquirySection({
  company,
  services,
  onQuoteRequested
}: CustomerInquirySectionProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<PrintingCategory>('T-Shirt Printing');
  const [quantity, setQuantity] = useState<number>(50);
  const [timeline, setTimeline] = useState('Standard (2-3 Days)');
  const [projectNotes, setProjectNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<Quotation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const whatsappPhone =
    company.phone?.split('/')[0]?.replace(/[^0-9]/g, '') || '263777923262';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please provide your name and phone/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Find matching or default service
      const matchedService = services.find(s => s.category === category) || services[0];
      const unitPrice = matchedService ? matchedService.price : 5.0;
      const subtotal = Math.round(unitPrice * Math.max(1, quantity) * 100) / 100;

      const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toISOString().split('T')[0];
      const validUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      const newQuotation: Quotation = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quoteNumber,
        date: today,
        validUntil,
        customerName: organization ? `${customerName.trim()} (${organization.trim()})` : customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: 'Mount Darwin, Zimbabwe',
        items: [
          {
            id: `item_${Date.now()}`,
            description: `${category} - Custom Print Run (${timeline})`,
            category,
            quantity: Math.max(1, quantity),
            unitPrice,
            totalPrice: subtotal,
            unit: matchedService?.unit || 'units',
            notes: projectNotes ? projectNotes.trim() : `Timeline: ${timeline}`
          }
        ],
        subtotal,
        totalAmount: subtotal,
        status: 'Sent',
        notes: `Customer Web Inquiry via MIBS Marketing Portal. Timeline: ${timeline}. Notes: ${projectNotes}`,
        terms: 'Official Mount Darwin commercial quotation. Valid for 14 days.',
        preparedBy: 'MIBS Online Desk',
        createdAt: new Date().toISOString(),
        source: 'web'
      };

      // 1. Server action save (persists to SQLite & broadcasts live real-time event)
      const res = await createQuotationAction(newQuotation);
      if (!res.success) {
        throw new Error(res.error || 'Server error saving quotation');
      }

      // 2. Local storage sync
      storage.saveQuotation(newQuotation);

      setSubmittedQuote(newQuotation);
      if (onQuoteRequested) onQuoteRequested(newQuotation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quote inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (submittedQuote) {
      await exportQuotationPDF(submittedQuote, company);
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setOrganization('');
    setProjectNotes('');
    setQuantity(50);
  };

  return (
    <section id="inquiry" className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading, Value Props & PWA App Download */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Commercial Cotation &amp; Consult</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Submit Your Job Specs For An Official Cotation
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Whether you need 500 exam revision booklets, branded sports uniforms for your school, corporate banners, or an EIA environmental document, our Mount Darwin workshop desk responds promptly with formal PDF cotations and pro-forma invoices.
            </p>

            {/* Trust points */}
            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-minute rapid turnaround on commercial quotations</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official PDF invoices accepted by schools, NGOs &amp; Gov</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Physical production facility at Stand 448 Mount Darwin</span>
              </div>
            </div>

            {/* PWA & Mobile App Download Feature Card */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Download MIBS App (Web APK)</h4>
                    <p className="text-[10px] text-slate-400">Offline POS &amp; Mobile Client Hub</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  PWA Ready
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Install our Progressive Web App on your Android phone or Windows/Mac desktop for offline access, instant order tracking, and receipt generation.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <PWAInstallButton variant="hero" className="w-full text-xs py-2.5" />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Customer Lead / Quote Capture Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl">
              {submittedQuote ? (
                /* Instant Confirmation Card */
                <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Inquiry Successfully Received
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Cotation Reference: {submittedQuote.quoteNumber}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Thank you, <strong>{submittedQuote.customerName}</strong>! Our Mount Darwin workshop tellers have received your specs and synchronized them to the live register.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Service Category:</span>
                      <strong className="text-slate-800">{submittedQuote.items[0]?.category}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Quantity:</span>
                      <strong className="text-slate-800">{submittedQuote.items[0]?.quantity} units</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Estimated Total:</span>
                      <strong className="text-emerald-700 text-sm">${submittedQuote.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Status:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <Clock className="w-3 h-3" /> Queued for Workshop Teller
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Download PDF Cotation</span>
                    </button>

                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Hello MIBS Mount Darwin! I just submitted quotation request ${submittedQuote.quoteNumber} for ${submittedQuote.items[0]?.description}. Please confirm turnaround.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Follow Up on WhatsApp</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline pt-2"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                /* Inquiry Input Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900">
                      Commercial Job Specification Form
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fill out your requirements below for an instant quote &amp; production scheduling.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  {/* Customer Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="e.g. Mr. C. Makore"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +263 77 792 3262"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Organization & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        School / Business / Organization
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. Mount Darwin High School"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="headmaster@mtdarwinhigh.ac.zw"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Category & Quantity Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Service Category *
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as PrintingCategory)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Turnaround / Timeline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Required Turnaround Timeline
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        'Urgent Rush (24 Hours)',
                        'Standard (2-3 Days)',
                        'Flexible (1 Week+)'
                      ].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTimeline(t)}
                          className={`py-2 px-2 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer ${
                            timeline === t
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Specs & Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Details, Sizes or Custom Finishing
                    </label>
                    <textarea
                      rows={3}
                      value={projectNotes}
                      onChange={e => setProjectNotes(e.target.value)}
                      placeholder="e.g. 50 Navy Blue Tees (Sizes M & L) with front pocket logo and large back print in gold ink. Provide price for both 180gsm and 200gsm cotton."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Generating Official Cotation...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Specs &amp; Request Official Cotation</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 Synced in real-time with Mount Darwin Commercial Register. No spam guarantee.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
