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
  Globe
} from 'lucide-react';
import { User } from '@/types';
import { storage, CompanyInfo } from '@/services/storage';
import { MagenLogo } from '@/components/MagenLogo';

interface StaffLockScreenProps {
  company: CompanyInfo;
  onUnlock: (user: User) => void;
  onBackToWebsite: () => void;
}

export function StaffLockScreen({
  company,
  onUnlock,
  onBackToWebsite
}: StaffLockScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const list = storage.getUsers();
    setUsers(list);
    const active = storage.getActiveUser();
    if (active && list.some(u => u.id === active.id)) {
      setSelectedUser(active);
    } else if (list.length > 0) {
      setSelectedUser(list[0]);
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
        setError('Incorrect PIN. Please re-enter.');
        setPin('');
      }
    } catch {
      setError('Authentication failure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard support for typing PIN directly
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
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
  }, [pin, selectedUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar: Return to Website */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800/60 border border-slate-800"
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
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

          {/* User Selector Tabs */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
              Select Staff Member:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setError('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl shrink-0">{u.avatar || '🧑‍💼'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
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

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
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

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted POS Backoffice Session &bull; Mount Darwin Terminal</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} {company.name || 'Magen Integrated Business Solutions'}</span>
        <button
          type="button"
          onClick={onBackToWebsite}
          className="text-emerald-400 hover:underline flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Switch to Public Marketing Website</span>
        </button>
      </div>
    </div>
  );
}
