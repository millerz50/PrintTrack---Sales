import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  KeyRound,
  X,
  Check,
  Lock,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: User;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onUserChanged
}) => {
  if (!isOpen) return null;

  const users = storage.getUsers();
  const [selectedUser, setSelectedUser] = useState<User>(activeUser);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (pinInput !== selectedUser.pin) {
      setErrorMsg('Incorrect PIN. Please check the PIN and try again.');
      return;
    }

    storage.setActiveUser(selectedUser);
    onUserChanged(selectedUser);
    onClose();
  };

  const handleQuickSwitch = (user: User) => {
    setSelectedUser(user);
    storage.setActiveUser(user);
    onUserChanged(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Account Authentication & Role Switcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Role Selection Cards */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select User Account:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {users.map(user => {
              const isCurrent = user.id === activeUser.id;
              const isSelected = user.id === selectedUser.id;

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{user.avatar || '👤'}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {user.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                        {user.role === 'admin' ? (
                          <Shield className="w-3 h-3 text-amber-500 inline" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-blue-500 inline" />
                        )}
                        Role: {user.role} ({user.role === 'admin' ? 'Full Access + Costs' : 'POS Sales & Receipts'})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      PIN: {user.pin}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleLogin} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter 4-Digit Security PIN for {selectedUser.name}:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={`PIN (Default: ${selectedUser.pin})`}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-widest font-mono"
              />
            </div>
            {errorMsg && (
              <p className="text-xs font-medium text-rose-600 mt-1">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch(selectedUser)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              1-Click Demo Login
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Verify & Switch
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
