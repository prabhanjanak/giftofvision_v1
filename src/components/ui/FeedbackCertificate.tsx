import React from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, Donation } from '../../data/initialData';
import { Button } from './Button';
import { Printer, Eye, Download, CheckCircle, Heart, Building2, Calendar, UserCheck, ShieldCheck } from 'lucide-react';

interface FeedbackCertificateProps {
  patient: Patient;
  donation?: Donation;
  onClose?: () => void;
}

export const FeedbackCertificate: React.FC<FeedbackCertificateProps> = ({
  patient,
  donation,
  onClose
}) => {
  const { maskPatientName, maskPatientMrn, isUsaUser, isDpdpShieldActive } = useApp();
  const handlePrint = () => {
    window.print();
  };

 return (
 <div className="flex flex-col gap-5">
 {/* Action Bar */}
 <div className="flex items-center justify-between no-print bg-slate-50 p-3 rounded-xl border border-slate-200">
 <div className="flex items-center gap-2">
 <span className="flex h-2 w-2 rounded-full bg-emerald-500"/>
 <span className="text-xs font-semibold text-slate-700">
 Sponsorship Report Ready for Dispatch
 </span>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="primary"size="sm"icon={<Printer className="h-4 w-4"/>} onClick={handlePrint}>
 Print / Save as PDF
 </Button>
 {onClose && (
 <Button variant="outline"size="sm"onClick={onClose}>
 Close
 </Button>
 )}
 </div>
 </div>

 {/* Printable Certificate Body */}
 <div
 id="printable-certificate"
 className="relative bg-white text-slate-900 border-2 border-slate-200 rounded-2xl p-8 sm:p-10 shadow-origin-xl print:border-none print:shadow-none print:p-0"
 >
 {/* Decorative Top Border */}
 <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sankara-800 via-sky-600 to-emerald-600 rounded-t-2xl print:rounded-none"/>

 {/* Header with Authentic Trust Letterhead */}
 <div className="border-b border-slate-200 pb-4 mb-6">
 <img
 src="/images/letterhead.jpg"
 alt="Sri Kanchi Kamakoti Medical Trust - Sankara Eye Hospital"
 className="w-full h-auto max-h-24 object-contain rounded-lg"
 />
 </div>

 {/* Dedication Banner */}
 <div className="my-5 rounded-xl bg-gradient-to-br from-sankara-50 to-sky-50/50 p-5 border border-sankara-100/80">
 <div className="flex items-center gap-2 text-sankara-900 font-bold text-sm">
 <Heart className="h-4 w-4 text-rose-500 fill-rose-500"/>
 <span>Dedicated with Gratitude To:</span>
 </div>
 <h2 className="text-xl font-extrabold text-sankara-950 mt-1">
 {patient.matchedDonorName || donation?.donorName ||'Honorable Sponsor'}
 </h2>
 <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-700 font-medium">
 <span>SEF ID: <strong className="text-slate-900">{donation?.sefId ||'SEF-490812'}</strong></span>
 <span>Purpose: <strong className="text-slate-900">{donation?.purpose ||'Free Cataract Surgery'}</strong></span>
 <span>Hospital Branch: <strong className="text-slate-900">{patient.hospital}</strong></span>
 <span>Occasion / Dedication: <strong className="text-slate-900">{donation?.specialRequest ||'Gift of Sight Blessings'}</strong></span>
 </div>
 </div>

 {/* Patient Details & Photographs Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
 {/* Patient Info Card */}
 <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between">
 <div>
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
 <UserCheck className="h-4 w-4 text-sankara-700"/>
 Patient Medical Profile
 </h3>
 <div className="space-y-2.5 text-xs text-slate-700">
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Patient Beneficiary:</span>
 <span className="font-bold text-slate-900">{maskPatientName(patient.name)}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Age & Gender:</span>
 <span className="font-semibold text-slate-900">{patient.age} yrs • {patient.gender}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">MRN / Hospital ID:</span>
 <span className="font-mono font-semibold text-slate-900">{maskPatientMrn(patient.mrn)}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Operated Eye:</span>
 <span className="font-semibold text-sankara-800">{patient.eye}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Diagnosis:</span>
 <span className="font-semibold text-slate-900">{patient.diagnosis}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Surgical Procedure:</span>
 <span className="font-semibold text-slate-900">{patient.surgeryType}</span>
 </div>
 <div className="flex justify-between py-1 border-b border-slate-200/60">
 <span className="text-slate-700">Surgery Date:</span>
 <span className="font-semibold text-slate-900">{patient.surgeryDate}</span>
 </div>
 <div className="flex justify-between py-1">
 <span className="text-slate-700">Operating Surgeon:</span>
 <span className="font-bold text-sankara-900">{patient.surgeon}</span>
 </div>
 </div>
 </div>

 <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
 <div className="flex justify-between items-center">
 <span className="text-emerald-800 font-bold">Visual Acuity Outcome:</span>
 <span className="font-extrabold text-emerald-900">
 {patient.preOpVision} ➔ {patient.postOpVision}
 </span>
 </div>
 </div>
 </div>

 {/* Photographic Evidence Card */}
 <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between">
 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
 <Eye className="h-4 w-4 text-sankara-700"/>
 Photographic Evidence
 </h3>

 <div className="grid grid-cols-2 gap-3">
 <div className="flex flex-col items-center">
 <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 relative">
 {patient.preOpPhoto ? (
 <img
 src={patient.preOpPhoto}
 alt="Pre-operative"
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-xs text-slate-700">
 Pre-op Photo
 </div>
 )}
 <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
 Pre-Op
 </span>
 </div>
 <span className="text-[11px] font-semibold text-slate-700 mt-1.5">Before Surgery</span>
 </div>

 <div className="flex flex-col items-center">
 <div className="w-full h-36 rounded-lg overflow-hidden border border-emerald-300 bg-slate-200 relative">
 {patient.postOpPhoto ? (
 <img
 src={patient.postOpPhoto}
 alt="Post-operative"
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-xs text-slate-700">
 Post-op Photo
 </div>
 )}
 <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
 Post-Op
 </span>
 </div>
 <span className="text-[11px] font-semibold text-emerald-800 mt-1.5">Restored Vision</span>
 </div>
 </div>

 <p className="mt-3 text-[11px] text-center text-slate-700 italic">
"Because of your compassionate support, {maskPatientName(patient.name)} has regained clear sight and returned to an independent livelihood."
 </p>
 </div>
 </div>

 {/* Footer & Authority Signatures */}
 <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-6">
 <div className="text-center sm:text-left">
 <p className="font-bold text-slate-800">Sankara Eye Foundation India & USA</p>
 <p className="text-[11px] text-slate-700">80G / 501(c)(3) Recognized Non-Profit Charitable Trust</p>
 <p className="text-[11px] text-slate-700">Web: www.giftofvision.in • Email: info@giftofvision.in</p>
 </div>

 <div className="flex items-center gap-8 text-center">
 <div>
 <div className="h-12 flex items-center justify-center pb-1">
 <img
 src="/images/rvr-sign_copy.jpg"
 alt="Dr. R.V. Ramani Signature"
 className="h-10 w-auto object-contain"
 />
 </div>
 <p className="text-[10px] font-semibold text-slate-700 mt-1">Founder & Managing Trustee</p>
 </div>

 <div>
 <div className="h-12 border-b border-dashed border-slate-400 w-28 mx-auto flex items-end justify-center pb-1">
 <span className="font-serif italic text-slate-800 text-xs">{patient.surgeon}</span>
 </div>
 <p className="text-[10px] font-semibold text-slate-700 mt-1">Operating Surgeon & Superintendent</p>
 </div>
 </div>
 </div>

 {/* DPDP Act 2023 Compliance & Consent Footnote */}
 <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
   <span>🛡️ Protected Health Information (PHI) processed in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.</span>
   <span className="font-mono">Consent Ref: {patient.dpdpConsent?.consentRef || 'DPDP-2023-VERIFIED'}</span>
 </div>
 </div>
 </div>
 );
};
