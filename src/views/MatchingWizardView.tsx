import React, { useState, useMemo } from'react';
import { useApp } from'../context/AppContext';
import { Donation, Patient } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 GitMerge,
 Sparkles,
 Building2,
 Calendar,
 CheckCircle2,
 ArrowRight,
 Heart,
 Eye,
 Search,
 Filter,
 UserCheck,
 CheckSquare,
 Square,
 DollarSign,
 Coins,
 ShieldCheck,
 Zap,
 Layers,
 ArrowDownRight,
 HeartHandshake,
 Users2,
 Plus,
 FileText,
 Percent,
 Check
} from'lucide-react';
import confetti from'canvas-confetti';

export const MatchingWizardView: React.FC = () => {
 const {
 donations,
 patients,
 selectedBranch,
 matchMultiPatientsToDonor,
 poolDonorsForSurgery,
 autoMatchQueue,
 forexRates,
 setSelectedPatientDetails,
 setSelectedDonorDetails,
 showToast,
 maskPatientName,
 maskPatientMrn
 } = useApp();

 const [matchingMode, setMatchingMode] = useState<'standard'|'co_sponsorship'|'overall_ledger'>('standard');

 // Standard Mode: 1 Donor -> Multiple Patients
 const [selectedDonor, setSelectedDonor] = useState<Donation | null>(null);
 const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
 const [moveRemainderToGeneral, setMoveRemainderToGeneral] = useState<boolean>(true);

 // Co-Sponsorship Mode: Multiple Micro-Donors -> 1 Patient
 const [selectedPooledDonorIds, setSelectedPooledDonorIds] = useState<string[]>([]);
 const [selectedCoPatient, setSelectedCoPatient] = useState<Patient | null>(null);

 const [donorSearch, setDonorSearch] = useState('');
 const [patientSearch, setPatientSearch] = useState('');
 const [ledgerSearch, setLedgerSearch] = useState('');
 const [currencyFilter, setCurrencyFilter] = useState<'All'|'USD'|'INR'>('All');

 const unmatchedDonors = useMemo(() => {
 return donations.filter((d) => {
 const isUnmatched = d.status ==='Pending Match';
 const matchesBranch =
 selectedBranch ==='All Branches'||
 d.location.toLowerCase().includes(selectedBranch.toLowerCase()) ||
 d.location ==='Any';
 const matchesSearch =
 !donorSearch ||
 `${d.donorName} ${d.sefId} ${d.location} ${d.purpose} ${d.amount}`
 .toLowerCase()
 .includes(donorSearch.toLowerCase());

 const matchesCurrency =
 currencyFilter ==='All'
 ? true
 : currencyFilter ==='USD'
 ? d.amount.includes('$')
 : d.amount.includes('R') || d.amount.includes('₹');

 return isUnmatched && matchesBranch && matchesSearch && matchesCurrency;
 });
 }, [donations, selectedBranch, donorSearch, currencyFilter]);

 const availablePatients = useMemo(() => {
 return patients.filter((p) => {
 const isUnmatched = p.matchStatus ==='Pending Match';
 const matchesBranch =
 selectedBranch ==='All Branches'||
 p.hospital.toLowerCase().includes(selectedBranch.toLowerCase());
 const matchesSearch =
 !patientSearch ||
 `${p.name} ${p.mrn} ${p.hospital} ${p.diagnosis} ${p.surgeryType}`
 .toLowerCase()
 .includes(patientSearch.toLowerCase());

 return isUnmatched && matchesBranch && matchesSearch;
 });
 }, [patients, selectedBranch, patientSearch]);

 // Pricing calculations for standard mode
 const donorStats = useMemo(() => {
 if (!selectedDonor) return null;
 const rawNum = parseFloat(selectedDonor.amount.replace(/[^0-9.]/g,'')) || 0;
 const isInr = selectedDonor.amount.includes('R') || selectedDonor.amount.includes('₹');
 const symb = isInr ?'Rs.':'$';

    let unitCost = isInr ? 3000 : 30;
    if (selectedDonor.purpose.includes('Corneal') || selectedDonor.purpose.includes('Child') || selectedDonor.purpose.includes('Pediatric')) {
      unitCost = isInr ? 3000 : 100;
    } else if (selectedDonor.purpose.includes('Food') || selectedDonor.purpose.includes('Annadhanam')) {
      unitCost = isInr ? 10000 : 200;
    } else if (selectedDonor.purpose.includes('Eye Camp')) {
      unitCost = isInr ? 60000 : 1000;
    } else if (selectedDonor.purpose.includes('Endow') || selectedDonor.purpose.includes('Day')) {
      unitCost = isInr ? 180000 : 3000;
    }

 const maxSurgeries = Math.floor(rawNum / unitCost);
 const isPartial = rawNum < unitCost;
 const fundedPct = isPartial ? Math.round((rawNum / unitCost) * 100) : 100;
 const selectedCount = selectedPatientIds.length;
 const allocatedAmount = selectedCount * unitCost;
 const remainingAmount = Math.max(0, rawNum - allocatedAmount);

 return {
 rawNum,
 isInr,
 symb,
 unitCost,
 maxSurgeries,
 isPartial,
 fundedPct,
 selectedCount,
 allocatedAmount,
 remainingAmount
 };
 }, [selectedDonor, selectedPatientIds]);

 // Co-Sponsorship Pool Calculations
 const coPoolStats = useMemo(() => {
 const pooledDonors = donations.filter((d) => selectedPooledDonorIds.includes(d.id));
 let totalInr = 0;
 pooledDonors.forEach((d) => {
 const raw = parseFloat(d.amount.replace(/[^0-9.]/g,'')) || 0;
 if (d.amount.includes('$')) {
 totalInr += raw * (forexRates.INR || 83.50);
 } else {
 totalInr += raw;
 }
 });

 const targetCostInr = 3000;
 const fundedPct = Math.min(100, Math.round((totalInr / targetCostInr) * 100));
 const isTargetMet = totalInr >= targetCostInr;
 const deficitInr = Math.max(0, targetCostInr - totalInr);

 return {
 count: pooledDonors.length,
 totalInr: Math.round(totalInr),
 targetCostInr,
 fundedPct,
 isTargetMet,
 deficitInr
 };
 }, [selectedPooledDonorIds, donations, forexRates]);

 // Overall Master Allocation Ledger records
 const matchedLedgerRows = useMemo(() => {
 const rows: any[] = [];

 patients
 .filter((p) => p.matchStatus ==='Matched'&& p.matchedDonorName)
 .forEach((patient) => {
 const donor = donations.find((d) => d.id === patient.matchedDonorId);
 const rawAmount = donor ? parseFloat(donor.amount.replace(/[^0-9.]/g,'')) || 0 : 0;
 const isInr = donor ? donor.amount.includes('R') || donor.amount.includes('₹') : true;
 const symb = isInr ?'Rs.':'$';
 const unitCost = isInr ? 3500 : 50;

 let statement ='';
 let pct = 100;
 let isPartial = false;

 if (patient.matchedDonorName?.includes('Co-Sponsored') || patient.matchedDonorName?.includes('Co-Funded')) {
 isPartial = true;
 pct = rawAmount > 0 && rawAmount < unitCost ? Math.round((rawAmount / unitCost) * 100) : 45;
 statement = `Your contribution of ${donor?.amount ||'₹1,500'} has helped fund ${pct}% of ${patient.name}'s cataract surgery (Intraocular Lens & Pre-Op Diagnostics)`;
 } else if (rawAmount > unitCost * 2) {
 const count = Math.floor(rawAmount / unitCost);
 statement = `Funded 100% of ${count} Cataract Surgeries (${symb}${count * unitCost}) + Residual balance moved to General Usage Ledger`;
 } else {
 statement = `Funded 100% of ${patient.name}'s complete cataract surgery & post-op recovery`;
 }

 const matchesSearch =
 !ledgerSearch ||
 `${patient.name} ${patient.mrn} ${patient.matchedDonorName} ${patient.hospital} ${statement}`
 .toLowerCase()
 .includes(ledgerSearch.toLowerCase());

 if (matchesSearch) {
 rows.push({
 patient,
 donor,
 donorName: patient.matchedDonorName || donor?.donorName ||'Generous Donor',
 donorAmount: donor?.amount ||'₹3,500',
 sefId: donor?.sefId ||'SEF-MATCHED',
 patientName: patient.name,
 mrn: patient.mrn,
 hospital: patient.hospital,
 surgeryDate: patient.surgeryDate,
 statement,
 percentage: pct,
 isPartial
 });
 }
 });

 return rows;
 }, [patients, donations, ledgerSearch]);

 const handleTogglePatient = (patientId: string) => {
 setSelectedPatientIds((prev) =>
 prev.includes(patientId)
 ? prev.filter((id) => id !== patientId)
 : [...prev, patientId]
 );
 };

 const handleTogglePooledDonor = (donorId: string) => {
 setSelectedPooledDonorIds((prev) =>
 prev.includes(donorId)
 ? prev.filter((id) => id !== donorId)
 : [...prev, donorId]
 );
 };

 const handleSelectMaxForPool = () => {
 if (!donorStats) return;
 const maxToTake = Math.max(1, donorStats.maxSurgeries);
 const idsToSelect = availablePatients.slice(0, maxToTake).map((p) => p.id);
 setSelectedPatientIds(idsToSelect);
 };

 // Overall System Stats for Matching
 const matchingOverview = useMemo(() => {
 const totalDonors = donations.length;
 const unmatchedDonorsCount = donations.filter((d) => d.status === 'Pending Match').length;
 const matchedDonorsCount = donations.filter((d) => d.status === 'Matched').length;

 const totalPatients = patients.length;
 const waitingPatientsCount = patients.filter((p) => p.matchStatus === 'Pending Match').length;
 const matchedPatientsCount = patients.filter((p) => p.matchStatus === 'Matched').length;

 let unmatchedUsd = 0;
 let unmatchedInr = 0;
 donations
 .filter((d) => d.status === 'Pending Match')
 .forEach((d) => {
 const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
 if (d.amount.includes('$')) {
 unmatchedUsd += raw;
 } else {
 unmatchedInr += raw;
 }
 });

 const fx = forexRates.INR || 83.50;
 const totalUnmatchedInflowUsd = Math.round(unmatchedUsd + unmatchedInr / fx);
 const totalUnmatchedInflowInr = Math.round(unmatchedInr + unmatchedUsd * fx);

 const allocationRate = totalPatients > 0 ? Math.round((matchedPatientsCount / totalPatients) * 100) : 0;

 return {
 totalDonors,
 unmatchedDonorsCount,
 matchedDonorsCount,
 totalPatients,
 waitingPatientsCount,
 matchedPatientsCount,
 totalUnmatchedInflowUsd,
 totalUnmatchedInflowInr,
 allocationRate
 };
 }, [donations, patients, forexRates]);

 const [matchReportModal, setMatchReportModal] = useState<{
 isOpen: boolean;
 count: number;
 timestamp: string;
 }>({
 isOpen: false,
 count: 0,
 timestamp: ''
 });

 const handleAutoMatch = () => {
 const count = autoMatchQueue();
 if (count > 0) {
 confetti({
 particleCount: 120,
 spread: 85,
 origin: { y: 0.6 }
 });
 setMatchReportModal({
 isOpen: true,
 count,
 timestamp: new Date().toLocaleTimeString()
 });
 }
 };

 const handleConfirmMultiMatch = () => {
 if (!selectedDonor || selectedPatientIds.length === 0) return;

 matchMultiPatientsToDonor(
 selectedDonor.id,
 selectedPatientIds,
 moveRemainderToGeneral
 );

 confetti({
 particleCount: 80,
 spread: 70,
 origin: { y: 0.6 }
 });

 setSelectedDonor(null);
 setSelectedPatientIds([]);
 };

 const handleConfirmCoSponsorship = () => {
 if (selectedPooledDonorIds.length === 0 || !selectedCoPatient) return;

 poolDonorsForSurgery(selectedPooledDonorIds, selectedCoPatient.id);

 confetti({
 particleCount: 90,
 spread: 75,
 origin: { y: 0.6 }
 });

 setSelectedPooledDonorIds([]);
 setSelectedCoPatient(null);
 };

 return (
 <div className="space-y-6">
 {/* Studio Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <GitMerge className="h-6 w-6 text-orange-600"/>
 Matching & Allocation Studio
 </h1>
 <p className="text-xs text-slate-600 mt-1 font-medium">
 Pair sponsorships ($3000, $180) across patients, combine partial donations (e.g. ₹1,500 + ₹2,000), or run instant 1-click auto-matching.
 </p>
 </div>

 {/* Mode Selector */}
 <div className="flex flex-wrap items-center gap-1.5 bg-orange-50/80 p-1.5 rounded-2xl border border-orange-200">
 <button
 onClick={() => setMatchingMode('standard')}
 className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
 matchingMode ==='standard'
 ?'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
 :'text-slate-700 hover:text-orange-950'
 }`}
 >
 <Layers className="h-3.5 w-3.5"/>
 🎯 Manual Match (Direct 1-to-1 & Multi-Patient)
 </button>

 <button
 onClick={() => setMatchingMode('co_sponsorship')}
 className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
 matchingMode ==='co_sponsorship'
 ?'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
 :'text-slate-700 hover:text-orange-950'
 }`}
 >
 <HeartHandshake className="h-3.5 w-3.5 text-amber-200"/>
 🤝 Co-Sponsorship Pooling (Micro-Donors)
 </button>

 <button
 onClick={() => setMatchingMode('overall_ledger')}
 className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
 matchingMode ==='overall_ledger'
 ?'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
 :'text-slate-700 hover:text-orange-950'
 }`}
 >
 <FileText className="h-3.5 w-3.5 text-amber-200"/>
 📑 Allocation Ledger & Statement Audit ({matchedLedgerRows.length})
 </button>
 </div>
 </div>

 {/* 4 Real-time Live Matching KPI Stat Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Card 1: Unmatched Donors */}
 <div className="p-4 rounded-3xl bg-white border border-orange-200 shadow-sm flex flex-col justify-between">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unmatched Donors</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
 Pending Match
 </span>
 </div>
 <div className="mt-2">
 <p className="text-2xl font-black text-slate-900">{matchingOverview.unmatchedDonorsCount} Donors</p>
 <p className="text-xs text-orange-600 font-bold mt-0.5">
 ${matchingOverview.totalUnmatchedInflowUsd.toLocaleString()} USD (≈ ₹{(matchingOverview.totalUnmatchedInflowInr / 100000).toFixed(2)}L)
 </p>
 </div>
 <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
 <span>Branch Filter: {selectedBranch}</span>
 <span className="font-bold text-slate-700">{unmatchedDonors.length} in scope</span>
 </div>
 </div>

 {/* Card 2: Waiting Patients */}
 <div className="p-4 rounded-3xl bg-white border border-orange-200 shadow-sm flex flex-col justify-between">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Waiting Patients</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-200">
 Awaiting Donor
 </span>
 </div>
 <div className="mt-2">
 <p className="text-2xl font-black text-rose-600">{matchingOverview.waitingPatientsCount} Patients</p>
 <p className="text-xs text-slate-500 font-medium mt-0.5">
 Pre-Op Done & Awaiting Sponsorship
 </p>
 </div>
 <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
 <span>Branch Queue:</span>
 <span className="font-bold text-rose-600">{availablePatients.length} ready</span>
 </div>
 </div>

 {/* Card 3: Matched Cases */}
 <div className="p-4 rounded-3xl bg-white border border-orange-200 shadow-sm flex flex-col justify-between">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Matched Cases</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
 100% Linked
 </span>
 </div>
 <div className="mt-2">
 <p className="text-2xl font-black text-emerald-600">{matchingOverview.matchedPatientsCount} Surgeries</p>
 <p className="text-xs text-slate-500 font-medium mt-0.5">
 ${(matchingOverview.matchedPatientsCount * 50).toLocaleString()} USD Surgical Grants
 </p>
 </div>
 <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
 <span>Donors Paired:</span>
 <span className="font-bold text-emerald-700">{matchingOverview.matchedDonorsCount} Donors</span>
 </div>
 </div>

 {/* Card 4: Allocation Rate */}
 <div className="p-4 rounded-3xl bg-white border border-orange-200 shadow-sm flex flex-col justify-between">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allocation Rate</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
 Live Rate
 </span>
 </div>
 <div className="mt-2">
 <p className="text-2xl font-black text-slate-900">{matchingOverview.allocationRate}%</p>
 <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
 <div
 className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
 style={{ width: `${matchingOverview.allocationRate}%` }}
 />
 </div>
 </div>
 <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
 <span>Total Registered:</span>
 <span className="font-bold text-slate-700">{matchingOverview.totalPatients} Beneficiaries</span>
 </div>
 </div>
 </div>

 {/* Auto-Match Action Bar - High Contrast Bright Saffron Banner */}
 <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="h-11 w-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
 <Zap className="h-6 w-6 text-amber-200 animate-pulse" />
 </div>
 <div>
 <h3 className="font-black text-sm text-white flex items-center gap-2">
 Instant Auto-Match Engine
 <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
 Smart Algorithm
 </span>
 </h3>
 <p className="text-xs text-orange-50 font-medium">
 Automatically matches unmatched donors with waiting patients based on branch, splits multi-surgeries, and transfers remaining balance to General Usage!
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={handleAutoMatch}
 className="h-11 px-5 rounded-2xl bg-white hover:bg-orange-50 text-orange-950 font-black text-xs shadow-lg border border-orange-200 flex items-center gap-2.5 transition-all transform active:scale-95 shrink-0"
 >
 <Zap className="h-4 w-4 text-orange-600 fill-orange-500" />
 <span>Auto-Match Queue ({unmatchedDonors.length} Donors ➔ {availablePatients.length} Patients)</span>
 </button>
 </div>

 {/* Auto-Match Success Modal */}
 <Modal
 isOpen={matchReportModal.isOpen}
 onClose={() => setMatchReportModal((prev) => ({ ...prev, isOpen: false }))}
 title="✨ Auto-Matching Batch Completed!"
 maxWidth="md"
 >
 <div className="space-y-4">
 <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
 <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
 <div>
 <h4 className="font-black text-emerald-950 text-sm">
 Successfully Paired {matchReportModal.count} Beneficiaries!
 </h4>
 <p className="text-xs text-emerald-800 mt-1 font-medium">
 The smart engine matched available donations with waiting patients according to hospital unit preferences, split multi-surgery sponsorships, and moved any residual balances to the General Care Fund.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 text-center">
 <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
 <p className="text-[10px] uppercase font-bold text-orange-700">Surgeries Funded</p>
 <p className="text-xl font-black text-orange-900">{matchReportModal.count}</p>
 </div>
 <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
 <p className="text-[10px] uppercase font-bold text-slate-500">Processed At</p>
 <p className="text-sm font-black text-slate-800 mt-1">{matchReportModal.timestamp}</p>
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <Button
 variant="primary"
 size="sm"
 onClick={() => {
 setMatchReportModal((prev) => ({ ...prev, isOpen: false }));
 setMatchingMode('overall_ledger');
 }}
 >
 View Allocation Ledger
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setMatchReportModal((prev) => ({ ...prev, isOpen: false }))}
 >
 Close
 </Button>
 </div>
 </div>
 </Modal>

 {/* MODE 1: Standard & Multi-Patient Allocation Banner - Pure White & Orange Border */}
 {matchingMode ==='standard'&& selectedDonor && donorStats && (
 <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg border border-orange-300">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
 <div>
 <div className="flex items-center gap-2 mb-1">
 {donorStats.isPartial ? (
 <span className="text-[10px] uppercase tracking-wider font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
 Partial Co-Sponsorship ({donorStats.fundedPct}% of ₹{donorStats.unitCost})
 </span>
 ) : (
 <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2 py-0.5 rounded-full border border-orange-200">
 Full Sponsorship ({donorStats.maxSurgeries} Surgeries)
 </span>
 )}
 <span className="text-xs font-mono text-white font-bold">
 SEF ID: <strong>{selectedDonor.sefId}</strong>
 </span>
 <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
 {selectedDonor.location}
 </span>
 </div>
 <h2 className="text-xl font-black">{selectedDonor.donorName}</h2>
 <p className="text-xs text-orange-100 mt-0.5 font-medium">
 Purpose: <strong>{selectedDonor.purpose}</strong> • Cost per Surgery: <strong className="text-white">{donorStats.symb}{donorStats.unitCost}</strong>
 </p>
 </div>

 {/* Dynamic Math Countdown Box - White Inner Tiles */}
 <div className="flex flex-wrap items-center gap-2.5 bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
 <div className="text-center px-3.5 py-1.5 bg-white text-slate-900 rounded-xl shadow-sm">
 <p className="text-[10px] uppercase font-bold text-slate-500">Total Donation</p>
 <p className="text-base font-black text-orange-600">{selectedDonor.amount}</p>
 </div>

 <div className="text-center px-3.5 py-1.5 bg-white text-slate-900 rounded-xl shadow-sm">
 <p className="text-[10px] uppercase font-bold text-slate-500">Selected</p>
 <p className="text-base font-black text-slate-800">
 {donorStats.selectedCount} / {Math.max(1, donorStats.maxSurgeries)}
 </p>
 </div>

 <div className="text-center px-3.5 py-1.5 bg-white text-slate-900 rounded-xl shadow-sm">
 <p className="text-[10px] uppercase font-bold text-slate-500">Surgeries Cost</p>
 <p className="text-base font-black text-rose-600">
 -{donorStats.symb}{donorStats.allocatedAmount}
 </p>
 </div>

 <div className="text-center px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl shadow-sm">
 <p className="text-[10px] uppercase font-bold text-emerald-700">Remainder to Care</p>
 <p className="text-base font-black text-emerald-700">
 {donorStats.symb}{donorStats.remainingAmount}
 </p>
 </div>
 </div>
 </div>

 {/* Action Bar inside Banner */}
 <div className="mt-4 pt-4 border-t border-white/25 flex flex-wrap items-center justify-between gap-4 text-xs">
 <div className="flex items-center gap-3">
 <label className="flex items-center gap-2 cursor-pointer select-none">
 <input
 type="checkbox"
 checked={moveRemainderToGeneral}
 onChange={(e) => setMoveRemainderToGeneral(e.target.checked)}
 className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 bg-white border-white cursor-pointer"
 />
 <span className="text-xs font-bold text-white">
 Move remaining balance (<strong>{donorStats.symb}{donorStats.remainingAmount}</strong>) to General Usage & Patient Care Fund
 </span>
 </label>
 </div>

 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={handleSelectMaxForPool}
 className="bg-white/20 border-white/40 text-white hover:bg-white/30 text-xs font-black"
 >
 Auto-Select {Math.max(1, donorStats.maxSurgeries)} Patients
 </Button>

 <Button
 variant="white"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4 text-emerald-600"/>}
 disabled={selectedPatientIds.length === 0}
 onClick={handleConfirmMultiMatch}
 className="text-xs shadow-lg"
 >
 Confirm Allocation ({selectedPatientIds.length} Surgeries)
 </Button>
 </div>
 </div>
 </div>
 )}

 {/* MODE 2: Co-Sponsorship Pooling Banner */}
 {matchingMode ==='co_sponsorship'&& (
 <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg border border-orange-300">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
 Co-Sponsorship Pooling Engine
 </span>
 <span className="text-xs font-bold text-orange-50">
 Combined Total: <strong className="text-white font-black text-sm">₹{coPoolStats.totalInr.toLocaleString()}</strong> of ₹{coPoolStats.targetCostInr.toLocaleString()} Target
 </span>
 </div>
 <h2 className="text-xl font-black">
 {coPoolStats.count === 0
 ?'Select 2 or more Partial Donors to Pool'
 : `${coPoolStats.count} Co-Donors Selected (${coPoolStats.fundedPct}% Funded)`}
 </h2>
 <div className="w-full sm:w-80 h-2.5 bg-white/30 rounded-full mt-2 overflow-hidden border border-white/40">
 <div
 className="h-full bg-white transition-all duration-300 rounded-full"
 style={{ width: `${coPoolStats.fundedPct}%` }}
 />
 </div>
 </div>

 <div className="flex items-center gap-3">
 <Button
 variant="white"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4 text-orange-600"/>}
 disabled={!coPoolStats.isTargetMet || !selectedCoPatient}
 onClick={handleConfirmCoSponsorship}
 className="text-xs shadow-lg h-10 px-5"
 >
 Link & Complete Co-Sponsorship ({coPoolStats.count} Donors ➔ 1 Patient)
 </Button>
 </div>
 </div>
 </div>
 )}

 {/* MODE 3: 📑 Allocation Ledger & Statement Audit Panel - Pure White Theme */}
 {matchingMode ==='overall_ledger'&& (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
 <FileText className="h-5 w-5 text-orange-600"/>
 Overall Matched Patients & Contribution Statement Ledger
 </h3>
 <p className="text-xs text-slate-600 mt-0.5 font-medium">
 Shows exact surgical contribution breakdown (e.g. 42.8% partial support vs 100% full sponsorship) and residual general usage transfers.
 </p>
 </div>

 <div className="relative w-full sm:w-80">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500"/>
 <input
 type="text"
 placeholder="Search patient, donor, statement, hospital..."
 value={ledgerSearch}
 onChange={(e) => setLedgerSearch(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-orange-200 rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
 />
 </div>
 </div>

 <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-orange-50/70 border-b border-orange-200 text-[11px] font-black uppercase tracking-wider text-orange-950">
 <th className="py-3 px-4">Beneficiary Patient</th>
 <th className="py-3 px-4">Donor / Sponsor</th>
 <th className="py-3 px-4">Donation</th>
 <th className="py-3 px-4">Surgical Contribution Statement</th>
 <th className="py-3 px-4">Hospital & Date</th>
 <th className="py-3 px-4 text-right">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {matchedLedgerRows.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-12 text-center text-slate-600 font-medium">
 No matched allocations found. Click"Instant Auto-Match Engine"above to match the queue!
 </td>
 </tr>
 ) : (
 matchedLedgerRows.map((row, idx) => (
 <tr key={idx} className="hover:bg-orange-50/40 transition-colors">
 <td className="py-3.5 px-4">
 <strong className="font-extrabold text-slate-900 block text-sm">
 {maskPatientName(row.patientName)}
 </strong>
 <span className="font-mono text-[10px] text-slate-500">
 MRN: {maskPatientMrn(row.mrn)}
 </span>
 </td>

 <td className="py-3.5 px-4">
 <span className="font-bold text-slate-800 block">
 {row.donorName}
 </span>
 <span className="font-mono text-[10px] text-slate-500">
 {row.sefId}
 </span>
 </td>

 <td className="py-3.5 px-4">
 <span className="font-black text-sm text-orange-600">
 {row.donorAmount}
 </span>
 </td>

 <td className="py-3.5 px-4 max-w-md">
 <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-200/80 text-[11px]">
 {row.isPartial ? (
 <div className="flex items-start gap-1.5">
 <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-black text-[10px] shrink-0 border border-amber-300">
 {row.percentage}% Co-Funded
 </span>
 <span className="text-slate-800 font-medium">
 {row.statement}
 </span>
 </div>
 ) : (
 <div className="flex items-start gap-1.5">
 <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950 font-black text-[10px] shrink-0 border border-emerald-300">
 100% Full Surgery
 </span>
 <span className="text-slate-800 font-medium">
 {row.statement}
 </span>
 </div>
 )}
 </div>
 </td>

 <td className="py-3.5 px-4">
 <span className="font-bold text-slate-800 block">
 {row.hospital}
 </span>
 <span className="text-[10px] text-slate-500">
 {row.surgeryDate}
 </span>
 </td>

 <td className="py-3.5 px-4 text-right">
 <Button
 variant="outline"
 size="sm"
 icon={<Eye className="h-3.5 w-3.5 text-orange-600"/>}
 onClick={() => setSelectedPatientDetails(row.patient)}
 className="text-xs font-bold border-orange-200 hover:bg-orange-50"
 >
 Details
 </Button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Main Studio Grid (For Standard & Co-Sponsorship Modes) - Pure White Theme */}
 {matchingMode !=='overall_ledger'&& (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column: Donors (5 cols) */}
 <div className="lg:col-span-5 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
 <Heart className="h-4 w-4 text-rose-500"/>
 {matchingMode ==='standard'?'1. Select Sponsor Pool':'1. Check Donors to Pool'} ({unmatchedDonors.length})
 </h3>
 </div>

 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500"/>
 <input
 type="text"
 placeholder="Search donor name, SEF ID, amount..."
 value={donorSearch}
 onChange={(e) => setDonorSearch(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-orange-200 rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
 />
 </div>

 <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
 {unmatchedDonors.length === 0 ? (
 <div className="p-8 text-center text-xs text-slate-600 bg-white rounded-2xl border border-orange-100">
 No unmatched donors found for this filter.
 </div>
 ) : (
 unmatchedDonors.map((donor) => {
 const raw = parseFloat(donor.amount.replace(/[^0-9.]/g,'')) || 0;
 const isPartial = donor.amount.includes('R') ? raw < 3500 : raw < 50;
 const isSelected = matchingMode ==='standard'
 ? selectedDonor?.id === donor.id
 : selectedPooledDonorIds.includes(donor.id);

 return (
 <div
 key={donor.id}
 onClick={() => {
 if (matchingMode ==='standard') {
 setSelectedDonor(donor);
 setSelectedPatientIds([]);
 } else {
 handleTogglePooledDonor(donor.id);
 }
 }}
 className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-white ${
 isSelected
 ?'border-orange-500 bg-orange-50/90 shadow-md ring-2 ring-orange-500/20'
 :'border-orange-100 hover:border-orange-300'
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 {matchingMode ==='co_sponsorship'&& (
 isSelected ? (
 <CheckSquare className="h-4 w-4 text-orange-600 flex-shrink-0"/>
 ) : (
 <Square className="h-4 w-4 text-slate-400 flex-shrink-0"/>
 )
 )}
 <div>
 <h4 className="font-extrabold text-sm text-slate-900">
 {donor.donorName}
 </h4>
 <p className="font-mono text-[11px] font-semibold text-slate-600">
 {donor.sefId}
 </p>
 </div>
 </div>

 <div className="text-right">
 <span className="font-black text-base text-orange-600">
 {donor.amount}
 </span>
 {isPartial && (
 <span className="block text-[10px] font-extrabold text-amber-700">
 Partial (₹{raw} / ₹3,500)
 </span>
 )}
 </div>
 </div>

 <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-orange-100">
 <span className="truncate">{donor.purpose}</span>
 <span className="flex-shrink-0 font-medium">📍 {donor.location}</span>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* Right Column: Patients (7 cols) */}
 <div className="lg:col-span-7 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
 <UserCheck className="h-4 w-4 text-emerald-600"/>
 {matchingMode ==='standard'?'2. Select Patients to Benefit':'2. Select Patient for Co-Sponsorship'} ({availablePatients.length} Waiting)
 </h3>
 </div>

 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500"/>
 <input
 type="text"
 placeholder="Search patient name, MRN, procedure, hospital..."
 value={patientSearch}
 onChange={(e) => setPatientSearch(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-orange-200 rounded-xl text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
 {availablePatients.length === 0 ? (
 <div className="col-span-full p-8 text-center text-xs text-slate-600 bg-white rounded-2xl border border-orange-100">
 No unassigned patients waiting in registry.
 </div>
 ) : (
 availablePatients.map((patient) => {
 const isSelected = matchingMode ==='standard'
 ? selectedPatientIds.includes(patient.id)
 : selectedCoPatient?.id === patient.id;

 return (
 <div
 key={patient.id}
 onClick={() => {
 if (matchingMode ==='standard') {
 if (!selectedDonor) {
 showToast('Please select a donor sponsorship from the left column first!', 'warning');
 return;
 }
 handleTogglePatient(patient.id);
 } else {
 setSelectedCoPatient(patient);
 }
 }}
 className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between bg-white ${
 isSelected
 ?'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
 :'border-orange-100 hover:border-orange-300'
 }`}
 >
 <div>
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 {isSelected ? (
 <CheckSquare className="h-4 w-4 text-emerald-600 flex-shrink-0"/>
 ) : (
 <Square className="h-4 w-4 text-slate-400 flex-shrink-0"/>
 )}
 <div>
 <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
 {maskPatientName(patient.name)}
 </h4>
 <p className="font-mono text-[10px] text-slate-600">
 {maskPatientMrn(patient.mrn)}
 </p>
 </div>
 </div>

 <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 text-[10px] font-bold">
 {patient.hospital}
 </span>
 </div>

 <div className="mt-2.5 space-y-1 text-[11px] text-slate-700">
 <p className="truncate">
 Procedure: <strong>{patient.surgeryType}</strong>
 </p>
 <p className="text-emerald-700 font-bold">
 Acuity: {patient.preOpVision} ➔ {patient.postOpVision}
 </p>
 </div>
 </div>

 <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
 <span>{patient.surgeryDate}</span>
 <span className="font-bold text-orange-600">
 {patient.eye}
 </span>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
