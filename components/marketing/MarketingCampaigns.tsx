'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Tag,
  Megaphone,
  Calendar,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  Percent,
  CheckCircle2,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MarketingCampaign, CampaignAudience, PrintingCategory, Quotation, User } from '@/types';
import { CompanyInfo, storage } from '@/services/storage';

interface MarketingCampaignsProps {
  company: CompanyInfo;
  activeUser: User;
  onStartQuotationWithPromo?: (promo: { code: string; discount: number; title: string }) => void;
  onNavigateToTab?: (tab: any) => void;
}

const AUDIENCE_OPTIONS: CampaignAudience[] = [
  'Schools & Academies',
  'Corporate & SMEs',
  'Churches & Events',
  'Walk-in & Retail',
  'Environmental & Consultancy'
];

const CATEGORY_OPTIONS: (PrintingCategory | 'All Services')[] = [
  'All Services',
  'T-Shirt Printing',
  'Paper Printing',
  'Book Printing',
  'Banners & Signage',
  'Merchandise & Branding',
  'Photocopy & Lamination',
  'Other Services'
];

export const MarketingCampaigns: React.FC<MarketingCampaignsProps> = ({
  company,
  activeUser,
  onStartQuotationWithPromo,
  onNavigateToTab
}) => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => storage.getMarketingCampaigns());
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAudience, setFormAudience] = useState<CampaignAudience>('Schools & Academies');
  const [formCategory, setFormCategory] = useState<PrintingCategory | 'All Services'>('All Services');
  const [formDiscount, setFormDiscount] = useState<number>(10);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [formPromoCode, setFormPromoCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWhatsappPitch, setFormWhatsappPitch] = useState('');
  const [formHeadline, setFormHeadline] = useState('');

  const reloadCampaigns = () => {
    setCampaigns(storage.getMarketingCampaigns());
  };

  const filteredCampaigns = useMemo(() => {
    if (selectedAudience === 'all') return campaigns;
    return campaigns.filter(c => c.targetAudience === selectedAudience);
  }, [campaigns, selectedAudience]);

  const activeCount = campaigns.filter(c => c.active).length;
  const avgDiscount = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.discountPercentage, 0) / campaigns.length)
    : 0;

  const handleCopyPitch = (campaign: MarketingCampaign) => {
    const textToCopy = `${campaign.whatsappPitch}\n\n🏷️ Use Promo Code: *${campaign.promoCode || 'SPECIAL'}* for ${campaign.discountPercentage}% OFF.\n📞 Contact: ${company.phone}\n📍 ${company.name} - ${company.tagline}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(campaign.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = (id: string) => {
    storage.toggleCampaignStatus(id);
    reloadCampaigns();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete campaign "${title}"?`)) {
      storage.deleteMarketingCampaign(id);
      reloadCampaigns();
    }
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormAudience('Schools & Academies');
    setFormCategory('All Services');
    setFormDiscount(10);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setFormPromoCode(`SAVE${Math.floor(10 + Math.random() * 90)}`);
    setFormDescription('');
    setFormWhatsappPitch('');
    setFormHeadline('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: MarketingCampaign) => {
    setEditingCampaign(c);
    setFormTitle(c.title);
    setFormSubtitle(c.subtitle);
    setFormAudience(c.targetAudience);
    setFormCategory(c.category);
    setFormDiscount(c.discountPercentage);
    setFormStartDate(c.startDate);
    setFormEndDate(c.endDate);
    setFormPromoCode(c.promoCode || '');
    setFormDescription(c.description);
    setFormWhatsappPitch(c.whatsappPitch);
    setFormHeadline(c.flyerHeadline);
    setIsModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Auto-generate WhatsApp pitch if blank
    let pitch = formWhatsappPitch.trim();
    if (!pitch) {
      pitch = `Greetings from ${company.name}! 🌟 Enjoy an exclusive ${formDiscount}% discount on ${formCategory === 'All Services' ? 'all media & print orders' : formCategory} with code *${formPromoCode || 'SPECIAL'}*. Valid until ${formEndDate}. Reply to get your custom quotation today!`;
    }

    storage.saveMarketingCampaign({
      id: editingCampaign ? editingCampaign.id : undefined,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || `${formDiscount}% Special Promotional Discount`,
      targetAudience: formAudience,
      category: formCategory,
      discountPercentage: formDiscount,
      startDate: formStartDate,
      endDate: formEndDate,
      promoCode: formPromoCode.trim().toUpperCase() || undefined,
      description: formDescription.trim(),
      whatsappPitch: pitch,
      flyerHeadline: formHeadline.trim() || formTitle.trim(),
      active: editingCampaign ? editingCampaign.active : true
    });

    reloadCampaigns();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0C2D64] via-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Megaphone className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Marketing Campaigns &amp; Client Specials
                </h2>
                <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                  Drive B2B quotations, school orders, and commercial bulk printing with targeted marketing packages.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign Deal</span>
            </button>
          </div>
        </div>

        {/* Marketing KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-blue-800/60">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Active Campaigns</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{activeCount} Running</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Average Discount</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{avgDiscount}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Total Deals in Library</p>
            <p className="text-xl font-black text-white mt-0.5">{campaigns.length} Packages</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Outreach Channel</p>
            <p className="text-xl font-black text-teal-300 mt-0.5">WhatsApp &amp; PDF</p>
          </div>
        </div>
      </div>

      {/* Target Audience Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedAudience('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedAudience === 'all'
              ? 'bg-[#0C2D64] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Audiences ({campaigns.length})
        </button>
        {AUDIENCE_OPTIONS.map(aud => {
          const count = campaigns.filter(c => c.targetAudience === aud).length;
          return (
            <button
              key={aud}
              onClick={() => setSelectedAudience(aud)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedAudience === aud
                  ? 'bg-[#0C2D64] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {aud} ({count})
            </button>
          );
        })}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCampaigns.map(camp => {
          const isCopied = copiedId === camp.id;
          return (
            <div
              key={camp.id}
              className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md flex flex-col justify-between p-5 ${
                camp.active ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                        {camp.targetAudience}
                      </span>
                      {camp.promoCode && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {camp.promoCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 pt-1">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {camp.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      {camp.discountPercentage}% OFF
                    </span>
                    <span
                      onClick={() => handleToggleStatus(camp.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 cursor-pointer transition ${
                        camp.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {camp.active ? '● Active' : '○ Paused'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {camp.description && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {camp.description}
                  </p>
                )}

                {/* Dates & Validity */}
                <div className="flex items-center space-x-4 mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid: {camp.startDate} to {camp.endDate}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.category}</span>
                  </span>
                </div>

                {/* WhatsApp Pitch Box */}
                <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold mb-1">
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready WhatsApp Broadcast Pitch:</span>
                    </span>
                    <button
                      onClick={() => handleCopyPitch(camp)}
                      className="text-emerald-700 hover:text-emerald-950 flex items-center space-x-1 font-semibold cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-950/80 font-mono line-clamp-2 leading-relaxed">
                    {camp.whatsappPitch}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(camp)}
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-medium transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id, camp.title)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyPitch(camp)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied to Clipboard' : 'Copy Pitch'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onStartQuotationWithPromo) {
                        onStartQuotationWithPromo({
                          code: camp.promoCode || 'PROMO',
                          discount: camp.discountPercentage,
                          title: camp.title
                        });
                      } else if (onNavigateToTab) {
                        onNavigateToTab('quotations');
                      }
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0C2D64] hover:bg-[#081e44] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create Quote with Deal</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#0C2D64] text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {editingCampaign ? 'Edit Marketing Package' : 'Create Marketing Campaign'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Set promo discounts, marketing pitches, and target client audience.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campaign Title: *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Back-to-School Modules & Schemes of Work"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Offer Summary:
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={e => setFormSubtitle(e.target.value)}
                  placeholder="e.g. 15% Bulk Discount on All School Booklets and Term Reports"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Client Group:
                  </label>
                  <select
                    value={formAudience}
                    onChange={e => setFormAudience(e.target.value as CampaignAudience)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  >
                    {AUDIENCE_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Category:
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Percentage (%): *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    required
                    value={formDiscount}
                    onChange={e => setFormDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Promo / Quotation Code:
                  </label>
                  <input
                    type="text"
                    value={formPromoCode}
                    onChange={e => setFormPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SCHOOL2026"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date / Expiry:
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ready WhatsApp Outreach Text (For broadcast to clients):
                </label>
                <textarea
                  rows={3}
                  value={formWhatsappPitch}
                  onChange={e => setFormWhatsappPitch(e.target.value)}
                  placeholder="Greetings from Magen Media & Print Solutions! We have a special package for your school..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0C2D64] hover:bg-[#081e44] text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  {editingCampaign ? 'Update Campaign' : 'Save & Activate Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
