'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  FileText,
  Mail,
  Megaphone,
  Briefcase,
  GraduationCap,
  Leaf,
  Layers,
  Percent,
  RefreshCw
} from 'lucide-react';
import { CampaignAudience, PrintingCategory, User } from '@/types';
import { CompanyInfo } from '@/services/storage';

interface AiMarketingHubProps {
  company: CompanyInfo;
  activeUser: User;
}

type GeneratorMode = 'whatsapp_promo' | 'quote_followup' | 'flyer_copy' | 'corporate_email' | 'bundle_deal';

export const AiMarketingHub: React.FC<AiMarketingHubProps> = ({ company, activeUser }) => {
  const [mode, setMode] = useState<GeneratorMode>('whatsapp_promo');
  const [audience, setAudience] = useState<CampaignAudience>('Schools & Academies');
  const [category, setCategory] = useState<PrintingCategory>('Book Printing');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [clientName, setClientName] = useState<string>('Horizon Academy High School');
  const [quoteNumber, setQuoteNumber] = useState<string>('QT-2026-0904');
  const [customKeywords, setCustomKeywords] = useState<string>('Free delivery on orders over 50 copies, 3-day turnaround');
  const [copied, setCopied] = useState(false);

  // Generated Pitch State
  const [generatedContent, setGeneratedContent] = useState<string>(() => {
    return generatePitch('whatsapp_promo', 'Schools & Academies', 'Book Printing', 15, company, 'Horizon Academy High School', 'QT-2026-0904', 'Free delivery on orders over 50 copies, 3-day turnaround');
  });

  function generatePitch(
    selectedMode: GeneratorMode,
    targetAud: CampaignAudience,
    cat: PrintingCategory,
    discount: number,
    comp: CompanyInfo,
    client: string,
    quoteNum: string,
    notes: string
  ): string {
    const brand = comp.name || 'Magen Integrated Solutions';
    const contact = comp.phone || '+263 77 123 4567';

    if (selectedMode === 'whatsapp_promo') {
      if (targetAud === 'Schools & Academies') {
        return `📚 *SPECIAL EDUCATIONAL PRINTING OFFER - ${brand.toUpperCase()}* 🎓\n\nDear Principal / School Administrator,\n\nAs the new academic term commences, ${brand} is pleased to support your institution with *${discount}% OFF* bulk printing for:\n\n✔️ Curriculum Modules (BET, Science, History, FRS)\n✔️ Shona & Literature Set Books\n✔️ Secondary & Primary Terminal Assessment Reports\n✔️ Schemes of Work & Student Exercise Covers\n\n✨ *Why partner with us?*\n• Crisp, durable spiral and saddle-stitch binding\n• Heavy-duty laminated covers that endure student use\n• Express 3-to-4 business day turnaround\n${notes ? `• ${notes}\n` : ''}\n🎁 *Use Promo Code:* *SCHOOL${discount}* for an instant ${discount}% invoice reduction.\n\n📲 *Reply to this message* with your required quantities or call *${contact}* to receive a formal quotation within 1 hour!`;
      }

      if (targetAud === 'Corporate & SMEs') {
        return `💼 *EXECUTIVE MEDIA & APPAREL BRANDING - ${brand.toUpperCase()}* ✨\n\nElevate your corporate identity and marketing reach this quarter!\n\n${brand} is currently offering corporate partners an exclusive *${discount}% DISCOUNT* on our high-demand packages:\n\n👕 *DTF High-Density Branded T-Shirts & Golf Shirts*\n🏢 *Executive Roll-Up Banner Stands (85x200cm)*\n📇 *Matte-Laminated Full-Color Business Cards (Pack of 100)*\n☕ *Custom Sublimation Corporate Mugs & Gifts*\n\n${notes ? `💡 *Special note:* ${notes}\n` : ''}\n📦 Free digital artwork mockup included with every order.\n\n📞 Get in touch today at *${contact}* or reply to discuss your branding specifications.`;
      }

      if (targetAud === 'Environmental & Consultancy') {
        return `🌍 *EXPEDITED ENVIRONMENTAL & CONSULTANCY DOSSIER BINDING* 📋\n\nTo Our Valued Consultancy Partners,\n\nNeed fast, compliant, and executive documentation for your upcoming Environmental Impact Assessments (EIA) or Corporate Prospectuses?\n\n${brand} provides specialized technical publication support:\n\n📘 *Executive Hardcover Binding with Gold-Foil Embossing*\n🗺️ *High-Resolution Large-Format Cartography & Site Maps*\n📑 *High-Speed Color Printing (80gsm / 130gsm Art Paper)*\n⚡ *Expedited 24-Hour Emergency Turnaround Available*\n\nTake advantage of our *${discount}% Professional Partner Discount*.\n\n📍 Contact our technical desk at *${contact}* for sample casing inspections and instant quotation.`;
      }

      return `🌟 *EXCLUSIVE SPECIAL PROMOTION - ${brand.toUpperCase()}* 🖨️\n\nUpgrade your prints with premium quality and reliable turnaround!\n\nEnjoy an immediate *${discount}% DISCOUNT* on all ${cat} orders this month.\n\n✔️ Superior color fidelity & durable stock\n✔️ Custom sizing and finishing options\n${notes ? `✔️ ${notes}\n` : ''}\n📞 Reach out to our workshop at *${contact}* or visit our front desk to place your order!`;
    }

    if (selectedMode === 'quote_followup') {
      return `Good day ${client},\n\nI hope this message finds you well.\n\nI am following up regarding Quotation *${quoteNum}* for your *${cat}* order sent recently by ${brand}.\n\nWe wanted to confirm if the quantities and specifications meet your team's requirements, or if you would like us to make any adjustments.\n\n💡 *Note:* If confirmed this week, we can apply an additional *${discount}% courtesy incentive* and reserve production slots for guaranteed prompt delivery.\n\nPlease let us know if you require any additional information or an updated invoice. We look forward to partnering with you!\n\nWarm regards,\n*${activeUser.name}*\n${brand}\n📞 ${contact}`;
    }

    if (selectedMode === 'flyer_copy') {
      return `📢 *HEADLINE: Professional ${cat} That Demands Attention!*\n\nSUBHEAD: High-definition clarity, rich colors, and durable finishing tailored for your brand.\n\n🔥 *KEY HIGHLIGHTS:*\n• Industry-standard materials & vibrant UV-resistant inks\n• Quick production runs with zero compromise on quality\n• Unbeatable commercial rates - Save up to *${discount}%*\n${notes ? `• ${notes}\n` : ''}\n📍 *VISIT US TODAY:*\n${comp.address}\n\n📞 *CALL / WHATSAPP:*\n${contact}\n\n✉️ *EMAIL:*\n${comp.email || 'orders@magensolutions.com'}\n\n*${brand} — ${comp.tagline}*`;
    }

    if (selectedMode === 'corporate_email') {
      return `Subject: Professional Media, Printing & Technical Documentation Partnership - ${brand}\n\nDear Procurement & Operations Team at ${client},\n\nI am writing to introduce ${brand} as a dedicated partner for all your organizational printing, corporate branding, and environmental consultancy documentation needs.\n\nWe specialize in high-capacity production with rigorous quality control, including:\n- Executive Corporate Branding & Uniform Apparel\n- High-Volume Publishing, Booklets & Annual Reports\n- Heavy-Duty Outdoor Signage & Expo Displays\n- Environmental & Technical Project Prospectuses\n\nTo demonstrate our capabilities, we would like to offer your organization an introductory ${discount}% discount on your next project.\n\n${notes ? `Additional Services: ${notes}\n\n` : ''}We would welcome the opportunity to submit a formal price catalog or provide a no-obligation quotation for your upcoming projects.\n\nSincerely,\n\n${activeUser.name}\n${activeUser.role.toUpperCase()} | ${brand}\nPhone: ${contact}\nAddress: ${comp.address}`;
    }

    // bundle_deal
    return `🎁 *COMMERCIAL ALL-IN-ONE PRINTING BUNDLE* 📦\n\nTake the hassle out of promotional procurement! ${brand} presents the *${targetAud} Commercial Pack*:\n\n1️⃣ Pack of 50 Custom Heavy-Cotton Branded Shirts\n2️⃣ 2x Premium Roll-Up Retractable Banners (85x200cm)\n3️⃣ 250 Double-Sided Full Color Flyers\n4️⃣ 100 Premium Business Cards with Matte UV Finish\n\n🏷️ *Bundle Value:* Save over *${discount}%* compared to individual item rates!\n${notes ? `💡 *Custom option:* ${notes}\n` : ''}\nContact us at *${contact}* to reserve your production batch today.`;
  }

  const handleGenerate = () => {
    const result = generatePitch(mode, audience, category, discountPercent, company, clientName, quoteNumber, customKeywords);
    setGeneratedContent(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWhatsAppShareUrl = () => {
    return `https://wa.me/?text=${encodeURIComponent(generatedContent)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-[#0C2D64] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                AI Marketing Generator &amp; Pitch Copilot
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Generate high-converting WhatsApp promotional blasts, quotation follow-up letters, and corporate proposals in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-indigo-900/60">
          <button
            onClick={() => { setMode('whatsapp_promo'); }}
            className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              mode === 'whatsapp_promo'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp Promo</span>
          </button>

          <button
            onClick={() => { setMode('quote_followup'); }}
            className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              mode === 'quote_followup'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Quote Follow-Up</span>
          </button>

          <button
            onClick={() => { setMode('flyer_copy'); }}
            className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              mode === 'flyer_copy'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>Flyer &amp; Ad Copy</span>
          </button>

          <button
            onClick={() => { setMode('corporate_email'); }}
            className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              mode === 'corporate_email'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>B2B Email Pitch</span>
          </button>

          <button
            onClick={() => { setMode('bundle_deal'); }}
            className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
              mode === 'bundle_deal'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Bundle Package</span>
          </button>
        </div>
      </div>

      {/* Main Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Parameters */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span>Campaign Customizer</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
              {mode.replace('_', ' ')}
            </span>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Client Audience:
            </label>
            <select
              value={audience}
              onChange={e => setAudience(e.target.value as CampaignAudience)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-medium"
            >
              <option value="Schools & Academies">Schools &amp; Academies (Modules, Exam Books, Reports)</option>
              <option value="Corporate & SMEs">Corporate &amp; SMEs (T-Shirts, Banners, Cards)</option>
              <option value="Environmental & Consultancy">Environmental &amp; Consultancy (EIA Reports, Binding)</option>
              <option value="Churches & Events">Churches &amp; Events (Flyers, Banners, Mugs)</option>
              <option value="Walk-in & Retail">Walk-in &amp; Retail (Quick Photo &amp; Copy)</option>
            </select>
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Featured Product / Focus:
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as PrintingCategory)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-medium"
            >
              <option value="Book Printing">Book Printing &amp; Binding (Modules, Novels)</option>
              <option value="T-Shirt Printing">T-Shirt Printing &amp; Apparel (DTF, Polo)</option>
              <option value="Banners & Signage">Banners &amp; Signage (Roll-up, Vinyl)</option>
              <option value="Paper Printing">Paper Printing (Flyers, Booklets)</option>
              <option value="Merchandise & Branding">Merchandise &amp; Branding (Mugs, Badges)</option>
              <option value="Other Services">Consultancy Prospectus &amp; Hardcover</option>
            </select>
          </div>

          {/* Discount Percentage */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Promotional Incentive / Discount:</span>
              <span className="text-emerald-700 font-bold">{discountPercent}% OFF</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={5}
              value={discountPercent}
              onChange={e => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-[#0C2D64] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>0% (Standard)</span>
              <span>10%</span>
              <span>20%</span>
              <span>30% (High)</span>
            </div>
          </div>

          {/* Client Name & Quote # for Follow-up Mode */}
          {mode === 'quote_followup' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Client / School:
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quote Number:
                </label>
                <input
                  type="text"
                  value={quoteNumber}
                  onChange={e => setQuoteNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          )}

          {/* Custom Notes / Offer Specifics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Notes / Unique Selling Points:
            </label>
            <textarea
              rows={2}
              value={customKeywords}
              onChange={e => setCustomKeywords(e.target.value)}
              placeholder="e.g. Free delivery for orders over 50 copies, 48-hr turnaround, free artwork design"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-[#0C2D64] hover:bg-[#081e44] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Targeted Pitch</span>
          </button>
        </div>

        {/* Right Column: Output & Action Deck */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Share2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Generated Marketing Pitch
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ready to send on WhatsApp, Email, or Print
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Formatted Message Box */}
            <div className="mt-4 bg-slate-900 text-slate-100 rounded-xl p-4 font-sans text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800 shadow-inner">
              {generatedContent}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Branded for {company.name}</span>
            </span>
            <span className="font-mono text-[11px]">
              {generatedContent.length} characters • Optimized for WhatsApp &amp; SMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
