import React, { useState } from'react';
import { useApp } from'../context/AppContext';
import { Patient } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 ShieldCheck,
 CheckCircle2,
 XCircle,
 AlertTriangle,
 Eye,
 Camera,
 Search,
 Building2,
 Filter
} from'lucide-react';
import confetti from'canvas-confetti';

export const QualityAssuranceView: React.FC = () => {
 const { patients, selectedBranch, updateQAStatus } = useApp();

 const [searchQuery, setSearchQuery] = useState('');
 const [qaFilter, setQaFilter] = useState('All');
 const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

 const filteredPatients = patients.filter((p) => {
 const isMatched = p.matchStatus ==='Matched';
 const matchesBranch =
 selectedBranch ==='All Branches'||
 p.hospital.toLowerCase().includes(selectedBranch.toLowerCase());
 const matchesStatus = qaFilter ==='All'|| p.qaStatus === qaFilter;
 const matchesSearch =
 !searchQuery ||
 `${p.name} ${p.mrn} ${p.hospital} ${p.matchedDonorName}`
 .toLowerCase()
 .includes(searchQuery.toLowerCase());

 return isMatched && matchesBranch && matchesStatus && matchesSearch;
 });

 const handleApprove = (patientId: string) => {
 updateQAStatus(patientId,'Approved');
 confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
 if (selectedPatient?.id === patientId) {
 setSelectedPatient(null);
 }
 };

 const handleReject = (patientId: string) => {
 updateQAStatus(patientId,'Rejected');
 if (selectedPatient?.id === patientId) {
 setSelectedPatient(null);
 }
 };

 const handleRequestPhotos = (patientId: string) => {
 updateQAStatus(patientId,'Pending Photos');
 if (selectedPatient?.id === patientId) {
 setSelectedPatient(null);
 }
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <ShieldCheck className="h-6 w-6 text-sankara-800"/>
 Quality Assurance & Photo Audit Queue
 </h1>
 <p className="text-xs text-slate-700 mt-1">
 Review patient medical profiles, pre/post-operative photo quality, and sponsor allocations before dispatch.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <Badge variant="warning"size="md">
 {patients.filter((p) => p.qaStatus ==='Pending QA').length} Pending QA
 </Badge>
 <Badge variant="success"size="md">
 {patients.filter((p) => p.qaStatus ==='Approved').length} Approved
 </Badge>
 </div>
 </div>

 {/* Filter Bar */}
 <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-origin flex flex-wrap items-center gap-3">
 <div className="relative flex-1 min-w-[220px]">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"/>
 <input
 type="text"
 placeholder="Search patient, MRN, donor name, hospital..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-slate-100/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-700">QA Status:</span>
 <select
 value={qaFilter}
 onChange={(e) => setQaFilter(e.target.value)}
 className="h-9 px-3 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500 cursor-pointer"
 >
 <option value="All">All QA Statuses</option>
 <option value="Approved">Approved</option>
 <option value="Pending QA">Pending QA</option>
 <option value="Pending Photos">Pending Photos</option>
 <option value="Rejected">Rejected</option>
 </select>
 </div>
 </div>

 {/* QA Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredPatients.length === 0 ? (
 <div className="col-span-full py-12 text-center text-xs text-slate-700">
 No matched records found needing QA review.
 </div>
 ) : (
 filteredPatients.map((patient) => (
 <div
 key={patient.id}
 className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-origin flex flex-col justify-between"
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

 <Badge
 variant={
 patient.qaStatus ==='Approved'
 ?'success'
 : patient.qaStatus ==='Rejected'
 ?'danger'
 :'warning'
 }
 size="sm"
 dot
 >
 {patient.qaStatus}
 </Badge>
 </div>

 {/* Donor Link */}
 <div className="mt-3 p-2.5 rounded-xl bg-sankara-50 border border-sankara-100 text-xs">
 <span className="text-[10px] text-slate-700 block font-semibold">Matched Sponsor:</span>
 <span className="font-bold text-sankara-900">
 {patient.matchedDonorName}
 </span>
 </div>

 {/* Photos Review Thumbnail */}
 <div className="mt-3 grid grid-cols-2 gap-2">
 <div
 onClick={() => setSelectedPatient(patient)}
 className="cursor-pointer h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group"
 >
 {patient.preOpPhoto ? (
 <img
 src={patient.preOpPhoto}
 alt="Pre-op"
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-700">
 No Pre-Op
 </div>
 )}
 <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded">
 Pre-Op
 </span>
 </div>

 <div
 onClick={() => setSelectedPatient(patient)}
 className="cursor-pointer h-20 rounded-lg overflow-hidden border border-emerald-300 bg-slate-100 relative group"
 >
 {patient.postOpPhoto ? (
 <img
 src={patient.postOpPhoto}
 alt="Post-op"
 className="w-full h-full object-cover group-hover:scale-105 transition-transform"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-700">
 No Post-Op
 </div>
 )}
 <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] px-1 rounded">
 Post-Op
 </span>
 </div>
 </div>

 <div className="mt-3 text-xs text-slate-700 space-y-1">
 <p>Diagnosis: <strong className="text-slate-800">{patient.diagnosis}</strong></p>
 <p>Surgeon: <strong className="text-slate-800">{patient.surgeon}</strong></p>
 </div>
 </div>

 <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setSelectedPatient(patient)}
 className="text-xs h-7 px-2"
 >
 <Eye className="h-3 w-3 mr-1"/>
 Inspect
 </Button>

 <div className="flex items-center gap-1.5">
 <Button
 variant="danger"
 size="sm"
 onClick={() => handleReject(patient.id)}
 className="h-7 text-xs px-2"
 title="Reject"
 >
 <XCircle className="h-3.5 w-3.5"/>
 </Button>
 <Button
 variant="success"
 size="sm"
 onClick={() => handleApprove(patient.id)}
 className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700"
 title="Approve for Dispatch"
 >
 <CheckCircle2 className="h-3.5 w-3.5 mr-1"/>
 Approve
 </Button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* QA Inspection Modal */}
 {selectedPatient && (
 <Modal
 isOpen={!!selectedPatient}
 onClose={() => setSelectedPatient(null)}
 title={`QA Audit: ${selectedPatient.name}`}
 subtitle={`MRN: ${selectedPatient.mrn} • Hospital: ${selectedPatient.hospital}`}
 maxWidth="3xl"
 >
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col items-center">
 <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
 <img
 src={selectedPatient.preOpPhoto}
 alt="Pre-Op"
 className="w-full h-full object-cover"
 />
 </div>
 <span className="text-xs font-bold text-slate-700 mt-2">
 Pre-Operative Photo (Before)
 </span>
 <span className="text-[11px] text-slate-700">
 Vision: {selectedPatient.preOpVision}
 </span>
 </div>

 <div className="flex flex-col items-center">
 <div className="w-full h-56 rounded-xl overflow-hidden border border-emerald-300 bg-slate-100">
 <img
 src={selectedPatient.postOpPhoto}
 alt="Post-Op"
 className="w-full h-full object-cover"
 />
 </div>
 <span className="text-xs font-bold text-emerald-800 mt-2">
 Post-Operative Photo (After)
 </span>
 <span className="text-[11px] text-emerald-700 font-semibold">
 Vision: {selectedPatient.postOpVision}
 </span>
 </div>
 </div>

 <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs grid grid-cols-2 gap-3">
 <div>
 <span className="text-slate-700">Matched Sponsor:</span>
 <p className="font-bold text-slate-900">{selectedPatient.matchedDonorName}</p>
 </div>
 <div>
 <span className="text-slate-700">Surgery Type:</span>
 <p className="font-bold text-slate-900">{selectedPatient.surgeryType}</p>
 </div>
 <div>
 <span className="text-slate-700">Surgeon:</span>
 <p className="font-semibold text-slate-900">{selectedPatient.surgeon}</p>
 </div>
 <div>
 <span className="text-slate-700">Surgery Date:</span>
 <p className="font-semibold text-slate-900">{selectedPatient.surgeryDate}</p>
 </div>
 </div>

 <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleRequestPhotos(selectedPatient.id)}
 >
 Request Photo Revision
 </Button>
 <Button
 variant="danger"
 size="sm"
 onClick={() => handleReject(selectedPatient.id)}
 >
 Reject QA
 </Button>
 <Button
 variant="success"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4"/>}
 onClick={() => handleApprove(selectedPatient.id)}
 className="bg-emerald-600 hover:bg-emerald-700"
 >
 Approve for Donor Dispatch
 </Button>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
};
