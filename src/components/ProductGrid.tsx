import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { SearchX, RotateCcw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onViewDetails: (product: Product) => void;
  onOpenAuthModal: () => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onViewDetails,
  onOpenAuthModal,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
            <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-full" />
              <div className="h-3 bg-slate-200 rounded-md w-2/3" />
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <div className="h-6 bg-slate-200 rounded-md w-24" />
              <div className="h-6 bg-slate-200 rounded-md w-16" />
            </div>
            <div className="h-10 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
          <SearchX className="w-8 h-8" />
        </div>
        
        <h3 className="text-lg font-bold text-slate-900">No Products Matched</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          We couldn't find any biotechnology reagents, kits, or laboratory equipment matching your active filters or search terms.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
          onOpenAuthModal={onOpenAuthModal}
        />
      ))}
    </div>
  );
};
