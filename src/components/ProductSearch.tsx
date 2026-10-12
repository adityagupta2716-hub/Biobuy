import React from 'react';
import { Search, X, ArrowUpDown, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { SortOption } from '../types';
import { useBioBuy } from '../context/BioBuyContext';

interface ProductSearchProps {
  totalResults: number;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ totalResults }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedSort,
    setSelectedSort,
    selectedAvailability,
    setSelectedAvailability,
    selectedCategory,
    setSelectedCategory,
  } = useBioBuy();

  const isFiltered = searchQuery !== '' || selectedCategory !== 'All' || selectedAvailability !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAvailability('all');
    setSelectedSort('name-asc');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      
      {/* Search Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Search Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, catalog #, manufacturer, reagents..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider pl-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          >
            <option value="name-asc">Name: A to Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="availability-desc">Availability (Highest Stock)</option>
          </select>
        </div>

      </div>

      {/* Sub-Filters: Availability Pills + Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        
        {/* Availability Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Stock:</span>
          
          <button
            onClick={() => setSelectedAvailability('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedAvailability === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stock
          </button>

          <button
            onClick={() => setSelectedAvailability('in_stock')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedAvailability === 'in_stock'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            In Stock
          </button>

          <button
            onClick={() => setSelectedAvailability('low_stock')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedAvailability === 'low_stock'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Low Stock (≤ 5)
          </button>

          <button
            onClick={() => setSelectedAvailability('out_of_stock')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedAvailability === 'out_of_stock'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Out of Stock
          </button>
        </div>

        {/* Results Counter & Reset Filter CTA */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium text-xs">
            Showing <strong className="text-slate-800">{totalResults}</strong> product{totalResults === 1 ? '' : 's'}
          </span>

          {isFiltered && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold text-xs ml-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
