'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Layers,
  CheckCircle2,
  Send,
  Shirt,
  BookOpen,
  Copy,
  Briefcase,
  PenTool,
  ArrowRight,
  MessageCircle,
  Plus,
  Upload,
  Image as ImageIcon,
  X,
  FileCheck,
  Check,
  Tag,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CompanyInfo } from '@/services/storage';
import { createQuotationAction } from '@/app/actions/quotations';

interface DesignStudioSectionProps {
  company: CompanyInfo;
  onAddToQuote?: (item: {
    description: string;
    category: 'Graphic Design & Branding';
    quantity: number;
    unitPrice: number;
    unit: string;
    notes?: string;
  }) => void;
  onDesignRequested?: () => void;
}

interface DesignPackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  recommendedFor: string;
  category: 'Graphic Design & Branding';
}

const PACKAGES: DesignPackage[] = [
  {
    id: 'pkg_logo',
    title: 'Logo Design & Vector Identity',
    subtitle: 'Distinctive, memorable corporate brand mark tailored for print & digital.',
    price: 25,
    badge: 'Most Popular',
    icon: Sparkles,
    features: [
      '3 Unique creative design concepts',
      'Full Vector master files (AI, SVG, PDF, transparent PNG)',
      'Black & White + Full-Color versions',
      'High-resolution 300 DPI print-ready master',
      '100% Commercial ownership & copyright'
    ],
    recommendedFor: 'Startups, SMEs, Schools & Organizations',
    category: 'Graphic Design & Branding'
  },
  {
    id: 'pkg_brand_kit',
    title: 'Corporate Brand Identity Kit',
    subtitle: 'Comprehensive visual identity system for professional enterprises.',
    price: 60,
    badge: 'Full Suite',
    icon: Briefcase,
    features: [
      'Everything in Logo Design Package',
      'Executive Business Card layout design',
      'Official Letterhead & Invoice template',
      'Social media profile avatars & covers',
      'Color Palette guide (CMYK, HEX, Pantone)'
    ],
    recommendedFor: 'Registered Businesses, NGOs & Public Institutions',
    category: 'Graphic Design & Branding'
  },
  {
    id: 'pkg_flyer_poster',
    title: 'Commercial Flyer & Poster Design',
    subtitle: 'High-conversion advertising graphics engineered for maximum sales impact.',
    price: 10,
    badge: 'Fast 24h',
    icon: Copy,
    features: [
      'A5 / A4 single or double-sided flyer layout',
      'High-contrast typography & image retouching',
      'Print-ready PDF with bleed & crop marks',
      'Optimized digital version for WhatsApp & Facebook',
      '2 rounds of minor revisions included'
    ],
    recommendedFor: 'Event promotions, Church rallies & Product launches',
    category: 'Graphic Design & Branding'
  },
  {
    id: 'pkg_apparel',
    title: 'Custom DTF Apparel & Teamwear',
    subtitle: 'Precision vector separations crafted specifically for DTF and embroidery.',
    price: 15,
    badge: 'Print-Ready',
    icon: Shirt,
    features: [
      'High-definition transparent vector artwork',
      'Gang-sheet layout ready for DTF film printing',
      'School crest / sports club badge digitizing',
      'Front pocket + large back design configuration',
      'Pantone textile color profiling'
    ],
    recommendedFor: 'School uniforms, Sports clubs & Workwear',
    category: 'Graphic Design & Branding'
  },
  {
    id: 'pkg_editorial',
    title: 'Book Cover & Syllabus Typesetting',
    subtitle: 'Typesetting and cover artwork for textbooks, modules, and annual reports.',
    price: 20,
    badge: 'Publishing',
    icon: BookOpen,
    features: [
      'Front, spine & back cover graphic design',
      'Internal curriculum typography & table layout',
      'Hardcover foil-stamp or gloss lamination setup',
      'Print-ready imposition for offset or digital copier',
      'ISBN & barcode integration'
    ],
    recommendedFor: 'Schools, Academic publishers & Authors',
    category: 'Graphic Design & Branding'
  },
  {
    id: 'pkg_doc_eia',
    title: 'EIA Environmental Document Design',
    subtitle: 'Technical report formatting and corporate document design.',
    price: 35,
    badge: 'Technical',
    icon: Layers,
    features: [
      'Certified Environmental Impact Assessment cover',
      'Project site maps & diagram graphic formatting',
      'Corporate governance prospectus layout',
      'Compliant layout matching statutory submissions',
      'Full PDF publication setup'
    ],
    recommendedFor: 'Mining, Agricultural & Construction projects',
    category: 'Graphic Design & Branding'
  }
];

