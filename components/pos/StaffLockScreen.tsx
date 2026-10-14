'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  UserCheck,
  AlertCircle,
  Building2,
  Sparkles,
  Globe,
  UserPlus,
  Shield,
  Check,
  CheckCircle2,
  X
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { storage, CompanyInfo } from '@/services/storage';
import { MagenLogo } from '@/components/MagenLogo';
import {
  registerTellerAction,
  grantTellerAccessAction,
  quickAdminGrantAction,
  getUsersAction
} from '@/app/actions/users';

interface StaffLockScreenProps {
  company: CompanyInfo;
  onUnlock: (user: User) => void;
  onBackToWebsite: () => void;
}

const AVATAR_OPTIONS = ['🧑‍💼', '👩‍🎨', '👨‍💻', '⚡', '💼', '🖨️', '👑', '🌟'];

export function StaffLockScreen({
  company,
  onUnlock,
  onBackToWebsite
}: StaffLockScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sub-modal for creating teller or admin grant
  const [modalMode, setModalMode] = useState<'none' | 'register' | 'grant'>('none');

  // Registration Form
  const [regName, setRegName] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState('🧑‍💼');
  const [regAutoActive, setRegAutoActive] = useState(true);

  // Admin Grant Form
  const [adminPinInput, setAdminPinInput] = useState('');
  const [grantTargetUser, setGrantTargetUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await getUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
        if (!selectedUser && res.users.length > 0) {
          setSelectedUser(res.users[0]);
        }
      } else {
        const local = storage.getUsers();
        setUsers(local);
        if (!selectedUser && local.length > 0) {
          setSelectedUser(local[0]);
        }
      }
    } catch {
      const local = storage.getUsers();
      setUsers(local);
      if (!selectedUser && local.length > 0) {
        setSelectedUser(local[0]);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    const active = storage.getActiveUser();
    if (active) {
      setSelectedUser(active);
    }
  }, []);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setError('Please choose a staff account');
      return;
    }
    if (!pin) {
      setError('Please enter your staff PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const authenticated = await storage.authenticateUser(selectedUser.id, pin.trim());
      if (authenticated) {
        storage.setActiveUser(authenticated);
        onUnlock(authenticated);
      } else {
        if (selectedUser.active === false) {
          setError('This teller account is pending Admin approval. An admin can grant access using PIN 1234.');
        } else {
          setError('Incorrect PIN. Please re-enter.');
          setPin('');
        }
      }
    } catch {
      setError('Authentication failure. Please try again.');
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      const res = await registerTellerAction({
        name: regName.trim(),
        pin: regPin.trim(),
        email: regEmail.trim() || undefined,
        avatar: regAvatar,
        autoGrant: regAutoActive
      });

      if (res.success && res.user) {
        const newUser = res.user;
        await fetchUsers();
        setSelectedUser(newUser);
        setPin(newUser.pin || regPin.trim());
        setModalMode('none');

        if (newUser.active) {
          setSuccess(`Teller profile created for ${newUser.name}! Click Unlock to open POS.`);
        } else {
          setSuccess(`Teller profile created for ${newUser.name}. Pending Admin Grant (Admin PIN 1234).`);
        }
      } else {
        setError(res.error || 'Failed to save teller details.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating teller in database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTargetUser || !adminPinInput.trim()) {
      setError('Please select a staff member and enter the Admin PIN.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await quickAdminGrantAction(adminPinInput.trim(), grantTargetUser.id, 'teller');
      if (res.success && res.user) {
        setSuccess(`Admin Grant Authorized for ${res.user.name}!`);
        await fetchUsers();
        setSelectedUser(res.user);
        setPin(res.user.pin || '');
        setModalMode('none');
      } else {
        setError(res.error || 'Invalid Admin PIN. (Sarah Admin PIN is 1234)');
      }
    } catch {
      setError('Failed to grant user access.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard support for typing PIN directly
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (modalMode !== 'none') return;
      if (ev.key >= '0' && ev.key <= '9') {
        handleKeyPress(ev.key);
      } else if (ev.key === 'Backspace') {
        handleBackspace();
      } else if (ev.key === 'Enter') {
        handleUnlock();
      } else if (ev.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedUser, modalMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar: Return to Website */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800/60 border border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Return to Customer Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mount Darwin Terminal</span>
        </div>
      </div>

      {/* Main Lock Card */}
      <div className="max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <MagenLogo variant="full" size="md" lightText={true} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Staff &amp; Workshop Backoffice</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Teller POS Terminal
            </h1>
            <p className="text-xs text-slate-400">
              Select your teller profile and enter your 4-digit PIN to access sales, stock, and receipts.
            </p>
          </div>

          {/* Quick Credentials & Self-Service Banner */}
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs text-indigo-200 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Staff Access PIN Codes:
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Click profile to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded">
                <span>👑 Sarah (Admin)</span>
                <span className="font-bold text-white bg-indigo-800 px-1.5 py-0.5 rounded">1234</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded">
                <span>🧑‍💼 David (Teller)</span>
                <span className="font-bold text-white bg-indigo-800 px-1.5 py-0.5 rounded">0000</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded">
                <span>💼 Michael (Mgr)</span>
                <span className="font-bold text-white bg-indigo-800 px-1.5 py-0.5 rounded">2222</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded">
                <span>👩‍🎨 Grace (Op)</span>
                <span className="font-bold text-white bg-indigo-800 px-1.5 py-0.5 rounded">1111</span>
              </div>
            </div>

            {/* Quick Action Buttons: Create Teller & Admin Grant */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalMode('register');
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create Teller Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalMode('grant');
                  setError('');
                  setSuccess('');
                }}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Grant</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* User Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
                Select Staff Member:
              </label>
              <button
                type="button"
                onClick={() => setModalMode('register')}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                + Register New Teller
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = selectedUser?.id === u.id;
                const isPending = u.active === false;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      if (u.pin) setPin(u.pin);
                      setError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl shrink-0">{u.avatar || '🧑‍💼'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{u.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                        {isPending ? (
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">Pending</span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-300 bg-slate-900/80 px-1 rounded">
                            {u.pin || '••••'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Display Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Enter PIN:
              </label>
              {selectedUser && (
                <span className="text-[11px] text-slate-500">
                  Signing in as <strong className="text-slate-300">{selectedUser.name}</strong>
                </span>
              )}
            </div>

            {/* PIN Dots Display */}
            <div className="h-14 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-4 px-4">
              {[0, 1, 2, 3].map(index => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      isFilled
                        ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-12 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/80 rounded-xl text-lg font-bold text-white transition cursor-pointer flex items-center justify-center shadow-xs"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-12 bg-slate-800/40 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/80 rounded-xl text-lg font-bold text-white transition cursor-pointer flex items-center justify-center shadow-xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 bg-slate-800/40 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center"
            >
              ⌫ Back
            </button>
          </div>

          {/* Unlock Submit Button */}
          <button
            type="button"
            onClick={() => handleUnlock()}
            disabled={isLoading || pin.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Verifying PIN...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Unlock POS Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL 1: CREATE TELLER DETAILS */}
      {modalMode === 'register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Create Teller Account Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalMode('none')}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTeller} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name (Teller)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farai Moyo"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Choose 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="4-digit PIN (e.g. 7777)"
                  value={regPin}
                  onChange={e => setRegPin(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-lg font-mono tracking-widest focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email / Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. farai@mibs.co.zw"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Avatar
                </label>
                <div className="flex gap-2">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`text-xl p-1.5 rounded-lg border ${
                        regAvatar === av
                          ? 'bg-emerald-950 border-emerald-500'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Active Access Immediately</p>
                  <p className="text-[10px] text-slate-400">Enable instant POS sign-in without waiting</p>
                </div>
                <input
                  type="checkbox"
                  checked={regAutoActive}
                  onChange={e => setRegAutoActive(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !regName.trim() || regPin.length < 4}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save to Database &amp; Unlock</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN GRANT HUB */}
      {modalMode === 'grant' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Admin Teller Grant &amp; Approval</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalMode('none')}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickGrant} className="space-y-3">
              <p className="text-xs text-slate-300">
                Admins can approve pending staff registrations using the Sarah Master Admin PIN (<strong>1234</strong>).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Select User to Grant:
                </label>
                <select
                  value={grantTargetUser?.id || ''}
                  onChange={e => {
                    const u = users.find(x => x.id === e.target.value);
                    if (u) setGrantTargetUser(u);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Staff Account --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) - {u.active ? 'Active' : 'Pending'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Admin PIN Code (Sarah PIN: 1234)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 1234"
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center font-mono tracking-widest text-base focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !grantTargetUser || !adminPinInput.trim()}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Grant Teller Permissions</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} {company.name || 'Magen Integrated Business Solutions'}</span>
        <button
          type="button"
          onClick={onBackToWebsite}
          className="text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Switch to Public Marketing Website</span>
        </button>
      </div>
    </div>
  );
}
