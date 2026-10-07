import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Calculator,
  ArrowRightLeft,
  HeartHandshake,
  Sparkles,
  Eye,
  Utensils,
  Baby,
  Building2,
  TrendingUp,
  CheckCircle2,
  Coins
} from 'lucide-react';

interface SponsorshipSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  forexRate: number;
  onApplyDonation: (amount: string, purpose: string, country: string) => void;
}

export const SponsorshipSimulatorModal: React.FC<SponsorshipSimulatorModalProps> = ({
  isOpen,
  onClose,
  forexRate,
  onApplyDonation
}) => {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [inputAmount, setInputAmount] = useState<number>(500);

  // Live conversion calculations
  const { amountUsd, amountInr } = useMemo(() => {
    if (currency === 'USD') {
      return {
        amountUsd: inputAmount,
        amountInr: Math.round(inputAmount * (forexRate || 83.50))
      };
    } else {
      return {
        amountUsd: Math.round(inputAmount / (forexRate || 83.50)),
        amountInr: inputAmount
      };
    }
  }, [inputAmount, currency, forexRate]);

  // Impact metrics
  const impact = useMemo(() => {
    const cataractCases = Math.floor(amountUsd / 50);
    const cornealCases = Math.floor(amountUsd / 100);
    const childCareCases = Math.floor(amountUsd / 100);
    const annadhanamMealsDays = Math.floor(amountUsd / 200);
    const campScreenings = Math.floor((amountUsd / 1000) * 500);

    return {
      cataractCases,
      cornealCases,
      childCareCases,
      annadhanamMealsDays,
      campScreenings
    };
  }, [amountUsd]);

  const presetAmountsUsd = [50, 150, 300, 500, 1000, 3000];
  const presetAmountsInr = [3500, 10000, 25000, 50000, 100000, 250000];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sponsorship Impact Calculator & Forex Simulator"
      subtitle="Real-time INR ⇋ USD surgery purchasing power across Sankara Eye Care Hospitals"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Currency Selector & Input Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-white border border-orange-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-orange-600" />
              <span>Enter Remittance / Grant Amount</span>
            </label>

            {/* Currency Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-orange-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  setInputAmount(500);
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                  currency === 'USD'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-orange-950 hover:bg-orange-50'
                }`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency('INR');
                  setInputAmount(42000);
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                  currency === 'INR'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-orange-950 hover:bg-orange-50'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-orange-600">
              {currency === 'USD' ? '$' : '₹'}
            </span>
            <input
              type="number"
              min={10}
              step={currency === 'USD' ? 50 : 1000}
              value={inputAmount}
              onChange={(e) => setInputAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-16 pl-12 pr-4 text-3xl font-black text-slate-900 bg-white border-2 border-orange-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-inner"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500">Quick Presets:</span>
            {(currency === 'USD' ? presetAmountsUsd : presetAmountsInr).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setInputAmount(amt)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                  inputAmount === amt
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-white text-slate-700 border-orange-200 hover:border-orange-400'
                }`}
              >
                {currency === 'USD' ? `$${amt}` : `₹${amt.toLocaleString()}`}
              </button>
            ))}
          </div>

          {/* Dual Converted Bar */}
          <div className="pt-3 border-t border-orange-200/80 flex flex-wrap items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-orange-600" />
              <span>
                Dual Currency Equivalent: <strong className="text-orange-950 font-black">${amountUsd.toLocaleString()} USD</strong> ≈ <strong className="text-emerald-700 font-black">₹{amountInr.toLocaleString()} INR</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Live Reference Forex: 1 USD = ₹{forexRate.toFixed(2)} INR
            </span>
          </div>
        </div>

        {/* Calculated Impact Matrix */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Vision Restoration & Healthcare Purchasing Power for this Remittance:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Cataract Surgeries */}
            <div className="p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/50 flex flex-col justify-between hover:shadow-orange-glow transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-orange-950 uppercase tracking-wider">Free Cataract Surgeries</span>
                  <p className="text-2xl font-black text-orange-600 mt-1">
                    {impact.cataractCases} Patients
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3">
                $50 (₹3,500) per SICS surgery with PCIOL implant and medicines
              </p>
            </div>

            {/* Corneal Grafts */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Corneal Transplants</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {impact.cornealCases} Eyes
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3">
                $100 (₹7,000) per sight-saving keratoplasty procedure
              </p>
            </div>

            {/* Pediatric Eye Care */}
            <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex flex-col justify-between hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">Child Vision Surgeries</span>
                  <p className="text-2xl font-black text-indigo-700 mt-1">
                    {impact.childCareCases} Children
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Baby className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3">
                $100 (₹6,000) per specialized pediatric eye surgery
              </p>
            </div>

            {/* Inpatient Meals */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">Annadhanam Meal Units</span>
                  <p className="text-2xl font-black text-amber-700 mt-1">
                    {impact.annadhanamMealsDays * 200} Meals
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Utensils className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3">
                $200 (₹10,000) feeds 200 rural admitted patients & attendants
              </p>
            </div>

            {/* Rural Camp Screenings */}
            <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between sm:col-span-2 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-purple-950 uppercase tracking-wider">Rural Village Eye Screenings</span>
                  <p className="text-2xl font-black text-purple-700 mt-1">
                    {impact.campScreenings > 0 ? `${impact.campScreenings.toLocaleString()} Rural Villagers` : 'Partial Camp Pool'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3">
                $1,000 (₹60,000) organizes a complete village outreach camp including diagnostic buses and transportation
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Ready to record this donation in the system?
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="md" onClick={onClose} className="flex-1 sm:flex-none">
              Close Simulator
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<HeartHandshake className="h-4 w-4" />}
              onClick={() => {
                const formatted = currency === 'USD' ? `$${inputAmount}` : `₹${inputAmount}`;
                const country = currency === 'USD' ? 'USA (SEF USA)' : 'India (Direct 80G)';
                onApplyDonation(formatted, 'Cataract Surgery', country);
                onClose();
              }}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black shadow-md"
            >
              Pre-fill Remittance ({currency === 'USD' ? `$${inputAmount}` : `₹${inputAmount.toLocaleString()}`})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
