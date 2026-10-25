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
  Mail,
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
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSignInTeam('');
    setSignInPass('');
    setRegTeam('');
    setRegEmail('');
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
      setErrorMsg('Please enter your team name, email, or "Admin".');
      return;
    }
    const res = login(signInTeam.trim(), signInPass);
    if (res.success) handleSuccess();
    else setErrorMsg(res.message);
  };

  // --- Register new team ---
  const handleRegister = async (e: React.FormEvent) => {
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
    const res = await registerTeam(regTeam.trim(), regPass.trim(), regEmail.trim() || undefined);
    if (res.success) handleSuccess();
    else setErrorMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden text-slate-100">

        {/* Header */}
        <div className="bg-slate-950 p-6 text-white border-b border-slate-800 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              BioBuy Portal
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeTab === 'register' ? 'Create Your Team' : 'Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {activeTab === 'register'
              ? 'Register a new team and receive a ₹10,000 virtual budget instantly.'
              : 'Enter your team name and password to access the marketplace.'}
          </p>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Team
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* Error banner */}
          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Sign In ── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={signInTeam}
                    onChange={e => setSignInTeam(e.target.value)}
                    placeholder='Enter your registered team name'
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showSignInPass ? 'text' : 'password'}
                    value={signInPass}
                    onChange={e => setSignInPass(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPass(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                New team?{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-blue-400 font-bold hover:underline">
                  Create your team →
                </button>
              </p>
            </form>
          )}

          {/* ── Create Team ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every new team starts with a <strong className="text-white">₹10,000 virtual budget</strong> and immediate access to the full product marketplace.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={regTeam}
                    onChange={e => setRegTeam(e.target.value)}
                    placeholder='e.g. "Quantum Biology" or "Lab 7"'
                    maxLength={50}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Must be unique (2–50 characters).</p>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[10px] text-slate-500 font-normal lowercase">(optional for Supabase Auth)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder='e.g. team@institution.org'
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">If empty, automatically generates a team ID email.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="Choose a password (min 4 characters)"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    value={regConfirmPass}
                    onChange={e => setRegConfirmPass(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-medium text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Create Team & Start Shopping
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Already registered?{' '}
                <button type="button" onClick={() => switchTab('signin')} className="text-blue-400 font-bold hover:underline">
                  Sign in here →
                </button>
              </p>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Roles are securely verified and cannot be chosen from the client.
          </div>
        </div>
      </div>
    </div>
  );
};
