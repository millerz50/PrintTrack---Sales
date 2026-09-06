'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  Megaphone,
  CheckCircle2,
  Clock,
  Shield,
  Lock,
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
  Gift
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
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'T-Shirt Printing': <Shirt className="w-4 h-4" />,
  'Paper Printing': <Copy className="w-4 h-4" />,
  'Book Printing': <BookOpen className="w-4 h-4" />,
  'Banners & Signage': <Flag className="w-4 h-4" />,
  'Merchandise & Branding': <Gift className="w-4 h-4" />,
  'Photocopy & Lamination': <Printer className="w-4 h-4" />,
  'Other Services': <Layers className="w-4 h-4" />
};

export function PublicShowcaseWebsite({
  company,
  services,
  campaigns = [],
  onStaffLoginSuccess,
  activeStaffUser,
  onEnterPosDirectly
}: PublicShowcaseWebsiteProps) {
  const currency = company.currency || '$';

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteBasket, setQuoteBasket] = useState<QuotationItem[]>([]);
  const [isCotationModalOpen, setIsCotationModalOpen] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [activePromoCode, setActivePromoCode] = useState('');

  // Filter active services only
  const activeServices = useMemo(() => {
    return services.filter(s => s.active !== false);
  }, [services]);

  // Unique categories available in catalogue
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(activeServices.map(s => s.category)));
    return ['all', ...cats];
  }, [activeServices]);

  // Filtered by Category and Search Query
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

  // Add a service to the client's quotation basket
  const handleAddToCotation = (service: ServiceItem) => {
    const existingIdx = quoteBasket.findIndex(i => i.description === service.name);
    if (existingIdx >= 0) {
      const updated = [...quoteBasket];
      updated[existingIdx].quantity += 10;
      updated[existingIdx].totalPrice = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setQuoteBasket(updated);
    } else {
      const newItem: QuotationItem = {
        id: `quote_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        description: service.name,
        category: service.category,
        quantity: 10,
        unitPrice: service.price,
        totalPrice: service.price * 10,
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#081e42] border-b border-blue-950/80 text-[11px] text-slate-300 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Workshop Active:</span>
            <span>Walk-in orders, bulk academic printing &amp; expedited quotes open today</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`tel:${company.phone?.split('/')[0]?.trim() || '+263771234567'}`}
              className="flex items-center space-x-1 hover:text-emerald-400 transition"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{company.phone?.split('/')[0]?.trim() || '+263 77 123 4567'}</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">{company.address}</span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <MagenLogo variant="full" size="md" lightText={true} />
            <div className="hidden lg:block border-l border-slate-800 pl-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Public Services Showcase
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {company.tagline || 'Media & Print Solutions | Environmental Consultancy'}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#services-catalogue" className="hover:text-emerald-400 transition">
              Services &amp; Pricing
            </a>
            <a href="#promotions" className="hover:text-emerald-400 transition">
              Specials &amp; Bundles
            </a>
            <a href="#why-us" className="hover:text-emerald-400 transition">
              Why Partner With Us
            </a>
            <a href="#portfolio" className="hover:text-emerald-400 transition">
              Sample Works
            </a>
            <a href="#contact" className="hover:text-emerald-400 transition">
              Contact &amp; Location
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Request a Cotation Button */}
            <button
              id="header-request-cotation-btn"
              onClick={() => setIsCotationModalOpen(true)}
              className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request Cotation</span>
              {quoteBasket.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-950 font-black text-[10px] flex items-center justify-center ml-1">
                  {quoteBasket.length}
                </span>
              )}
            </button>

            {/* Staff / Teller Access Guard */}
            {activeStaffUser && onEnterPosDirectly ? (
              <button
                id="header-reenter-pos-btn"
                onClick={onEnterPosDirectly}
                className="px-3 py-2 bg-[#0C2D64] hover:bg-[#12397e] text-emerald-300 border border-emerald-500/40 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{activeStaffUser.avatar || '🧑‍💼'}</span>
                <span className="hidden sm:inline">POS Terminal ({activeStaffUser.role})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="header-staff-login-btn"
                onClick={() => setIsStaffLoginOpen(true)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 font-medium text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                title="Staff Login - Internal POS & Workshop Register"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Staff / Teller Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0C2D64] via-slate-950 to-slate-950 py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#388e3c_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Service Commercial Production &amp; Consultancy Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Precision Printing, Apparel Branding &amp; Book Publishing
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Serving schools, corporate institutions, NGOs, churches, and individuals across the country. We specialize in bulk curriculum book printing, DTF garment branding, large-format signages, and executive environmental documentation.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <Clock className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Fast Turnaround</p>
                <p className="text-[10px] text-slate-400">Same-day walk-in service</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <Award className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Subsidized Rates</p>
                <p className="text-[10px] text-slate-400">Bulk school &amp; NGO discounts</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Executive Binding</p>
                <p className="text-[10px] text-slate-400">Gold foil, spiral &amp; hardcover</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-white">Japanese Inks</p>
                <p className="text-[10px] text-slate-400">High-Gsm media &amp; sharp color</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                id="hero-request-cotation-btn"
                onClick={() => setIsCotationModalOpen(true)}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Request Free Cotation / Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                id="hero-browse-services-btn"
                href="#services-catalogue"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2"
              >
                <span>Browse Live Service Rates</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a
                id="hero-whatsapp-btn"
                href={`https://wa.me/${company.phone?.split('/')[0]?.replace(/[^0-9]/g, '') || '263771234567'}?text=${encodeURIComponent('Hello Magen Print! I am interested in your printing and branding services.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-slate-950/60 hover:bg-slate-900 text-emerald-400 border border-emerald-500/30 font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Active Promotional Packages (Campaigns) */}
      <section id="promotions" className="py-14 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Special Seasonal Packages
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Featured Discounts &amp; Academic Bundles
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                Take advantage of bulk promotional packages designed for schools, corporate re-branding, and community events.
              </p>
            </div>

            <button
              onClick={() => setIsCotationModalOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 self-start"
            >
              <span>Build Custom Package in Cotation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {camp.targetAudience}
                    </span>
                    <span className="text-xs font-black text-white bg-emerald-600 px-2.5 py-0.5 rounded-full">
                      {camp.discountPercentage}% OFF
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {camp.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {camp.subtitle}
                  </p>

                  <p className="text-xs text-slate-400">
                    {camp.description}
                  </p>

                  {camp.promoCode && (
                    <div className="pt-2 flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Promo Code:</span>
                      <span className="font-mono font-bold text-emerald-400 tracking-wider">
                        {camp.promoCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                  <span className="text-[11px] text-slate-400">
                    Valid until {camp.endDate}
                  </span>

                  <button
                    onClick={() => handleApplyPromo(camp.promoCode || 'PROMO10')}
                    className="px-3 py-1.5 bg-[#0C2D64] hover:bg-[#12397e] text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Apply to Quote</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Services & Pricing Catalogue Showcase */}
      <section id="services-catalogue" className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Live Service Catalogue &amp; Rates
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                Commercial Printing &amp; Media Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                Admin-verified transparent pricing. Add services to your cotation basket or request a customized job calculation.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-72">
              <input
                id="search-services-input"
                type="text"
                placeholder="Search services (e.g. DTF, Modules)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2.5 pl-9 pr-4 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            {availableCategories.map(cat => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {CATEGORY_ICONS[cat] || <Layers className="w-3.5 h-3.5" />}
                <span>{cat === 'all' ? 'All Services' : cat}</span>
              </button>
            ))}
          </div>

          {/* Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {service.code}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                    {service.name}
                  </h3>

                  {service.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {service.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Standard Rate
                    </span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {currency}{service.price.toFixed(2)}
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1">
                        / {service.unit}
                      </span>
                    </span>
                  </div>

                  <button
                    id={`add-quote-${service.id}`}
                    onClick={() => handleAddToCotation(service)}
                    className="px-3 py-2 bg-[#0C2D64] hover:bg-[#12397e] text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add to Cotation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-400 text-xs">
              No services match your search or filter criteria. Need custom work?{' '}
              <button
                onClick={() => setIsCotationModalOpen(true)}
                className="text-emerald-400 underline font-semibold ml-1"
              >
                Request a custom cotation
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Portfolio & Sample Works */}
      <section id="portfolio" className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Portfolio &amp; Production Gallery
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
              Sample Works &amp; Client Deliverables
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              High-resolution digital transfers, precision bookbinding, and corporate branding manufactured in our workshop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="h-36 rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-950 flex items-center justify-center text-4xl border border-blue-950">
                📚
              </div>
              <h3 className="text-sm font-bold text-white">Educational Curriculum Modules</h3>
              <p className="text-xs text-slate-400">
                Secondary school modules (History, Science, Shona Novels) printed in bulk with durable spiral binding and color gloss covers.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                Bulk School Run (100+ copies)
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="h-36 rounded-xl bg-gradient-to-br from-emerald-900/60 to-slate-950 flex items-center justify-center text-4xl border border-emerald-950">
                👕
              </div>
              <h3 className="text-sm font-bold text-white">DTF Corporate &amp; Event Apparel</h3>
              <p className="text-xs text-slate-400">
                Full-color high-definition DTF printing on 100% premium heavy cotton tees and corporate polo shirts with vibrant wash durability.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                Corporate Staff Uniforms
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="h-36 rounded-xl bg-gradient-to-br from-amber-900/60 to-slate-950 flex items-center justify-center text-4xl border border-amber-950">
                📖
              </div>
              <h3 className="text-sm font-bold text-white">Hardcover Gold-Foil Dossiers</h3>
              <p className="text-xs text-slate-400">
                Executive Environmental Impact Assessment (EIA) reports, university theses, and company prospectuses with gold lettering.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                Consultancy &amp; Academics
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="h-36 rounded-xl bg-gradient-to-br from-purple-900/60 to-slate-950 flex items-center justify-center text-4xl border border-purple-950">
                🚩
              </div>
              <h3 className="text-sm font-bold text-white">Exhibition Roll-up Banners</h3>
              <p className="text-xs text-slate-400">
                Retractable aluminum pull-up banners, teardrop flags, and weather-proof PVC stage backdrops for expos and conferences.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                Expo &amp; Conference Branding
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us & Security Notice */}
      <section id="why-us" className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0C2D64] to-slate-950 border border-blue-900/60 rounded-3xl p-8 sm:p-12">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Our Operating Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Quality Media, Print Solutions &amp; Environmental Responsibility
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Magen Integrated Solutions bridges modern high-speed digital printing with environmental consulting precision. We prioritize eco-conscious materials, recycled paper options where applicable, and energy-efficient digital print workflows.
              </p>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Strict Role Separation &amp; Security</h4>
                    <p className="text-[11px] text-slate-400">
                      Clients have safe public access to cotations without seeing internal sales or cash-up registers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Real-Time Quotation Tracking</h4>
                    <p className="text-[11px] text-slate-400">
                      Web requests are synced directly with teller terminals for fast 15-minute approvals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location Footer */}
      <footer id="contact" className="bg-slate-950 py-12 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <MagenLogo variant="full" size="sm" lightText={true} />
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {company.receiptFooter || 'Quality Media & Print Solutions | Environmental Consultancy. Your trusted partner for educational publishing, corporate identity, and commercial print production.'}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-slate-300 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{company.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact &amp; Orders</h4>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{company.phone}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{company.email}</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Mon - Fri: 7:30 AM - 5:30 PM<br />
                Saturday: 8:00 AM - 2:00 PM
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Internal Portals</h4>
              <p className="text-slate-400 text-[11px]">
                Authorized tellers and workshop administrators:
              </p>
              <button
                id="footer-staff-login-btn"
                onClick={() => setIsStaffLoginOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Staff POS Terminal Login</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
            <p className="flex items-center space-x-2">
              <span>Client Showcase &amp; Cotation System</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-mono">Protected POS Architecture</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Client Cotation Modal */}
      <ClientCotationModal
        isOpen={isCotationModalOpen}
        onClose={() => {
          setIsCotationModalOpen(false);
          setActivePromoCode('');
        }}
        services={activeServices}
        company={company}
        initialItems={quoteBasket}
        initialPromoCode={activePromoCode}
      />

      {/* Staff / Teller Security Login Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onSuccess={user => {
          onStaffLoginSuccess(user);
        }}
      />
    </div>
  );
}
