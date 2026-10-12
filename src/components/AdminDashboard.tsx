import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Users, 
  Wallet, 
  Search, 
  RotateCcw,
  X,
  Eye,
  EyeOff,
  Layers,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';
import { Product, ProductCategory, Team } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    teams,
    allPurchases,
    updateProduct,
    addProduct,
    deleteProduct,
    adjustTeamBudget,
    createTeam,
    resetDemoData,
    isAdmin,
    currentUser,
    logout,
  } = useBioBuy();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'categories' | 'teams' | 'ledger' | 'lowstock'>('inventory');
  const [adminSearch, setAdminSearch] = useState('');
  
  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [budgetModalTeam, setBudgetModalTeam] = useState<Team | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(10000);
  const [budgetReason, setBudgetReason] = useState<string>('Grant Allocation Boost');

  // New Team Modal
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamBudget, setNewTeamBudget] = useState(10000);

  // Form state for adding product
  const [newProdData, setNewProdData] = useState({
    name: '',
    description: '',
    category: 'Laboratory Equipment' as ProductCategory,
    subcategory: '',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    manufacturer: 'ApexBio Instruments',
    catalog_number: '',
    price: 3500,
    unit_of_sale: 'Kit',
    pack_size: '1 Unit',
    storage_information: 'Room Temperature (15–25°C)',
    compatibility_information: 'Standard universal laboratory fit',
    stock_quantity: 10,
    active: true,
  });

  // STRICT ROUTE GUARD: Deny contestants and unauthenticated callers
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Access Denied: Administrator Only
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          The administrator control console is strictly restricted to authenticated administrators. Contestants can only browse and purchase supplies using their team's virtual budget.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const lowStockProducts = products.filter(p => p.stock_quantity <= 5);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  // Calculations for Admin Overview
  const _totalTurnover = allPurchases.reduce((acc, p) => acc + p.total_amount, 0); void _totalTurnover;
  const totalTeamAllocations = teams.reduce((acc, t) => acc + t.initial_budget, 0);
  const totalTeamRemainingBalances = teams.reduce((acc, t) => acc + t.remaining_balance, 0);
  const totalSpendingAcrossTeams = Math.max(0, totalTeamAllocations - totalTeamRemainingBalances);

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.catalog_number.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(adminSearch.toLowerCase()) ||
    p.manufacturer.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const categoriesList: ProductCategory[] = [
    'Laboratory Equipment',
    'Reagents and Raw Materials',
    'Assay Kits',
    'Molecular Biology',
    'Cell Culture',
    'Laboratory Consumables',
    'Analytical and Testing Equipment'
  ];

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdData.name.trim() || !newProdData.catalog_number.trim()) return;

    addProduct({
      ...newProdData,
      catalog_number: newProdData.catalog_number.trim().toUpperCase(),
    });

    setIsAddModalOpen(false);
    setNewProdData({
      name: '',
      description: '',
      category: 'Laboratory Equipment',
      subcategory: '',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      manufacturer: 'ApexBio Instruments',
      catalog_number: '',
      price: 3500,
      unit_of_sale: 'Kit',
      pack_size: '1 Unit',
      storage_information: 'Room Temperature (15–25°C)',
      compatibility_information: 'Standard universal laboratory fit',
      stock_quantity: 10,
      active: true,
    });
  };

  const handleAdjustBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetModalTeam) return;
    adjustTeamBudget(budgetModalTeam.id, Number(newBudgetAmount), budgetReason);
    setBudgetModalTeam(null);
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    createTeam(newTeamName.trim(), Number(newTeamBudget));
    setIsNewTeamModalOpen(false);
    setNewTeamName('');
    setNewTeamBudget(10000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            BioBuy Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{currentUser?.user_name}</strong>. Manage biotechnology catalog, inventory, teams, budgets, and audit records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>

          <button
            onClick={() => setIsNewTeamModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Users className="w-4 h-4" />
            Register Team
          </button>

          <button
            onClick={resetDemoData}
            title="Reset demo catalog and initial budgets"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</span>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{products.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{products.filter(p => p.active).length} active items</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Teams</span>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{teams.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Contestant teams</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spending</span>
          <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">{formatCurrency(totalSpendingAcrossTeams)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all teams</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Balances</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalTeamRemainingBalances)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Unspent team credits</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {lowStockProducts.length} <span className="text-xs text-rose-400 font-bold">({outOfStockProducts.length} out)</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Units ≤ 5 in lab</p>
        </div>

      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Inventory & Products ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Product Categories ({categoriesList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('teams')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'teams'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Teams & Budgets ({teams.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'ledger'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Purchases ({allPurchases.length})
        </button>

        <button
          onClick={() => setActiveSubTab('lowstock')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'lowstock'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Low Stock Alerts ({lowStockProducts.length})
        </button>
      </div>

      {/* SUB-TAB 1: Manage Inventory & Products (with Add, Edit, Delete) */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search products by title, catalog #, brand, category..."
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden"
              />
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5">Visibility</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{prod.name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Cat #{prod.catalog_number} • {prod.manufacturer}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {prod.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(prod.price)} <span className="text-[10px] text-slate-400 font-normal">/{prod.unit_of_sale}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-black text-xs px-2.5 py-1 rounded-md ${
                          prod.stock_quantity === 0
                            ? 'bg-rose-100 text-rose-800'
                            : prod.stock_quantity <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.stock_quantity} units
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => updateProduct({ id: prod.id, active: !prod.active })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            prod.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {prod.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {prod.active ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: Manage Categories */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map(cat => {
              const count = products.filter(p => p.category === cat).length;
              const totalStock = products.filter(p => p.category === cat).reduce((acc, p) => acc + p.stock_quantity, 0);

              return (
                <div key={cat} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Category
                    </span>
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{cat}</h3>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Products in Catalog:</span>
                      <strong className="text-slate-800">{count} items</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Units in Stock:</span>
                      <strong className="text-slate-800">{totalStock} units</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setAdminSearch(cat);
                      setActiveSubTab('inventory');
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center"
                  >
                    View Products in {cat.split(' ')[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Manage Teams & Budgets */}
      {activeSubTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Contestant Teams</h3>
              <p className="text-xs text-slate-500">Contestants can purchase only using their assigned team's credits.</p>
            </div>
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Register New Team
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const spent = Math.max(0, team.initial_budget - team.remaining_balance);
              const percentUsed = Math.min(100, Math.round((spent / team.initial_budget) * 100));

              return (
                <div key={team.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contestant Team</span>
                      <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                    </div>
                    <Users className="w-5 h-5 text-sky-600" />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Initial Allocation:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(team.initial_budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spent to Date:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(spent)} ({percentUsed}%)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-700 font-bold">
                      <span>Remaining Balance:</span>
                      <span className="text-sm">{formatCurrency(team.remaining_balance)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBudgetModalTeam(team);
                      setNewBudgetAmount(team.remaining_balance + 5000);
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Adjust Team Budget
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: View All Purchases */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Global Purchase Audit Ledger</h3>
              <p className="text-xs text-slate-500">Audit trail of all purchases executed across all contestant teams.</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {allPurchases.length} Total Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Team</th>
                  <th className="px-4 py-3.5">Product Snapshot</th>
                  <th className="px-4 py-3.5 text-center">Qty</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5">Total Deducted</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {allPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No purchases have been executed yet by contestant teams.
                    </td>
                  </tr>
                ) : (
                  allPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{p.team_name || 'Lab Team'}</td>
                      <td className="px-4 py-3 font-semibold">{p.product_name_snapshot}</td>
                      <td className="px-4 py-3 text-center font-bold">{p.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(p.unit_price_snapshot)}</td>
                      <td className="px-4 py-3 font-black text-emerald-700">{formatCurrency(p.total_amount)}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-600 whitespace-nowrap">{p.transaction_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Low Stock Alerts */}
      {activeSubTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Low Stock Notice:</strong> The following items have 5 or fewer units remaining across all research teams. Replenish stock to avoid lab work disruption.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Stock Left</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {p.name}
                      <span className="block text-[10px] text-slate-400 font-normal">Cat #{p.catalog_number}</span>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-black text-amber-600">{p.stock_quantity} units</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => updateProduct({ id: p.id, stock_quantity: p.stock_quantity + 20 })}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        +20 Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Edit Product: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Unit of Sale</label>
                <input
                  type="text"
                  value={editingProduct.unit_of_sale}
                  onChange={(e) => setEditingProduct({ ...editingProduct, unit_of_sale: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
                <p className="text-xs text-slate-500">Catalog Removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{deletingProduct.name}</strong> (Cat #{deletingProduct.catalog_number}) from the BioBuy catalog? This item will no longer be available for contestant procurement.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md text-xs"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Biotechnology Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. TaqPolymerase High Fidelity 500U"
                  value={newProdData.name}
                  onChange={(e) => setNewProdData({ ...newProdData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newProdData.category}
                    onChange={(e) => setNewProdData({ ...newProdData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Catalog #</label>
                  <input
                    type="text"
                    placeholder="e.g. BT-TAQ-500"
                    value={newProdData.catalog_number}
                    onChange={(e) => setNewProdData({ ...newProdData, catalog_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newProdData.price}
                    onChange={(e) => setNewProdData({ ...newProdData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProdData.stock_quantity}
                    onChange={(e) => setNewProdData({ ...newProdData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Unit of Sale</label>
                  <input
                    type="text"
                    placeholder="e.g. Kit / Box"
                    value={newProdData.unit_of_sale}
                    onChange={(e) => setNewProdData({ ...newProdData, unit_of_sale: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={newProdData.manufacturer}
                  onChange={(e) => setNewProdData({ ...newProdData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProdData.description}
                  onChange={(e) => setNewProdData({ ...newProdData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="Technical description of research reagent / equipment"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Adjust Team Budget Modal */}
      {budgetModalTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Adjust Team Budget</h3>
              <button onClick={() => setBudgetModalTeam(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBudgetSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Adjusting balance for: <strong>{budgetModalTeam.name}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">New Balance Amount (₹)</label>
                <input
                  type="number"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-emerald-700"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Reason / Grant Ref</label>
                <input
                  type="text"
                  value={budgetReason}
                  onChange={(e) => setBudgetReason(e.target.value)}
                  placeholder="e.g. Additional Research Grant Phase 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalTeam(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Budget Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Register New Team Modal */}
      {isNewTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Register Contestant Team</h3>
              <button onClick={() => setIsNewTeamModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Team Delta (Synthetic Biology)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Virtual Budget (₹)</label>
                <input
                  type="number"
                  value={newTeamBudget}
                  onChange={(e) => setNewTeamBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  min="1000"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
