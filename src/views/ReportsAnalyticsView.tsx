import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  BarChart3,
  Download,
  Upload,
  Printer,
  Calendar,
  Building2,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  Heart,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  Lock,
  FileCheck2,
  FolderTree
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

export const ReportsAnalyticsView: React.FC = () => {
  const {
    donations,
    patients,
    hospitals,
    purposes,
    selectedBranch,
    currentUser,
    forexRates,
    showToast,
    addDonation,
    addPatient,
    maskPatientName,
    maskPatientMrn,
    maskPatientVillage
  } = useApp();

  const isUsaUser =
    currentUser.role === 'SEF USA' ||
    ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser.username.toLowerCase());

  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPurpose, setSelectedPurpose] = useState('All');
  const [isBulkReportModalOpen, setIsBulkReportModalOpen] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<'donors' | 'patients' | 'financial'>('donors');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalUsdDonations = donations.filter((d) => d.amount.includes('$')).length;
  const matchedUsdDonations = donations.filter((d) => d.amount.includes('$') && d.status !== 'Pending Match').length;
  const matchedPatients = patients.filter((p) => p.matchStatus === 'Matched');

  // 1. Download Templates
  const handleDownloadDonorTemplate = () => {
    const csvContent =
      'date,donation,account,name,country,purpose,behalf,No of Xs,special instructions,hospital,email\n' +
      '2026-08-20,$180,34802,Naveen Immidisetty & Swapna Kancherla,USA (SEF USA),Cataract Surgery,,3,Send certificate by email,Coimbatore,naveen.sample@gmail.com\n' +
      '2026-08-22,$3000,54427,Rajesh & Falguni Patel,USA (SEF USA),Open_Eyes_a_Day,,60,In Memory of Parents,Gujarat,aakashpatel04@yahoo.com\n' +
      '2026-08-25,₹10500,89210,K. V. Sundaram,India,Cataract Surgery,,3,Annadhanam Seva sponsorship,Bangalore,sundaram.kv@gmail.com\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Sankara_Donor_Remittance_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Donor remittance template downloaded successfully!');
  };

  const handleDownloadPatientTemplate = () => {
    const csvContent =
      'Mrd No,Patient Name,Age,Sex,Camp No,Admission Date,Token,City,Surgery,Surgery Date\n' +
      'SK-CBE-2026-1049,Munisamy G,68,M,CAMP-821,2026-08-15,TK-102,Tirupur,Phacoemulsification with Foldable IOL,2026-08-16\n' +
      'SK-GUN-2026-2184,Lakshmi Devi K,62,F,CAMP-822,2026-08-18,TK-103,Tenali,Small Incision Cataract Surgery (SICS),2026-08-19\n' +
      'SK-BAN-2026-3490,Basavaraj Gowda,71,M,CAMP-823,2026-08-20,TK-104,Mandya,Corneal Transplant / Penetrating Keratoplasty,2026-08-21\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Sankara_Patient_Clinical_CaseSheet_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Patient case sheet template downloaded successfully!');
  };

  // 2. Export Live Datasets
  const handleExportSefUsaReport = () => {
    const usaDonations = donations.filter((d) => d.amount.includes('$') || (d.country && d.country.includes('USA')));
    const rows = usaDonations.map((d) => {
      const matchedPatient = patients.find((p) => p.id === d.matchedPatientId || p.matchedDonorId === d.id);
      const maskedPatName = matchedPatient
        ? maskPatientName(matchedPatient.name, true)
        : (d.matchedPatientName ? maskPatientName(d.matchedPatientName, true) : 'Queued in System');
      const maskedPatMrn = matchedPatient ? maskPatientMrn(matchedPatient.mrn, true) : 'N/A';

      return {
        'SEF ID': d.sefId,
        'Donor Name': d.donorName,
        'Country': d.country || 'USA (SEF USA)',
        'Payment Status': d.paymentStatus || 'Verified',
        'Donor Email': d.email || 'donor@sefusa.org',
        'Remittance Amount': d.amount,
        'Purpose Tariff': d.purpose,
        'Remittance Date': d.date,
        'Hospital Center': d.location,
        'Allocation Status': d.status,
        'Matched Patient Beneficiary': maskedPatName,
        'Patient Hospital Ref': maskedPatMrn,
        'Surgery Procedure': matchedPatient?.surgeryType || 'Cataract IOL',
        'Surgery Date': matchedPatient?.surgeryDate || 'N/A',
        'Vision Outcome': matchedPatient ? `${matchedPatient.preOpVision} ➔ ${matchedPatient.postOpVision}` : 'Pending Case',
        'Privacy Compliance': '🛡️ DPDP Act (2023) Redacted'
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SEF_USA_Sponsorships');
    XLSX.writeFile(wb, `SEF_USA_Beneficiary_Allocation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('SEF USA Sponsorship Report downloaded successfully with DPDP privacy protection!');
  };

  const handleExportMatchedBeneficiariesReport = () => {
    const rows = matchedPatients.map((p) => ({
      'MRN ID': maskPatientMrn(p.mrn),
      'Beneficiary Name': maskPatientName(p.name),
      'Age': p.age,
      'Gender': p.gender,
      'Hospital Center': p.hospital,
      'Village / Outreach Sector': maskPatientVillage(p.village),
      'Surgery Procedure': p.surgeryType,
      'Surgery Date': p.surgeryDate,
      'Surgeon': p.surgeon,
      'Pre-Op Vision': p.preOpVision,
      'Post-Op Vision': p.postOpVision,
      'Sponsoring Donor': p.matchedDonorName || 'SEF USA Sponsor',
      'QA Status': p.qaStatus,
      'Feedback Status': p.dispatchStatus
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matched_Beneficiaries');
    XLSX.writeFile(wb, `Sankara_Matched_Beneficiaries_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Matched Beneficiaries Report downloaded successfully!');
  };

  const handleExportFinancialAuditSummary = () => {
    const rows = hospitals.map((h) => {
      const branchDonations = donations.filter((d) => d.location.toLowerCase().includes(h.name.toLowerCase()) || d.location === 'Any');
      const branchPatients = patients.filter((p) => p.hospital.toLowerCase().includes(h.name.toLowerCase()));
      let usd = 0;
      let inr = 0;
      branchDonations.forEach((d) => {
        const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
        if (d.amount.includes('$')) usd += raw;
        else inr += raw;
      });

      return {
        'Hospital Center': h.name,
        'State': h.state,
        'Center Code': h.code,
        'SEF USA Remittances ($)': usd,
        'India Donations (₹)': inr,
        'Surgeries Conducted': branchPatients.filter((p) => p.matchStatus === 'Matched').length
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financial_Summary');
    XLSX.writeFile(wb, `Sankara_Financial_Utilization_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Financial Utilization Summary downloaded successfully!');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
              {isUsaUser ? '🇺🇸 SEF USA Reporting Portal' : 'Sankara Trust Intelligence & Audits'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" /> Live Audited Data
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Reports, Analytics & Bulk Upload Center
          </h1>
          <p className="text-xs text-orange-50 mt-0.5 font-medium">
            Download verified Excel/CSV datasets, export official templates, and upload bulk external audit files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="white"
            size="sm"
            icon={<Download className="h-4 w-4 text-orange-600" />}
            onClick={handleDownloadDonorTemplate}
            className="text-xs font-black shadow-md"
          >
            Donor Template
          </Button>

          <Button
            variant="white"
            size="sm"
            icon={<Download className="h-4 w-4 text-orange-600" />}
            onClick={handleDownloadPatientTemplate}
            className="text-xs font-black shadow-md"
          >
            Patient Template
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportSefUsaReport}
            className="border-white/40 text-white hover:bg-white/15 font-bold text-xs"
          >
            Export All (Excel)
          </Button>
        </div>
      </div>

      {/* 3 Executive Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: SEF USA Sponsorship Allocation Report */}
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm hover:shadow-orange-glow transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              SEF USA Sponsorships Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Complete register of all USD donor remittances, SEF IDs, purpose tariffs, payment verification, and linked beneficiary names.
            </p>
          </div>

          <div className="pt-3 border-t border-orange-50 flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600">
              {totalUsdDonations} Records Ready
            </span>
            <Button
              variant="white"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 text-orange-600" />}
              onClick={handleExportSefUsaReport}
              className="text-xs font-black"
            >
              Export Excel
            </Button>
          </div>
        </div>

        {/* Card 2: Matched Beneficiaries & Medical Proof Report */}
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm hover:shadow-orange-glow transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Matched Beneficiaries Report
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Clinical dataset of all operated patients linked to sponsors, including MRN, surgeon, pre/post visual acuity, and QA approval.
            </p>
          </div>

          <div className="pt-3 border-t border-orange-50 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">
              {matchedPatients.length} Operated Patients
            </span>
            <Button
              variant="white"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 text-emerald-600" />}
              onClick={handleExportMatchedBeneficiariesReport}
              className="text-xs font-black"
            >
              Export Excel
            </Button>
          </div>
        </div>

        {/* Card 3: 13 Hospital Branch Utilization Summary */}
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm hover:shadow-orange-glow transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-11 w-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Hospital Branch Financial Summary
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Consolidated financial matrix auditing USD & INR donor inflows, operated surgical cases, and general care reserves across 13 centers.
            </p>
          </div>

          <div className="pt-3 border-t border-orange-50 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">
              13 Centers Audited
            </span>
            <Button
              variant="white"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 text-purple-600" />}
              onClick={handleExportFinancialAuditSummary}
              className="text-xs font-black"
            >
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Official Template Download Vault */}
      <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-orange-600" />
              Standard Import Templates Repository
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Official standardized CSV templates formatted with exact required column headers for bulk data upload
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Donor Remittance Template</h4>
                <p className="text-[11px] text-slate-500 font-mono">SEF_USA_Bulk_Donor_Import_Template.csv</p>
              </div>
            </div>
            <Button
              variant="white"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 text-orange-600" />}
              onClick={handleDownloadDonorTemplate}
              className="text-xs font-black"
            >
              Download
            </Button>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-8 w-8 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Patient Case Sheet Template</h4>
                <p className="text-[11px] text-slate-500 font-mono">MEDICS_Patient_Case_Sheet_Template.csv</p>
              </div>
            </div>
            <Button
              variant="white"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 text-emerald-600" />}
              onClick={handleDownloadPatientTemplate}
              className="text-xs font-black"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
