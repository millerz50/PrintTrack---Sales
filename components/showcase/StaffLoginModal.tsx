'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  X,
  UserCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
  UserPlus,
  Shield,
  CheckCircle2,
  Users,
  Sparkles,
  Check,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { storage } from '@/services/storage';
import {
  registerTellerAction,
  grantTellerAccessAction,
  quickAdminGrantAction,
  deleteUserAction,
  getUsersAction
} from '@/app/actions/users';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AVATAR_OPTIONS = ['🧑‍💼', '👩‍🎨', '👨‍💻', '⚡', '💼', '🖨️', '👑', '🌟'];

export function StaffLoginModal({ isOpen, onClose, onSuccess }: StaffLoginModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'grant'>('signin');
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0] || null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState('🧑‍💼');
  const [regInstantActive, setRegInstantActive] = useState(true);

  // Admin Grant State
  const [adminPinInput, setAdminPinInput] = useState('');
  const [grantTargetUser, setGrantTargetUser] = useState<User | null>(null);

  // Refresh users on open and periodically
  const refreshUserList = async () => {
    try {
      const res = await getUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
        if (!selectedUser && res.users.length > 0) {
          setSelectedUser(res.users[0]);
        }
      } else {
        setUsers(storage.getUsers());
      }
    } catch {
      setUsers(storage.getUsers());
    }
  };

  useEffect(() => {
    refreshUserList();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a staff account.');
      return;
    }

    if (!pin.trim()) {
      setError('Please enter your staff PIN code.');
      return;
    }

    setLoading(true);
    try {
      const authenticated = await storage.authenticateUser(selectedUser.id, pin.trim());
      if (authenticated) {
        storage.setActiveUser(authenticated);
        onSuccess(authenticated);
        onClose();
      } else {
        if (selectedUser.active === false) {
          setError('This teller account is pending Admin approval. An admin can grant access using PIN 1234.');
        } else {
          setError('Incorrect PIN. Please re-enter (Sarah Admin PIN is 1234).');
        }
      }
    } catch {
      setError('Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!regPin.trim() || regPin.trim().length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create in real database via server action
      const res = await registerTellerAction({
        name: regName.trim(),
        pin: regPin.trim(),
        email: regEmail.trim() || undefined,
        avatar: regAvatar,
        autoGrant: regInstantActive
      });

      if (res.success && res.user) {
        const newUser = res.user;
        await refreshUserList();

        if (newUser.active) {
          setSuccess(`Teller account created successfully! You can sign in immediately with PIN ${newUser.pin}.`);
          setSelectedUser(newUser);
          setPin(newUser.pin || regPin.trim());
          // Auto sign in if instant
          storage.setActiveUser(newUser);
          setTimeout(() => {
            onSuccess(newUser);
            onClose();
          }, 1200);
        } else {
          setSuccess(`Teller account submitted! Pending Admin Grant. Admin (Sarah: 1234) can grant approval.`);
          setSelectedUser(newUser);
          setActiveTab('grant');
        }
      } else {
        setError(res.error || 'Failed to create teller account in database.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving teller to database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGrant = async (targetUser: User, activate: boolean) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await grantTellerAccessAction(targetUser.id, activate, targetUser.role);
      if (res.success) {
        setSuccess(`Successfully ${activate ? 'granted access to' : 'deactivated'} ${targetUser.name}!`);
        await refreshUserList();
      } else {
        setError(res.error || 'Failed to update user status.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to grant teller access.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPinInput.trim() || !grantTargetUser) {
      setError('Please select a user and enter the Admin PIN.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await quickAdminGrantAction(adminPinInput.trim(), grantTargetUser.id, 'teller');
      if (res.success && res.user) {
        setSuccess(`Admin Grant Authorized! ${res.user.name} is now an active teller.`);
        await refreshUserList();
        setSelectedUser(res.user);
        setPin(res.user.pin || '');
        setAdminPinInput('');
        setActiveTab('signin');
      } else {
        setError(res.error || 'Invalid Admin PIN. (Sarah Admin PIN is 1234)');
      }
    } catch (err: any) {
      setError(err?.message || 'Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;
    setLoading(true);
    try {
      const res = await deleteUserAction(userId);
      if (res.success) {
        setSuccess(`Staff account for ${userName} removed.`);
        await refreshUserList();
      } else {
        setError(res.error || 'Failed to delete user.');
      }
    } catch {
      setError('Failed to delete staff member.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPad = (digit: string) => {
    if (activeTab === 'signin') {
      if (pin.length < 6) {
        setPin(prev => prev + digit);
        setError('');
      }
    } else if (activeTab === 'register') {
      if (regPin.length < 6) {
        setRegPin(prev => prev + digit);
        setError('');
      }
    }
  };

  const handleBackspace = () => {
    if (activeTab === 'signin') {
      setPin(prev => prev.slice(0, -1));
    } else if (activeTab === 'register') {
      setRegPin(prev => prev.slice(0, -1));
    }
    setError('');
  };

  const handleClear = () => {
    if (activeTab === 'signin') setPin('');
    if (activeTab === 'register') setRegPin('');
    setError('');
  };

  return (
    <div
      id="staff-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="staff-login-modal"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0C2D64] via-slate-900 to-[#0C2D64] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Staff Portal &amp; Teller Access
              </h2>
              <p className="text-xs text-slate-300">
                Live SQLite Database Authentication &bull; Mount Darwin Hub
              </p>
            </div>
          </div>
          <button
            id="close-staff-login-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs: Sign In | Create Teller | Admin Grant */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In (PIN)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create Teller</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('grant');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'grant'
                ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Grant</span>
          </button>
        </div>

        {/* Global Notifications */}
        <div className="px-6 pt-3">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center space-x-2 text-rose-300 text-xs animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Body content based on activeTab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Credentials quick banner */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <KeyRound className="w-4 h-4" />
                    Available Staff &amp; PINs:
                  </span>
                  <span className="text-[10px] text-emerald-400/80 bg-emerald-900/50 px-2 py-0.5 rounded-full">
                    Tap profile to autofill
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  {users.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setPin(u.pin || '1234');
                        setError('');
                      }}
                      className="flex items-center justify-between bg-emerald-900/30 hover:bg-emerald-900/60 px-2 py-1 rounded text-left transition"
                    >
                      <span className="truncate">{u.avatar} {u.name}</span>
                      <span className="font-bold text-white bg-emerald-800 px-1.5 py-0.5 rounded ml-1 shrink-0">
                        {u.pin || '1234'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Profile
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ New Teller</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {users.map(u => {
                    const isSelected = selectedUser?.id === u.id;
                    const isPending = u.active === false;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        id={`staff-user-${u.id}`}
                        onClick={() => {
                          setSelectedUser(u);
                          setPin(u.pin || '');
                          setError('');
                        }}
                        className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{u.avatar || (u.role === 'admin' ? '👑' : '🧑‍💼')}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{u.name}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[10px] uppercase font-mono text-emerald-400">
                              {u.role}
                            </span>
                            {isPending ? (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-semibold">
                                Pending Grant
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 rounded">
                                PIN: {u.pin || '••••'}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Enter 4-Digit PIN Code
                </label>
                <div className="relative">
                  <input
                    id="staff-pin-input"
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={e => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="• • • •"
                    className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 px-4 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white outline-none"
                    autoFocus
                  />
                  <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Touch Number Pad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === 'C') handleClear();
                      else if (btn === '⌫') handleBackspace();
                      else handleKeyPad(btn);
                    }}
                    className="py-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-base transition active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="submit-staff-login-btn"
                disabled={loading || !pin.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : `Unlock Terminal as ${selectedUser?.name || 'Staff'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: CREATE TELLER (CRUD REGISTRATION) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterTeller} className="space-y-4">
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs text-indigo-200">
                <span className="font-bold flex items-center gap-1.5 text-indigo-300 mb-1">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Self-Service Teller Registration:
                </span>
                <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                  Anyone can create their details as a teller. The account is saved into the live SQLite database. You can activate it immediately or request an Admin Grant.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name &bull; Teller
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tendai Moyo (Front Desk)"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Avatar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`text-xl p-2 rounded-xl border transition ${
                        regAvatar === av
                          ? 'bg-emerald-950 border-emerald-500 ring-2 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="e.g. 5555"
                  value={regPin}
                  onChange={e => setRegPin(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Email / Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email / WhatsApp Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. tendai@mibs.co.zw or +263771234567"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Grant / Activation Toggle */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Instant Activation</p>
                  <p className="text-[11px] text-slate-400">
                    {regInstantActive
                      ? 'Account will be active immediately upon creation.'
                      : 'Account requires Admin Approval/Grant before login.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={regInstantActive}
                  onChange={e => setRegInstantActive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !regName.trim() || regPin.length < 4}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Saving to Database...' : 'Create Teller Account & Details'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN GRANT HUB */}
          {activeTab === 'grant' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Shield className="w-4 h-4" />
                  Admin Teller Grant &amp; Permissions Hub:
                </span>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Admins can grant active counter access, approve pending teller registrations, or delete accounts directly in the real database.
                </p>
              </div>

              {/* Quick Admin Pin Verification */}
              <form onSubmit={handleQuickAdminAuthorize} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorize with Admin Master PIN (Sarah PIN: 1234)</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Admin PIN (1234)"
                    value={adminPinInput}
                    onChange={e => setAdminPinInput(e.target.value)}
                    className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono tracking-widest focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!adminPinInput.trim() || !grantTargetUser}
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition"
                  >
                    Grant Access
                  </button>
                </div>
                {grantTargetUser ? (
                  <p className="text-[11px] text-emerald-400">
                    Selected for grant: <strong>{grantTargetUser.name}</strong> ({grantTargetUser.role})
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Click any user below to select them for authorization.
                  </p>
                )}
              </form>

              {/* List of All Staff & Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Staff Accounts &bull; Real Database
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {users.map(u => {
                    const isTarget = grantTargetUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setGrantTargetUser(u)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                          isTarget
                            ? 'bg-slate-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{u.avatar || '🧑‍💼'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Role: <span className="text-emerald-400 capitalize">{u.role}</span> &bull; PIN: {u.pin || '••••'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                          {u.active ? (
                            <button
                              type="button"
                              onClick={() => handleAdminGrant(u, false)}
                              title="Click to revoke/deactivate"
                              className="px-2 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700 text-[10px] font-bold rounded-lg transition"
                            >
                              Active &bull; Revoke
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAdminGrant(u, true)}
                              title="Click to grant/activate"
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded-lg transition shadow-xs"
                            >
                              Grant Access
                            </button>
                          )}

                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete staff"
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
