import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';

export const PurchaseToast: React.FC = () => {
  const { toast, hideToast } = useBioBuy();

  useEffect(() => {
    if (!toast?.visible) return;

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      hideToast();
    }, 6000);

    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast || !toast.visible) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`rounded-2xl border shadow-2xl p-4.5 text-slate-900 overflow-hidden relative ${
        isSuccess
          ? 'bg-white border-emerald-300 ring-2 ring-emerald-500/20'
          : isError
          ? 'bg-white border-rose-300 ring-2 ring-rose-500/20'
          : 'bg-white border-sky-300 ring-2 ring-sky-500/20'
      }`}>
        
        {/* Top colored accent bar */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${
          isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-sky-500'
        }`} />

        <div className="flex items-start gap-3">
          
          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            {isSuccess && (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {isError && (
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {toast.title}
            </h4>

            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
              {toast.message}
            </p>

            {/* Optional Purchase Details Chip */}
            {toast.details && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 bg-slate-50/80 p-2 rounded-xl text-[11px] space-y-1 font-mono text-slate-700">
                {toast.details.transactionId && (
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>TXN ID:</span>
                    <span className="font-bold text-slate-800">{toast.details.transactionId}</span>
                  </div>
                )}
                {toast.details.newBalance !== undefined && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>New Balance:</span>
                    <span className="font-bold font-sans">₹{toast.details.newBalance.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={hideToast}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
