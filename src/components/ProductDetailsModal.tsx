import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Thermometer, 
  Layers, 
  Building2, 
  FileText, 
  Plus, 
  Minus
} from 'lucide-react';
import { Product } from '../types';
import { useBioBuy } from '../context/BioBuyContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onOpenAuthModal,
}) => {
  const { buyNow, isPurchasing, currentUser, isContestant, showCustomToast } = useBioBuy();
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const totalCost = product.price * quantity;
  const isBuying = Boolean(isPurchasing[product.id]);

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

  const handlePurchase = async () => {
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
      onClose();
    }
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Cat #{product.catalog_number}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Section: Image & Key Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            
            {/* Image Box */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {imgError ? (
                <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                  <FileText className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-xs font-semibold">Biotech Scientific Product</span>
                </div>
              ) : (
                <img
                  src={product.image_url}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Stock Status Badge */}
              <div className="absolute top-3 left-3">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
                    <XCircle className="w-3.5 h-3.5" />
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Only {product.stock_quantity} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {product.stock_quantity} Available
                  </span>
                )}
              </div>
            </div>

            {/* Product Meta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{product.manufacturer}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Unit Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {product.unit_of_sale} {product.pack_size ? `(${product.pack_size})` : ''}
                  </span>
                </div>
              </div>

              {/* Storage condition card */}
              {product.storage_information && (
                <div className="bg-sky-50/80 border border-sky-100 p-2.5 rounded-xl flex items-start gap-2 text-xs text-sky-900">
                  <Thermometer className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Storage:</strong> {product.storage_information}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Detailed Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                Technical Specifications
              </h3>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 p-2.5 text-xs">
                    <span className="font-semibold text-slate-600">{key}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility Information */}
          {product.compatibility_information && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs text-slate-700">
              <strong className="font-bold text-slate-900 block mb-1">Laboratory Compatibility:</strong>
              {product.compatibility_information}
            </div>
          )}

          {/* Purchase Action Box */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quantity</span>
                <div className="flex items-center gap-2 mt-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-10 text-center font-black text-sm text-white">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock_quantity || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Deducted</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  {formatCurrency(totalCost)}
                </span>
                <span className="text-[10px] text-slate-400 block">From Team Virtual Budget</span>
              </div>
            </div>

            {/* Instant Buy Button */}
            <button
              onClick={handlePurchase}
              disabled={isOutOfStock || isBuying}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isBuying
                  ? 'bg-sky-700 text-white cursor-wait opacity-80'
                  : 'bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white shadow-sky-500/25 hover:scale-[1.01]'
              }`}
            >
              {isBuying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deducting Budget & Confirming Purchase...</span>
                </>
              ) : isOutOfStock ? (
                <span>Item Out of Stock</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>BUY NOW — {formatCurrency(totalCost)}</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
