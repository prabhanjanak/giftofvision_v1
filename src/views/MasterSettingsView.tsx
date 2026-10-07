import React, { useState } from'react';
import { useApp } from'../context/AppContext';
import { Hospital, Purpose, Occasion, UserAccount } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 Settings,
 Building2,
 Tag,
 Calendar,
 Users,
 Plus,
 Edit,
 Trash2,
 CheckCircle2,
 Shield,
 Coins
} from'lucide-react';

export const MasterSettingsView: React.FC = () => {
 const {
 hospitals,
 purposes,
 occasions,
 users,
 forexRates,
 refreshForexRates,
 addHospital,
 updateHospital,
 addPurpose,
 updatePurpose,
 showToast
 } = useApp();

 const [activeTab, setActiveTab] = useState<'hospitals'|'purposes'|'occasions'|'users'|'forex'>('hospitals');

 // Forex & CurrencyLayer Settings
 const [currencyLayerKey, setCurrencyLayerKey] = useState<string>(() => {
 return localStorage.getItem('gov_currencylayer_key') ||'';
 });
 const [isTestingForex, setIsTestingForex] = useState(false);

 // Hospital modal state
 const [isHospModalOpen, setIsHospModalOpen] = useState(false);
 const [hospForm, setHospForm] = useState({
 name:'',
 state:'Tamil Nadu',
 code:'NEW',
 active: true,
 beds: 150,
 contact:'+91 422 266 6450'
 });

 // Purpose modal state
 const [isPurpModalOpen, setIsPurpModalOpen] = useState(false);
 const [purpForm, setPurpForm] = useState({
 name:'',
 costUsd: 50,
 costInr: 3000,
 category:'Surgery',
 active: true
 });

 const handleSaveHospital = (e: React.FormEvent) => {
 e.preventDefault();
 if (!hospForm.name.trim()) return;
 addHospital(hospForm);
 setIsHospModalOpen(false);
 };

 const handleSavePurpose = (e: React.FormEvent) => {
 e.preventDefault();
 if (!purpForm.name.trim()) return;
 addPurpose(purpForm);
 setIsPurpModalOpen(false);
 };

 const handleSaveCurrencyLayerKey = async () => {
 setIsTestingForex(true);
 localStorage.setItem('gov_currencylayer_key', currencyLayerKey.trim());
 await refreshForexRates();
 setIsTestingForex(false);
 showToast('CurrencyLayer API configuration saved & live rates refreshed!');
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <Settings className="h-6 w-6 text-sankara-800"/>
 Master Configuration & System Tables
 </h1>
 <p className="text-xs text-slate-700 mt-1">
 Manage hospital branches, sponsorship purpose tariffs, occasions, and system access accounts.
 </p>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
 <button
 onClick={() => setActiveTab('hospitals')}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
 activeTab ==='hospitals'
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <Building2 className="h-4 w-4"/>
 <span>Hospital Branches ({hospitals.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('purposes')}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
 activeTab ==='purposes'
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <Tag className="h-4 w-4"/>
 <span>Sponsorship Purposes ({purposes.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('occasions')}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
 activeTab ==='occasions'
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <Calendar className="h-4 w-4"/>
 <span>Occasions Master ({occasions.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('users')}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
 activeTab ==='users'
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <Users className="h-4 w-4"/>
 <span>Admin Users & Roles ({users.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('forex')}
 className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
 activeTab ==='forex'
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <Coins className="h-4 w-4"/>
 <span>Daily Forex & CurrencyLayer API</span>
 </button>
 </div>

 {/* Tab 1: Hospitals */}
 {activeTab ==='hospitals'&& (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-xs text-slate-700">
 Active Sankara Eye Foundation hospital network in India.
 </p>
 <Button
 variant="primary"
 size="sm"
 icon={<Plus className="h-4 w-4"/>}
 onClick={() => setIsHospModalOpen(true)}
 className="bg-sankara-800 hover:bg-sankara-900"
 >
 Add Hospital Branch
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {hospitals.map((hosp) => (
 <div
 key={hosp.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between">
 <div>
 <h3 className="font-extrabold text-sm text-slate-900">
 {hosp.name}
 </h3>
 <p className="text-xs text-slate-700">
 {hosp.state} • Code: <strong className="text-slate-900">{hosp.code}</strong>
 </p>
 </div>
 <Badge variant="success"size="sm">Active</Badge>
 </div>

 <div className="mt-3 space-y-1 text-xs text-slate-700">
 <p>Bed Capacity: <strong className="text-slate-900">{hosp.beds} Beds</strong></p>
 <p>Helpline: <strong className="text-slate-900">{hosp.contact}</strong></p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Tab 2: Purposes */}
 {activeTab ==='purposes'&& (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-xs text-slate-700">
 Sponsorship programs and standard donation donation values.
 </p>
 <Button
 variant="primary"
 size="sm"
 icon={<Plus className="h-4 w-4"/>}
 onClick={() => setIsPurpModalOpen(true)}
 className="bg-sankara-800 hover:bg-sankara-900"
 >
 Add Purpose
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {purposes.map((p) => (
 <div
 key={p.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between">
 <h3 className="font-extrabold text-sm text-slate-900">
 {p.name}
 </h3>
 <Badge variant="primary"size="sm">{p.category}</Badge>
 </div>

 <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
 <span>USD: <strong className="text-sankara-800 font-bold">${p.costUsd}</strong></span>
 <span>INR: <strong className="text-emerald-700 font-bold">₹{p.costInr.toLocaleString()}</strong></span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Tab 3: Occasions */}
 {activeTab ==='occasions'&& (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {occasions.map((occ) => (
 <div
 key={occ.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex items-center justify-between"
 >
 <div className="flex items-center gap-2.5">
 <Calendar className="h-4 w-4 text-purple-600"/>
 <span className="font-bold text-xs text-slate-900">
 {occ.name}
 </span>
 </div>
 <Badge variant="neutral"size="sm">Occasion</Badge>
 </div>
 ))}
 </div>
 )}

 {/* Tab 4: Users */}
 {activeTab ==='users'&& (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {users.map((u) => (
 <div
 key={u.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between">
 <div>
 <h3 className="font-extrabold text-sm text-slate-900">
 {u.name}
 </h3>
 <p className="font-mono text-xs text-slate-700">
 @{u.username}
 </p>
 </div>
 <Badge variant={u.role ==='Super Admin'?'purple':'primary'} size="sm">
 {u.role}
 </Badge>
 </div>

 <div className="mt-3 space-y-1 text-xs text-slate-700">
 <p>Email: <strong className="text-slate-900">{u.email}</strong></p>
 <p>Branch: <strong className="text-slate-900">{u.hospital}</strong></p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Tab 5: Forex & CurrencyLayer API */}
 {activeTab ==='forex'&& (
 <div className="space-y-6">
 <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-origin space-y-5">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
 <Coins className="h-5 w-5 text-amber-500"/>
 CurrencyLayer API Live Forex Configuration
 </h3>
 <Badge variant="primary"size="sm">
 {forexRates.provider}
 </Badge>
 </div>
 <p className="text-xs text-slate-600 mt-1">
 Connect your official <strong>CurrencyLayer (currencylayer.com)</strong> API access key for real-time daily currency conversions across SEF USA ($) and Indian (₹) donor flows.
 </p>
 </div>
 </div>

 {/* Current Rates Display */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
 <div className="text-center">
 <span className="text-[10px] text-slate-500 font-bold block">1 USD ($) Benchmark</span>
 <strong className="text-base font-black text-emerald-600">
 ₹{forexRates.INR.toFixed(2)} INR
 </strong>
 </div>
 <div className="text-center">
 <span className="text-[10px] text-slate-500 font-bold block">1 GBP (£)</span>
 <strong className="text-base font-black text-slate-800">
 ₹{forexRates.GBP ? (forexRates.INR / forexRates.GBP).toFixed(2) :'106.20'}
 </strong>
 </div>
 <div className="text-center">
 <span className="text-[10px] text-slate-500 font-bold block">1 EUR (€)</span>
 <strong className="text-base font-black text-slate-800">
 ₹{forexRates.EUR ? (forexRates.INR / forexRates.EUR).toFixed(2) :'91.30'}
 </strong>
 </div>
 <div className="text-center">
 <span className="text-[10px] text-slate-500 font-bold block">Live Provider Status</span>
 <Badge variant={forexRates.isLive ?'success':'warning'} size="sm">
 {forexRates.isLive ?'Live Active':'Offline Baseline'}
 </Badge>
 </div>
 </div>

 {/* API Key Form */}
 <div className="space-y-3 pt-2">
 <label className="block text-xs font-bold text-slate-700">
 CurrencyLayer Access Key (from currencylayer.com dashboard):
 </label>
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <input
 type="text"
 placeholder="e.g. 7a8b9c1d2e3f4g5h6i7j8k9l0m1n2o3p"
 value={currencyLayerKey}
 onChange={(e) => setCurrencyLayerKey(e.target.value)}
 className="flex-1 h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-sankara-500 w-full"
 />
 <Button
 variant="primary"
 size="sm"
 disabled={isTestingForex}
 onClick={handleSaveCurrencyLayerKey}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold h-10 px-5 shrink-0 w-full sm:w-auto"
 >
 {isTestingForex ?'Testing Connection...':'Save & Refresh Rates'}
 </Button>
 </div>
 <p className="text-[11px] text-slate-500">
 💡 If left blank, the system automatically uses the free resilient Open Exchange API and benchmark baseline (1 USD = ₹83.50).
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Add Hospital Modal */}
 {isHospModalOpen && (
 <Modal
 isOpen={isHospModalOpen}
 onClose={() => setIsHospModalOpen(false)}
 title="Add Hospital Branch"
 subtitle="Configure a new Sankara Eye Care hospital location in the network."
 maxWidth="lg"
 >
 <form onSubmit={handleSaveHospital} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Hospital City / Name *
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Coimbatore"
 value={hospForm.name}
 onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 State
 </label>
 <input
 type="text"
 value={hospForm.state}
 onChange={(e) => setHospForm({ ...hospForm, state: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Short Code
 </label>
 <input
 type="text"
 value={hospForm.code}
 onChange={(e) => setHospForm({ ...hospForm, code: e.target.value.toUpperCase() })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsHospModalOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-sankara-800 hover:bg-sankara-900">
 Save Hospital
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* Add Purpose Modal */}
 {isPurpModalOpen && (
 <Modal
 isOpen={isPurpModalOpen}
 onClose={() => setIsPurpModalOpen(false)}
 title="Add Sponsorship Purpose"
 subtitle="Define a new eye care program tariff."
 maxWidth="lg"
 >
 <form onSubmit={handleSavePurpose} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Purpose Name *
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Corneal Transplant"
 value={purpForm.name}
 onChange={(e) => setPurpForm({ ...purpForm, name: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Cost (USD $)
 </label>
 <input
 type="number"
 value={purpForm.costUsd}
 onChange={(e) => setPurpForm({ ...purpForm, costUsd: parseInt(e.target.value) || 50 })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Cost (INR ₹)
 </label>
 <input
 type="number"
 value={purpForm.costInr}
 onChange={(e) => setPurpForm({ ...purpForm, costInr: parseInt(e.target.value) || 3000 })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsPurpModalOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-sankara-800 hover:bg-sankara-900">
 Save Purpose
 </Button>
 </div>
 </form>
 </Modal>
 )}
 </div>
 );
};
