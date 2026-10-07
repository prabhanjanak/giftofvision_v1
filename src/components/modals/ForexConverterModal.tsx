import React, { useState } from'react';
import { Modal } from'../ui/Modal';
import { Button } from'../ui/Button';
import { Badge } from'../ui/Badge';
import { ForexRates, convertCurrency, calculateSurgeryEquivalent } from'../../services/forexService';
import {
 Coins,
 ArrowRightLeft,
 DollarSign,
 TrendingUp,
 Sparkles,
 Layers,
 Heart,
 RefreshCw,
 X
} from'lucide-react';

interface ForexConverterModalProps {
 isOpen: boolean;
 onClose: () => void;
 rates: ForexRates;
 onRefreshRates: () => void;
}

export const ForexConverterModal: React.FC<ForexConverterModalProps> = ({
 isOpen,
 onClose,
 rates,
 onRefreshRates
}) => {
 const [inputAmount, setInputAmount] = useState<number>(50);
 const [sourceCurrency, setSourceCurrency] = useState<'USD'|'INR'|'GBP'|'EUR'>('USD');
 const [isRefreshing, setIsRefreshing] = useState(false);

 const convertedInr = convertCurrency(inputAmount, sourceCurrency,'INR', rates);
 const convertedUsd = convertCurrency(inputAmount, sourceCurrency,'USD', rates);
 const convertedGbp = convertCurrency(inputAmount, sourceCurrency,'GBP', rates);
 const convertedEur = convertCurrency(inputAmount, sourceCurrency,'EUR', rates);

 const surgeryPower = calculateSurgeryEquivalent(inputAmount, sourceCurrency, rates);

 const handleRefresh = async () => {
 setIsRefreshing(true);
 await onRefreshRates();
 setTimeout(() => setIsRefreshing(false), 500);
 };

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title="Daily Live Forex & Surgery Purchasing Power"
 subtitle={`Live Currency Benchmark • Provider: ${rates.provider} • Date: ${rates.lastUpdated}`}
 maxWidth="xl"
 >
 <div className="space-y-4">
 {/* Live Daily Exchange Banner - Warm Orange Theme */}
 <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-md border border-orange-400/40 flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2">
 <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse"/>
 <span className="text-[10px] uppercase font-black text-amber-100 tracking-wider">
 Live Daily Benchmark
 </span>
 <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
 {rates.isLive ?'Live API Feed':'Standard Baseline'}
 </span>
 </div>
 <p className="text-xl sm:text-2xl font-black mt-0.5">
 1 USD ($) = <span className="text-white font-extrabold">₹{rates.INR.toFixed(2)} INR</span>
 </p>
 <p className="text-[11px] text-orange-100">
 1 GBP = ₹{rates.GBP ? (rates.INR / rates.GBP).toFixed(2) :'106.20'} • 1 EUR = ₹{rates.EUR ? (rates.INR / rates.EUR).toFixed(2) :'91.30'}
 </p>
 </div>

 <button
 onClick={handleRefresh}
 className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 text-xs font-black shadow"
 title="Refresh Live Forex Rates"
 >
 <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ?'animate-spin':''}`} />
 <span className="hidden sm:inline">Refresh</span>
 </button>
 </div>

 {/* Interactive Converter Card - White Theme */}
 <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/90 space-y-3">
 <label className="block text-xs font-bold text-slate-800">
 Enter Remittance Amount & Select Currency:
 </label>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
 <div className="sm:col-span-2">
 <input
 type="number"
 min="1"
 value={inputAmount}
 onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
 placeholder="Enter amount..."
 className="w-full h-10 px-3 text-sm font-black bg-white border border-orange-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500"
 />
 </div>

 <div>
 <select
 value={sourceCurrency}
 onChange={(e) => setSourceCurrency(e.target.value as any)}
 className="w-full h-10 px-3 text-xs font-bold bg-white border border-orange-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 cursor-pointer"
 >
 <option value="USD">🇺🇸 USD ($ - USA)</option>
 <option value="INR">🇮🇳 INR (₹ - India)</option>
 <option value="GBP">🇬🇧 GBP (£ - UK)</option>
 <option value="EUR">🇪🇺 EUR (€ - EU)</option>
 </select>
 </div>
 </div>

 {/* Real-time Multi-Currency Output Tiles */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
 <div className="p-2.5 rounded-xl bg-white border border-orange-100 text-center shadow-sm">
 <span className="text-[10px] text-slate-500 font-bold block">USD ($)</span>
 <strong className="text-xs sm:text-sm font-black text-slate-900">
 ${convertedUsd.toLocaleString()}
 </strong>
 </div>

 <div className="p-2.5 rounded-xl bg-orange-100/70 border border-orange-300/80 text-center shadow-sm">
 <span className="text-[10px] text-orange-950 font-bold block">INR (₹)</span>
 <strong className="text-xs sm:text-sm font-black text-orange-900">
 ₹{convertedInr.toLocaleString()}
 </strong>
 </div>

 <div className="p-2.5 rounded-xl bg-white border border-orange-100 text-center shadow-sm">
 <span className="text-[10px] text-slate-500 font-bold block">GBP (£)</span>
 <strong className="text-xs sm:text-sm font-black text-slate-900">
 £{convertedGbp.toLocaleString()}
 </strong>
 </div>

 <div className="p-2.5 rounded-xl bg-white border border-orange-100 text-center shadow-sm">
 <span className="text-[10px] text-slate-500 font-bold block">EUR (€)</span>
 <strong className="text-xs sm:text-sm font-black text-slate-900">
 €{convertedEur.toLocaleString()}
 </strong>
 </div>
 </div>
 </div>

 {/* Surgery Equivalent Impact Box - Pure White Theme */}
 <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50/70 to-white border border-orange-200 text-xs space-y-2">
 <div className="flex items-center justify-between">
 <h4 className="font-extrabold text-orange-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
 <Sparkles className="h-3.5 w-3.5 text-orange-600"/>
 Surgical Impact & Sponsoring Power:
 </h4>
 <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full font-bold text-[10px] border border-orange-200">
 Standard Tariff: ₹{surgeryPower.surgeryCostInr.toLocaleString()} ($50)
 </span>
 </div>

 <div className="p-3 rounded-xl bg-white border border-orange-100 shadow-sm">
 {surgeryPower.fullSurgeries > 0 ? (
 <div className="space-y-1">
 <p className="text-xs sm:text-sm font-black text-slate-900">
 🎯 Funds <span className="text-orange-600">{surgeryPower.fullSurgeries} Complete Sight-Restoring Cataract Surgeries</span>
 </p>
 {surgeryPower.remainderInr > 0 && (
 <p className="text-slate-600 text-[11px]">
 + <strong>₹{surgeryPower.remainderInr.toLocaleString()} ($ {surgeryPower.remainderUsd})</strong> for Inpatient Medicines, Drops & Post-Op Meals
 </p>
 )}
 </div>
 ) : (
 <div className="space-y-1">
 <p className="text-xs sm:text-sm font-black text-amber-800">
 🤝 Partial Co-Sponsorship ({((convertedInr / surgeryPower.surgeryCostInr) * 100).toFixed(1)}% of 1 Surgery)
 </p>
 <p className="text-slate-600 text-[11px]">
 ₹{convertedInr.toLocaleString()} provides intraocular lenses, surgical packs, and pre-op tests. Can be co-pooled with another donor in Matching Studio!
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Prominent Footer Close Button */}
 <div className="flex items-center justify-between pt-3 border-t border-slate-100">
 <p className="text-[11px] text-slate-500">
 Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] text-slate-700">ESC</kbd> or click Close
 </p>

 <Button
 variant="primary"
 size="sm"
 onClick={onClose}
 className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-6 text-xs shadow-md"
 >
 Close Converter
 </Button>
 </div>
 </div>
 </Modal>
 );
};
