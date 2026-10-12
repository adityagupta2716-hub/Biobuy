import React, { useState } from 'react';
import { 
  History, 
  Wallet, 
  ShoppingBag, 
  Calendar, 
  Receipt, 
  Download, 
  Search, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';

export const PurchaseHistory: React.FC = () => {
  const { currentTeam, purchases } = useBioBuy();
  const [historySearch, setHistorySearch] = useState('');

  if (!currentTeam) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-200">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Please sign in with your Contestant account to view your assigned team's procurement history and ledger.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Metrics
  const totalPurchases = purchases.length;
  const totalUnits = purchases.reduce((acc, p) => acc + p.quantity, 0);
  const totalSpent = purchases.reduce((acc, p) => acc + p.total_amount, 0);
  const remainingBudget = currentTeam.remaining_balance ?? (10000 - totalSpent);

  // Filtered purchases
  const filteredPurchases = purchases.filter(p => 
    p.product_name_snapshot.toLowerCase().includes(historySearch.toLowerCase()) ||
    p.transaction_id.toLowerCase().includes(historySearch.toLowerCase())
  );

  const exportCSV = () => {
    if (purchases.length === 0) return;
    
    const headers = ['Transaction ID', 'Date & Time', 'Product Name', 'Unit Price (₹)', 'Unit of Sale', 'Quantity', 'Total Amount (₹)', 'Team'];
    const rows = purchases.map(p => [
      p.transaction_id,
      formatDate(p.created_at),
      `"${p.product_name_snapshot.replace(/"/g, '""')}"`,
      p.unit_price_snapshot,
      p.unit_of_sale_snapshot,
      p.quantity,
      p.total_amount,
      `"${currentTeam.name}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BioBuy_Procurement_${currentTeam.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            Audit Ledger & Historical Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Team Purchase History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction record for <strong className="text-white">{currentTeam.name}</strong>. Historical unit prices are permanently preserved.
          </p>
        </div>

        {purchases.length > 0 && (
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
        )}
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            {totalPurchases}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Orders executed</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Units Acquired</span>
            <ShoppingBag className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            {totalUnits}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Laboratory reagents & tools</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Virtual credits deducted</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Budget</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {formatCurrency(remainingBudget)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Available for procurement</p>
        </div>

      </div>

      {/* Search in History Bar */}
      {purchases.length > 0 && (
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search history by product name or transaction ID..."
            className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-200 placeholder:text-slate-500 focus:outline-hidden"
          />
          {historySearch && (
            <button
              onClick={() => setHistorySearch('')}
              className="text-xs text-slate-400 hover:text-white font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Transactions Table / List */}
      {purchases.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-10 text-center max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-800">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Purchases Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Your team hasn't purchased any items yet. Visit the Marketplace to explore reagents, kits, and lab equipment.
          </p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center text-slate-400 text-xs">
          No transactions match "{historySearch}".
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Product & Details</th>
                  <th className="px-4 py-3.5">Unit Price</th>
                  <th className="px-4 py-3.5 text-center">Qty</th>
                  <th className="px-4 py-3.5">Total Deducted</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Transaction ID</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-800/50 transition-colors">
                    
                    {/* Product Name & Snapshot */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {purchase.product_image_snapshot ? (
                          <img
                            src={purchase.product_image_snapshot}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-950 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            {purchase.product_name_snapshot}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            Sold as {purchase.unit_of_sale_snapshot}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Historical Unit Price Snapshot */}
                    <td className="px-4 py-3.5 font-semibold text-slate-300 whitespace-nowrap">
                      {formatCurrency(purchase.unit_price_snapshot)}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 font-bold text-slate-200">
                        {purchase.quantity}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {formatCurrency(purchase.total_amount)}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(purchase.created_at)}
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {purchase.transaction_id}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
