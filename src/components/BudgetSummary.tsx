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
  let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let progressColor = 'bg-gradient-to-r from-emerald-500 to-teal-500';
  let badgeLabel = 'Healthy Allocation';

  if (percentageUsed >= 85) {
    statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
    progressColor = 'bg-gradient-to-r from-amber-500 to-rose-600';
    badgeLabel = 'Critical Budget (< 15%)';
  } else if (percentageUsed >= 60) {
    statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
    progressColor = 'bg-gradient-to-r from-teal-500 to-amber-500';
    badgeLabel = 'Moderate Allocation';
  }

  return (
    <section className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          
          {/* Header Row: Team & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Procurement Team
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {currentTeam.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                {percentageUsed >= 85 ? (
                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
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
            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Initial Budget</p>
              <p className="text-base sm:text-xl font-black text-slate-800 mt-0.5">
                {formatCurrency(initialBudget)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Assigned Virtual Fund</p>
            </div>

            {/* Amount Spent */}
            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount Spent</p>
                <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-base sm:text-xl font-black text-slate-900 mt-0.5">
                {formatCurrency(amountSpent)}
              </p>
              <p className="text-[10px] text-sky-600 font-medium mt-0.5">
                {percentageUsed}% of allocation
              </p>
            </div>

            {/* Remaining Balance */}
            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Remaining Balance</p>
              <p className={`text-base sm:text-xl font-black mt-0.5 ${remainingBalance < 2000 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formatCurrency(remainingBalance)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{remainingPercentage}% available</p>
            </div>

            {/* Budget Used Gauge */}
            <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Budget Utilization</p>
              <p className="text-base sm:text-xl font-black text-slate-800 mt-0.5">
                {percentageUsed}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {amountSpent === 0 ? 'Fresh Allocation' : `${formatCurrency(remainingBalance)} left`}
              </p>
            </div>

          </div>

          {/* Animated Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                Budget Expenditure Meter
              </span>
              <span>{percentageUsed}% used ({formatCurrency(amountSpent)} / {formatCurrency(initialBudget)})</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
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
