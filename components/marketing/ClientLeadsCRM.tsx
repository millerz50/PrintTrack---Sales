'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Briefcase,
  Church,
  Leaf,
  FileText,
  MessageCircle,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ClientLead, Quotation, User } from '@/types';
import { CompanyInfo, storage } from '@/services/storage';

interface ClientLeadsCRMProps {
  company: CompanyInfo;
  activeUser: User;
  onSelectClientForQuote?: (client: { name: string; phone?: string; email?: string; address?: string }) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ClientLeadsCRM: React.FC<ClientLeadsCRMProps> = ({
  company,
  activeUser,
  onSelectClientForQuote,
  onNavigateToTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [leads, setLeads] = useState<ClientLead[]>(() => storage.getClientLeads());
  const [quotations] = useState<Quotation[]>(() => storage.getQuotations());
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<ClientLead | null>(null);

  const currency = company.currency || '$';

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.companyOrOrg && lead.companyOrOrg.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || lead.leadType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [leads, searchTerm, selectedType]);

  const totalWonRevenue = leads.reduce((sum, l) => sum + l.totalWonAmount, 0);
  const totalQuotesCount = leads.reduce((sum, l) => sum + l.totalQuotes, 0);
  const schoolsCount = leads.filter(l => l.leadType === 'School').length;
  const corporateCount = leads.filter(l => l.leadType === 'Corporate').length;

  const getLeadTypeBadge = (type: ClientLead['leadType']) => {
    switch (type) {
      case 'School':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <GraduationCap className="w-3 h-3" />
            <span>School / Academy</span>
          </span>
        );
      case 'Corporate':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Briefcase className="w-3 h-3" />
            <span>Corporate / SME</span>
          </span>
        );
      case 'Church':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Church className="w-3 h-3" />
            <span>Church / Ministry</span>
          </span>
        );
      case 'Consultancy':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Leaf className="w-3 h-3" />
            <span>Environmental / Consultancy</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Users className="w-3 h-3" />
            <span>Direct Client</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: ClientLead['latestStatus']) => {
    switch (status) {
      case 'Converted':
      case 'Accepted':
      case 'Customer':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ Active Customer
          </span>
        );
      case 'Sent':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300">
            ⏳ Pending Quote
          </span>
        );
      case 'Draft':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
            Draft Lead
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleStartQuote = (lead: ClientLead) => {
    if (onSelectClientForQuote) {
      onSelectClientForQuote({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.companyOrOrg
      });
    } else if (onNavigateToTab) {
      onNavigateToTab('quotations');
    }
  };

  // Get client's specific quotes
  const clientQuotes = useMemo(() => {
    if (!selectedLeadForHistory) return [];
    return quotations.filter(
      q => q.customerName.toLowerCase() === selectedLeadForHistory.name.toLowerCase()
    );
  }, [quotations, selectedLeadForHistory]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0C2D64] to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Client Leads &amp; Quotation Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                Manage commercial accounts, school principals, and corporate relationships for recurring print jobs.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-blue-900/60">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Total Clients &amp; Leads</p>
            <p className="text-xl font-black text-white mt-0.5">{leads.length} Accounts</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Total Won Quotations</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{currency}{totalWonRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Schools in Pipeline</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{schoolsCount} Schools</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-blue-200 font-medium">Corporate Accounts</p>
            <p className="text-xl font-black text-cyan-300 mt-0.5">{corporateCount} Companies</p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by school, company, name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0C2D64] focus:outline-none shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {['all', 'School', 'Corporate', 'Consultancy', 'Church', 'Individual'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-[#0C2D64] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type === 'all' ? `All Leads (${leads.length})` : type}
            </button>
          ))}
        </div>
      </div>

      {/* Client Leads Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Client / Organization</th>
                <th className="px-4 py-3">Client Segment</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Quotations &amp; Value</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Direct Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => {
                const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Org */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      {lead.companyOrOrg && (
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{lead.companyOrOrg}</span>
                        </div>
                      )}
                    </td>

                    {/* Segment Badge */}
                    <td className="px-4 py-3">
                      {getLeadTypeBadge(lead.leadType)}
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {lead.phone ? (
                          <div className="flex items-center space-x-1.5 text-slate-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{lead.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No phone logged</span>
                        )}
                        {lead.email && (
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-blue-500" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quotations & Value */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {currency}{lead.totalWonAmount.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lead.totalQuotes > 0 ? `${lead.totalQuotes} Quotation(s)` : 'Direct Walk-in Orders'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {getStatusBadge(lead.latestStatus)}
                        <div className="text-[10px] text-slate-400">
                          Last: {lead.lastInteractionDate}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${lead.name}! Greetings from ${company.name}. We are following up regarding your printing and media inquiries. How may we assist you today?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
                            title="Send WhatsApp Message"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setSelectedLeadForHistory(lead)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
                          title="View Past Quotations"
                        >
                          History
                        </button>

                        <button
                          onClick={() => handleStartQuote(lead)}
                          className="flex items-center space-x-1 px-3 py-1 bg-[#0C2D64] hover:bg-[#081e44] text-white rounded-lg text-xs font-bold transition shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Quote</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLIENT QUOTATION HISTORY MODAL */}
      {selectedLeadForHistory && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Quotation History: {selectedLeadForHistory.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedLeadForHistory.phone || 'No phone'} | Total Value: {currency}{selectedLeadForHistory.totalWonAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadForHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-3">
              {clientQuotes.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No previous formal quotations found for this client. They may have made direct walk-in cash sales.
                </div>
              ) : (
                clientQuotes.map(q => (
                  <div key={q.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{q.quoteNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {q.date} • {q.items.length} item(s) • Prepared by {q.preparedBy}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-xs">
                        {currency}{q.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Valid to {q.validUntil}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 mt-3">
              <button
                onClick={() => setSelectedLeadForHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleStartQuote(selectedLeadForHistory);
                  setSelectedLeadForHistory(null);
                }}
                className="px-4 py-2 bg-[#0C2D64] text-white text-xs font-bold rounded-xl hover:bg-[#081e44]"
              >
                Start New Quote for {selectedLeadForHistory.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
