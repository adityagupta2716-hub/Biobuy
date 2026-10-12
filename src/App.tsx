import React, { useState, useMemo, useEffect } from 'react';
import { useBioBuy, BioBuyProvider } from './context/BioBuyContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BudgetSummary } from './components/BudgetSummary';
import { CategoryFilters } from './components/CategoryFilters';
import { ProductSearch } from './components/ProductSearch';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { PurchaseToast } from './components/PurchaseToast';
import { PurchaseHistory } from './components/PurchaseHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Product } from './types';
import { 
  FlaskConical, 
  LogIn,
  ShieldCheck
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    products,
    isLoading,
    searchQuery,
    selectedCategory,
    selectedSort,
    selectedAvailability,
    currentTeam,
    currentUser,
    isAdmin,
    isContestant,
    showCustomToast,
    setSearchQuery,
    setSelectedCategory,
    setSelectedSort,
    setSelectedAvailability,
  } = useBioBuy();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'categories' | 'history' | 'admin'>('marketplace');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Automatically direct admin to admin dashboard upon login
  useEffect(() => {
    if (isAdmin && activeTab === 'marketplace') {
      setActiveTab('admin');
    } else if (isContestant && activeTab === 'admin') {
      setActiveTab('marketplace');
    }
  }, [isAdmin, isContestant]);

  // Tab route guard: Contestants or guests can NEVER access the admin tab
  const handleTabSwitch = (tab: 'marketplace' | 'categories' | 'history' | 'admin') => {
    if (tab === 'admin' && !isAdmin) {
      showCustomToast('error', 'Access Denied', 'The Administrator Dashboard is restricted to authenticated administrators.');
      setActiveTab('marketplace');
      return;
    }
    setActiveTab(tab);
  };

  // Filter and Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Active status for non-admin viewers
    if (!isAdmin) {
      result = result.filter(p => p.active);
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.catalog_number.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.storage_information && p.storage_information.toLowerCase().includes(q))
      );
    }

    // Filter by Stock Availability
    if (selectedAvailability === 'in_stock') {
      result = result.filter(p => p.stock_quantity > 0);
    } else if (selectedAvailability === 'low_stock') {
      result = result.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
    } else if (selectedAvailability === 'out_of_stock') {
      result = result.filter(p => p.stock_quantity === 0);
    }

    // Sort
    if (selectedSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === 'availability-desc') {
      result.sort((a, b) => b.stock_quantity - a.stock_quantity);
    }

    return result;
  }, [products, selectedCategory, searchQuery, selectedAvailability, selectedSort, isAdmin]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAvailability('all');
    setSelectedSort('name-asc');
  };

  const handleEnterMarketplace = () => {
    setActiveTab('marketplace');
    const el = document.getElementById('marketplace-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Top Navigation with Strict Role Visibility */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Global Purchase Toast Notification */}
      <PurchaseToast />

      {/* Team Budget Summary Banner: STRICTLY for Contestants */}
      {isContestant && <BudgetSummary />}

      {/* Main Page Routing Views */}
      <main className="flex-1 bg-slate-950">
        
        {/* VIEW 1: Marketplace / Catalog */}
        {activeTab === 'marketplace' && (
          <div>
            {/* Hero Section */}
            <Hero onEnterMarketplace={handleEnterMarketplace} />

            {/* Marketplace Explorer Section */}
            <section id="marketplace-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
              
              {/* Heading & Subtitle */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
                    <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
                    Biotechnology Raw Materials & Equipment
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Explore Biotechnology Products
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Research essentials, laboratory equipment, assay kits, and scientific consumables.
                  </p>
                </div>

                {!currentUser && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-xs rounded-xl shadow-md self-start md:self-auto hover:scale-[1.02] transition-transform"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In with Contestant Account
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md self-start md:self-auto hover:scale-[1.02] transition-transform"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Return to Admin Dashboard
                  </button>
                )}
              </div>

              {/* Category Pills Navigation */}
              <CategoryFilters />

              {/* Search, Sorting & Availability Toolbar */}
              <ProductSearch totalResults={filteredAndSortedProducts.length} />

              {/* Product Grid Cards (Strictly Shopping View) */}
              <ProductGrid
                products={filteredAndSortedProducts}
                isLoading={isLoading}
                onViewDetails={(prod) => setSelectedProductDetails(prod)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onResetFilters={handleResetFilters}
              />

            </section>
          </div>
        )}

        {/* VIEW 2: Category Browser View */}
        {activeTab === 'categories' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Product Categories
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Browse our complete specialized biotechnology catalog by scientific domain.
              </p>
            </div>

            <CategoryFilters onCategorySelect={() => setActiveTab('marketplace')} />

            <div className="pt-4">
              <ProductGrid
                products={filteredAndSortedProducts}
                isLoading={isLoading}
                onViewDetails={(prod) => setSelectedProductDetails(prod)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onResetFilters={handleResetFilters}
              />
            </div>
          </section>
        )}

        {/* VIEW 3: Team Purchase History View (Contestant Team Only) */}
        {activeTab === 'history' && (
          <PurchaseHistory />
        )}

        {/* VIEW 4: Admin Dashboard View (Strictly for Authenticated Administrators) */}
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* Global Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        onOpenAuthModal={() => {
          setSelectedProductDetails(null);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Secure Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            
            {/* Brand Col */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Bio<span className="text-sky-400">Buy</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                “Equip Your Lab. Empower Your Research.”
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
                Biotechnology laboratory procurement platform with strict role-based access control separating research contestants from laboratory administrators.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Navigation</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => handleTabSwitch('marketplace')} className="hover:text-sky-400 transition-colors">Marketplace</button></li>
                <li><button onClick={() => handleTabSwitch('categories')} className="hover:text-sky-400 transition-colors">Categories</button></li>
                {isContestant && (
                  <li><button onClick={() => handleTabSwitch('history')} className="hover:text-sky-400 transition-colors">Team Purchase History</button></li>
                )}
                {isAdmin && (
                  <li><button onClick={() => handleTabSwitch('admin')} className="text-amber-400 font-bold hover:underline">Admin Console</button></li>
                )}
              </ul>
            </div>

            {/* System Status & RBAC Indicator */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Security & RBAC</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Database-Enforced RBAC: Active</span>
                </div>
                <p className="text-slate-400 font-medium">
                  Active Role: <span className="text-white font-bold uppercase">{currentUser ? currentUser.role : 'Guest Viewer'}</span>
                </p>
                {isContestant && (
                  <p className="text-slate-400">Team: <span className="text-sky-300 font-bold">{currentTeam?.name}</span></p>
                )}
                <p className="text-slate-500 text-[10px] mt-1 italic">
                  *Permissions validated at application, store, and database levels.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} BioBuy Platform. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Role-Based Access Control Architecture
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <BioBuyProvider>
      <MainAppContent />
    </BioBuyProvider>
  );
}

export default App;
