'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, X, UserCheck, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { User } from '@/types';
import { storage } from '@/services/storage';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function StaffLoginModal({ isOpen, onClose, onSuccess }: StaffLoginModalProps) {
  if (!isOpen) return null;

  const users = storage.getUsers();
  const [selectedUser, setSelectedUser] = useState<User>(users[0] || null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError('Incorrect PIN. Please try again or contact the administrator.');
      }
    } catch {
      setError('Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPad = (digit: string) => {
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

  return (
    <div
      id="staff-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="staff-login-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0C2D64] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Staff &amp; Teller Portal
              </h2>
              <p className="text-xs text-slate-300">
                Authorized access to Local POS &amp; Workshop Register
              </p>
            </div>
          </div>
          <button
            id="close-staff-login-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Clients have no access to the POS. Please select your staff profile and enter your 4-digit security PIN to unlock the counter terminal.
            </span>
          </div>

          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Staff Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  id={`staff-user-${u.id}`}
                  onClick={() => {
                    setSelectedUser(u);
                    setPin('');
                    setError('');
                  }}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition ${
                    selectedUser?.id === u.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{u.avatar || (u.role === 'admin' ? '👑' : '🧑‍💼')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{u.name}</p>
                    <p className="text-[10px] uppercase font-mono text-emerald-400">
                      {u.role === 'admin' ? 'Admin / Manager' : 'Teller / Counter'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Display */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter Staff PIN Code
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

            {/* Quick Demo Hint */}
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>{selectedUser?.name}: PIN is <span className="font-mono text-emerald-400 font-semibold">{selectedUser?.pin}</span></span>
              <span>Protected Session</span>
            </div>
          </div>

          {/* Touch Number Pad for Teller Touchscreen */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
              <button
                key={btn}
                type="button"
                id={`pin-btn-${btn === '⌫' ? 'back' : btn}`}
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

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center space-x-2 text-rose-300 text-xs animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
      </div>
    </div>
  );
}
