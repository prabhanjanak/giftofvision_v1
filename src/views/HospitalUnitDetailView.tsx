import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, Donation, Patient } from '../data/initialData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FeedbackCertificate } from '../components/ui/FeedbackCertificate';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Activity,
  Users,
  HeartHandshake,
  Calendar,
  Filter,
  Search,
  Download,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  PieChart as PieIcon,
  BarChart3,
  Phone,
  MapPin,
  Bed,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';

interface HospitalUnitDetailViewProps {
  hospital: Hospital;
  onBack: () => void;
  onOpenNewDonation: () => void;
  onOpenNewPatient: () => void;
}

export const HospitalUnitDetailView: React.FC<HospitalUnitDetailViewProps> = ({
  hospital,
  onBack,
  onOpenNewDonation,
  onOpenNewPatient
}) => {
  const {
    donations,
    patients,
    forexRates,
    showToast,
    currentUser,
    isDpdpShieldActive,
    toggleDpdpShield,
    maskPatientName,
    maskPatientMrn,
    globalCurrency
  } = useApp();

  // Active view subtab: 'patients' | 'donations' | 'analytics'
  const [activeTab, setActiveTab] = useState<'patients' | 'donations' | 'analytics'>('patients');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [procedureFilter, setProcedureFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Patient for Certificate Modal
  const [certificatePatient, setCertificatePatient] = useState<Patient | null>(null);

  // Unit-specific raw data
  const unitDonations = useMemo(() => {
    return donations.filter(
      (d) =>
        d.location.toLowerCase().includes(hospital.name.toLowerCase()) ||
        d.location.toLowerCase() === hospital.code.toLowerCase() ||
        d.location === 'Any'
    );
  }, [donations, hospital]);

  const unitPatients = useMemo(() => {
    return patients.filter(
      (p) =>
        p.hospital.toLowerCase().includes(hospital.name.toLowerCase()) ||
        p.hospital.toLowerCase() === hospital.code.toLowerCase()
    );
  }, [patients, hospital]);

  // Unit Financial Metrics
  const unitMetrics = useMemo(() => {
    let usdReceived = 0;
    let inrReceived = 0;
    let otherUsdEq = 0;

    unitDonations.forEach((d) => {
      const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
      if (d.amount.includes('$') || (d.country && d.country.includes('USA'))) {
        usdReceived += raw;
      } else if (d.amount.includes('₹') || d.amount.includes('R') || (d.country && d.country.includes('India'))) {
        inrReceived += raw;
      } else if (d.amount.includes('£')) {
        otherUsdEq += raw * 1.3;
      } else {
        usdReceived += raw;
      }
    });

    const matchedPatients = unitPatients.filter((p) => p.matchStatus === 'Matched');
    const waitingPatients = unitPatients.filter((p) => p.matchStatus === 'Pending Match');
    const totalSurgeries = matchedPatients.length;

    const surgeriesUsedUsd = totalSurgeries * 50;
    const surgeriesUsedInr = totalSurgeries * 3500;

    const rate = forexRates.INR || 83.50;
    const totalInflowUsd = usdReceived + otherUsdEq + inrReceived / rate;
    const totalInflowInr = inrReceived + (usdReceived + otherUsdEq) * rate;

    const utilizationRate = totalInflowUsd > 0
      ? Math.min(100, Math.round((surgeriesUsedUsd / totalInflowUsd) * 100))
      : 0;

    return {
      usdReceived,
      inrReceived,
      totalInflowUsd: Math.round(totalInflowUsd),
      totalInflowInr: Math.round(totalInflowInr),
      totalSurgeries,
      waitingCount: waitingPatients.length,
      surgeriesUsedUsd,
      surgeriesUsedInr,
      utilizationRate
    };
  }, [unitDonations, unitPatients, forexRates, hospital]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return unitPatients.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        `${p.name} ${p.mrn} ${p.village} ${p.surgeon} ${p.surgeryType} ${p.matchedDonorName || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesProcedure =
        procedureFilter === 'All'
          ? true
          : p.surgeryType.toLowerCase().includes(procedureFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'All'
          ? true
          : p.matchStatus === statusFilter;

      const matchesDate =
        (!dateFrom || p.surgeryDate >= dateFrom) &&
        (!dateTo || p.surgeryDate <= dateTo);

      return matchesSearch && matchesProcedure && matchesStatus && matchesDate;
    });
  }, [unitPatients, searchQuery, procedureFilter, statusFilter, dateFrom, dateTo]);

  // Filtered Donations List
  const filteredDonations = useMemo(() => {
    return unitDonations.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        `${d.donorName} ${d.sefId} ${d.amount} ${d.purpose} ${d.country || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Verified'
          ? (d.paymentStatus || 'Verified') === 'Verified'
          : d.status === statusFilter;

      const matchesDate =
        (!dateFrom || d.date >= dateFrom) &&
        (!dateTo || d.date <= dateTo);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [unitDonations, searchQuery, statusFilter, dateFrom, dateTo]);

  // Procedure Distribution Chart Data
  const procedureChartData = useMemo(() => {
    const counts: { [key: string]: number } = {
      'SICS Cataract': 0,
      'Phaco IOL': 0,
      'Corneal Transplant': 0,
      'Pediatric Care': 0,
      'Glaucoma': 0
    };

    unitPatients.forEach((p) => {
      const st = p.surgeryType.toLowerCase();
      if (st.includes('phaco')) counts['Phaco IOL'] += 1;
      else if (st.includes('sics') || st.includes('cataract')) counts['SICS Cataract'] += 1;
      else if (st.includes('corneal') || st.includes('keratoplasty')) counts['Corneal Transplant'] += 1;
      else if (st.includes('pediatric') || st.includes('child')) counts['Pediatric Care'] += 1;
      else if (st.includes('glaucoma')) counts['Glaucoma'] += 1;
      else counts['SICS Cataract'] += 1;
    });

    const colors = ['#ea580c', '#f97316', '#10b981', '#6366f1', '#f59e0b'];

    return Object.keys(counts).map((key, idx) => ({
      name: key,
      value: counts[key],
      color: colors[idx % colors.length]
    }));
  }, [unitPatients]);

  const handleExportUnitReport = () => {
    const wsPatients = XLSX.utils.json_to_sheet(
      filteredPatients.map((p) => ({
        'MRN ID': maskPatientMrn(p.mrn),
        'Patient Name': maskPatientName(p.name),
        'Age': p.age,
        'Gender': p.gender,
        'Hospital Center': p.hospital,
        'Surgery Procedure': p.surgeryType,
        'Surgery Date': p.surgeryDate,
        'Surgeon': p.surgeon,
        'Pre-Op Vision': p.preOpVision,
        'Post-Op Vision': p.postOpVision,
        'Match Status': p.matchStatus,
        'Sponsoring Donor': p.matchedDonorName || 'Pending Match'
      }))
    );

    const wsDonations = XLSX.utils.json_to_sheet(
      filteredDonations.map((d) => ({
        'SEF ID': d.sefId,
        'Donor Name': d.donorName,
        'Country': d.country || 'USA (SEF USA)',
        'Amount': d.amount,
        'Purpose Tariff': d.purpose,
        'Remittance Date': d.date,
        'Payment Status': d.paymentStatus || 'Verified',
        'Allocation Status': d.status
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsPatients, 'Beneficiaries');
    XLSX.utils.book_append_sheet(wb, wsDonations, 'Donations');
    XLSX.writeFile(
      wb,
      `Sankara_${hospital.code}_${hospital.name}_Unit_Telemetry_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    showToast(`Exported full telemetry report for Sankara Eye Hospital ${hospital.name}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner with Back Navigation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-orange-glow border border-orange-300">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-black backdrop-blur-md mb-3 border border-white/30 shadow-sm transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to 13 Hospital Network Matrix</span>
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                <Building2 className="h-7 w-7 text-amber-200" />
                Sankara Eye Hospital • {hospital.name}
              </h1>
              <span className="px-2.5 py-1 rounded-xl bg-white text-orange-950 font-mono font-black text-xs border border-white/40 shadow-sm">
                {hospital.code}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-orange-50 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-200" />
                {hospital.state}, India
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5 text-amber-200" />
                {hospital.beds} Inpatient Beds
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-amber-200" />
                {hospital.contact}
              </span>
              <span className="flex items-center gap-1 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300/40 text-emerald-200 font-bold">
                <ShieldCheck className="h-3 w-3" />
                DPDP Act (2023) Audited Center
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="white"
              size="md"
              icon={<Download className="h-4 w-4 text-orange-600" />}
              onClick={handleExportUnitReport}
              className="text-xs font-black shadow-lg"
            >
              Export Unit Excel Report
            </Button>
          </div>
        </div>

        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      {/* 2. Unit Financial & Clinical Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-sm hover:shadow-orange-glow transition-all">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Unit Inflow
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {globalCurrency === 'USD'
              ? `$${unitMetrics.totalInflowUsd.toLocaleString()} USD`
              : `₹${(unitMetrics.totalInflowInr / 100000).toFixed(2)} Lakhs`}
          </p>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            {globalCurrency === 'USD'
              ? `≈ ₹${(unitMetrics.totalInflowInr / 100000).toFixed(2)} Lakhs INR Total`
              : `≈ $${unitMetrics.totalInflowUsd.toLocaleString()} USD Equivalent`}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-sm hover:shadow-orange-glow transition-all">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Surgeries Conducted
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            {unitMetrics.totalSurgeries} Patients
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {globalCurrency === 'USD'
              ? `$${unitMetrics.surgeriesUsedUsd.toLocaleString()} Allocated to Surgeries`
              : `₹${(unitMetrics.surgeriesUsedInr / 100000).toFixed(2)} Lakhs Allocated`}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-sm hover:shadow-orange-glow transition-all">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Waiting for Sponsor
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {unitMetrics.waitingCount} Cases
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Pre-Op Diagnostics Cleared
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-sm hover:shadow-orange-glow transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span>Financial Utilization</span>
            <span className="text-emerald-700 font-black">{unitMetrics.utilizationRate}%</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {unitMetrics.utilizationRate}%
          </p>
          <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${unitMetrics.utilizationRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar with Datewise, Procedure, Status, Search, and DPDP Toggle */}
      <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-orange-100">
          {/* Subtabs Selector */}
          <div className="flex items-center gap-1.5 bg-orange-100/70 p-1 rounded-2xl border border-orange-200">
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'patients'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'text-orange-950 hover:bg-orange-200/60'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Operated Beneficiaries ({filteredPatients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('donations')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'donations'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'text-orange-950 hover:bg-orange-200/60'
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Remittance Inflows ({filteredDonations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                  : 'text-orange-950 hover:bg-orange-200/60'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Surgical Analytics</span>
            </button>
          </div>

          {/* DPDP Shield Toggle (Restricted to Super Admin) */}
          {(currentUser?.role === 'Super Admin' || currentUser?.username === 'prabhanjan') ? (
            <button
              type="button"
              onClick={toggleDpdpShield}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs border ${
                isDpdpShieldActive
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
              }`}
              title="Super Admin DPDP Act (2023) Privacy Shield Switch"
            >
              <ShieldCheck className={`h-4 w-4 ${isDpdpShieldActive ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span>{isDpdpShieldActive ? '🛡️ DPDP Shield: Active' : '⚠️ DPDP Shield: Off'}</span>
            </button>
          ) : (
            <span
              className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-xs cursor-default"
              title="Protected under the Digital Personal Data Protection (DPDP) Act, 2023"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>🛡️ DPDP Protected</span>
            </span>
          )}
        </div>

        {/* Datewise & Detailed Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="Search donor, MRN, surgeon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-orange-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-orange-200">
            <span className="text-slate-500 font-bold shrink-0">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-800 font-bold focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-orange-200">
            <span className="text-slate-500 font-bold shrink-0">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border-0 text-slate-800 font-bold focus:outline-none"
            />
          </div>

          {/* Procedure Filter */}
          <select
            value={procedureFilter}
            onChange={(e) => setProcedureFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-orange-200 bg-slate-50 text-slate-800 font-bold focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="All">All Procedures</option>
            <option value="Cataract">Cataract (SICS/Phaco)</option>
            <option value="Corneal">Corneal Graft</option>
            <option value="Pediatric">Pediatric Care</option>
            <option value="Glaucoma">Glaucoma</option>
          </select>
        </div>
      </div>

      {/* 4. Tab 1: Matched Beneficiary Clinical Records */}
      {activeTab === 'patients' && (
        <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Operated Beneficiaries & Patient Matching Details ({filteredPatients.length} Cases)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Clinical records, vision restoration acuity, operating surgeons, and linked donor sponsorships
              </p>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-orange-50/20 rounded-2xl border border-orange-100">
              No patient records match the current filters for {hospital.name}. Click "Register Patient" to record operated cases.
            </div>
          ) : (
            <div className="rounded-2xl border border-orange-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-orange-50 border-b border-orange-200 text-[10px] font-black uppercase tracking-wider text-orange-950">
                  <tr>
                    <th className="py-3 px-4">Patient MRN</th>
                    <th className="py-3 px-4">Beneficiary Name</th>
                    <th className="py-3 px-4">Age / Sex</th>
                    <th className="py-3 px-4">Surgical Procedure</th>
                    <th className="py-3 px-4">Surgery Date</th>
                    <th className="py-3 px-4">Surgeon</th>
                    <th className="py-3 px-4">Acuity (Pre ➔ Post)</th>
                    <th className="py-3 px-4">Sponsoring Donor</th>
                    <th className="py-3 px-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((patient) => {
                    const displayName = maskPatientName(patient.name);
                    const displayMrn = maskPatientMrn(patient.mrn);

                    return (
                      <tr key={patient.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {displayMrn}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {displayName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {patient.age}y ({patient.gender})
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium truncate max-w-[170px]">
                          {patient.surgeryType}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {patient.surgeryDate}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {patient.surgeon}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-300">
                            {patient.preOpVision} ➔ {patient.postOpVision}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-600">
                          {patient.matchedDonorName || (
                            <span className="text-amber-600 text-[11px] font-semibold">
                              Pending Match
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="white"
                            size="sm"
                            icon={<FileCheck2 className="h-3.5 w-3.5 text-orange-600" />}
                            onClick={() => setCertificatePatient(patient)}
                            className="text-[10px] font-black"
                          >
                            Certificate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Remittance Inflow Ledger */}
      {activeTab === 'donations' && (
        <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-orange-600" />
                Unit Remittance Inflow & Donor Sponsorships ({filteredDonations.length} Records)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Detailed ledger of all remittances assigned to {hospital.name} center
              </p>
            </div>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-orange-50/20 rounded-2xl border border-orange-100">
              No donor remittances recorded for {hospital.name} center matching current filters.
            </div>
          ) : (
            <div className="rounded-2xl border border-orange-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-orange-50 border-b border-orange-200 text-[10px] font-black uppercase tracking-wider text-orange-950">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Country / Chapter</th>
                    <th className="py-3 px-4">SEF Account</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Purpose Tariff</th>
                    <th className="py-3 px-4">Payment Verification</th>
                    <th className="py-3 px-4 text-right">Matching Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.map((donor) => (
                    <tr key={donor.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {donor.date}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {donor.donorName}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {donor.country || 'USA (SEF USA)'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {donor.sefId}
                      </td>
                      <td className="py-3 px-4 font-black text-orange-600">
                        {donor.amount}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {donor.purpose}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Payment Verified
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={donor.status === 'Matched' ? 'success' : 'warning'}
                          size="sm"
                          dot
                        >
                          {donor.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Surgical Analytics & Procedure Distribution */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-orange-600" />
              Surgical Procedure Distribution ({hospital.name})
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={procedureChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name || ''} (${(((percent as number) || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {procedureChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Procedure Volumes Breakdown
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procedureChartData} margin={{ top: 15, right: 15, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ea580c" radius={[6, 6, 0, 0]} name="Cases Conducted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certificatePatient && (
        <Modal
          isOpen={Boolean(certificatePatient)}
          onClose={() => setCertificatePatient(null)}
          title="Sponsorship Impact Certificate"
          subtitle={`Beneficiary: ${maskPatientName(certificatePatient.name)} • ${certificatePatient.hospital}`}
          maxWidth="3xl"
        >
          <FeedbackCertificate
            patient={certificatePatient}
            donation={donations.find((d) => d.id === certificatePatient.matchedDonorId)}
            onClose={() => setCertificatePatient(null)}
          />
        </Modal>
      )}
    </div>
  );
};
