import React from 'react';
import { Sparkles, Dna, ArrowRight, Zap } from 'lucide-react';

interface HeroProps {
  onEnterMarketplace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnterMarketplace }) => {
  return (
    <section className="bg-slate-950 text-slate-100 pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Content */}
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Biotechnology Laboratory Procurement Platform
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            BioBuy
          </h1>

          <p className="text-lg sm:text-2xl font-semibold text-slate-300 mt-2 tracking-tight">
            “Your Research. Your Team. Your Budget.”
          </p>

          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed max-w-2xl mx-auto">
            Explore certified laboratory supplies, discover scientific equipment, and equip your research team with precision virtual allocations.
          </p>

          {/* Enter Marketplace CTA */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Enter Marketplace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Compact Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 sm:mt-14 max-w-5xl mx-auto">
          
          {/* Feature 1 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-950/70 border border-blue-800/50 text-blue-400 flex items-center justify-center mb-3">
              <Dna className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Scientific Products</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Research essentials — precision micropipettes, high-purity buffers, assay kits, and molecular consumables.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-300 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Smart Budgeting</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Track virtual credits in real-time with instant deductions and a complete transactional audit history.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Live Inventory</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Shared cloud inventory updated atomically across teams with zero overselling.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
