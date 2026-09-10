'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Check,
  Send,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Shirt,
  Flag,
  Copy,
  Briefcase,
  Gift,
  RefreshCw,
  Calculator,
  SlidersHorizontal,
  Database,
  Star,
  Users,
  Building2,
  Calendar
} from 'lucide-react';
import { ServiceItem, PrintingCategory, QuotationItem, MarketingCampaign, User } from '@/types';
import { CompanyInfo } from '@/services/storage';
import { MagenLogo } from '@/components/MagenLogo';
import { ClientCotationModal } from './ClientCotationModal';
import { StaffLoginModal } from './StaffLoginModal';

interface PublicShowcaseWebsiteProps {
  company: CompanyInfo;
  services: ServiceItem[];
  campaigns?: MarketingCampaign[];
  onStaffLoginSuccess: (user: User) => void;
  activeStaffUser?: User | null;
  onEnterPosDirectly?: () => void;
  isLoadingDb?: boolean;
  lastSyncedAt?: Date;
  onRefreshDb?: () => void;
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  'T-Shirt Printing': {
    label: 'Apparel & DTF',
    icon: <Shirt className="w-4 h-4" />,
    desc: 'High-definition wash-resistant DTF transfers on tees, polos, overalls & sportswear'
  },
  'Paper Printing': {
    label: 'Paper & Flyers',
    icon: <Copy className="w-4 h-4" />,
    desc: 'Full-color promotional flyers, office stationery, invoice pads & vouchers'
  },
  'Book Printing': {
    label: 'Curriculum & Books',
    icon: <BookOpen className="w-4 h-4" />,
    desc: 'School syllabi, exam revision booklets, spiral-bound manuals & registers'
  },
  'Banners & Signage': {
    label: 'Signage & Banners',
    icon: <Flag className="w-4 h-4" />,
    desc: 'Weatherproof PVC eyeleted banners, pull-up rollup banners & directional signage'
  },
  'Merchandise & Branding': {
    label: 'Corporate Gifts',
    icon: <Gift className="w-4 h-4" />,
    desc: 'Ceramic sublimation mugs, conference keyholders, branded pens & ID lanyards'
  },
  'Photocopy & Lamination': {
    label: 'Duplication & Laminating',
    icon: <Printer className="w-4 h-4" />,
    desc: 'High-speed document runs, pouch lamination up to A3 & plastic binding'
  },
  'Other Services': {
    label: 'Consultancy & Other',
    icon: <Briefcase className="w-4 h-4" />,
    desc: 'EIA environmental consultancy reports, commercial graphic design & custom jobs'
  }
};

