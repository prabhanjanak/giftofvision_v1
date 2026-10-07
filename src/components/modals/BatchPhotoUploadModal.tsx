import React, { useState, useRef } from'react';
import { useApp } from'../../context/AppContext';
import { Modal } from'../ui/Modal';
import { Button } from'../ui/Button';
import { Badge } from'../ui/Badge';
import {
 Upload,
 FolderTree,
 Building2,
 Calendar,
 CheckCircle2,
 AlertCircle,
 FileImage,
 Sparkles,
 Layers,
 X
} from'lucide-react';

interface BatchPhotoUploadModalProps {
 isOpen: boolean;
 onClose: () => void;
}

interface QueuedPhotoItem {
 file: File;
 previewUrl: string;
 inferredMrn: string;
 photoType:'pre'|'post';
 matchedPatientName?: string;
 matchedPatientId?: string;
 targetPath: string;
}

export const BatchPhotoUploadModal: React.FC<BatchPhotoUploadModalProps> = ({
 isOpen,
 onClose
}) => {
 const { patients, hospitals, selectedBranch, updatePatient, showToast } = useApp();
 const fileInputRef = useRef<HTMLInputElement>(null);

 const [selectedUnit, setSelectedUnit] = useState<string>(
 selectedBranch ==='All Branches'?'Coimbatore': selectedBranch
 );
 const [selectedDate, setSelectedDate] = useState<string>(
 new Date().toISOString().slice(0, 10)
 );

 const [queuedPhotos, setQueuedPhotos] = useState<QueuedPhotoItem[]>([]);
 const [isProcessing, setIsProcessing] = useState<boolean>(false);

 const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;

 const items: QueuedPhotoItem[] = [];

 Array.from(files).forEach((file) => {
 const fname = file.name.toLowerCase();
 const previewUrl = URL.createObjectURL(file);

 // Determine photo type (pre vs post)
 const isPost = fname.includes('post') || fname.includes('after') || fname.includes('_2') || fname.includes('-2');
 const photoType:'pre'|'post'= isPost ?'post':'pre';

 // Infer MRN from filename (e.g.,"20111323_pre.jpg","SK-CBE-2026-8812.jpg","20111323.jpg")
 const mrnMatch = file.name.match(/[A-Za-z0-9_-]+/);
 let rawMrn = mrnMatch ? mrnMatch[0] :'';
 rawMrn = rawMrn.replace(/_pre|_post|_after|_before|_1|_2/gi,'');

 // Try matching with registered patients
 const matched = patients.find(
 (p) =>
 p.mrn.toLowerCase().replace(/[^a-z0-9]/g,'').includes(rawMrn.toLowerCase().replace(/[^a-z0-9]/g,'')) ||
 rawMrn.toLowerCase().replace(/[^a-z0-9]/g,'').includes(p.mrn.toLowerCase().replace(/[^a-z0-9]/g,''))
 );

 const targetPath = `upload/${selectedUnit.replace(/\s+/g,'_')}/${selectedDate}/${rawMrn}_${photoType}.jpg`;

 items.push({
 file,
 previewUrl,
 inferredMrn: matched ? matched.mrn : rawMrn,
 photoType,
 matchedPatientName: matched?.name,
 matchedPatientId: matched?.id,
 targetPath
 });
 });

 setQueuedPhotos((prev) => [...prev, ...items]);
 };

 const handleCommitBatch = () => {
 if (queuedPhotos.length === 0) return;
 setIsProcessing(true);

 let matchedCount = 0;
 const patientUpdates: Record<string, { pre?: string; post?: string }> = {};

 queuedPhotos.forEach((item) => {
 if (item.matchedPatientId) {
 if (!patientUpdates[item.matchedPatientId]) {
 patientUpdates[item.matchedPatientId] = {};
 }
 if (item.photoType ==='pre') {
 patientUpdates[item.matchedPatientId].pre = item.previewUrl;
 } else {
 patientUpdates[item.matchedPatientId].post = item.previewUrl;
 }
 matchedCount++;
 }
 });

 Object.entries(patientUpdates).forEach(([patId, photos]) => {
 const patient = patients.find((p) => p.id === patId);
 if (patient) {
 const newPre = photos.pre || patient.preOpPhoto;
 const newPost = photos.post || patient.postOpPhoto;
 const isBoth = Boolean(newPre && newPost);

 updatePatient(patId, {
 preOpPhoto: newPre,
 postOpPhoto: newPost,
 photoStatus: isBoth ?'Uploaded':'Pending Upload',
 qaStatus: isBoth && patient.qaStatus ==='Pending Photos'?'Pending QA': patient.qaStatus
 });
 }
 });

 setIsProcessing(false);
 showToast(`Successfully indexed and mapped ${queuedPhotos.length} clinical photos!`);
 onClose();
 };

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title="Batch Photo Folder Ingestion (Unit & Date Hierarchy)"
 subtitle="Automatically organize and map pre-op & post-op photographs to registered patients"
 maxWidth="3xl"
 >
 <div className="space-y-5">
 {/* Unit & Surgery Date Selector */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
 <Building2 className="h-4 w-4 text-sankara-700"/>
 Hospital Center / Unit
 </label>
 <select
 value={selectedUnit}
 onChange={(e) => setSelectedUnit(e.target.value)}
 className="w-full h-9.5 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sankara-500"
 >
 {hospitals.map((h) => (
 <option key={h.id} value={h.name}>
 {h.name} ({h.state})
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
 <Calendar className="h-4 w-4 text-sankara-700"/>
 Surgery / Camp Date
 </label>
 <input
 type="date"
 value={selectedDate}
 onChange={(e) => setSelectedDate(e.target.value)}
 className="w-full h-9.5 px-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 {/* Directory Target Display */}
 <div className="flex items-center justify-between p-3 rounded-xl bg-sankara-50 border border-sankara-200/80 text-xs">
 <div className="flex items-center gap-2 text-sankara-950 font-bold">
 <FolderTree className="h-4 w-4 text-sankara-700"/>
 <span>Target Base Path:</span>
 <code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-sankara-200">
 upload/{selectedUnit.replace(/\s+/g,'_')}/{selectedDate}/
 </code>
 </div>
 <span className="text-[11px] text-slate-500 font-semibold">
 Auto-matched by MRN
 </span>
 </div>

 {/* Upload Dropzone */}
 <div
 onClick={() => fileInputRef.current?.click()}
 className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-sankara-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-all group"
 >
 <input
 ref={fileInputRef}
 type="file"
 multiple
 accept="image/*"
 onChange={handleFilesSelect}
 className="hidden"
 />
 <Upload className="h-8 w-8 text-slate-400 group-hover:text-sankara-600 mx-auto mb-2 transition-colors"/>
 <p className="text-xs font-bold text-slate-800">
 Click to select or drop multiple Pre/Post photos or batch folder
 </p>
 <p className="text-[11px] text-slate-500 mt-0.5">
 Supported naming: <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">20111323_pre.jpg</code>, <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">20111323_post.jpg</code>
 </p>
 </div>

 {/* Queued Photos Table */}
 {queuedPhotos.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs">
 <span className="font-bold text-slate-800">
 Queued Photo Files ({queuedPhotos.length} Images)
 </span>
 <button
 onClick={() => setQueuedPhotos([])}
 className="text-[11px] text-rose-600 hover:underline font-semibold"
 >
 Clear All
 </button>
 </div>

 <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 overflow-x-auto">
 <table className="w-full text-left text-[11px]">
 <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700">
 <tr>
 <th className="py-2 px-3">Thumbnail</th>
 <th className="py-2 px-3">File Name</th>
 <th className="py-2 px-3">Inferred MRN</th>
 <th className="py-2 px-3">Type</th>
 <th className="py-2 px-3">Matched Patient</th>
 <th className="py-2 px-3">Target Folder</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {queuedPhotos.map((item, idx) => (
 <tr key={idx} className="hover:bg-slate-50">
 <td className="py-1.5 px-3">
 <img
 src={item.previewUrl}
 alt="thumb"
 className="h-8 w-8 rounded-lg object-cover border border-slate-200"
 />
 </td>
 <td className="py-1.5 px-3 font-mono text-slate-700 truncate max-w-[140px]">
 {item.file.name}
 </td>
 <td className="py-1.5 px-3 font-bold font-mono text-slate-900">
 {item.inferredMrn}
 </td>
 <td className="py-1.5 px-3">
 <span
 className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
 item.photoType ==='post'
 ?'bg-emerald-100 text-emerald-800'
 :'bg-amber-100 text-amber-800'
 }`}
 >
 {item.photoType.toUpperCase()}
 </span>
 </td>
 <td className="py-1.5 px-3">
 {item.matchedPatientName ? (
 <span className="font-bold text-emerald-700">
 {item.matchedPatientName}
 </span>
 ) : (
 <span className="text-slate-400 italic">No direct MRN match</span>
 )}
 </td>
 <td className="py-1.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
 {item.targetPath}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Modal Actions */}
 <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
 <Button variant="outline"size="sm"onClick={onClose}>
 Cancel
 </Button>
 <Button
 variant="primary"
 size="sm"
 icon={<CheckCircle2 className="h-4 w-4"/>}
 disabled={queuedPhotos.length === 0 || isProcessing}
 onClick={handleCommitBatch}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold"
 >
 {isProcessing ?'Indexing...': `Attach & Save ${queuedPhotos.length} Photos`}
 </Button>
 </div>
 </div>
 </Modal>
 );
};
