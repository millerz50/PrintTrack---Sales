import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit2, Plus, Search, Trash2, X, Wrench } from 'lucide-react';
import { PrintingCategory, ServiceItem, User } from '../types';
import { CompanyInfo, storage } from '../services/storage';
import { saveServiceItemAction, deleteServiceItemAction } from '@/app/actions/services';

interface ServiceManagerProps {
  services: ServiceItem[];
  inventory: { id: string; name: string }[];
  activeUser: User;
  company: CompanyInfo;
}

const CATEGORIES: PrintingCategory[] = [
  'T-Shirt Printing', 'Paper Printing', 'Book Printing', 'Banners & Signage',
  'Merchandise & Branding', 'Photocopy & Lamination', 'Other Services'
];

const EMPTY: ServiceItem = {
  id: '', code: '', name: '', category: 'Paper Printing', unit: 'page', price: 0, active: true, notes: ''
};

export const ServiceManager: React.FC<ServiceManagerProps> = ({ services, inventory, activeUser, company }) => {
  const currency = company.currency || '$';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceItem>(EMPTY);

  const filtered = useMemo(() => services.filter(s =>
    (category === 'all' || s.category === category) &&
    (`${s.code} ${s.name}`.toLowerCase().includes(query.toLowerCase()))
  ), [services, category, query]);

  if (activeUser.role !== 'admin') {
    return <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">Only administrators can manage the service catalogue and prices.</div>;
  }

  const openNew = () => {
    const next = services.length + 1;
    setEditing(null);
    setForm({ ...EMPTY, id: `svc_${Date.now()}`, code: `SVC-${String(next).padStart(3, '0')}` });
    setShowForm(true);
  };

  const openEdit = (service: ServiceItem) => {
    setEditing(service);
    setForm({ ...service });
    setShowForm(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.unit.trim()) return;
    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      unit: form.unit.trim(),
      price: Math.max(0, Number(form.price) || 0),
      notes: form.notes?.trim() || undefined
    };
    storage.saveService(payload);
    saveServiceItemAction(payload).catch(err => console.warn('[ServiceManager] DB save error:', err));
    setShowForm(false);
  };

  return <div className="space-y-5">
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Wrench className="w-5 h-5 text-indigo-600" /></div>
          <div><h2 className="text-lg font-bold text-slate-800">Services & Pricing</h2><p className="text-xs text-slate-500 mt-1">Admin-controlled service catalogue. Services entered here appear automatically in POS.</p></div>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add Service</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
        <div className="sm:col-span-2 relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search service or code..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50"><option value="all">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
      </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto"><table className="w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">Service</th><th className="text-left p-3">Category</th><th className="text-left p-3">Unit</th><th className="text-right p-3">Price</th><th className="text-center p-3">Status</th><th className="text-right p-3">Actions</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{filtered.map(s => <tr key={s.id} className="hover:bg-slate-50">
          <td className="p-3 font-mono text-slate-500">{s.code}</td><td className="p-3 font-semibold text-slate-800">{s.name}{s.notes && <div className="text-[10px] text-amber-600 mt-1">{s.notes}</div>}</td><td className="p-3 text-slate-500">{s.category}</td><td className="p-3 text-slate-500">{s.unit}</td><td className="p-3 text-right font-bold text-indigo-700">{currency}{s.price.toFixed(2)}</td>
          <td className="p-3 text-center">
            <button
              onClick={() => {
                storage.toggleService(s.id);
                saveServiceItemAction({ ...s, active: !s.active }).catch(err => console.warn('[ServiceManager] DB toggle error:', err));
              }}
              className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
            >
              {s.active ? 'Active' : 'Hidden'}
            </button>
          </td>
          <td className="p-3 text-right">
            <button onClick={() => openEdit(s)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${s.name}?`)) {
                  storage.deleteService(s.id);
                  deleteServiceItemAction(s.id).catch(err => console.warn('[ServiceManager] DB delete error:', err));
                }
              }}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </td>
        </tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">No services found.</td></tr>}</tbody>
      </table></div>
    </div>

    {showForm && <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 overflow-y-auto"><form onSubmit={save} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
      <div className="flex items-center justify-between pb-3 border-b"><div><h3 className="font-bold text-slate-900">{editing ? 'Edit Service' : 'Add Service'}</h3><p className="text-[11px] text-slate-500 mt-0.5">Only admins can change the catalogue.</p></div><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="text-xs font-semibold">Service Code<input required value={form.code} onChange={e => setForm({...form, code:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg font-mono" /></label>
        <label className="text-xs font-semibold">Service Name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
        <label className="text-xs font-semibold">Category<select value={form.category} onChange={e => setForm({...form, category:e.target.value as PrintingCategory})} className="mt-1 w-full px-3 py-2 border rounded-lg">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="text-xs font-semibold">Unit<input required value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="page, book, job..." /></label>
        <label className="text-xs font-semibold">Selling Price ({currency})<input required min="0" step="0.01" type="number" value={form.price} onChange={e => setForm({...form, price:Number(e.target.value)})} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
        <label className="text-xs font-semibold">Optional Stock Link<select value={form.inventoryItemId || ''} onChange={e => setForm({...form, inventoryItemId:e.target.value || undefined})} className="mt-1 w-full px-3 py-2 border rounded-lg"><option value="">No stock deduction</option>{inventory.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
        <label className="col-span-2 text-xs font-semibold">Notes<input value={form.notes || ''} onChange={e => setForm({...form, notes:e.target.value})} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
      </div>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Save Service</button></div>
    </form></div>}
  </div>;
};
