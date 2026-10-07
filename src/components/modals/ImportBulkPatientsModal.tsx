import React, { useState, useRef } from'react';
import { useApp } from'../../context/AppContext';
import { Modal } from'../ui/Modal';
import { Button } from'../ui/Button';
import { Badge } from'../ui/Badge';
import {
 Upload,
 FileSpreadsheet,
 Download,
 CheckCircle2,
 AlertCircle,
 X,
 Users,
 Eye
} from'lucide-react';
import * as XLSX from'xlsx';

interface ImportBulkPatientsModalProps {
 isOpen: boolean;
 onClose: () => void;
}

interface ParsedPatientRow {
 mrdNo: string;
 patientName: string;
 age: number;
 sex:'Male'|'Female'|'Other';
 campNo?: string;
 admissionDate: string;
 token?: string;
 city: string;
 surgery: string;
 surgeryDate: string;
 hospital: string;
}

export const ImportBulkPatientsModal: React.FC<ImportBulkPatientsModalProps> = ({
 isOpen,
 onClose
}) => {
 const { addPatient, showToast, hospitals, selectedBranch } = useApp();
 const fileInputRef = useRef<HTMLInputElement>(null);

 const [file, setFile] = useState<File | null>(null);
 const [parsedData, setParsedData] = useState<ParsedPatientRow[]>([]);
 const [errorMsg, setErrorMsg] = useState('');
 const [isProcessing, setIsProcessing] = useState(false);

 const handleDownloadTemplate = () => {
 const csvContent =
'Mrd No,Patient Name,Age,Sex,Camp No,Admission Date,Token,City,Surgery,Surgery Date\n'+
'20261323,NADIYAMMAL,47,F,6940,17/08/2026,C279,PATTUKOTTAI,SICS-OS-GP,19/08/2026\n'+
'20261212,SUBRAMANI,70,M,6940,17/08/2026,C280,PATTUKOTTAI,PHACO-OD,18/08/2026\n'+
'20263344,ACHIKANNU,85,F,6940,17/08/2026,C281,PATTUKOTTAI,SICS-OS,18/08/2026\n';

 const blob = new Blob([csvContent], { type:'text/csv;charset=utf-8;'});
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download','medics_patient_template.csv');
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setErrorMsg('');
 const selectedFile = e.target.files?.[0];
 if (!selectedFile) return;

 setFile(selectedFile);
 parseFile(selectedFile);
 };

 const parseFile = (fileObj: File) => {
 const reader = new FileReader();

 reader.onload = (evt) => {
 try {
 const bstr = evt.target?.result;
 const wb = XLSX.read(bstr, { type:'binary'});
 const wsname = wb.SheetNames[0];
 const ws = wb.Sheets[wsname];
 const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

 if (data.length < 2) {
 setErrorMsg('The uploaded file is empty or missing patient rows.');
 return;
 }

 const headers = data[0].map((h: any) => String(h ||'').toLowerCase().trim());

 const mrdIdx = headers.findIndex((h) => h.includes('mrd') || h.includes('mrn'));
 const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('patient'));
 const ageIdx = headers.findIndex((h) => h.includes('age'));
 const sexIdx = headers.findIndex((h) => h.includes('sex') || h.includes('gender'));
 const campIdx = headers.findIndex((h) => h.includes('camp'));
 const admIdx = headers.findIndex((h) => h.includes('admission'));
 const tokenIdx = headers.findIndex((h) => h.includes('token'));
 const cityIdx = headers.findIndex((h) => h.includes('city') || h.includes('village') || h.includes('address'));
 const surgIdx = headers.findIndex((h) => h.includes('surgery') && !h.includes('date'));
 const sdateIdx = headers.findIndex((h) => h.includes('surgery date') || h.includes('surg date') || (h.includes('date') && !h.includes('admission')));

 const rows: ParsedPatientRow[] = [];
 const defaultHosp = selectedBranch ==='All Branches'?'Coimbatore': selectedBranch;

 for (let i = 1; i < data.length; i++) {
 const row = data[i];
 if (!row || row.length === 0 || !row[nameIdx !== -1 ? nameIdx : 1]) continue;

 const pName = String(row[nameIdx !== -1 ? nameIdx : 1] ||'').trim();
 if (!pName) continue;

 const pMrd = mrdIdx !== -1 && row[mrdIdx] ? String(row[mrdIdx]).trim() : `MRN-2026-${Math.floor(10000 + Math.random() * 89999)}`;
 const pAge = ageIdx !== -1 && row[ageIdx] ? parseInt(row[ageIdx]) || 60 : 60;
 const rawSex = sexIdx !== -1 && row[sexIdx] ? String(row[sexIdx]).trim().toUpperCase() :'F';
 const pSex:'Male'|'Female'|'Other'= rawSex.startsWith('M') ?'Male': (rawSex.startsWith('F') ?'Female':'Other');
 const pCamp = campIdx !== -1 && row[campIdx] ? String(row[campIdx]).trim() :'';
 const pAdm = admIdx !== -1 && row[admIdx] ? String(row[admIdx]).trim() : new Date().toISOString().slice(0, 10);
 const pToken = tokenIdx !== -1 && row[tokenIdx] ? String(row[tokenIdx]).trim() :'';
 const pCity = cityIdx !== -1 && row[cityIdx] ? String(row[cityIdx]).trim() :'Rural Mandal';
 const pSurg = surgIdx !== -1 && row[surgIdx] ? String(row[surgIdx]).trim() :'Phacoemulsification with Foldable IOL';
 const pSDate = sdateIdx !== -1 && row[sdateIdx] ? String(row[sdateIdx]).trim() : new Date().toISOString().slice(0, 10);

 rows.push({
 mrdNo: pMrd,
 patientName: pName.toUpperCase(),
 age: pAge,
 sex: pSex,
 campNo: pCamp,
 admissionDate: pAdm,
 token: pToken,
 city: pCity,
 surgery: pSurg,
 surgeryDate: pSDate,
 hospital: defaultHosp
 });
 }

 if (rows.length === 0) {
 setErrorMsg('Could not parse any valid patient records.');
 } else {
 setParsedData(rows);
 }
 } catch (err: any) {
 setErrorMsg(`Failed to parse file: ${err.message}`);
 }
 };

 reader.readAsBinaryString(fileObj);
 };

 const handleCommitImport = () => {
 if (parsedData.length === 0) return;
 setIsProcessing(true);

 const defaultPrePhotos = [
'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
 ];
 const defaultPostPhotos = [
'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
 ];

 let count = 0;
 parsedData.forEach((row, idx) => {
 const isRightEye = row.surgery.toLowerCase().includes('od') || idx % 2 === 0;
 addPatient({
 mrn: row.mrdNo,
 name: row.patientName,
 age: row.age,
 gender: row.sex,
 hospital: row.hospital,
 eye: isRightEye ?'Right Eye (OD)':'Left Eye (OS)',
 diagnosis: row.surgery.includes('PHACO') ?'Nuclear Senile Cataract':'Mature Cataract',
 surgeryType: row.surgery,
 surgeryDate: row.surgeryDate,
 surgeon:'Dr. S. Ramasamy, MS',
 preOpVision:'Hand Movements (6/60)',
 postOpVision:'6/9 Restored Normal Vision',
 village: row.city,
 occupation:'Agricultural Laborer',
 annualIncome:'Rs. 32,000',
 photoStatus:'Uploaded',
 preOpPhoto: defaultPrePhotos[idx % defaultPrePhotos.length],
 postOpPhoto: defaultPostPhotos[idx % defaultPostPhotos.length]
 });
 count++;
 });

 setIsProcessing(false);
 showToast(`Successfully imported ${count} operated patients into the registry!`);
 onClose();
 };

 return (
 <Modal
 isOpen={isOpen}
 onClose={onClose}
 title="Upload MEDICS EMR / Camp Patient CSV"
 subtitle="Ingest camp surgery records directly from Sankara MEDICS Hospital Software"
 maxWidth="3xl"
 >
 <div className="space-y-5">
 {/* Template Banner */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
 <div>
 <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
 <FileSpreadsheet className="h-4 w-4 text-emerald-600"/>
 Sankara MEDICS EMR Export Format (patient.csv)
 </h4>
 <p className="text-[11px] text-slate-600 mt-0.5">
 Headers: <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded">Mrd No, Patient Name, Age, Sex, Camp No, Admission Date, Token, City, Surgery, Surgery Date</code>
 </p>
 </div>

 <Button
 variant="outline"
 size="sm"
 icon={<Download className="h-3.5 w-3.5"/>}
 onClick={handleDownloadTemplate}
 className="text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex-shrink-0"
 >
 Download MEDICS CSV Template
 </Button>
 </div>

 {/* Upload Dropzone */}
 {!file ? (
 <div
 onClick={() => fileInputRef.current?.click()}
 className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/50 transition-all group"
 >
 <input
 ref={fileInputRef}
 type="file"
 accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 onChange={handleFileChange}
 className="hidden"
 />
 <Upload className="h-10 w-10 text-slate-400 group-hover:text-emerald-600 mx-auto mb-2.5 transition-colors"/>
 <p className="text-xs font-bold text-slate-800">
 Click to select or drag and drop your <span className="text-emerald-700">MEDICS CSV</span> or Excel file
 </p>
 <p className="text-[11px] text-slate-500 mt-1">
 Supports CSV & Excel reports exported from Sankara MEDICS Hospital software
 </p>
 </div>
 ) : (
 <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
 <div className="flex items-center gap-2.5">
 <FileSpreadsheet className="h-5 w-5 text-emerald-600"/>
 <div>
 <p className="text-xs font-bold text-slate-900">{file.name}</p>
 <p className="text-[10px] text-slate-500 font-mono">
 {(file.size / 1024).toFixed(1)} KB • {parsedData.length} patient cases ready
 </p>
 </div>
 </div>

 <button
 onClick={() => {
 setFile(null);
 setParsedData([]);
 }}
 className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200"
 >
 <X className="h-4 w-4"/>
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="h-4 w-4 flex-shrink-0"/>
 {errorMsg}
 </div>
 )}

 {/* Data Preview Table */}
 {parsedData.length > 0 && (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs">
 <span className="font-bold text-slate-800">
 Preview Patient Cases ({parsedData.length} Patients)
 </span>
 <Badge variant="success"size="sm">
 Ready for Registration
 </Badge>
 </div>

 <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 overflow-x-auto">
 <table className="w-full text-left text-[11px]">
 <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700">
 <tr>
 <th className="py-2 px-3">MRN</th>
 <th className="py-2 px-3">Patient Name</th>
 <th className="py-2 px-3">Age / Sex</th>
 <th className="py-2 px-3">City / Mandal</th>
 <th className="py-2 px-3">Surgery Procedure</th>
 <th className="py-2 px-3">Surgery Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {parsedData.slice(0, 10).map((row, rIdx) => (
 <tr key={rIdx} className="hover:bg-slate-50">
 <td className="py-2 px-3 font-mono font-bold text-slate-800">
 {row.mrdNo}
 </td>
 <td className="py-2 px-3 font-bold text-slate-900">
 {row.patientName}
 </td>
 <td className="py-2 px-3 text-slate-700">
 {row.age}y ({row.sex})
 </td>
 <td className="py-2 px-3 text-slate-700">{row.city}</td>
 <td className="py-2 px-3 font-semibold text-sankara-800">
 {row.surgery}
 </td>
 <td className="py-2 px-3 text-slate-700">{row.surgeryDate}</td>
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
 disabled={parsedData.length === 0 || isProcessing}
 onClick={handleCommitImport}
 className="bg-sankara-800 hover:bg-sankara-900 font-bold"
 >
 {isProcessing ?'Registering...': `Import ${parsedData.length} Patients into Registry`}
 </Button>
 </div>
 </div>
 </Modal>
 );
};
