import React from 'react';
import { useApp } from '../../context/AppContext';
import { Donation, Patient } from '../../data/initialData';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  HeartHandshake,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DonorDetailsModalProps {
  donation: Donation | null;
  matchedPatient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPatient?: (patient: Patient) => void;
  onOpenMatchWizard?: (donation: Donation) => void;
}

export const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({
  donation,
  matchedPatient,
  isOpen,
  onClose,
  onViewPatient,
  onOpenMatchWizard
}) => {
  const { maskPatientName, maskPatientMrn } = useApp();
  if (!donation) return null;

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title={`Donor Record: ${donation.donorName}`}
 subtitle={`SEF ID: ${donation.sefId} • Sponsorship Ref: ${donation.refId ||'N/A'}`}
 maxWidth="2xl"
 >
 <div className="space-y-6">
 {/* Top Header Card - Warm Orange Gradient */}
 <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full">
 Sponsorship Profile
 </span>
 <h3 className="text-xl font-black mt-1">{donation.donorName}</h3>
 <p className="text-xs text-orange-100 mt-0.5 font-medium">{donation.email ||'donor@sankaraeye.com'}</p>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-orange-100">Amount:</span>
 <span className="px-3.5 py-1.5 bg-white rounded-2xl font-black text-base text-orange-900 shadow-sm">
 {donation.amount}
 </span>
 </div>
 </div>
 </div>

 {/* Detailed Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Sponsorship Metadata */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
 <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
 Sponsorship Details
 </h4>

 <div className="flex justify-between">
 <span className="text-slate-500">SEF ID:</span>
 <span className="font-mono font-bold text-slate-800">{donation.sefId}</span>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Sponsorship Type:</span>
 <Badge variant={donation.type ==='Endowment'?'purple':'primary'} size="sm">
 {donation.type}
 </Badge>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Purpose Tariff:</span>
 <span className="font-bold text-slate-800">{donation.purpose}</span>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Hospital Branch:</span>
 <span className="font-bold text-sankara-800">{donation.location}</span>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Donation Date:</span>
 <span className="font-semibold text-slate-800">{donation.date}</span>
 </div>
 </div>

 {/* Allocation & Contact */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
 <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
 Allocation Status
 </h4>

 <div className="flex justify-between items-center">
 <span className="text-slate-500">Workflow Status:</span>
 <Badge
 variant={
 donation.status ==='Dispatched'
 ?'success'
 : donation.status ==='Matched'
 ?'primary'
 :'warning'
 }
 size="sm"
 dot
 >
 {donation.status}
 </Badge>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Entry Added By:</span>
 <span className="font-mono font-semibold text-slate-800">
 {donation.addedBy ||'kalamurali'}
 </span>
 </div>

 <div className="flex justify-between">
 <span className="text-slate-500">Creation Date:</span>
 <span className="font-semibold text-slate-800">
 {donation.creationDate ||'2026-08-25'}
 </span>
 </div>

 <div className="pt-2 border-t border-slate-200">
 <span className="text-slate-500 block mb-0.5">Special Dedication / Occasion:</span>
 <p className="text-slate-800 italic">
"{donation.specialRequest ||'General Gift of Vision Sponsorship for Cataract Surgery'}"
 </p>
 </div>
 </div>
 </div>

 {/* Matched Beneficiary Card */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-white">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <Eye className="h-4 w-4 text-emerald-600"/>
 <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
 Linked Patient Beneficiary
 </h4>
 </div>

 {matchedPatient && (
 <Badge variant="success"size="sm">
 Active Match
 </Badge>
 )}
 </div>

 {matchedPatient ? (
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
 <div className="flex items-center gap-3">
 <div className="h-12 w-12 rounded-xl overflow-hidden border border-emerald-300 bg-slate-200 flex-shrink-0">
 <img
 src={matchedPatient.postOpPhoto || matchedPatient.preOpPhoto}
 alt={matchedPatient.name}
 className="h-full w-full object-cover"
 />
 </div>
 <div>
 <h5 className="font-black text-sm text-slate-900">
 {maskPatientName(matchedPatient.name)}
 </h5>
 <p className="text-xs text-slate-500 font-mono">
 MRN: {maskPatientMrn(matchedPatient.mrn)} • {matchedPatient.hospital}
 </p>
 <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
 Vision Restored: {matchedPatient.preOpVision} ➔ {matchedPatient.postOpVision}
 </p>
 </div>
 </div>

 {onViewPatient && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => onViewPatient(matchedPatient)}
 className="text-xs font-bold"
 >
 View Patient Full Profile
 <ArrowRight className="h-3.5 w-3.5 ml-1"/>
 </Button>
 )}
 </div>
 ) : (
 <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
 <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-80"/>
 <p className="text-xs font-bold text-slate-800">
 No Beneficiary Linked Yet
 </p>
 <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
 This donation is currently waiting in the Today's Allocation queue.
 </p>
 {onOpenMatchWizard && (
 <Button
 variant="primary"
 size="sm"
 onClick={() => onOpenMatchWizard(donation)}
 className="bg-sankara-800 hover:bg-sankara-900 text-xs font-bold"
 >
 Open in Matching Wizard
 </Button>
 )}
 </div>
 )}
 </div>

 {/* Footer actions */}
 <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
 <Button variant="outline"size="sm"onClick={onClose}>
 Close
 </Button>
 </div>
 </div>
 </Modal>
 );
};
