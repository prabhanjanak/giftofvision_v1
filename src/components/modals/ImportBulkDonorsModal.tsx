import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Building2,
  DollarSign,
  CheckSquare,
  Square,
  Sparkles,
  Users,
  Globe
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

interface ImportBulkDonorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StagedDonorRow {
  id: string;
  verified: boolean;
  date: string;
  donation: string;
  account: string;
  name: string;
  country: string;
  purpose: string;
  behalf?: string;
  quantity?: number;
  specialInstructions?: string;
  hospital: string;
  email: string;
}

export const ImportBulkDonorsModal: React.FC<ImportBulkDonorsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addDonation, showToast, hospitals } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [stagedData, setStagedData] = useState<StagedDonorRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Download Standard Template (CSV)
  const handleDownloadTemplate = () => {
    const csvContent =
      'date,donation,account,name,country,purpose,behalf,No of Xs,special instructions,hospital,email\n' +
      '2026-08-20,$180,34802,Naveen Immidisetty & Swapna Kancherla,USA (SEF USA),Cataract Surgery,,3,Send certificate by email,Coimbatore,naveen.sample@gmail.com\n' +
      '2026-08-22,$3000,54427,Rajesh & Falguni Patel,USA (SEF USA),Open_Eyes_a_Day,,60,In Memory of Parents,Gujarat,aakashpatel04@yahoo.com\n' +
      '2026-08-25,₹10500,89210,K. V. Sundaram,India,Cataract Surgery,,3,Annadhanam Seva sponsorship,Bangalore,sundaram.kv@gmail.com\n' +
      '2026-08-26,$500,67120,Dr. Ananya & Rohit Sharma,USA (SEF USA),Corneal Transplant,,5,Annual SEF USA Gala donation,Kanpur,ananya.sharma@example.com\n' +
      '2026-08-27,$1500,41980,Silicon Valley Tech Community,USA (SEF USA),Cataract Surgery,,30,Community Vision Drive 2026,Panvel,community.sef@example.com\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'SEF_USA_Bulk_Donor_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Donor template downloaded (SEF_USA_Bulk_Donor_Import_Template.csv)');
  };

  // 2. Parse Uploaded CSV / Excel
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
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length < 2) {
          setErrorMsg('The uploaded file is empty or missing donor rows.');
          return;
        }

        const headers = data[0].map((h: any) => String(h || '').toLowerCase().trim());

        const dateIdx = headers.findIndex((h) => h.includes('date'));
        const donationIdx = headers.findIndex((h) => h.includes('donation') || h.includes('amount'));
        const accountIdx = headers.findIndex((h) => h.includes('account') || h.includes('sefid') || h.includes('sef'));
        const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('donor'));
        const countryIdx = headers.findIndex((h) => h.includes('country') || h.includes('chapter'));
        const purposeIdx = headers.findIndex((h) => h.includes('purpose'));
        const behalfIdx = headers.findIndex((h) => h.includes('behalf'));
        const qtyIdx = headers.findIndex((h) => h.includes('xs') || h.includes('qty') || h.includes('no'));
        const siIdx = headers.findIndex((h) => h.includes('instruction') || h.includes('special') || h.includes('request'));
        const hospIdx = headers.findIndex((h) => h.includes('hospital') || h.includes('location') || h.includes('branch'));
        const emailIdx = headers.findIndex((h) => h.includes('email'));

        const rows: StagedDonorRow[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const dName = String(row[nameIdx !== -1 ? nameIdx : 3] || '').trim();
          if (!dName) continue;

          const dDate = dateIdx !== -1 && row[dateIdx] ? String(row[dateIdx]).trim() : new Date().toISOString().slice(0, 10);
          let dAmount = donationIdx !== -1 && row[donationIdx] ? String(row[donationIdx]).trim() : '$50';
          if (!dAmount.startsWith('$') && !dAmount.startsWith('₹') && !dAmount.startsWith('Rs') && !dAmount.startsWith('£')) {
            dAmount = `$${dAmount}`;
          }

          const dAccount = accountIdx !== -1 && row[accountIdx] ? String(row[accountIdx]).trim() : `${Math.floor(10000 + Math.random() * 89999)}`;
          const dCountry = countryIdx !== -1 && row[countryIdx] ? String(row[countryIdx]).trim() : 'USA (SEF USA)';
          const dPurpose = purposeIdx !== -1 && row[purposeIdx] ? String(row[purposeIdx]).trim() : 'Cataract Surgery';
          const dBehalf = behalfIdx !== -1 && row[behalfIdx] ? String(row[behalfIdx]).trim() : '';
          const dQty = qtyIdx !== -1 && row[qtyIdx] ? parseInt(row[qtyIdx]) || 1 : 1;
          const dSI = siIdx !== -1 && row[siIdx] ? String(row[siIdx]).trim() : '';
          const dHosp = hospIdx !== -1 && row[hospIdx] ? String(row[hospIdx]).trim() : 'Coimbatore';
          const dEmail = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : '';

          rows.push({
            id: `STG-${Date.now()}-${i}`,
            verified: true, // Pre-verified tick by default
            date: dDate,
            donation: dAmount,
            account: dAccount.startsWith('SEF') ? dAccount : `SEF-${dAccount}`,
            name: dName,
            country: dCountry,
            purpose: dPurpose,
            behalf: dBehalf,
            quantity: dQty,
            specialInstructions: dSI,
            hospital: dHosp,
            email: dEmail
          });
        }

        if (rows.length === 0) {
          setErrorMsg('Could not parse any valid donor records. Please check the CSV header columns.');
        } else {
          setStagedData(rows);
          showToast(`Uploaded ${rows.length} donor records for review & verification!`);
        }
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message}`);
      }
    };

    reader.readAsBinaryString(fileObj);
  };

  // Toggle single verification tick
  const handleToggleVerifyRow = (rowId: string) => {
    setStagedData((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, verified: !r.verified } : r))
    );
  };

  // Toggle all verification ticks
  const verifiedCount = stagedData.filter((r) => r.verified).length;
  const isAllVerified = stagedData.length > 0 && verifiedCount === stagedData.length;

  const handleToggleSelectAll = () => {
    const nextState = !isAllVerified;
    setStagedData((prev) => prev.map((r) => ({ ...r, verified: nextState })));
  };

  // 3. Commit Verified Donors to Active System
  const handleCommitImport = () => {
    const verifiedRows = stagedData.filter((r) => r.verified);
    if (verifiedRows.length === 0) {
      alert('Please check/verify at least 1 donor from the list to import.');
      return;
    }

    setIsProcessing(true);

    verifiedRows.forEach((row, idx) => {
      addDonation({
        donorName: row.name,
        sefId: row.account,
        refId: `IMP-SEF-${Date.now().toString().slice(-4)}-${idx + 1}`,
        amount: row.donation,
        purpose: row.purpose,
        date: row.date,
        location: row.hospital,
        email:
          row.email ||
          `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}@sefusa.org`,
        specialRequest:
          row.specialInstructions ||
          (row.behalf ? `On behalf of ${row.behalf}` : 'SEF USA Bulk Import Batch'),
        type: row.purpose.includes('Month')
          ? 'Recurring OEM'
          : row.purpose.includes('Week')
          ? 'Recurring OEW'
          : row.purpose.includes('Day') || row.purpose.includes('Endow')
          ? 'Endowment'
          : 'One-Time',
        paymentStatus: 'Verified',
        country: row.country,
        addedBy: 'sef_usa_bulk_importer',
        creationDate: new Date().toISOString().slice(0, 10)
      });
    });

    setIsProcessing(false);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    showToast(`Successfully verified & added ${verifiedRows.length} donors to the active system!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Donor Remittance Upload & Verification"
      subtitle="Download the standard SEF USA template, upload your batch file, verify the donor list, and add to the system."
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Step 1: Download Template Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-2">
                1. Official SEF USA Import Template (.csv)
                <span className="px-2 py-0.5 rounded-full bg-white text-orange-900 font-extrabold text-[10px] border border-orange-200">
                  Ready to Use
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Columns: <code className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-orange-200 font-bold">date, donation, account, name, country, purpose, behalf, hospital, email</code>
              </p>
            </div>
          </div>

          <Button
            variant="white"
            size="sm"
            icon={<Download className="h-3.5 w-3.5 text-orange-600" />}
            onClick={handleDownloadTemplate}
            className="text-xs font-black shadow-md flex-shrink-0"
          >
            Download CSV Template
          </Button>
        </div>

        {/* Step 2: Upload Dropzone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-3xl p-8 text-center bg-orange-50/20 hover:bg-orange-50/50 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-orange-400 group-hover:text-orange-600 mx-auto mb-2.5 transition-colors animate-bounce" />
            <p className="text-sm font-black text-slate-900">
              Click to select or drag and drop your completed <span className="text-orange-600">CSV or Excel</span> donor batch
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV, XLSX, and XLS formats from SEF USA, India, and Global Chapters
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl border border-orange-200 bg-orange-50/40">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs font-black text-slate-900">{file.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {(file.size / 1024).toFixed(1)} KB • {stagedData.length} donors parsed • {verifiedCount} verified
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setStagedData([]);
                setErrorMsg('');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
              title="Remove File & Re-upload"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Step 3: Staged Donor Review List with Verification Tick Buttons */}
        {stagedData.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-orange-100">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-orange-600" />
                  3. Uploaded Donor Staging List ({verifiedCount} of {stagedData.length} Verified)
                </h4>
              </div>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1.5 select-none"
              >
                {isAllVerified ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                    <span>All Donors Checked</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 text-slate-400" />
                    <span>Check / Verify All</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrollable Staging Table */}
            <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-orange-50 border-b border-orange-200 text-[10px] font-black uppercase tracking-wider text-orange-950 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Verify</th>
                    <th className="py-2.5 px-3">Donor Name</th>
                    <th className="py-2.5 px-3">SEF Account</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Hospital Center</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stagedData.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => handleToggleVerifyRow(row.id)}
                      className={`cursor-pointer transition-colors ${
                        row.verified ? 'bg-orange-50/30 hover:bg-orange-50/60' : 'bg-slate-50/60 hover:bg-slate-100 opacity-60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        {row.verified ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400 mx-auto" />
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <strong className="font-extrabold text-slate-900 block">
                          {row.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 truncate max-w-[150px] block">
                          {row.email || 'No email specified'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {row.account}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-black text-orange-600 text-xs">
                          {row.donation}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {row.country}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700 font-medium truncate max-w-[140px]">
                        {row.purpose}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-orange-500 shrink-0" />
                          {row.hospital}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {row.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-300 shadow-xs">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                            Unchecked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="h-4 w-4" />}
            disabled={verifiedCount === 0 || isProcessing}
            loading={isProcessing}
            onClick={handleCommitImport}
            className="bg-gradient-to-r from-orange-600 to-amber-600 font-black text-xs shadow-lg"
          >
            Verify & Add {verifiedCount} Donors to System
          </Button>
        </div>
      </div>
    </Modal>
  );
};
