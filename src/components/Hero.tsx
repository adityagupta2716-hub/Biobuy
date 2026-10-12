import React from 'react';
import { Sparkles, Dna, ArrowRight, Zap } from 'lucide-react';

interface HeroProps {
  onEnterMarketplace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnterMarketplace }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800">
      {/* Subtle scientific grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Content */}
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-700/60 text-sky-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Biotechnology Laboratory Procurement Platform
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Bio<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">Buy</span>
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-sky-100/90 mt-3 tracking-tight">
            “Your Research. Your Team. Your Budget.”
          </p>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
            Explore laboratory supplies, discover scientific equipment, and equip your research team with the resources you need.
          </p>

          {/* Enter Marketplace CTA */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Enter Marketplace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Compact Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-14 max-w-5xl mx-auto">
          
          {/* Feature 1 */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3.5">
              <Dna className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Scientific Products</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Discover research essentials — micropipettes, high-purity buffers, assay kits, and molecular consumables.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Smart Budgeting</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Make every credit count with real-time budget deductions and complete purchase audit records.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3.5">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Live Inventory</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              See availability across all teams in real time with atomic stock guarantees and zero overselling.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