export function PublicShowcaseWebsite({
  company,
  services,
  campaigns = [],
  onStaffLoginSuccess,
  activeStaffUser,
  onEnterPosDirectly,
  isLoadingDb = false,
  lastSyncedAt,
  onRefreshDb
}: PublicShowcaseWebsiteProps) {
  const currency = company.currency || '$';

  // Filters and Interactive State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteBasket, setQuoteBasket] = useState<QuotationItem[]>([]);
  const [isCotationModalOpen, setIsCotationModalOpen] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [activePromoCode, setActivePromoCode] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estimator State
  const [estimatorServiceId, setEstimatorServiceId] = useState<string>(
    services[0]?.id || ''
  );
  const [estimatorQty, setEstimatorQty] = useState<number>(50);

  // Filter active services only
  const activeServices = useMemo(() => {
    return services.filter(s => s.active !== false);
  }, [services]);

  // Unique categories
  const categoriesList = useMemo(() => {
    const set = new Set(activeServices.map(s => s.category));
    return ['all', ...Array.from(set)];
  }, [activeServices]);

  // Filtered Services for catalogue
  const filteredServices = useMemo(() => {
    return activeServices.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeServices, selectedCategory, searchQuery]);

  // Estimator Selected Service
  const currentEstimatorService = useMemo(() => {
    return (
      activeServices.find(s => s.id === estimatorServiceId) ||
      activeServices[0] ||
      null
    );
  }, [activeServices, estimatorServiceId]);

  const estimatorTotal = useMemo(() => {
    if (!currentEstimatorService) return 0;
    return currentEstimatorService.price * Math.max(1, estimatorQty);
  }, [currentEstimatorService, estimatorQty]);

  // Add a service to the client's quotation basket
  const handleAddToCotation = (service: ServiceItem, quantity = 10) => {
    const existingIdx = quoteBasket.findIndex(i => i.description === service.name);
    if (existingIdx >= 0) {
      const updated = [...quoteBasket];
      updated[existingIdx].quantity += quantity;
      updated[existingIdx].totalPrice =
        updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setQuoteBasket(updated);
    } else {
      const newItem: QuotationItem = {
        id: `quote_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        description: service.name,
        category: service.category,
        quantity: quantity,
        unitPrice: service.price,
        totalPrice: service.price * quantity,
        unit: service.unit,
        inventoryItemId: service.inventoryItemId
      };
      setQuoteBasket(prev => [...prev, newItem]);
    }
    setIsCotationModalOpen(true);
  };

  const handleApplyPromo = (code: string) => {
    setActivePromoCode(code);
    setIsCotationModalOpen(true);
  };

  const handleManualRefresh = () => {
    if (onRefreshDb) {
      setIsRefreshing(true);
      onRefreshDb();
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const whatsappPhone =
    company.phone?.split('/')[0]?.replace(/[^0-9]/g, '') || '263771234567';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP UTILITY STRIP & DATABASE STATUS INDICATOR */}
      <div className="bg-[#0A2240] text-slate-200 border-b border-blue-950/60 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Hub identity & workshop status */}
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Workshop Open in Mount Darwin
            </span>
            <span className="text-slate-400 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 text-[11px]">
              Stand 448, Mount Darwin Commercial Centre
            </span>
          </div>

          {/* Right: Database live sync indicator & Phone */}
          <div className="flex items-center gap-3">
            {/* Database Live Verification Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300"
              title="State is hydrated directly from the SQLite database via Prisma Server Actions"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>SQLite DB Live ({activeServices.length} Services)</span>
              {onRefreshDb && (
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing || isLoadingDb}
                  className="hover:text-emerald-400 transition-colors ml-1 p-0.5"
                  title="Force re-query SQLite database"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRefreshing || isLoadingDb ? 'animate-spin text-emerald-400' : ''}`}
                  />
                </button>
              )}
            </div>

            <span className="text-slate-600 hidden md:inline">&bull;</span>

            <a
              href={`tel:${company.phone?.split('/')[0]?.trim() || '+263771234567'}`}
              className="flex items-center gap-1.5 text-white hover:text-emerald-400 transition-colors font-medium text-[11px]"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{company.phone?.split('/')[0]?.trim() || '+263 77 123 4567'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. REFINED NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <MagenLogo variant="full" size="md" />
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-700">
            <a href="#catalogue" className="hover:text-emerald-600 transition-colors">
              Live Services
            </a>
            <a href="#estimator" className="hover:text-emerald-600 transition-colors">
              Cost Estimator
            </a>
            <a href="#packages" className="hover:text-emerald-600 transition-colors">
              School &amp; SME Packages
            </a>
            <a href="#guarantees" className="hover:text-emerald-600 transition-colors">
              Why MIBS
            </a>
            <a href="#location" className="hover:text-emerald-600 transition-colors">
              Contact &amp; Hours
            </a>
          </nav>

          {/* Action Area */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Request a Cotation Button */}
            <button
              id="header-request-cotation-btn"
              onClick={() => setIsCotationModalOpen(true)}
              className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Request Cotation</span>
              {quoteBasket.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-emerald-800 font-black text-[10px] flex items-center justify-center">
                  {quoteBasket.length}
                </span>
              )}
            </button>

            {/* Staff / Teller Access Button */}
            {activeStaffUser && onEnterPosDirectly ? (
              <button
                id="header-reenter-pos-btn"
                onClick={onEnterPosDirectly}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-800"
              >
                <span>{activeStaffUser.avatar || '🧑‍💼'}</span>
                <span className="hidden sm:inline">POS Backoffice</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <button
                id="header-staff-login-btn"
                onClick={() => setIsStaffLoginOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Staff Terminal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Commercial Print & Business Solutions) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-14 sm:py-20">
        {/* Subtle geometric accent backgrounds */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mount Darwin Commercial Media &amp; Printing Hub</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Precision Commercial Printing, DTF Apparel &amp; Integrated Business Solutions
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Serving educational institutions, corporate enterprises, community projects, and public sectors across Mount Darwin and Mashonaland Central. From bulk curriculum syllabus booklets to high-definition DTF uniforms and certified environmental documentation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsCotationModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Build Instant Cotation</span>
                </button>

                <a
                  href="#catalogue"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-colors flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Browse Live Catalogue ({activeServices.length})</span>
                </a>

                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                    'Hello Magen Integrated Business Solutions (MIBS) team! I would like to inquire about printing services.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>

              {/* Payment Methods Badges */}
              <div className="pt-2 flex items-center flex-wrap gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Accepted Payment Methods:</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
                  💵 USD Cash
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-emerald-700 shadow-2xs">
                  📱 EcoCash
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800 shadow-2xs">
                  🤝 Local Cash
                </span>
              </div>
            </div>

            {/* Right Column: Key Trust Badges & Highlights Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-5 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        MIBS Production Standard
                      </h3>
                      <p className="text-xs text-slate-500">
                        Mount Darwin Production Facility
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0A2240] font-mono font-bold text-xs border border-blue-100">
                    VERIFIED
                  </span>
                </div>

                {/* Metric Points */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl font-black text-slate-900 block">50+</span>
                    <span className="text-xs text-slate-600 font-medium leading-tight block mt-0.5">
                      Schools &amp; Organizations Served
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl font-black text-emerald-600 block">24-48h</span>
                    <span className="text-xs text-slate-600 font-medium leading-tight block mt-0.5">
                      Expedited Job Turnaround
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl font-black text-slate-900 block">100%</span>
                    <span className="text-xs text-slate-600 font-medium leading-tight block mt-0.5">
                      Wash-Tested DTF Durability
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-2xl font-black text-emerald-600 block">$0.00</span>
                    <span className="text-xs text-slate-600 font-medium leading-tight block mt-0.5">
                      Free Formal Cotation Quotes
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Procurement Quotations</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-normal">
                    Need an invoice quotation for School Development Committees (SDC) or corporate procurement approval? Submit online and receive an official branded proposal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE INSTANT COST ESTIMATOR PREVIEW */}
      <section id="estimator" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#0A2240] text-xs font-bold border border-blue-100">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transparent Pricing Calculator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Instant Job Cost Estimator
            </h2>
            <p className="text-sm text-slate-600">
              Select any service directly from our database, dial your required quantity, and add it to your quotation in one click.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
              {/* Service Picker */}
              <div className="sm:col-span-6 space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Select Production Service
                </label>
                <select
                  value={estimatorServiceId}
                  onChange={e => setEstimatorServiceId(e.target.value)}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {activeServices.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name} — {currency}{s.price.toFixed(2)} / {s.unit}
                    </option>
                  ))}
                </select>
                {currentEstimatorService && (
                  <p className="text-[11px] text-slate-500">
                    Category: {currentEstimatorService.category} &bull; Unit: {currentEstimatorService.unit}
                  </p>
                )}
              </div>

              {/* Quantity Picker */}
              <div className="sm:col-span-3 space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Quantity ({currentEstimatorService?.unit || 'units'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={estimatorQty}
                  onChange={e => setEstimatorQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Calculated Total & Add Action */}
              <div className="sm:col-span-3 space-y-1.5">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Estimated Total
                  </span>
                  <span className="text-xl font-black text-emerald-700 block">
                    {currency}{estimatorTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 text-left">
                * Bulk orders of 100+ units qualify for institutional discounts in the quotation.
              </span>

              {currentEstimatorService && (
                <button
                  onClick={() => handleAddToCotation(currentEstimatorService, estimatorQty)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {estimatorQty}x to Cotation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CATEGORIZED LIVE SERVICE CATALOGUE */}
      <section id="catalogue" className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <Database className="w-3 h-3" />
                <span>Direct Database Catalogue</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Services &amp; Standard Pricing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Browse all commercial printing, apparel branding, and business consultancy services active in our production database.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search service, code, or material..."
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoriesList.map(cat => {
              const info = CATEGORY_MAP[cat];
              const count =
                cat === 'all'
                  ? activeServices.length
                  : activeServices.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {info?.icon || <Layers className="w-3.5 h-3.5" />}
                  <span>{cat === 'all' ? 'All Services' : info?.label || cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Catalogue Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No services matched your query</h3>
              <p className="text-xs text-slate-500">
                Try searching for another term or selecting a different category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {filteredServices.map(service => {
                const categoryInfo = CATEGORY_MAP[service.category];
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Category & Service Code */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {categoryInfo?.icon}
                          <span>{service.code}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {categoryInfo?.label || service.category}
                        </span>
                      </div>

                      {/* Service Name */}
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {service.name}
                      </h3>

                      {/* Notes / Material */}
                      {service.notes && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {service.notes}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Add to Cotation */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Standard Rate
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900">
                            {currency}{service.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            / {service.unit}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCotation(service, 10)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Add to quotation basket"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Quote</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. SEASONAL & INSTITUTIONAL PACKAGES */}
      <section id="packages" className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Star className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tailored Solutions for Mount Darwin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Special Institutional &amp; Corporate Packages
            </h2>
            <p className="text-sm text-slate-600">
              Specialized bundles engineered for academic terms, corporate branding, and public environmental projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Package 1: Academic */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A2240]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Primary &amp; Secondary Schools
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Term Curriculum &amp; Exam Bundle
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bulk syllabus modules &amp; revision tests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Heavy 300gsm laminated protective covers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Plastic or wire spiral ring binding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>15% institutional discount for 100+ copies</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleApplyPromo('SCHOOLS15')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs transition text-center cursor-pointer"
              >
                Inquire with Promo SCHOOLS15
              </button>
            </div>

            {/* Package 2: Corporate SME */}
            <div className="bg-slate-50 rounded-2xl border-2 border-emerald-500/60 p-6 flex flex-col justify-between shadow-sm relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    SMEs, NGOs &amp; Companies
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Corporate Identity &amp; Apparel
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>20x Heavy cotton branded polo shirts or tees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1x Heavyweight roll-up exhibition banner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>200x Premium double-sided business cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct-to-Film transfer wash warranty</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleApplyPromo('CORP10')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition text-center cursor-pointer shadow-xs"
              >
                Inquire with Promo CORP10
              </button>
            </div>

            {/* Package 3: Environmental & Business Consultancy */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-800">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Mining, Agriculture &amp; Commercial
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    EIA Environmental &amp; Compliance Hub
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Environmental Impact Assessment (EIA) printing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>EMA compliance documentation binding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Site safety notice boards &amp; vinyl signs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Technical business proposal layout &amp; print</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleApplyPromo('EIA5')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs transition text-center cursor-pointer"
              >
                Inquire with Promo EIA5
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE MIBS (Mount Darwin Standard) */}
      <section id="guarantees" className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Partner with Magen Integrated Business Solutions?
            </h2>
            <p className="text-sm text-slate-600">
              We combine cutting-edge print machinery with local accessibility right here in Mount Darwin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Zero Harare Commute</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No need to send money or artwork all the way to Harare. Mount Darwin has direct industrial printing, DTF transfers, and binding on Stand 448.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A2240]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Wash-Proof Garment Prints</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our Direct-to-Film (DTF) apparel transfers use premium hot-melt powders and Japanese pigment inks that endure 50+ wash cycles without cracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Formal Quotations &amp; Receipts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every transaction receives an official, serialized receipt and professional proposal ready for audited committees and school finance desks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A2240]">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Dual Expertise (Print + EIA)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Unique integrated capacity covering commercial digital print, apparel branding, and certified Environmental Consultancy documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">
              Clear answers on how we process, print, deliver, and invoice your orders.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                What payment methods does Magen Integrated Business Solutions accept?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                We accept <strong>USD Cash</strong>, <strong>EcoCash</strong>, and <strong>Cash</strong>. Official serialized receipts are generated for all completed orders.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                How fast can a school syllabus or bulk examination order be printed?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Standard bulk document runs of 50–500 modules are typically completed within 24–48 hours at our Mount Darwin production hub. Expedited same-day emergency options are also available.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                What file formats can I submit for printing?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                We accept PDF, Microsoft Word, CorelDraw, PNG, and JPEG files. If you only have hand-written notes or need formatting assistance, our in-house graphic team will assist.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                How does the online quotation request work?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Click &ldquo;Request Cotation&rdquo;, choose your desired services, and submit your contact details. Your request is saved straight to our live database, and our sales tellers review it immediately to send you a formal quotation via WhatsApp or email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOCATION & WORKSHOP HOURS */}
      <section id="location" className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>Mount Darwin Production Centre</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Visit Our Production Hub or Order Remotely
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Walk-ins are welcome for photocopies, binding, apparel fittings, and order collection. Schools and organizations across Mashonaland Central can order entirely via WhatsApp or our web portal.
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Physical Workshop Address:</strong>
                    <span>{company.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Direct Telephone &amp; WhatsApp:</strong>
                    <span>{company.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Email:</strong>
                    <span>{company.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Workshop Working Hours:</strong>
                    <span>Monday to Friday: 07:30 – 17:30 | Saturday: 08:00 – 14:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-6 bg-slate-800/90 rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  Direct Inquiries
                </span>
                <h3 className="text-xl font-black text-white">
                  Have a specific job specification?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Chat directly with our production manager for instant turnaround confirmation, bulk discount negotiation, or design consultation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                    'Hello MIBS team! I would like to get a quote on a custom job.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  onClick={() => setIsCotationModalOpen(true)}
                  className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-600 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Request Full Cotation</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Authorized Staff &amp; Sales Tellers
                </span>
                <button
                  onClick={() => (activeStaffUser && onEnterPosDirectly ? onEnterPosDirectly() : setIsStaffLoginOpen(true))}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Open POS Terminal &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <MagenLogo variant="compact" size="xs" lightText={true} />
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              &copy; {new Date().getFullYear()} Magen Integrated Business Solutions (MIBS). All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-500">Mount Darwin Commercial Centre</span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-emerald-400 font-mono">SQLite DB Synced</span>
            <span className="text-slate-700">&bull;</span>
            <button
              onClick={() => (activeStaffUser && onEnterPosDirectly ? onEnterPosDirectly() : setIsStaffLoginOpen(true))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </footer>

      {/* CLIENT COTATION MODAL */}
      <ClientCotationModal
        isOpen={isCotationModalOpen}
        onClose={() => setIsCotationModalOpen(false)}
        services={activeServices}
        company={company}
        initialItems={quoteBasket}
        initialPromoCode={activePromoCode}
      />

      {/* STAFF LOGIN MODAL */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onSuccess={user => {
          setIsStaffLoginOpen(false);
          onStaffLoginSuccess(user);
        }}
      />
    </div>
  );
}
