import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  KeyRound,
  X,
  Check,
  Lock,
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: User;
  onUserChanged: (user: User) => void;
}

const AVATAR_OPTIONS = ['👑', '🧑‍💼', '👩‍🎨', '👨‍💻', '💼', '🖨️', '⚡', '🌟', '👤'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onUserChanged
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'signin' | 'manage'>('signin');
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [selectedUser, setSelectedUser] = useState<User>(activeUser || storage.getUsers()[0]);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // CRUD State
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('teller');
  const [formPin, setFormPin] = useState('');
  const [formAvatar, setFormAvatar] = useState('🧑‍💼');
  const [formEmail, setFormEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadUsers = () => {
    const updated = storage.getUsers();
    setUsers(updated);
    const found = updated.find(u => u.id === selectedUser?.id);
    if (found) setSelectedUser(found);
    else if (updated.length > 0) setSelectedUser(updated[0]);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pinInput.trim()) {
      setErrorMsg('Please enter your 4-digit PIN code.');
      return;
    }

    setIsLoading(true);
    try {
      const verified = await storage.authenticateUser(selectedUser.id, pinInput.trim());
      if (verified) {
        storage.setActiveUser(verified);
        onUserChanged(verified);
        onClose();
      } else {
        setErrorMsg('Incorrect PIN. Authentication failed.');
      }
    } catch {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCreateUser = () => {
    setEditingUserId(null);
    setFormName('');
    setFormRole('teller');
    setFormPin('');
    setFormAvatar('🧑‍💼');
    setFormEmail('');
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormRole(user.role);
    setFormPin('');
    setFormAvatar(user.avatar || '👤');
    setFormEmail((user as any).email || '');
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setErrorMsg('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('User name is required.');
      return;
    }

    if (!editingUserId && (!formPin.trim() || formPin.trim().length < 4)) {
      setErrorMsg('Security PIN must be at least 4 digits.');
      return;
    }

    if (editingUserId && formPin.trim() && formPin.trim().length < 4) {
      setErrorMsg('PIN must be at least 4 digits if changing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingUserId) {
        // Update user
        const updated = await storage.updateUser({
          id: editingUserId,
          name: formName.trim(),
          role: formRole,
          ...(formPin.trim() ? { pin: formPin.trim() } : {}),
          avatar: formAvatar,
          ...((formEmail.trim() ? { email: formEmail.trim() } : {}) as any)
        });
        if (activeUser?.id === editingUserId) {
          onUserChanged(updated);
        }
        setSuccessMsg(`Staff user "${updated.name}" updated successfully.`);
      } else {
        // Create user
        const created = await storage.createUser({
          name: formName.trim(),
          role: formRole,
          pin: formPin.trim(),
          avatar: formAvatar,
          email: formEmail.trim() || undefined
        });
        setSuccessMsg(`New staff user "${created.name}" created successfully.`);
      }
      setIsEditing(false);
      setEditingUserId(null);
      reloadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.role === 'admin') {
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        setErrorMsg('Cannot delete the sole Administrator account.');
        return;
      }
    }

    if (!window.confirm(`Are you sure you want to deactivate staff account "${user.name}"?`)) {
      return;
    }

    try {
      await storage.deleteUser(user.id);
      setSuccessMsg(`Staff account "${user.name}" deactivated.`);
      reloadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0C2D64] text-white flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Staff Authentication &amp; Terminal Switch
              </h3>
              <p className="text-[11px] text-slate-500">
                Authorized Workshop Access &bull; Encrypted Sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Switcher Tabs */}
        <div className="flex items-center space-x-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setIsEditing(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'signin'
                ? 'bg-[#0C2D64] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Switch Operator</span>
          </button>

          {activeUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('manage');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'manage'
                  ? 'bg-[#0C2D64] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Management</span>
            </button>
          )}
        </div>

        {/* Notification alerts */}
        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN / SWITCH USER */}
        {activeTab === 'signin' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Select Staff Account:
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {users.map(user => {
                  const isCurrent = user.id === activeUser?.id;
                  const isSelected = user.id === selectedUser?.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0C2D64] bg-blue-50/70 shadow-xs ring-1 ring-[#0C2D64]/20'
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
                                Active Now
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                            {user.role === 'admin' ? (
                              <Shield className="w-3 h-3 text-amber-500 inline" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-blue-500 inline" />
                            )}
                            Role: {user.role} ({user.role === 'admin' ? 'Full Admin Access' : 'POS Sales & Workshop Register'})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono">
                          PIN Protected
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIN Entry Form */}
            <form onSubmit={handleLogin} className="pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter PIN for {selectedUser?.name}:
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
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none tracking-widest font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !pinInput.trim()}
                  className="px-4 py-2 bg-[#0C2D64] hover:bg-[#081e44] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Verifying...' : 'Verify & Switch'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MANAGE STAFF USERS (CRUD) */}
        {activeTab === 'manage' && activeUser?.role === 'admin' && (
          <div className="mt-4 space-y-4">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registered Staff Accounts ({users.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={startCreateUser}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#388E3C] hover:bg-[#2e7d32] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add New Staff User</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{user.avatar || '👤'}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {user.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                user.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : user.role === 'manager'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role}
                            </span>
                            {user.id === activeUser?.id && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                            <span>PIN Protected</span>
                            {(user as any).email && <span>&bull; {(user as any).email}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => startEditUser(user)}
                          className="p-1.5 text-slate-500 hover:text-[#0C2D64] hover:bg-white rounded-lg transition"
                          title="Edit staff details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {user.id !== activeUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                            title="Deactivate staff user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Create / Edit Form */
              <form onSubmit={handleSaveUser} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>{editingUserId ? `Edit Staff Member` : 'Register New Staff Member'}</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Role:
                    </label>
                    <select
                      value={formRole}
                      onChange={e => setFormRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                    >
                      <option value="teller">Teller / Counter Desk</option>
                      <option value="manager">Operations Manager</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {editingUserId ? 'Reset PIN (Leave blank to keep):' : '4-Digit Security PIN:'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={formPin}
                      onChange={e => setFormPin(e.target.value)}
                      placeholder={editingUserId ? 'Keep existing' : 'e.g. 5432'}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email / ID (Optional):
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="tendai@magensolutions.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0C2D64] focus:outline-none"
                  />
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Avatar Badge:
                  </label>
                  <div className="flex items-center space-x-2">
                    {AVATAR_OPTIONS.map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setFormAvatar(av)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg border transition ${
                          formAvatar === av
                            ? 'bg-[#0C2D64] text-white border-[#0C2D64] shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[#0C2D64] hover:bg-[#081e44] text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    {isSubmitting ? 'Saving...' : editingUserId ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
