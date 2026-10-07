import React, { useState, useMemo } from'react';
import { useApp } from'../context/AppContext';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 Coins,
 ShieldCheck,
 Building2,
 Calendar,
 Search,
 Download,
 Trash2,
 TrendingUp,
 HeartHandshake,
 DollarSign,
 Layers,
 Sparkles,
 Lock,
 Plus,
 ArrowUpRight,
 Eye,
 CheckCircle2,
 FileText
} from'lucide-react';

export const GeneralExpensesLedgerView: React.FC = () => {
 const {
 generalExpenses,
 addGeneralExpense,
 deleteGeneralExpense,
 clearGeneralExpenses,
 selectedBranch,
 hospitals,
 currentUser,
 showToast
 } = useApp();

 const [activeLedgerTab, setActiveLedgerTab] = useState<'ledger'|'hospital_breakdown'>('ledger');
 const [searchQuery, setSearchQuery] = useState('');
 const [currencyFilter, setCurrencyFilter] = useState<'All'|'USD'|'INR'>('All');

 // Manual Contribution Modal State
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [manualForm, setManualForm] = useState({
 donorId: `DON-SEVA-${Math.floor(1000 + Math.random() * 8999)}`,
 donorName:'',
 sefId: `SEF-GEN-${Math.floor(10000 + Math.random() * 89999)}`,
 originalAmount:'$500',
 surgeriesCount: 0,
 surgeriesAmount: 0,
 remainingAmount: 500,
 currency:'USD'as'USD'|'INR',
 date: new Date().toISOString().slice(0, 10),
 unit: selectedBranch ==='All Branches'?'Coimbatore': selectedBranch,
 purpose:'General Inpatient Medicines & Food Care Fund',
 matchedPatientMrns: [] as string[]
 });

 const filteredEntries = useMemo(() => {
 return generalExpenses.filter((item) => {
 const matchesBranch =
 selectedBranch ==='All Branches'||
 item.unit.toLowerCase().includes(selectedBranch.toLowerCase()) ||
 item.unit ==='Any';

 const matchesCurrency =
 currencyFilter ==='All'
 ? true
 : currencyFilter ==='USD'
 ? item.currency ==='USD'
 : item.currency ==='INR';

 const matchesSearch =
 !searchQuery ||
 `${item.donorName} ${item.sefId} ${item.unit} ${item.purpose}`
 .toLowerCase()
 .includes(searchQuery.toLowerCase());

 return matchesBranch && matchesCurrency && matchesSearch;
 });
 }, [generalExpenses, selectedBranch, currencyFilter, searchQuery]);

 // Aggregate totals
 const totalUsdRemaining = useMemo(() => {
 return generalExpenses
 .filter((g) => g.currency ==='USD')
 .reduce((sum, g) => sum + g.remainingAmount, 0);
 }, [generalExpenses]);

 const totalInrRemaining = useMemo(() => {
 return generalExpenses
 .filter((g) => g.currency ==='INR')
 .reduce((sum, g) => sum + g.remainingAmount, 0);
 }, [generalExpenses]);

 const totalSurgeriesSponsored = useMemo(() => {
 return generalExpenses.reduce((sum, g) => sum + g.surgeriesCount, 0);
 }, [generalExpenses]);

 // Hospital Unit Breakdown stats
 const hospitalStats = useMemo(() => {
 const map = new Map<string, { usd: number; inr: number; surgeries: number; count: number }>();

 generalExpenses.forEach((item) => {
 const unit = item.unit ||'General Pool';
 const existing = map.get(unit) || { usd: 0, inr: 0, surgeries: 0, count: 0 };
 if (item.currency ==='USD') {
 existing.usd += item.remainingAmount;
 } else {
 existing.inr += item.remainingAmount;
 }
 existing.surgeries += item.surgeriesCount;
 existing.count += 1;
 map.set(unit, existing);
 });

 return Array.from(map.entries()).map(([unit, data]) => ({
 unit,
 ...data
 }));
 }, [generalExpenses]);

 const handleSaveManualEntry = (e: React.FormEvent) => {
 e.preventDefault();
 if (!manualForm.donorName.trim()) return;

 addGeneralExpense(manualForm);
 setIsAddModalOpen(false);
 setManualForm({
 donorId: `DON-SEVA-${Math.floor(1000 + Math.random() * 8999)}`,
 donorName:'',
 sefId: `SEF-GEN-${Math.floor(10000 + Math.random() * 89999)}`,
 originalAmount:'$500',
 surgeriesCount: 0,
 surgeriesAmount: 0,
 remainingAmount: 500,
 currency:'USD',
 date: new Date().toISOString().slice(0, 10),
 unit: selectedBranch ==='All Branches'?'Coimbatore': selectedBranch,
 purpose:'General Inpatient Medicines & Food Care Fund',
 matchedPatientMrns: []
 });
 };

 const handleExportCsv = () => {
 if (filteredEntries.length === 0) {
 showToast('No entries to export','info');
 return;
 }

 const headers = [
'Date',
'SEF ID',
'Donor Name',
'Original Donation',
'Surgeries Count',
'Surgeries Amount',
'Remaining to General Fund',
'Currency',
'Hospital Unit',
'Purpose'
 ];

 const rows = filteredEntries.map((e) => [
 e.date,
 e.sefId,
 `"${e.donorName}"`,
 `"${e.originalAmount}"`,
 e.surgeriesCount,
 e.surgeriesAmount,
 e.remainingAmount,
 e.currency,
 e.unit,
 `"${e.purpose}"`
 ]);

 const csvContent =
'data:text/csv;charset=utf-8,'+
 [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `General_Expenses_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);

 showToast('Ledger successfully exported as CSV');
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
 <Lock className="h-3 w-3"/>
 Super Admin Exclusive
 </span>
 <Badge variant="primary"size="sm">
 Live Audited Fund
 </Badge>
 </div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <Coins className="h-6 w-6 text-purple-600"/>
 General Expenses & Patient Care Fund Ledger
 </h1>
 <p className="text-xs text-slate-600 mt-0.5">
 Audit trail of remaining donor balances transferred from multi-patient sponsorships ($3000, $180, etc.) to patient meals, medicines, and consumables.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <Button
 variant="primary"
 size="sm"
 icon={<Plus className="h-4 w-4"/>}
 onClick={() => setIsAddModalOpen(true)}
 className="bg-purple-700 hover:bg-purple-800 text-xs font-bold shadow-md"
 >
 Record Direct Seva Contribution
 </Button>

 <Button
 variant="outline"
 size="sm"
 icon={<Download className="h-4 w-4"/>}
 onClick={handleExportCsv}
 className="text-xs font-bold"
 >
 Export Ledger CSV
 </Button>

 {filteredEntries.length > 0 && (
 <Button
 variant="outline"
 size="sm"
 icon={<Trash2 className="h-4 w-4 text-rose-500"/>}
 onClick={() => {
 if (confirm('Are you sure you want to clear the general expenses ledger?')) {
 clearGeneralExpenses();
 }
 }}
 className="text-xs text-rose-600 hover:bg-rose-50"
 >
 Clear
 </Button>
 )}
 </div>
 </div>

 {/* KPI Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">SEF USA General Fund</span>
 <Coins className="h-4 w-4 text-purple-600"/>
 </div>
 <p className="text-2xl font-black text-purple-900 mt-2">
 ${totalUsdRemaining.toLocaleString()}
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Transferred from USA sponsorships</p>
 </div>

 <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">India General Seva Fund</span>
 <TrendingUp className="h-4 w-4 text-emerald-600"/>
 </div>
 <p className="text-2xl font-black text-emerald-900 mt-2">
 ₹{totalInrRemaining.toLocaleString()}
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Transferred from Indian donors</p>
 </div>

 <div className="p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">Surgeries Supported</span>
 <Layers className="h-4 w-4 text-sky-600"/>
 </div>
 <p className="text-2xl font-black text-sky-900 mt-2">
 {totalSurgeriesSponsored}
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Beneficiaries operated & matched</p>
 </div>

 <div className="p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">Contributing Donors</span>
 <HeartHandshake className="h-4 w-4 text-amber-600"/>
 </div>
 <p className="text-2xl font-black text-amber-900 mt-2">
 {generalExpenses.length} Donors
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Multi-patient pool allocations</p>
 </div>
 </div>

 {/* Navigation Sub-Tabs */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
 <div className="flex items-center gap-2">
 <button
 onClick={() => setActiveLedgerTab('ledger')}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 ${
 activeLedgerTab ==='ledger'
 ?'bg-purple-700 text-white shadow'
 :'text-slate-600 hover:bg-slate-100'
 }`}
 >
 <FileText className="h-3.5 w-3.5"/>
 <span>Audited Remainder Ledger ({filteredEntries.length})</span>
 </button>

 <button
 onClick={() => setActiveLedgerTab('hospital_breakdown')}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 ${
 activeLedgerTab ==='hospital_breakdown'
 ?'bg-purple-700 text-white shadow'
 :'text-slate-600 hover:bg-slate-100'
 }`}
 >
 <Building2 className="h-3.5 w-3.5"/>
 <span>Hospital Branch Distribution ({hospitalStats.length})</span>
 </button>
 </div>

 {/* Currency Filter */}
 <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
 <button
 onClick={() => setCurrencyFilter('All')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
 currencyFilter ==='All'
 ?'bg-white shadow text-slate-900'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 All Currencies
 </button>
 <button
 onClick={() => setCurrencyFilter('USD')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 currencyFilter ==='USD'
 ?'bg-purple-700 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇺🇸 USD ($)</span>
 </button>
 <button
 onClick={() => setCurrencyFilter('INR')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 currencyFilter ==='INR'
 ?'bg-purple-700 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇮🇳 INR (₹)</span>
 </button>
 </div>
 </div>

 {/* Tab 1: Audited Ledger Table */}
 {activeLedgerTab ==='ledger'&& (
 <div className="space-y-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"/>
 <input
 type="text"
 placeholder="Search donor, SEF ID, purpose, hospital unit..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
 />
 </div>

 <div className="rounded-2xl border border-slate-200/80 bg-white shadow-origin overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-700">
 <th className="py-3.5 px-4">Date & Unit</th>
 <th className="py-3.5 px-4">Donor / Sponsor</th>
 <th className="py-3.5 px-4">SEF ID</th>
 <th className="py-3.5 px-4">Original Donation</th>
 <th className="py-3.5 px-4">Surgeries Matched</th>
 <th className="py-3.5 px-4">Remaining to General Fund</th>
 <th className="py-3.5 px-4">Purpose / Category</th>
 <th className="py-3.5 px-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredEntries.length === 0 ? (
 <tr>
 <td colSpan={8} className="py-12 text-center text-slate-700">
 No general expense transfers recorded yet. Match multi-patient pools or record a contribution!
 </td>
 </tr>
 ) : (
 filteredEntries.map((entry) => {
 const symb = entry.currency ==='INR'?'Rs.':'$';

 return (
 <tr
 key={entry.id}
 className="hover:bg-slate-50/80 transition-colors"
 >
 <td className="py-3.5 px-4">
 <span className="font-semibold text-slate-800 block">
 {entry.date}
 </span>
 <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
 <Building2 className="h-3 w-3 text-slate-400"/>
 {entry.unit}
 </span>
 </td>

 <td className="py-3.5 px-4">
 <strong className="font-bold text-slate-900 block text-sm">
 {entry.donorName}
 </strong>
 <span className="text-[10px] text-slate-500 font-mono">
 Ref ID: {entry.id}
 </span>
 </td>

 <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
 {entry.sefId}
 </td>

 <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
 {entry.originalAmount}
 </td>

 <td className="py-3.5 px-4">
 <span className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
 {entry.surgeriesCount} Surgeries ({symb}{entry.surgeriesAmount})
 </span>
 </td>

 <td className="py-3.5 px-4">
 <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl text-sm border border-emerald-300 shadow-sm">
 +{symb}{entry.remainingAmount.toLocaleString()}
 </span>
 </td>

 <td className="py-3.5 px-4 text-slate-700 font-medium">
 {entry.purpose}
 </td>

 <td className="py-3.5 px-4 text-right">
 <button
 onClick={() => deleteGeneralExpense(entry.id)}
 className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
 title="Remove Entry"
 >
 <Trash2 className="h-4 w-4"/>
 </button>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Tab 2: Hospital Branch Distribution */}
 {activeLedgerTab ==='hospital_breakdown'&& (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {hospitalStats.map((h) => (
 <div
 key={h.unit}
 className="p-4 rounded-2xl border border-slate-200 bg-white shadow-origin space-y-3"
 >
 <div className="flex items-center justify-between pb-2 border-b border-slate-100">
 <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
 <Building2 className="h-4 w-4 text-purple-600"/>
 {h.unit}
 </h4>
 <Badge variant="primary"size="sm">
 {h.count} Donations
 </Badge>
 </div>

 <div className="space-y-1.5 text-xs">
 <div className="flex justify-between py-1 border-b border-slate-100">
 <span className="text-slate-500 font-medium">SEF USA Reserve ($):</span>
 <strong className="text-purple-700 font-black">
 ${h.usd.toLocaleString()}
 </strong>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-100">
 <span className="text-slate-500 font-medium">India Seva Reserve (₹):</span>
 <strong className="text-emerald-700 font-black">
 ₹{h.inr.toLocaleString()}
 </strong>
 </div>

 <div className="flex justify-between py-1">
 <span className="text-slate-500 font-medium">Surgeries Operated:</span>
 <span className="font-bold text-sky-700">
 {h.surgeries} Patients
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Manual Seva Contribution Modal */}
 {isAddModalOpen && (
 <Modal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 title="Record Direct Patient Care / Seva Contribution"
 subtitle="Add general donations allocated directly to patient consumables, medicines, and food care."
 maxWidth="lg"
 >
 <form onSubmit={handleSaveManualEntry} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Donor / Contributor Name *
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Anonymous Well-Wisher / Trustee Seva"
 value={manualForm.donorName}
 onChange={(e) => setManualForm({ ...manualForm, donorName: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Currency *
 </label>
 <select
 value={manualForm.currency}
 onChange={(e) => {
 const curr = e.target.value as'USD'|'INR';
 const symb = curr ==='INR'?'Rs.':'$';
 setManualForm({
 ...manualForm,
 currency: curr,
 originalAmount: `${symb}${manualForm.remainingAmount}`
 });
 }}
 className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-purple-500"
 >
 <option value="USD">🇺🇸 USD ($ - USA)</option>
 <option value="INR">🇮🇳 INR (₹ - India)</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Amount Contributed *
 </label>
 <input
 type="number"
 min="1"
 required
 value={manualForm.remainingAmount}
 onChange={(e) => {
 const num = parseFloat(e.target.value) || 0;
 const symb = manualForm.currency ==='INR'?'Rs.':'$';
 setManualForm({
 ...manualForm,
 remainingAmount: num,
 originalAmount: `${symb}${num}`
 });
 }}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-purple-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Hospital Branch
 </label>
 <select
 value={manualForm.unit}
 onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
 className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-purple-500"
 >
 {hospitals.map((h) => (
 <option key={h.id} value={h.name}>
 {h.name}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Purpose / Fund Tag
 </label>
 <input
 type="text"
 value={manualForm.purpose}
 onChange={(e) => setManualForm({ ...manualForm, purpose: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-500"
 />
 </div>

 <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsAddModalOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-purple-700 hover:bg-purple-800 font-bold">
 Save & Add to Fund
 </Button>
 </div>
 </form>
 </Modal>
 )}
 </div>
 );
};
