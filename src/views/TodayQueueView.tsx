import React, { useState, useMemo } from'react';
import { useApp } from'../context/AppContext';
import { Donation, Patient } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 Inbox,
 Search,
 Filter,
 Download,
 Sparkles,
 GitMerge,
 Eye,
 CheckCircle2,
 Calendar,
 Building2,
 Heart,
 ChevronLeft,
 ChevronRight
} from'lucide-react';
import confetti from'canvas-confetti';
import * as XLSX from'xlsx';

export const TodayQueueView: React.FC = () => {
 const {
 donations,
 patients,
 purposes,
 hospitals,
 selectedBranch,
 globalSearch,
 matchDonorPatient,
 autoMatchQueue,
 setSelectedDonorDetails,
 setSelectedPatientDetails,
 setActiveTab
 } = useApp();

 const [searchQuery, setSearchQuery] = useState('');
 const [purposeFilter, setPurposeFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 15;

 // Manual Match Modal State
 const [matchingDonation, setMatchingDonation] = useState<Donation | null>(null);
 const [selectedPatientId, setSelectedPatientId] = useState<string>('');

 const [currencyFilter, setCurrencyFilter] = useState<'All'|'USD'|'INR'>('All');

 const filteredDonations = useMemo(() => {
 return donations.filter((d) => {
 const matchesBranch =
 selectedBranch ==='All Branches'||
 d.location.toLowerCase().includes(selectedBranch.toLowerCase()) ||
 d.location ==='Any';

 const matchesSearch =
 !searchQuery && !globalSearch
 ? true
 : `${d.donorName} ${d.sefId} ${d.purpose} ${d.location} ${d.amount}`
 .toLowerCase()
 .includes((searchQuery || globalSearch).toLowerCase());

 const matchesPurpose = purposeFilter ==='All'|| d.purpose === purposeFilter;
 const matchesStatus = statusFilter ==='All'|| d.status === statusFilter;

 const matchesCurrency =
 currencyFilter ==='All'
 ? true
 : currencyFilter ==='USD'
 ? d.amount.includes('$')
 : d.amount.includes('R') || d.amount.includes('₹');

 return matchesBranch && matchesSearch && matchesPurpose && matchesStatus && matchesCurrency;
 });
 }, [donations, selectedBranch, searchQuery, globalSearch, purposeFilter, statusFilter, currencyFilter]);

 const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
 const paginatedDonations = filteredDonations.slice(
 (currentPage - 1) * itemsPerPage,
 currentPage * itemsPerPage
 );

 const availablePatients = useMemo(() => {
 return patients.filter((p) => p.matchStatus ==='Pending Match');
 }, [patients]);

 const handleOpenMatchModal = (donation: Donation) => {
 setMatchingDonation(donation);
 const bestMatch = availablePatients.find(
 (p) =>
 donation.location ==='Any'||
 p.hospital.toLowerCase().includes(donation.location.toLowerCase()) ||
 donation.location.toLowerCase().includes(p.hospital.toLowerCase())
 ) || availablePatients[0];
 if (bestMatch) {
 setSelectedPatientId(bestMatch.id);
 }
 };

 const handleConfirmMatch = () => {
 if (matchingDonation && selectedPatientId) {
 matchDonorPatient(matchingDonation.id, selectedPatientId);
 confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
 setMatchingDonation(null);
 }
 };

 const handleExportExcel = () => {
 const ws = XLSX.utils.json_to_sheet(
 filteredDonations.map((d) => ({
'Donation ID': d.id,
'Donor Name': d.donorName,
'SEF ID': d.sefId,
 Amount: d.amount,
 Purpose: d.purpose,
 Date: d.date,
 Hospital: d.location,
 Status: d.status,
 Email: d.email,
'Special Request': d.specialRequest ||'',
'Matched Patient': d.matchedPatientName ||'N/A'
 }))
 );
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,'DonationQueue');
 XLSX.writeFile(wb, `GiftOfVision_Queue_${new Date().toISOString().slice(0, 10)}.xlsx`);
 };

 return (
 <div className="space-y-6">
 {/* Header & Controls */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <Inbox className="h-6 w-6 text-sankara-800"/>
 Today's Incoming Sponsorship Allocation
 </h1>
 <p className="text-xs text-slate-700 mt-1">
 Review incoming donor remittances (SEF USA & India) and assign operated patients deliberately.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2.5">
 <Button
 variant="outline"
 size="sm"
 icon={<Download className="h-4 w-4"/>}
 onClick={handleExportExcel}
 >
 Export Excel
 </Button>

 <Button
 variant="primary"
 size="sm"
 icon={<GitMerge className="h-4 w-4"/>}
 onClick={() => setActiveTab('matching_wizard')}
 className="bg-sankara-800 hover:bg-sankara-900"
 >
 Open Matching Studio
 </Button>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-wrap items-center gap-3">
 {/* Search */}
 <div className="relative flex-1 min-w-[200px]">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"/>
 <input
 type="text"
 placeholder="Search donor name, SEF ID, amount, location..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setCurrentPage(1);
 }}
 className="w-full h-9 pl-9 pr-3 text-xs bg-slate-100/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 {/* Currency / Remittance Type (USA / India) */}
 <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
 <button
 onClick={() => setCurrencyFilter('All')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
 currencyFilter ==='All'
 ?'bg-white shadow text-slate-900'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 All Streams
 </button>
 <button
 onClick={() => setCurrencyFilter('USD')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 currencyFilter ==='USD'
 ?'bg-sankara-800 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇺🇸 SEF USA ($)</span>
 </button>
 <button
 onClick={() => setCurrencyFilter('INR')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 currencyFilter ==='INR'
 ?'bg-sankara-800 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇮🇳 India (₹)</span>
 </button>
 </div>

 {/* Purpose Filter */}
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-700">Purpose:</span>
 <select
 value={purposeFilter}
 onChange={(e) => {
 setPurposeFilter(e.target.value);
 setCurrentPage(1);
 }}
 className="h-9 px-3 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500 cursor-pointer"
 >
 <option value="All">All Purposes</option>
 {purposes.map((p) => (
 <option key={p.id} value={p.name}>
 {p.name}
 </option>
 ))}
 </select>
 </div>

 {/* Status Filter */}
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-700">Status:</span>
 <select
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value);
 setCurrentPage(1);
 }}
 className="h-9 px-3 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500 cursor-pointer"
 >
 <option value="All">All Statuses</option>
 <option value="Pending Match">Pending Match</option>
 <option value="Matched">Matched</option>
 <option value="Dispatched">Dispatched</option>
 </select>
 </div>
 </div>

 {/* Data Table */}
 <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-origin">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-700">
 <th className="py-3.5 px-4">Donor Details</th>
 <th className="py-3.5 px-4">SEF ID</th>
 <th className="py-3.5 px-4">Amount</th>
 <th className="py-3.5 px-4">Purpose & Category</th>
 <th className="py-3.5 px-4">Target Hospital</th>
 <th className="py-3.5 px-4">Donation Date</th>
 <th className="py-3.5 px-4">Status & Linkage</th>
 <th className="py-3.5 px-4 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {paginatedDonations.length === 0 ? (
 <tr>
 <td colSpan={8} className="py-12 text-center text-slate-700">
 No sponsorships found matching your filter criteria.
 </td>
 </tr>
 ) : (
 paginatedDonations.map((donation) => (
 <tr
 key={donation.id}
 className="hover:bg-slate-50/80 transition-colors"
 >
 <td className="py-3 px-4">
 <button
 onClick={() => setSelectedDonorDetails(donation)}
 className="text-left font-bold text-slate-900 hover:text-sankara-800 transition-colors"
 >
 {donation.donorName}
 </button>
 {donation.specialRequest && (
 <div className="text-[11px] text-slate-700 truncate max-w-xs">
 {donation.specialRequest}
 </div>
 )}
 </td>

 <td className="py-3 px-4 font-mono font-semibold text-slate-700">
 {donation.sefId}
 </td>

 <td className="py-3 px-4">
 <span className="font-extrabold text-sankara-900 bg-sankara-50 px-2 py-0.5 rounded-lg border border-sankara-200/50">
 {donation.amount}
 </span>
 </td>

 <td className="py-3 px-4 font-medium text-slate-800">
 {donation.purpose}
 </td>

 <td className="py-3 px-4">
 <span className="inline-flex items-center gap-1 text-slate-700">
 <Building2 className="h-3 w-3 text-slate-700"/>
 {donation.location}
 </span>
 </td>

 <td className="py-3 px-4 text-slate-700">
 {donation.date}
 </td>

 <td className="py-3 px-4">
 <div className="space-y-1">
 <Badge
 variant={donation.status ==='Pending Match'?'warning':'success'}
 size="sm"
 dot
 >
 {donation.status}
 </Badge>
 {donation.matchedPatientName && (
 <button
 onClick={() => {
 const pat = patients.find(p => p.id === donation.matchedPatientId || p.name === donation.matchedPatientName);
 if (pat) setSelectedPatientDetails(pat);
 }}
 className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 block text-left"
 >
 ➔ {donation.matchedPatientName}
 </button>
 )}
 </div>
 </td>

 <td className="py-3 px-4 text-right">
 {donation.status ==='Pending Match'? (
 <Button
 variant="primary"
 size="sm"
 icon={<GitMerge className="h-3.5 w-3.5"/>}
 onClick={() => handleOpenMatchModal(donation)}
 className="h-7 text-xs px-2.5 bg-sankara-800 hover:bg-sankara-900"
 >
 Match
 </Button>
 ) : (
 <Badge variant="neutral"size="sm">
 Allocated
 </Badge>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Bar */}
 <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/50">
 <p className="text-xs text-slate-700">
 Showing {(currentPage - 1) * itemsPerPage + 1} to{''}
 {Math.min(currentPage * itemsPerPage, filteredDonations.length)} of{''}
 {filteredDonations.length} records
 </p>

 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 icon={<ChevronLeft className="h-3.5 w-3.5"/>}
 disabled={currentPage === 1}
 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
 >
 Previous
 </Button>
 <span className="text-xs font-semibold text-slate-700">
 Page {currentPage} of {totalPages}
 </span>
 <Button
 variant="outline"
 size="sm"
 disabled={currentPage === totalPages}
 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
 >
 Next
 <ChevronRight className="h-3.5 w-3.5 ml-1"/>
 </Button>
 </div>
 </div>
 </div>

 {/* Manual 1-Click Match Modal */}
 {matchingDonation && (
 <Modal
 isOpen={!!matchingDonation}
 onClose={() => setMatchingDonation(null)}
 title="Manual Donor-Patient Match"
 subtitle={`Assign an operated patient to sponsor: ${matchingDonation.donorName} (${matchingDonation.amount})`}
 maxWidth="2xl"
 >
 <div className="space-y-4">
 {/* Donor Summary */}
 <div className="rounded-xl bg-sankara-50 p-4 border border-sankara-100">
 <div className="flex justify-between items-center text-xs">
 <span className="font-bold text-sankara-950">
 {matchingDonation.donorName} ({matchingDonation.sefId})
 </span>
 <span className="font-extrabold text-sankara-800">
 {matchingDonation.amount} • {matchingDonation.purpose}
 </span>
 </div>
 <p className="text-[11px] text-slate-700 mt-1">
 Preferred Hospital: <strong>{matchingDonation.location}</strong> | Request: {matchingDonation.specialRequest ||'None'}
 </p>
 </div>

 {/* Select Available Patient */}
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5">
 Select Available Operated Patient ({availablePatients.length} in queue):
 </label>

 {availablePatients.length === 0 ? (
 <div className="p-4 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
 No unmatched operated patients available right now. Please register new patients first.
 </div>
 ) : (
 <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
 {availablePatients.map((patient) => {
 const isSelected = selectedPatientId === patient.id;
 const isBranchMatch =
 matchingDonation.location ==='Any'||
 patient.hospital.toLowerCase().includes(matchingDonation.location.toLowerCase());

 return (
 <div
 key={patient.id}
 onClick={() => setSelectedPatientId(patient.id)}
 className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
 isSelected
 ?'border-sankara-600 bg-sankara-50/80 shadow-sm'
 :'border-slate-200 hover:border-slate-300'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <input
 type="radio"
 name="patient-select"
 checked={isSelected}
 onChange={() => setSelectedPatientId(patient.id)}
 className="text-sankara-600 focus:ring-sankara-500"
 />
 <div>
 <span className="font-bold text-slate-900">
 {patient.name} ({patient.age}y, {patient.gender})
 </span>
 <span className="ml-2 font-mono text-[10px] text-slate-700">
 {patient.mrn}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {isBranchMatch && (
 <Badge variant="success"size="sm">
 Location Match
 </Badge>
 )}
 <span className="font-semibold text-slate-700">
 {patient.hospital}
 </span>
 </div>
 </div>

 <div className="mt-1.5 pl-6 text-[11px] text-slate-700 flex items-center justify-between">
 <span>
 {patient.eye} • {patient.surgeryType}
 </span>
 <span>Surgery: {patient.surgeryDate}</span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Modal Actions */}
 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"onClick={() => setMatchingDonation(null)}>
 Cancel
 </Button>
 <Button
 variant="primary"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4"/>}
 disabled={!selectedPatientId}
 onClick={handleConfirmMatch}
 className="bg-sankara-800 hover:bg-sankara-900"
 >
 Confirm Match & Link
 </Button>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
};
