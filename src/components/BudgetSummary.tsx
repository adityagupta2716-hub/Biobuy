import React from 'react';
import { Wallet, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useBioBuy } from '../context/BioBuyContext';

export const BudgetSummary: React.FC = () => {
  const { currentTeam, isContestant } = useBioBuy();

  if (!isContestant || !currentTeam) return null;

  const initialBudget = currentTeam.initial_budget || 10000;
  const remainingBalance = currentTeam.remaining_balance ?? 10000;
  const amountSpent = Math.max(0, initialBudget - remainingBalance);
  const percentageUsed = Math.min(100, Math.round((amountSpent / initialBudget) * 100));
  const remainingPercentage = 100 - percentageUsed;

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  // Color state for budget health
  let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let progressColor = 'bg-emerald-600';
  let badgeLabel = 'Healthy Allocation';

  if (percentageUsed >= 85) {
    statusColor = 'text-red-700 bg-red-50 border-red-200';
    progressColor = 'bg-red-600';
    badgeLabel = 'Critical Budget (< 15%)';
  } else if (percentageUsed >= 60) {
    statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
    progressColor = 'bg-amber-500';
    badgeLabel = 'Moderate Allocation';
  }

  return (
    <section className="bg-slate-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xs">
          
          {/* Header Row: Team & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Procurement Team
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {currentTeam.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                {percentageUsed >= 85 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {badgeLabel}
              </span>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Virtual Research Credits
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4">
            
            {/* Initial Budget */}
            <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Initial Budget</p>
              <p className="text-base sm:text-xl font-bold text-white mt-0.5">
                {formatCurrency(initialBudget)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Assigned Virtual Fund</p>
            </div>

            {/* Amount Spent */}
            <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount Spent</p>
                <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-base sm:text-xl font-bold text-white mt-0.5">
                {formatCurrency(amountSpent)}
              </p>
              <p className="text-[10px] text-blue-400 font-medium mt-0.5">
                {percentageUsed}% of allocation
              </p>
            </div>

            {/* Remaining Balance */}
            <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
              <p className={`text-base sm:text-xl font-bold mt-0.5 ${remainingBalance < 2000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatCurrency(remainingBalance)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{remainingPercentage}% available</p>
            </div>

            {/* Budget Used Gauge */}
            <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget Utilization</p>
              <p className="text-base sm:text-xl font-bold text-white mt-0.5">
                {percentageUsed}%
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {amountSpent === 0 ? 'Fresh Allocation' : `${formatCurrency(remainingBalance)} left`}
              </p>
            </div>

          </div>

          {/* Animated Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Budget Expenditure Meter
              </span>
              <span>{percentageUsed}% used ({formatCurrency(amountSpent)} / {formatCurrency(initialBudget)})</span>
            </div>
            
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                style={{ width: `${Math.max(3, percentageUsed)}%` }}
              />
            </div>
          </div>

          {/* Low Balance Alert Banner if applicable */}
          {remainingBalance < 2000 && remainingBalance > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Low budget alert:</strong> Remaining balance is below ₹2,000. Prioritize essential reagents and critical assay consumables.
              </span>
            </div>
          )}

          {remainingBalance === 0 && (
            <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-2.5 flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Budget exhausted:</strong> Your team has used 100% of its virtual budget. Contact your lab administrator or use the simulator to request budget adjustments.
              </span>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
