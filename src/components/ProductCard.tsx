import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Building2, 
  FileText
} from 'lucide-react';
import { Product } from '../types';
import { useBioBuy } from '../context/BioBuyContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onOpenAuthModal: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onOpenAuthModal,
}) => {
  const { buyNow, isPurchasing, currentUser, isContestant, showCustomToast } = useBioBuy();
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const totalCost = product.price * quantity;
  const isBuying = Boolean(isPurchasing[product.id]);

  // Adjust quantity safely if stock drops below selected quantity in real time
  React.useEffect(() => {
    if (product.stock_quantity > 0 && quantity > product.stock_quantity) {
      setQuantity(product.stock_quantity);
    } else if (product.stock_quantity === 0) {
      setQuantity(1);
    }
  }, [product.stock_quantity, quantity]);

  const handleIncrement = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (!isContestant) {
      showCustomToast('error', 'Role Restriction', 'Administrators oversee the catalog and cannot make contestant purchases.');
      return;
    }
    const res = await buyNow(product.id, quantity);
    if (res.success) {
      setQuantity(1);
    }
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mb-1" />
            <span className="text-[11px] font-semibold">{product.category}</span>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border border-slate-700/60 shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">
              <XCircle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-3 h-3" />
              {product.stock_quantity} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              {product.stock_quantity} in stock
            </span>
          )}
        </div>

        {/* Catalog Number Badge */}
        <div className="absolute bottom-2 left-3 text-[10px] text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded font-mono font-medium shadow-2xs">
          Cat: {product.catalog_number}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Title, Brand, Description */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
            <Building2 className="w-3 h-3 text-sky-600" />
            <span className="truncate">{product.manufacturer}</span>
          </div>

          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors cursor-pointer line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Key Spec Snippet */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                <span key={key} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {key}: {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Unit Info */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Unit Price
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {product.unit_of_sale}
                </span>
              </div>
            </div>

            {product.pack_size && (
              <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                {product.pack_size}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Buy Control Box */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
          
          {/* Quantity Selector + Calculated Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Qty:</span>
              
              <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span className="w-8 text-center text-xs font-bold text-slate-800 select-none">
                  {isOutOfStock ? 0 : quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock_quantity || isOutOfStock}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Live Informational Total */}
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {formatCurrency(totalCost)}
              </span>
            </div>
          </div>

          {/* Instant BUY NOW Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuying}
              className={`flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isBuying
                  ? 'bg-blue-800 text-white cursor-wait opacity-80'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {isBuying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </>
              )}
            </button>

            {/* Quick Details Trigger */}
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              title="View full product specifications"
              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
