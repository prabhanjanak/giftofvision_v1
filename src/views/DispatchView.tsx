import React, { useState, useMemo } from'react';
import { useApp } from'../context/AppContext';
import { Patient, Donation } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import { FeedbackCertificate } from'../components/ui/FeedbackCertificate';
import { EmailDispatchModal } from'../components/modals/EmailDispatchModal';
import {
 Send,
 Printer,
 Eye,
 CheckCircle,
 Mail,
 Download,
 Search,
 Building2,
 Calendar,
 Sparkles,
 HeartHandshake
} from'lucide-react';
import confetti from'canvas-confetti';

export const DispatchView: React.FC = () => {
 const {
 patients,
 donations,
 selectedBranch,
 markDispatched,
 showToast
 } = useApp();

 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('All');
 const [streamFilter, setStreamFilter] = useState<'All'|'USD'|'INR'>('All');
 const [certificatePatient, setCertificatePatient] = useState<Patient | null>(null);
 const [emailPatient, setEmailPatient] = useState<Patient | null>(null);

 const dispatchRecords = useMemo(() => {
 return patients.filter((p) => {
 const isMatched = p.matchStatus ==='Matched';
 const matchesBranch =
 selectedBranch ==='All Branches'||
 p.hospital.toLowerCase().includes(selectedBranch.toLowerCase());
 const matchesStatus =
 statusFilter ==='All'|| p.dispatchStatus === statusFilter;
 const matchesSearch =
 !searchQuery ||
 `${p.name} ${p.mrn} ${p.matchedDonorName} ${p.hospital}`
 .toLowerCase()
 .includes(searchQuery.toLowerCase());

 const donation = donations.find((d) => d.id === p.matchedDonorId);
 const matchesStream =
 streamFilter ==='All'
 ? true
 : streamFilter ==='USD'
 ? (donation ? donation.amount.includes('$') : true)
 : (donation ? donation.amount.includes('R') || donation.amount.includes('₹') : false);

 return isMatched && matchesBranch && matchesStatus && matchesSearch && matchesStream;
 });
 }, [patients, donations, selectedBranch, statusFilter, searchQuery, streamFilter]);

 const handleBulkDispatchUsa = () => {
 const pendingUsa = dispatchRecords.filter(
 (p) => p.dispatchStatus ==='Ready for Dispatch'
 );
 if (pendingUsa.length === 0) {
 showToast('All USA matched records are already dispatched!');
 return;
 }

 pendingUsa.forEach((p) => markDispatched(p.id));
 confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
 showToast(`Successfully dispatched ${pendingUsa.length} feedback letters to SEF USA sponsors!`);
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <Send className="h-6 w-6 text-sankara-800"/>
 Dispatch & Donor Feedback Letter Hub
 </h1>
 <p className="text-xs text-slate-700 mt-1">
 Deliver personalized beneficiary reports, pre/post-op photos, and gratitude letters to SEF USA & Indian sponsors.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2.5">
 <Button
 variant="primary"
 size="sm"
 icon={<Mail className="h-4 w-4"/>}
 onClick={handleBulkDispatchUsa}
 className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-sm"
 >
 Transmit All Ready Emails
 </Button>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-wrap items-center gap-3">
 <div className="relative flex-1 min-w-[200px]">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"/>
 <input
 type="text"
 placeholder="Search patient, sponsor name, MRN..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-slate-100/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 {/* Currency / Stream Selector */}
 <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
 <button
 onClick={() => setStreamFilter('All')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
 streamFilter ==='All'
 ?'bg-white shadow text-slate-900'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 All Sponsors
 </button>
 <button
 onClick={() => setStreamFilter('USD')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 streamFilter ==='USD'
 ?'bg-sankara-800 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇺🇸 SEF USA ($)</span>
 </button>
 <button
 onClick={() => setStreamFilter('INR')}
 className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
 streamFilter ==='INR'
 ?'bg-sankara-800 text-white shadow'
 :'text-slate-600 hover:text-slate-900'
 }`}
 >
 <span>🇮🇳 India (₹)</span>
 </button>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-700">Dispatch Status:</span>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="h-9 px-3 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500 cursor-pointer"
 >
 <option value="All">All Statuses</option>
 <option value="Ready for Dispatch">Ready for Dispatch</option>
 <option value="Dispatched">Already Dispatched</option>
 </select>
 </div>
 </div>

 {/* Dispatch Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {dispatchRecords.length === 0 ? (
 <div className="col-span-full py-12 text-center text-xs text-slate-700">
 No records found matching your filter criteria.
 </div>
 ) : (
 dispatchRecords.map((patient) => {
 const donation = donations.find((d) => d.id === patient.matchedDonorId);
 const isReady = patient.dispatchStatus ==='Ready for Dispatch';

 return (
 <div
 key={patient.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-origin flex flex-col justify-between group"
 >
 <div>
 <div className="flex items-start justify-between">
 <div>
 <h3 className="font-extrabold text-sm text-slate-900">
 {patient.name}
 </h3>
 <p className="font-mono text-[11px] font-semibold text-slate-700">
 {patient.mrn} • {patient.hospital}
 </p>
 </div>

 <Badge variant={isReady ?'warning':'success'} size="sm"dot>
 {patient.dispatchStatus}
 </Badge>
 </div>

 {/* Pre/Post Photos Preview */}
 <div className="mt-3.5 grid grid-cols-2 gap-2.5">
 <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
 <img
 src={patient.preOpPhoto}
 alt="Pre"
 className="h-full w-full object-cover"
 />
 <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-semibold">
 Pre-Op
 </span>
 </div>

 <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-300 bg-slate-100">
 <img
 src={patient.postOpPhoto}
 alt="Post"
 className="h-full w-full object-cover"
 />
 <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] px-1 py-0.5 rounded font-semibold">
 Post-Op
 </span>
 </div>
 </div>

 {/* Matched Sponsor Box */}
 <div className="mt-3.5 p-3 rounded-xl bg-sankara-50/70 border border-sankara-100 text-xs space-y-1">
 <div className="flex justify-between items-center">
 <span className="text-slate-500 font-medium">Sponsor:</span>
 <strong className="text-sankara-950 font-bold truncate max-w-[150px]">
 {donation?.donorName || patient.matchedDonorName}
 </strong>
 </div>

 <div className="flex justify-between items-center">
 <span className="text-slate-500 font-medium">SEF ID / Amount:</span>
 <span className="font-mono font-semibold text-slate-800">
 {donation?.sefId ||'SEF-490812'} ({donation?.amount ||'$50'})
 </span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
 <Button
 variant="outline"
 size="sm"
 icon={<Printer className="h-3.5 w-3.5"/>}
 onClick={() => setCertificatePatient(patient)}
 className="text-xs font-bold"
 >
 Certificate
 </Button>

 <Button
 variant="primary"
 size="sm"
 icon={<Mail className="h-3.5 w-3.5"/>}
 onClick={() => setEmailPatient(patient)}
 className="bg-sankara-800 hover:bg-sankara-900 text-xs font-bold"
 >
 Send Email
 </Button>
 </div>
 </div>
 );
 })
 )}
 </div>

 {/* Certificate Modal */}
 {certificatePatient && (
 <Modal
 isOpen={!!certificatePatient}
 onClose={() => setCertificatePatient(null)}
 title="Official Donor Feedback Certificate"
 subtitle="Sri Kanchi Kamakoti Medical Trust • Letterhead Format"
 maxWidth="3xl"
 >
 <FeedbackCertificate
 patient={certificatePatient}
 donation={donations.find((d) => d.id === certificatePatient.matchedDonorId)}
 onClose={() => setCertificatePatient(null)}
 />
 </Modal>
 )}

 {/* Email Dispatch Modal */}
 {emailPatient && (
 <EmailDispatchModal
 patient={emailPatient}
 donation={donations.find((d) => d.id === emailPatient.matchedDonorId)}
 isOpen={!!emailPatient}
 onClose={() => setEmailPatient(null)}
 onSendSuccess={(pId) => {
 markDispatched(pId);
 showToast(`Feedback report successfully transmitted to sponsor!`);
 }}
 />
 )}
 </div>
 );
};