const COLOR_PRESETS = [
  { name: 'Royal Navy & Gold', hex: '#0A2240 / #D4AF37' },
  { name: 'Emerald & Crisp White', hex: '#059669 / #FFFFFF' },
  { name: 'Matte Black & Platinum', hex: '#111827 / #E5E7EB' },
  { name: 'Maroon & Yellow Amber', hex: '#800000 / #F59E0B' },
  { name: 'Cyan & Dark Slate', hex: '#06B6D4 / #1E293B' }
];

export function DesignStudioSection({
  company,
  onAddToQuote,
  onDesignRequested
}: DesignStudioSectionProps) {
  const [activeTab, setActiveTab] = useState<'packages' | 'custom-builder'>('packages');

  // Form State
  const [selectedPackage, setSelectedPackage] = useState<string>('pkg_logo');
  const [customDesignType, setCustomDesignType] = useState<string>('Logo Design');
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [colorPreferences, setColorPreferences] = useState('');
  const [designStyle, setDesignStyle] = useState('Modern & Minimalist');
  const [clientContactName, setClientContactName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(25);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBrief, setSubmittedBrief] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPkg = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[0];
  const whatsappPhone =
    company.phone?.split('/')[0]?.replace(/[^0-9]/g, '') || '263777923262';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectPackageForBrief = (pkgId: string) => {
    setSelectedPackage(pkgId);
    const pkg = PACKAGES.find(p => p.id === pkgId);
    if (pkg) {
      setCustomDesignType(pkg.title);
      setEstimatedPrice(pkg.price);
    }
    setActiveTab('custom-builder');
    const formElement = document.getElementById('design-brief-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('File too large (max 5MB). Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSketchPreview(event.target?.result as string);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDirectlyToBasket = (pkg: DesignPackage) => {
    if (onAddToQuote) {
      onAddToQuote({
        description: `${pkg.title} (Artwork & Master Files)`,
        category: 'Graphic Design & Branding',
        quantity: 1,
        unitPrice: pkg.price,
        unit: 'package',
        notes: `Selected package: ${pkg.title}. Deliverables: ${pkg.features.join(', ')}`
      });
      showToast(`Added "${pkg.title}" ($${pkg.price}) to quotation basket!`);
    } else {
      handleSelectPackageForBrief(pkg.id);
    }
  };

  const handleAddCustomToBasket = () => {
    if (!brandName.trim()) {
      setFormError('Please enter your Brand, Company, or Project Name before adding to quote.');
      return;
    }
    if (onAddToQuote) {
      const summary = `Brand: "${brandName.trim()}" | Style: ${designStyle} | Colors: ${colorPreferences || 'Designer Choice'}`;
      onAddToQuote({
        description: `Custom ${customDesignType} - "${brandName.trim()}"`,
        category: 'Graphic Design & Branding',
        quantity: 1,
        unitPrice: estimatedPrice,
        unit: 'job',
        notes: `${summary}${notes ? ` | Notes: ${notes.trim()}` : ''}`
      });
      showToast(`Added Custom ${customDesignType} ($${estimatedPrice}) to quotation basket!`);
      setFormError('');
    }
  };

  const handleSubmitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientContactName.trim() || !clientPhone.trim()) {
      setFormError('Please enter your contact name and WhatsApp/phone number.');
      return;
    }
    if (!brandName.trim()) {
      setFormError('Please enter your Brand, Business, or School Name.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const quoteNumber = `DSG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toISOString().split('T')[0];
      const validUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      const briefSummary = `Design Type: ${customDesignType} | Brand: "${brandName.trim()}" | Tagline: "${tagline.trim() || 'N/A'}" | Style: ${designStyle} | Colors: ${colorPreferences.trim() || 'Designer Choice'} | Notes: ${notes.trim() || 'None'}${sketchPreview ? ' [Reference Image Attached]' : ''}`;

      const quotation = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quoteNumber,
        date: today,
        validUntil,
        customerName: `${clientContactName.trim()} (${brandName.trim()})`,
        customerPhone: clientPhone.trim(),
        customerAddress: 'Mount Darwin, Zimbabwe',
        items: [
          {
            id: `item_${Date.now()}`,
            description: `${customDesignType} - Creative Studio Artwork`,
            category: 'Graphic Design & Branding' as const,
            quantity: 1,
            unitPrice: estimatedPrice,
            totalPrice: estimatedPrice,
            unit: 'package',
            notes: briefSummary
          }
        ],
        subtotal: estimatedPrice,
        totalAmount: estimatedPrice,
        status: 'Sent' as const,
        notes: `Creative Design Brief submitted online: ${briefSummary}`,
        terms: 'Official Creative Design Cotation. 50% deposit commences creative concept work; balance upon vector file signoff.',
        preparedBy: 'MIBS Creative Studio',
        createdAt: new Date().toISOString(),
        source: 'web' as const
      };

      await createQuotationAction(quotation);
      setSubmittedBrief(quoteNumber);

      if (onDesignRequested) onDesignRequested();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit design brief.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="designs" className="py-16 sm:py-24 bg-white border-b border-slate-200 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>Magen Graphic &amp; Digital Design Studio &bull; Mount Darwin</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Logo Design, Brand Identity &amp; Custom Artwork Studio
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every great commercial print job begins with exceptional design. Choose from our proven creative packages below, or use the interactive builder to submit and add your bespoke logo, flyer, or DTF apparel design project directly to your quote.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'packages'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Featured Design Packages</span>
            </button>
            <button
              onClick={() => setActiveTab('custom-builder')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'custom-builder'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Custom Design Project</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 6 DESIGN SERVICE PACKAGE CARDS GRID */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {PACKAGES.map(pkg => {
              const Icon = pkg.icon;
              const isSelected = selectedPackage === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-lg ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Bar with Icon & Badge */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {pkg.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {pkg.subtitle}
                      </p>
                    </div>

                    {/* Price Banner */}
                    <div className="py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-500">Starting from:</span>
                      <span className="text-2xl font-black text-slate-900">
                        ${pkg.price}
                        <span className="text-xs font-normal text-slate-500"> / job</span>
                      </span>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="space-y-2 pt-1 text-xs text-slate-700">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Deliverables:
                      </p>
                      {pkg.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-6 border-t border-slate-100 mt-6 space-y-2.5">
                    <p className="text-[10px] text-slate-400 text-center">
                      Ideal for: <strong className="text-slate-600">{pkg.recommendedFor}</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddDirectlyToBasket(pkg)}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPackageForBrief(pkg.id)}
                        className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Customize</span>
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Hello MIBS Design Studio (+263 77 792 3262)! I want to order the ${pkg.title} ($${pkg.price}). Please provide more details on artwork concepts.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inquire on WhatsApp (+263 77 792 3262)</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2 & INTERACTIVE DESIGN BUILDER */}
        <div
          id="design-brief-form"
          className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <PenTool className="w-3.5 h-3.5" />
                <span>Interactive Design Builder &bull; Add Custom Design Line Item</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Configure &amp; Add Your Custom Design
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                Need a new logo, t-shirt artwork, business card, flyer, or educational book cover? Detail your vision below to calculate pricing, attach reference sketches, and add directly to your quote basket or send via WhatsApp.
              </p>
            </div>

            {submittedBrief ? (
              <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-emerald-500/40 text-center space-y-5 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Design Project Queued With MIBS Graphic Artists
                  </span>
                  <h4 className="text-2xl font-black text-white">
                    Design Reference: {submittedBrief}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your design specification for <strong>{brandName}</strong> has been logged into the Mount Darwin studio queue. We will review your concepts and message you on WhatsApp!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                      `Hello MIBS Design Studio! I just submitted creative design brief ${submittedBrief} for "${brandName}". Here are my additional artwork thoughts.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Sketches on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedBrief(null);
                      setBrandName('');
                      setTagline('');
                      setNotes('');
                      setSketchPreview(null);
                    }}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Add Another Design
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBrief} className="space-y-6 text-left">
                {formError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
                    {formError}
                  </div>
                )}

                {/* 1. Design Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    1. Select Design Type / Scope *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Logo Design', price: 25, icon: '🎨' },
                      { label: 'Corporate Brand Kit', price: 60, icon: '💼' },
                      { label: 'Flyer / Poster Artwork', price: 10, icon: '📄' },
                      { label: 'DTF Apparel / Uniform Art', price: 15, icon: '👕' },
                      { label: 'Book Cover & Typesetting', price: 20, icon: '📚' },
                      { label: 'EIA Technical Report Layout', price: 35, icon: '📑' },
                      { label: 'Business Cards & Stationery', price: 8, icon: '💳' },
                      { label: 'Banner & Large Signage Art', price: 15, icon: '🪧' }
                    ].map(type => {
                      const isSelected = customDesignType === type.label;
                      return (
                        <button
                          key={type.label}
                          type="button"
                          onClick={() => {
                            setCustomDesignType(type.label);
                            setEstimatedPrice(type.price);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/30 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{type.icon}</span>
                            <span className="text-[11px] font-black text-emerald-400">${type.price}</span>
                          </div>
                          <span className="text-xs font-bold mt-2 leading-tight">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Brand & Slogan Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Brand / Business / School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      placeholder="e.g. Darwin AgroTech Enterprises"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Slogan / Tagline (Optional)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      placeholder="e.g. Precision Commercial Solutions"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                  </div>
                </div>

                {/* 3. Style Direction & Color Palette */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Visual Style Direction
                    </label>
                    <select
                      value={designStyle}
                      onChange={e => setDesignStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    >
                      <option value="Modern & Minimalist">Modern &amp; Minimalist (Clean lines, bold shapes)</option>
                      <option value="Corporate Authority">Corporate Authority (Executive, structured, trust)</option>
                      <option value="Creative & Vibrant">Creative &amp; Vibrant (High-energy, colorful, youth)</option>
                      <option value="Traditional & Educational">Traditional &amp; Educational (Crests, shields, heritage)</option>
                      <option value="Industrial & Technical">Industrial &amp; Environmental Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Brand Color Preferences
                    </label>
                    <input
                      type="text"
                      value={colorPreferences}
                      onChange={e => setColorPreferences(e.target.value)}
                      placeholder="e.g. Navy Blue &amp; Gold, or Emerald &amp; White"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                    {/* Quick color preset chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setColorPreferences(preset.name)}
                          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Client Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientContactName}
                      onChange={e => setClientContactName(e.target.value)}
                      placeholder="e.g. Tendai Moyo"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="e.g. +263 77 792 3262"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                  </div>
                </div>

                {/* 5. Reference File / Sketch Upload Preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Upload Inspiration / Rough Sketch / Logo Reference (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-2 transition">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Choose Reference File</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {sketchPreview && (
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-slate-200">Reference attached</span>
                        <button
                          type="button"
                          onClick={() => setSketchPreview(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="text-[11px] text-slate-400">
                      PNG, JPG, or PDF up to 5MB (or send on WhatsApp later)
                    </span>
                  </div>
                </div>

                {/* 6. Concept Description & Dimensions */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Specific Concept Requirements, Dimensions &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe specific symbols, layout requirements (e.g., A4 flyer, 300x200mm DTF chest, stylized baobab tree, gold foil elements)..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white resize-none"
                  />
                </div>

                {/* Price Bar & Combined Actions */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Calculated Package Cost:</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ${estimatedPrice}.00
                      <span className="text-xs font-normal text-slate-400"> USD</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Button 1: Add to Quotation Basket */}
                    {onAddToQuote && (
                      <button
                        type="button"
                        onClick={handleAddCustomToBasket}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Design to Quote Basket</span>
                      </button>
                    )}

                    {/* Button 2: Direct WhatsApp Order */}
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Hello MIBS Design Studio (+263 77 792 3262)!\nI would like to order a ${customDesignType} ($${estimatedPrice}).\nBrand: ${brandName || 'My Project'}\nStyle: ${designStyle}\nColors: ${colorPreferences || 'Open'}\nNotes: ${notes || 'Ready to discuss concepts.'}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order on WhatsApp</span>
                    </a>

                    {/* Button 3: Submit Online Brief */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Queuing Brief...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Online Brief</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  💡 Turnaround time for initial logo concepts is 24-48 business hours. WhatsApp direct line: <strong>+263 77 792 3262</strong>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
