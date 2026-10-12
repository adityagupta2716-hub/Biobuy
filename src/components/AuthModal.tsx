import React, { useState } from 'react';
import {
  LogIn,
  X,
  Lock,
  FlaskConical,
  AlertCircle,
  Users,
  PlusCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tab = 'signin' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, registerTeam } = useBioBuy();

  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [errorMsg, setErrorMsg] = useState('');

  // Sign-in form state
  const [signInTeam, setSignInTeam] = useState('');
  const [signInPass, setSignInPass] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Register form state
  const [regTeam, setRegTeam] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSignInTeam('');
    setSignInPass('');
    setRegTeam('');
    setRegPass('');
    setRegConfirmPass('');
    onClose();
  };

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    handleClose();
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  // --- Manual sign-in ---
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signInTeam.trim()) {
      setErrorMsg('Please enter your team name or "Admin".');
      return;
    }
    const res = login(signInTeam.trim(), signInPass);
    if (res.success) handleSuccess();
    else setErrorMsg(res.message);
  };

  // --- Register new team ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regTeam.trim()) {
      setErrorMsg('Team name is required.');
      return;
    }
    if (!regPass.trim()) {
      setErrorMsg('Password is required.');
      return;
    }
    if (regPass.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    const res = registerTeam(regTeam.trim(), regPass.trim());
    if (res.success) handleSuccess();
    else setErrorMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              BioBuy Portal
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeTab === 'register' ? 'Create Your Team' : 'Sign In'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {activeTab === 'register'
              ? 'Register a new team and receive a ₹10,000 virtual budget instantly.'
              : 'Enter your team name and password to access the marketplace.'}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Team
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* Error banner */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Sign In ── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={signInTeam}
                    onChange={e => setSignInTeam(e.target.value)}
                    placeholder='Enter your registered team name'
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showSignInPass ? 'text' : 'password'}
                    value={signInPass}
                    onChange={e => setSignInPass(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPass(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                New team?{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-teal-600 font-bold hover:underline">
                  Create your team →
                </button>
              </p>
            </form>
          )}

          {/* ── Create Team ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-teal-800 text-[11px] leading-relaxed">
                  Every new team starts with a <strong>₹10,000 virtual budget</strong> and immediate access to the full product marketplace.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={regTeam}
                    onChange={e => setRegTeam(e.target.value)}
                    placeholder='e.g. "Quantum Biology" or "Lab 7"'
                    maxLength={50}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Must be unique (2–50 characters).</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="Choose a password (min 4 characters)"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    value={regConfirmPass}
                    onChange={e => setRegConfirmPass(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Create Team & Start Shopping
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Already registered?{' '}
                <button type="button" onClick={() => switchTab('signin')} className="text-sky-600 font-bold hover:underline">
                  Sign in here →
                </button>
              </p>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Roles are securely verified and cannot be chosen from the client.
          </div>
        </div>
      </div>
    </div>
  );
};
