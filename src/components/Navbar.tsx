import React, { useState } from 'react';
import { 
  FlaskConical, 
  ShoppingBag, 
  History, 
  ShieldCheck, 
  Users, 
  Wallet, 
  LogOut, 
  Menu, 
  X,
  Layers,
  LogIn
} from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';

interface NavbarProps {
  activeTab: 'marketplace' | 'categories' | 'history' | 'admin';
  setActiveTab: (tab: 'marketplace' | 'categories' | 'history' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const { currentTeam, currentUser, isAdmin, isContestant, logout } = useBioBuy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const remainingBalance = currentTeam?.remaining_balance ?? 10000;
  const isLowBalance = remainingBalance < 2000;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg shadow-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveTab(isAdmin ? 'admin' : 'marketplace')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  BioBuy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {isAdmin ? 'Admin Portal' : 'Procurement'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
                Laboratory Supplies & Equipment
              </p>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            
            {/* If Admin: Show Admin Dashboard & Marketplace Preview */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'marketplace'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace View
                </button>
              </>
            )}

            {/* If Contestant or Guest: STRICTLY SHOPPING ONLY */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'marketplace'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'categories'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Categories
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'history'
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Purchase History
                </button>
              </>
            )}

          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* 1. CONTESTANT LOGGED IN: Show assigned team & remaining budget */}
            {isContestant && currentTeam && (
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 py-1.5 px-3.5 rounded-xl shadow-inner">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    Team
                  </span>
                  <span className="text-xs font-bold text-slate-100 max-w-[150px] truncate" title={currentTeam.name}>
                    {currentTeam.name}
                  </span>
                </div>

                <div className="h-7 w-px bg-slate-800" />

                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-end gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    Budget Left
                  </span>
                  <span className={`text-xs font-extrabold ${isLowBalance ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* 2. ADMIN LOGGED IN: Show Administrator Badge */}
            {isAdmin && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/80 border border-indigo-800/80 rounded-xl text-xs font-bold text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin: {currentUser?.user_name.split(' ')[0] || 'Administrator'}</span>
              </div>
            )}

            {/* 3. NOT LOGGED IN: Sign In button */}
            {!currentUser && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Logout button */}
            {currentUser && (
              <button
                onClick={logout}
                title="Sign out of BioBuy"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isContestant && currentTeam && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-bold text-emerald-400">
                <Wallet className="w-3 h-3" />
                {formatCurrency(remainingBalance)}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          
          {currentUser ? (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {isAdmin ? 'System Administrator' : 'Assigned Team'}
                </p>
                <p className="text-sm font-bold text-white">
                  {isAdmin ? currentUser.user_name : currentTeam?.name}
                </p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
              {isContestant && (
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Balance</p>
                  <p className="text-sm font-extrabold text-emerald-400">{formatCurrency(remainingBalance)}</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-xs text-center shadow-lg"
            >
              Sign In to Account
            </button>
          )}

          {/* Navigation Links based on role */}
          <div className="space-y-1">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Dashboard
                </button>

                <button
                  onClick={() => {
                    setActiveTab('marketplace');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'marketplace' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace View
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('marketplace');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'marketplace' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>

                <button
                  onClick={() => {
                    setActiveTab('categories');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'categories' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Categories
                </button>

                <button
                  onClick={() => {
                    setActiveTab('history');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeTab === 'history' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Purchase History
                </button>
              </>
            )}
          </div>

          {currentUser && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-950/30 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
};
