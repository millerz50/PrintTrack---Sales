'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  Shield,
  HelpCircle,
  Lock,
  RefreshCw,
  Search
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { storage, CompanyInfo } from '@/services/storage';
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  getUsersAction
} from '@/app/actions/users';

interface ActorsManagerProps {
  company: CompanyInfo;
  activeUser: User;
  onUserChanged?: (user: User) => void;
}

const AVATAR_OPTIONS = ['👑', '💼', '🧑‍💼', '👩‍🎨', '👨‍💻', '⚡', '📊', '🛠️'];

export function ActorsManager({
  company,
  activeUser,
  onUserChanged
}: ActorsManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('teller');
  const [formPin, setFormPin] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAvatar, setFormAvatar] = useState('🧑‍💼');
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revealed PIN map: userId -> boolean
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const isAdmin = activeUser.role === 'admin';
  const isManager = activeUser.role === 'manager';

  const loadUsers = async () => {
    setIsLoading(true);
    // 1. Load from local cache immediately
    const local = storage.getUsers();
    if (local && local.length > 0) {
      setUsers(local);
    }

    // 2. Refresh from server action (SSR/Database)
    try {
      const res = await getUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.warn('[ActorsManager] Server load warning, using local cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const unsub = storage.subscribe(() => {
      setUsers(storage.getUsers());
    });
    return unsub;
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormRole('teller');
    setFormPin('');
    setFormEmail('');
    setFormAvatar('🧑‍💼');
    setFormActive(true);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormRole(user.role);
    setFormPin('');
    setFormEmail(user.email || '');
    setFormAvatar(user.avatar || (user.role === 'admin' ? '👑' : user.role === 'manager' ? '💼' : '🧑‍💼'));
    setFormActive(user.active !== false);
    setFormError('');
  };

  const togglePinReveal = (userId: string) => {
    setRevealedPins(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Staff name is required');
      return;
    }
    if (!formPin.trim() || formPin.trim().length < 4) {
      setFormError('PIN must be at least 4 digits');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // 1. Server action
      const serverRes = await createUserAction({
        name: formName.trim(),
        role: formRole,
        pin: formPin.trim(),
        email: formEmail.trim() || undefined,
        avatar: formAvatar
      });

      // 2. Storage local sync
      const newUser: User = serverRes.user || {
        id: `usr_${Date.now()}`,
        name: formName.trim(),
        role: formRole,
        pin: formPin.trim(),
        email: formEmail.trim() || undefined,
        avatar: formAvatar,
        active: true
      };

      await storage.createUser({
        name: newUser.name,
        role: newUser.role,
        pin: newUser.pin,
        email: newUser.email,
        avatar: newUser.avatar
      });

      setIsAddModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formName.trim()) {
      setFormError('Staff name is required');
      return;
    }
    if (formPin.trim() && formPin.trim().length < 4) {
      setFormError('New PIN must be at least 4 digits');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const updatedUser: User = {
        id: editingUser.id,
        name: formName.trim(),
        role: formRole,
        ...(formPin.trim() ? { pin: formPin.trim() } : {}),
        email: formEmail.trim() || undefined,
        avatar: formAvatar,
        active: formActive
      };

      // 1. Server Action
      const serverRes = await updateUserAction(editingUser.id, {
        name: updatedUser.name,
        role: updatedUser.role,
        ...(formPin.trim() ? { pin: formPin.trim() } : {}),
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        active: updatedUser.active
      });

      if (!serverRes.success) {
        throw new Error(serverRes.error || 'Server rejected update');
      }

      // 2. Local Storage update
      await storage.updateUser(updatedUser);

      if (editingUser.id === activeUser.id && onUserChanged) {
        onUserChanged(updatedUser);
      }

      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!isAdmin) {
      alert('Only Administrators can delete staff actors.');
      return;
    }

    if (user.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        alert('Action blocked: System must have at least one active Administrator.');
        return;
      }
    }

    if (!confirm(`Are you sure you want to remove ${user.name} (${user.role}) from the POS system?`)) {
      return;
    }

    try {
      await deleteUserAction(user.id);
      await storage.deleteUser(user.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff member');
    }
  };

  // Filtered staff list
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const tellerCount = users.filter(u => u.role === 'teller').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Staff &amp; Actors Management (Full CRUD)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage roles, 4-digit PIN credentials, active status, and permissions for Mount Darwin tellers &amp; managers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>{showPermissionsMatrix ? 'Hide Matrix' : 'Permissions Matrix'}</span>
          </button>

          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Refresh from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {(isAdmin || isManager) && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Actor</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Active in Workshop</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Administrators</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{adminCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Full Governance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Managers</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{managerCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Ops &amp; Approvals</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Front Tellers</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{tellerCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Sales &amp; POS Registers</span>
        </div>
      </div>

      {/* Permissions Matrix Drawer (if expanded) */}
      {showPermissionsMatrix && (
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold">Role-Based Access Control (RBAC) Permissions Matrix</h3>
            </div>
            <button
              onClick={() => setShowPermissionsMatrix(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Capability / Operation</th>
                  <th className="py-2 px-3 font-bold text-amber-400">👑 Admin</th>
                  <th className="py-2 px-3 font-bold text-blue-400">💼 Manager</th>
                  <th className="py-2 px-3 font-bold text-emerald-400">🧑‍💼 Teller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-3">Sales POS &amp; Thermal Receipts</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Record Daily Workshop Expenses</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Quotations: Draft &amp; Issue</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Quotation Conversion to Sales Receipt</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-amber-400">⚠ Requires Approval</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Inventory Restocking &amp; Adjustments</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-slate-500">✗ View Only</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Services Catalog &amp; Pricing Editor</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-slate-500">✗ View Only</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Staff CRUD &amp; PIN Management</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-blue-400">✓ Tellers Only</td>
                  <td className="py-2 px-3 text-slate-500">✗ Blocked</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Company Header, Footer &amp; Tax Settings</td>
                  <td className="py-2 px-3 text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-slate-500">✗ Blocked</td>
                  <td className="py-2 px-3 text-slate-500">✗ Blocked</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {(['all', 'admin', 'manager', 'teller'] as const).map(rf => (
            <button
              key={rf}
              type="button"
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer shrink-0 ${
                roleFilter === rf
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Actors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const isMe = user.id === activeUser.id;
          const isPinVisible = revealedPins[user.id];

          return (
            <div
              key={user.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition hover:shadow-md relative space-y-4 ${
                user.active === false
                  ? 'border-slate-300 dark:border-slate-800 opacity-60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {user.avatar || '🧑‍💼'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-1.5 py-0.2 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[170px]">
                      {user.email || `${user.id}@magensolutions.com`}
                    </p>
                  </div>
                </div>

                {/* Role Badge */}
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                    user.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : user.role === 'manager'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Status and Credentials */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Security PIN</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-slate-500 text-xs">
                      •••• (Encrypted)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                      user.active !== false ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.active !== false ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {user.active !== false ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              {(isAdmin || isManager) && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    className="p-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No staff members found matching query</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing the search query or selecting &quot;All&quot; roles.</p>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Add New Staff Actor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Tariro Gondo"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    System Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={e => {
                      const r = e.target.value as UserRole;
                      setFormRole(r);
                      if (r === 'admin') setFormAvatar('👑');
                      else if (r === 'manager') setFormAvatar('💼');
                      else setFormAvatar('🧑‍💼');
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="teller">Front Teller</option>
                    <option value="manager">Operations Manager</option>
                    {isAdmin && <option value="admin">Administrator</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={formPin}
                    onChange={e => setFormPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 5678"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="tariro@magensolutions.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Avatar Emoji
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer ${
                        formAvatar === av
                          ? 'border-indigo-500 bg-indigo-500/20 scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Edit Staff Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    System Role *
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="teller">Front Teller</option>
                    <option value="manager">Operations Manager</option>
                    {isAdmin && <option value="admin">Administrator</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    4-Digit PIN *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formPin}
                    onChange={e => setFormPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Avatar Emoji
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer ${
                        formAvatar === av
                          ? 'border-indigo-500 bg-indigo-500/20 scale-105'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold">Account Active Status</p>
                  <p className="text-[10px] text-slate-400">Suspended accounts cannot log in to POS terminal</p>
                </div>
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
