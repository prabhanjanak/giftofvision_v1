import React, { useState, useRef } from'react';
import { useApp } from'../../context/AppContext';
import { Patient } from'../../data/initialData';
import { Modal } from'../ui/Modal';
import { Button } from'../ui/Button';
import { Badge } from'../ui/Badge';
import {
 Camera,
 Upload,
 Eye,
 CheckCircle2,
 FolderTree,
 Building2,
 Calendar,
 X,
 FileImage,
 Sparkles
} from'lucide-react';

interface PatientPhotoUploadModalProps {
 patient: Patient;
 isOpen: boolean;
 onClose: () => void;
}

export const PatientPhotoUploadModal: React.FC<PatientPhotoUploadModalProps> = ({
 patient,
 isOpen,
 onClose
}) => {
 const { updatePatient, showToast } = useApp();

 const [preOpPreview, setPreOpPreview] = useState<string>(patient.preOpPhoto ||'');
 const [postOpPreview, setPostOpPreview] = useState<string>(patient.postOpPhoto ||'');

 const preInputRef = useRef<HTMLInputElement>(null);
 const postInputRef = useRef<HTMLInputElement>(null);

 // Structured folder path according to Unit / Hospital & Surgery Date
 const folderDate = patient.surgeryDate || new Date().toISOString().slice(0, 10);
 const folderHospital = patient.hospital.replace(/\s+/g,'_');
 const cleanMrn = patient.mrn.replace(/[^a-zA-Z0-9_-]/g,'');

 const structuredStorageFolder = `upload/${folderHospital}/${folderDate}/${cleanMrn}`;
 const preOpFilename = `${cleanMrn}_pre_op.jpg`;
 const postOpFilename = `${cleanMrn}_post_op.jpg`;

 const handleFileSelect = (
 e: React.ChangeEvent<HTMLInputElement>,
 type:'pre'|'post'
 ) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = (evt) => {
 const dataUrl = evt.target?.result as string;
 if (type ==='pre') {
 setPreOpPreview(dataUrl);
 } else {
 setPostOpPreview(dataUrl);
 }
 };
 reader.readAsDataURL(file);
 };

 const handleSavePhotos = () => {
 const isBothUploaded = Boolean(preOpPreview && postOpPreview);
 updatePatient(patient.id, {
 preOpPhoto: preOpPreview,
 postOpPhoto: postOpPreview,
 photoStatus: isBothUploaded ?'Uploaded':'Pending Upload',
 qaStatus: isBothUploaded && patient.qaStatus ==='Pending Photos'?'Pending QA': patient.qaStatus
 });

 showToast(`Photos updated and saved to ${structuredStorageFolder}/`);
 onClose();
 };

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title={`Upload Clinical Photos - ${patient.name}`}
 subtitle={`MRN: ${patient.mrn} • Unit: ${patient.hospital} • Surgery Date: ${patient.surgeryDate}`}
 maxWidth="2xl"
 >
 <div className="space-y-6">
 {/* Structured Directory Path Banner */}
 <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
 <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
 <FolderTree className="h-4 w-4 text-sankara-700"/>
 <span>Target Folder Hierarchy (Unit / Date / MRN):</span>
 </div>
 <div className="mt-1.5 flex items-center gap-2">
 <code className="text-[11px] font-mono bg-white px-2.5 py-1 rounded border border-slate-200 text-sankara-900 font-semibold truncate flex-1">
 /{structuredStorageFolder}/
 </code>
 <Badge variant="primary"size="sm">
 Auto-Indexed
 </Badge>
 </div>
 </div>

 {/* 2-Column Photo Upload Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Pre-Op Photo Box */}
 <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 flex flex-col items-center justify-between min-h-[260px] text-center">
 <input
 ref={preInputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => handleFileSelect(e,'pre')}
 />

 <div className="w-full flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
 <Camera className="h-3.5 w-3.5 text-amber-600"/>
 Pre-Op (Before)
 </span>
 {preOpPreview && (
 <Badge variant="success"size="sm">
 Loaded
 </Badge>
 )}
 </div>

 {preOpPreview ? (
 <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
 <img
 src={preOpPreview}
 alt="Pre-Op Preview"
 className="w-full h-full object-cover"
 />
 <button
 onClick={() => preInputRef.current?.click()}
 className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity gap-1.5"
 >
 <Upload className="h-4 w-4"/>
 Change Photo
 </button>
 </div>
 ) : (
 <div
 onClick={() => preInputRef.current?.click()}
 className="w-full h-40 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center p-4 cursor-pointer hover:border-sankara-500 transition-colors group"
 >
 <FileImage className="h-8 w-8 text-slate-400 group-hover:text-sankara-600 mb-1.5 transition-colors"/>
 <p className="text-xs font-bold text-slate-700">
 Select Pre-Op Photo
 </p>
 <p className="text-[10px] text-slate-500 font-mono mt-0.5">
 {preOpFilename}
 </p>
 </div>
 )}

 <div className="mt-2 text-[10px] text-slate-500 text-left w-full">
 Shows cataracts / corneal opacity prior to surgical intervention.
 </div>
 </div>

 {/* Post-Op Photo Box */}
 <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 flex flex-col items-center justify-between min-h-[260px] text-center">
 <input
 ref={postInputRef}
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => handleFileSelect(e,'post')}
 />

 <div className="w-full flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
 <Eye className="h-3.5 w-3.5 text-emerald-600"/>
 Post-Op (Restored)
 </span>
 {postOpPreview && (
 <Badge variant="success"size="sm">
 Loaded
 </Badge>
 )}
 </div>

 {postOpPreview ? (
 <div className="relative w-full h-40 rounded-xl overflow-hidden border border-emerald-300 group">
 <img
 src={postOpPreview}
 alt="Post-Op Preview"
 className="w-full h-full object-cover"
 />
 <button
 onClick={() => postInputRef.current?.click()}
 className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity gap-1.5"
 >
 <Upload className="h-4 w-4"/>
 Change Photo
 </button>
 </div>
 ) : (
 <div
 onClick={() => postInputRef.current?.click()}
 className="w-full h-40 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center p-4 cursor-pointer hover:border-emerald-500 transition-colors group"
 >
 <FileImage className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 mb-1.5 transition-colors"/>
 <p className="text-xs font-bold text-slate-700">
 Select Post-Op Photo
 </p>
 <p className="text-[10px] text-slate-500 font-mono mt-0.5">
 {postOpFilename}
 </p>
 </div>
 )}

 <div className="mt-2 text-[10px] text-slate-500 text-left w-full">
 Shows clear visual outcome after IOL implantation.
 </div>
 </div>
 </div>

 {/* Action Controls */}
 <div className="flex items-center justify-between pt-4 border-t border-slate-200">
 <div className="text-xs text-slate-500">
 JPG/PNG files up to 10MB supported
 </div>

 <div className="flex items-center gap-2.5">
 <Button variant="outline"size="sm"onClick={onClose}>
 Cancel
 </Button>
 <Button
 variant="primary"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4"/>}
 onClick={handleSavePhotos}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold"
 >
 Save & Update Case Sheet
 </Button>
 </div>
 </div>
 </div>
 </Modal>
 );
};
