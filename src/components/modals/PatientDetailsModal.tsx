import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Donation } from '../../data/initialData';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FeedbackCertificate } from '../ui/FeedbackCertificate';
import {
  Users,
  Eye,
  Building2,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  Printer,
  FolderTree,
  Activity,
  MapPin,
  Briefcase,
  DollarSign,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface PatientDetailsModalProps {
  patient: Patient | null;
  matchedDonor?: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDonor?: (donor: Donation) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  matchedDonor,
  isOpen,
  onClose,
  onViewDonor
}) => {
  const { maskPatientName, maskPatientMrn, maskPatientVillage, maskPatientIncome, isUsaUser, isDpdpShieldActive } = useApp();
  const [showCertificate, setShowCertificate] = useState(false);

  if (!patient) return null;

 const folderDate = patient.surgeryDate || new Date().toISOString().slice(0, 10);
 const folderHospital = patient.hospital.replace(/\s+/g,'_');
 const cleanMrn = patient.mrn.replace(/[^a-zA-Z0-9_-]/g,'');
 const storagePath = `upload/${folderHospital}/${folderDate}/${cleanMrn}/`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Complete Beneficiary Clinical Case Sheet`}
      subtitle={`MRN: ${maskPatientMrn(patient.mrn)} • Sankara Eye Hospital, ${patient.hospital}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Header Card - Warm Orange Gradient */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full">
                Hospital Case Sheet
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
                {patient.hospital} Unit
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-100 text-[10px] font-black border border-emerald-300/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                DPDP Protected
              </span>
            </div>
            <h3 className="text-2xl font-black">{maskPatientName(patient.name)}</h3>
            <p className="text-xs text-orange-100 mt-0.5 font-medium">
              MRN ID: <strong className="font-mono text-white">{maskPatientMrn(patient.mrn)}</strong> • {patient.age} yrs • {patient.gender} • {maskPatientVillage(patient.village)}
            </p>
          </div>

          <div className="flex items-center">
            <Button
              variant="white"
              size="sm"
              icon={<FileCheck2 className="h-4 w-4 text-orange-600" />}
              onClick={() => setShowCertificate(true)}
              className="text-xs shadow-lg"
            >
              Generate Official Certificate
            </Button>
          </div>
        </div>

 {/* Pre-Op vs Post-Op Comparative Vault */}
 <div>
 <div className="flex items-center justify-between mb-2.5">
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
 <Sparkles className="h-4 w-4 text-sankara-600"/>
 Pre-Operative vs Post-Operative Photographic Evidence
 </h4>
 <Badge variant="success"size="sm">
 Clinical Acuity Gain: {patient.preOpVision} ➔ {patient.postOpVision}
 </Badge>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Pre-Op Card */}
 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
 <div className="relative h-52 rounded-xl overflow-hidden border border-slate-300 bg-slate-200">
 <img
 src={patient.preOpPhoto}
 alt="Pre-Op"
 className="w-full h-full object-cover"
 />
 <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-bold text-[10px]">
 PRE-OPERATIVE (BEFORE)
 </div>
 </div>
 <div className="mt-3 flex justify-between items-center text-xs">
 <span className="text-slate-500 font-medium">Pre-Op Visual Acuity:</span>
 <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
 {patient.preOpVision}
 </span>
 </div>
 </div>

 {/* Post-Op Card */}
 <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5">
 <div className="relative h-52 rounded-xl overflow-hidden border border-emerald-300 bg-slate-200">
 <img
 src={patient.postOpPhoto}
 alt="Post-Op"
 className="w-full h-full object-cover"
 />
 <div className="absolute top-2.5 left-2.5 bg-emerald-700 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-bold text-[10px]">
 POST-OPERATIVE (RESTORED)
 </div>
 </div>
 <div className="mt-3 flex justify-between items-center text-xs">
 <span className="text-slate-500 font-medium">Post-Op Visual Acuity:</span>
 <span className="font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-md">
 {patient.postOpVision}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Detailed Clinical & Demographics Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Clinical & Surgical Intervention */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
 <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
 <Activity className="h-3.5 w-3.5 text-sankara-700"/>
 Surgical & Clinical Specifications
 </h4>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Diagnosis:</span>
 <span className="font-bold text-slate-900">{patient.diagnosis}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Operated Eye:</span>
 <span className="font-bold text-sankara-800">{patient.eye}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Surgical Procedure:</span>
 <span className="font-semibold text-slate-800">{patient.surgeryType}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Surgery Date:</span>
 <span className="font-semibold text-slate-800">{patient.surgeryDate}</span>
 </div>

 <div className="flex justify-between py-1">
 <span className="text-slate-500">Operating Surgeon:</span>
 <span className="font-bold text-slate-900">{patient.surgeon}</span>
 </div>
 </div>

 {/* Demographics & Socio-Economic Profile */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
 <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
 <MapPin className="h-3.5 w-3.5 text-sankara-700"/>
 Beneficiary Background & Location
 </h4>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Village / Address:</span>
 <span className="font-bold text-slate-900">{maskPatientVillage(patient.village)}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Occupation:</span>
 <span className="font-semibold text-slate-800">{isUsaUser || isDpdpShieldActive ? 'Agricultural / Rural Laborer' : patient.occupation}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Annual Family Income:</span>
 <span className="font-semibold text-slate-800">{maskPatientIncome(patient.annualIncome)}</span>
 </div>

 <div className="flex justify-between py-1 border-b border-slate-200/50">
 <span className="text-slate-500">Hospital Base:</span>
 <span className="font-bold text-slate-900">{patient.hospital} Center</span>
 </div>

 <div className="flex justify-between py-1">
 <span className="text-slate-500">QA Audit Status:</span>
 <Badge variant={patient.qaStatus ==='Approved'?'success':'warning'} size="sm">
 {patient.qaStatus}
 </Badge>
 </div>
 </div>
 </div>

 {/* Server Storage Directory & Matched Sponsor */}
 <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
 <div className="flex items-center justify-between">
 <span className="font-bold text-slate-800 flex items-center gap-1.5">
 <FolderTree className="h-4 w-4 text-sankara-700"/>
 File System Storage Path:
 </span>
 <code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-sankara-900 font-bold">
 /{storagePath}
 </code>
 </div>

 <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
 <div>
 <span className="text-slate-500">Matched Sponsor: </span>
 {patient.matchedDonorName ? (
 <strong className="text-sankara-900 font-black text-sm">
 {patient.matchedDonorName}
 </strong>
 ) : (
 <span className="text-amber-600 font-semibold italic">Unallocated - Pending Matching</span>
 )}
 </div>

 {matchedDonor && onViewDonor && (
 <Button
 variant="outline"
 size="sm"
 icon={<HeartHandshake className="h-3.5 w-3.5"/>}
 onClick={() => onViewDonor(matchedDonor)}
 className="text-xs font-bold"
 >
 View Sponsor Details
 </Button>
 )}
 </div>
 </div>

 {/* Modal Action Footer */}
 <div className="flex items-center justify-between pt-4 border-t border-slate-200">
 <Button variant="outline"size="sm"onClick={onClose}>
 Close Case Sheet
 </Button>

 <Button
 variant="primary"
 size="sm"
 icon={<Printer className="h-4 w-4"/>}
 onClick={() => setShowCertificate(true)}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold"
 >
 Print Feedback Certificate
 </Button>
 </div>
 </div>

 {/* Official Certificate Overlay Modal */}
 {showCertificate && (
 <Modal
 isOpen={showCertificate}
 onClose={() => setShowCertificate(false)}
 title="Official Donor Feedback Certificate"
 subtitle="Sri Kanchi Kamakoti Medical Trust • Letterhead Format"
 maxWidth="3xl"
 >
 <FeedbackCertificate
 patient={patient}
 donation={matchedDonor || undefined}
 onClose={() => setShowCertificate(false)}
 />
 </Modal>
 )}
 </Modal>
 );
};
