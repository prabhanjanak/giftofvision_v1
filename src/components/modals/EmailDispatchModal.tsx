import React, { useState } from'react';
import { Patient, Donation } from'../../data/initialData';
import { Modal } from'../ui/Modal';
import { Button } from'../ui/Button';
import { Badge } from'../ui/Badge';
import {
 Mail,
 Send,
 CheckCircle2,
 FileCheck2,
 Eye,
 Building2,
 Sparkles,
 Paperclip,
 User,
 Heart
} from'lucide-react';
import confetti from'canvas-confetti';

interface EmailDispatchModalProps {
 patient: Patient;
 donation?: Donation | null;
 isOpen: boolean;
 onClose: () => void;
 onSendSuccess: (patientId: string) => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({
 patient,
 donation,
 isOpen,
 onClose,
 onSendSuccess
}) => {
 const [recipientEmail, setRecipientEmail] = useState(
 donation?.email ||'donor.sponsorship@sankaraeye.com'
 );
 const [subject, setSubject] = useState(
 `[Gift of Vision] Beneficiary Feedback Report & Certificate - ${patient.name} (${patient.mrn})`
 );
 const [isSending, setIsSending] = useState(false);
 const [isSent, setIsSent] = useState(false);

 const handleSendEmail = () => {
 setIsSending(true);

 setTimeout(() => {
 setIsSending(false);
 setIsSent(true);
 confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

 setTimeout(() => {
 onSendSuccess(patient.id);
 onClose();
 }, 1000);
 }, 700);
 };

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title="Dispatch Official Feedback Email to Sponsor"
 subtitle={`Delivering gratitude letter & photographic case sheet to ${donation?.donorName || patient.matchedDonorName}`}
 maxWidth="2xl"
 >
 <div className="space-y-5">
 {/* Email Header Fields */}
 <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
 <span className="text-slate-500 font-bold">To Sponsor:</span>
 <div className="sm:col-span-3">
 <input
 type="email"
 required
 value={recipientEmail}
 onChange={(e) => setRecipientEmail(e.target.value)}
 className="w-full h-8.5 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
 <span className="text-slate-500 font-bold">Subject:</span>
 <div className="sm:col-span-3">
 <input
 type="text"
 required
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 className="w-full h-8.5 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 pt-1 border-t border-slate-200">
 <span className="text-slate-500 font-bold">Attached PDF:</span>
 <div className="sm:col-span-3 flex items-center gap-2">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
 <Paperclip className="h-3 w-3"/>
 Certificate_{patient.mrn}.pdf (Verified Letterhead)
 </span>
 </div>
 </div>
 </div>

 {/* Rich Email Content Preview */}
 <div className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4">
 <div className="border-b border-slate-100 pb-3">
 <h4 className="text-sm font-black text-slate-900">
 Dear {donation?.donorName || patient.matchedDonorName ||'Honorable Sponsor'},
 </h4>
 <p className="text-xs text-slate-600 mt-1 leading-relaxed">
 Warm greetings from <strong>Sri Kanchi Kamakoti Medical Trust & Sankara Eye Foundation</strong>. We are delighted to inform you that because of your generous sponsorship, a free sight-restoring cataract surgery was successfully performed.
 </p>
 </div>

 {/* Mini Patient Case Sheet Box */}
 <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
 <div className="sm:col-span-2 space-y-1 text-xs">
 <p className="font-bold text-slate-900 text-sm">
 {patient.name} ({patient.age}y, {patient.gender})
 </p>
 <p className="text-slate-500 text-[11px]">
 MRN: <strong className="font-mono text-slate-700">{patient.mrn}</strong> • {patient.hospital}
 </p>
 <p className="text-slate-600 text-[11px]">
 Procedure: <strong>{patient.surgeryType}</strong>
 </p>
 <p className="text-emerald-700 font-bold text-[11px]">
 Visual Acuity Restored: {patient.preOpVision} ➔ {patient.postOpVision}
 </p>
 </div>

 <div className="flex items-center justify-end gap-2">
 <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
 <img
 src={patient.preOpPhoto}
 alt="Pre"
 className="h-full w-full object-cover"
 />
 </div>
 <div className="h-14 w-14 rounded-lg overflow-hidden border border-emerald-300 bg-slate-100">
 <img
 src={patient.postOpPhoto}
 alt="Post"
 className="h-full w-full object-cover"
 />
 </div>
 </div>
 </div>

 <p className="text-xs text-slate-500 italic">
"Your gift of vision has given {patient.name} a renewed sense of independence and dignity."
 </p>
 </div>

 {/* Action Controls */}
 <div className="flex items-center justify-between pt-3 border-t border-slate-200">
 <Button variant="outline"size="sm"onClick={onClose} disabled={isSending}>
 Cancel
 </Button>

 <Button
 variant="primary"
 size="sm"
 icon={isSent ? <CheckCircle2 className="h-4 w-4"/> : <Send className="h-4 w-4"/>}
 disabled={isSending || isSent}
 onClick={handleSendEmail}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold text-xs shadow-md"
 >
 {isSending ?'Sending via SMTP...': isSent ?'Email Dispatched!':'Transmit Email to Donor'}
 </Button>
 </div>
 </div>
 </Modal>
 );
};
