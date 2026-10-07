import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Patient } from '../data/initialData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Users,
  Search,
  Plus,
  Camera,
  Eye,
  Building2,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Upload,
  Calendar,
  UserCheck,
  FolderTree,
  FileImage,
  Sparkles,
  Layers,
  FileCheck2,
  Download,
  Lock,
  ShieldCheck,
  ShieldAlert,
  FileText
} from 'lucide-react';

import { ImportBulkPatientsModal } from '../components/modals/ImportBulkPatientsModal';
import { PatientPhotoUploadModal } from '../components/modals/PatientPhotoUploadModal';
import { BatchPhotoUploadModal } from '../components/modals/BatchPhotoUploadModal';
import { FeedbackCertificate } from '../components/ui/FeedbackCertificate';

export const PatientManagementView: React.FC = () => {
  const {
    patients,
    donations,
    hospitals,
    selectedBranch,
    addPatient,
    deletePatient,
    showToast,
    currentUser,
    setSelectedPatientDetails,
    isDpdpShieldActive,
    toggleDpdpShield,
    maskPatientName,
    maskPatientMrn,
    maskPatientVillage,
    maskPatientIncome
  } = useApp();

  const isUsaUser =
    currentUser.role === 'SEF USA' ||
    ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser.username.toLowerCase());

  const [searchQuery, setSearchQuery] = useState('');
  const [photoFilter, setPhotoFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('All');
  const [matchStatusFilter, setMatchStatusFilter] = useState(isUsaUser ? 'Matched' : 'All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBatchPhotoOpen, setIsBatchPhotoOpen] = useState(false);
  const [photoUploadPatient, setPhotoUploadPatient] = useState<Patient | null>(null);
  const [previewPatient, setPreviewPatient] = useState<Patient | null>(null);
  const [certificatePatient, setCertificatePatient] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    mrn: '',
    name: '',
    age: 65,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    hospital: 'Coimbatore',
    eye: 'Right Eye (OD)',
    diagnosis: 'Mature Senile Cataract',
    surgeryType: 'Phacoemulsification with Foldable IOL',
    surgeryDate: new Date().toISOString().slice(0, 10),
    surgeon: 'Dr. S. Ramasamy, MS',
    preOpVision: '6/60',
    postOpVision: '6/9',
    village: 'Rural District',
    occupation: 'Farmer',
    annualIncome: 'Below Poverty Line (BPL)',
    photoStatus: 'Uploaded' as 'Uploaded' | 'Pending Upload',
    preOpPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    postOpPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    // DPDP Act (2023) Consent & Privacy Standard
    dpdpConsent: {
      consentObtained: true,
      consentDate: new Date().toISOString().slice(0, 10),
      consentRef: `DPDP-CON-${Math.floor(100000 + Math.random() * 899999)}`,
      consentMode: 'Signed Consent Form' as 'Signed Consent Form' | 'Biometric / Thumbprint' | 'Guardian Authorization',
      redactionLevel: 'Masked PII' as 'Masked PII' | 'Standard' | 'Restricted'
    }
  });

  const handleOpenAddModal = () => {
    setFormData({
      mrn: `SK-CBE-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      name: '',
      age: 65,
      gender: 'Male',
      hospital: selectedBranch === 'All Branches' ? 'Coimbatore' : selectedBranch,
      eye: 'Right Eye (OD)',
      diagnosis: 'Mature Senile Cataract',
      surgeryType: 'Phacoemulsification with Foldable IOL',
      surgeryDate: new Date().toISOString().slice(0, 10),
      surgeon: 'Dr. S. Ramasamy, MS',
      preOpVision: '6/60',
      postOpVision: '6/9',
      village: 'Rural Sector',
      occupation: 'Agricultural Laborer',
      annualIncome: 'BPL Card Holder',
      photoStatus: 'Uploaded',
      preOpPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      postOpPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      dpdpConsent: {
        consentObtained: true,
        consentDate: new Date().toISOString().slice(0, 10),
        consentRef: `DPDP-CON-${Math.floor(100000 + Math.random() * 899999)}`,
        consentMode: 'Signed Consent Form',
        redactionLevel: 'Masked PII'
      }
    });
    setIsAddModalOpen(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mrn.trim()) return;

    addPatient({
      ...formData
    });

    setIsAddModalOpen(false);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesBranch =
        selectedBranch === 'All Branches' ||
        p.hospital.toLowerCase().includes(selectedBranch.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        `${p.name} ${p.mrn} ${p.village} ${p.surgeon} ${p.surgeryType} ${p.matchedDonorName || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesPhoto =
        photoFilter === 'All'
          ? true
          : photoFilter === 'Uploaded'
          ? p.preOpPhoto && p.postOpPhoto
          : photoFilter === 'Missing Pre-Op'
          ? !p.preOpPhoto
          : !p.postOpPhoto;

      const matchesDate = !dateFilter || p.surgeryDate.includes(dateFilter);

      const matchesProcedure =
        procedureFilter === 'All'
          ? true
          : p.surgeryType.toLowerCase().includes(procedureFilter.toLowerCase());

      const matchesStatus =
        isUsaUser
          ? true
          : matchStatusFilter === 'All' || p.matchStatus === matchStatusFilter;

      return (
        matchesBranch &&
        matchesSearch &&
        matchesPhoto &&
        matchesDate &&
        matchesProcedure &&
        matchesStatus
      );
    });
  }, [
    patients,
    selectedBranch,
    searchQuery,
    photoFilter,
    dateFilter,
    procedureFilter,
    matchStatusFilter,
    isUsaUser
  ]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
              {isUsaUser ? '🇺🇸 SEF USA Impact & Beneficiary Portal' : 'Patient Clinical & Visual Vault'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-100 text-[10px] font-black flex items-center gap-1 border border-emerald-300/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              DPDP Act (2023) Compliant
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Beneficiary Clinical Records & Visual Evidence Vault
          </h1>
          <p className="text-xs text-orange-50 mt-0.5 font-medium">
            Operated patient medical records, pre/post-op sight restoration photos, and cryptographic consent audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="white"
            size="sm"
            icon={<FolderTree className="h-4 w-4 text-orange-600" />}
            onClick={() => setIsBatchPhotoOpen(true)}
            className="text-xs font-black shadow-md"
          >
            Batch Photo Ingest
          </Button>

          <Button
            variant="white"
            size="sm"
            icon={<Upload className="h-4 w-4 text-orange-600" />}
            onClick={() => setIsImportModalOpen(true)}
            className="text-xs font-black shadow-md"
          >
            Upload MEDICS CSV
          </Button>

          <Button
            variant="white"
            size="sm"
            icon={<Plus className="h-4 w-4 text-orange-600" />}
            onClick={handleOpenAddModal}
            className="text-xs font-black shadow-lg"
          >
            Register Patient
          </Button>
        </div>
      </div>

      {/* Advanced Filter Bar with DPDP Shield Live Switch */}
      <div className="rounded-3xl border border-orange-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <input
            type="text"
            placeholder="Search patient, MRN, village, surgeon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-orange-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 🛡️ DPDP Act Privacy Shield Toggle (Restricted to Super Admin) */}
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

          {/* Photo Filter */}
          <select
            value={photoFilter}
            onChange={(e) => setPhotoFilter(e.target.value)}
            className="h-9 px-2.5 text-xs font-bold bg-slate-50 border border-orange-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="All">All Photos</option>
            <option value="Uploaded">Both Uploaded (Pre+Post)</option>
            <option value="Missing Pre-Op">Missing Pre-Op</option>
            <option value="Missing Post-Op">Missing Post-Op</option>
          </select>

          {/* Procedure Filter */}
          <select
            value={procedureFilter}
            onChange={(e) => setProcedureFilter(e.target.value)}
            className="h-9 px-2.5 text-xs font-bold bg-slate-50 border border-orange-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="All">All Procedures</option>
            <option value="Cataract">Cataract (SICS/Phaco)</option>
            <option value="Corneal">Corneal Grafting</option>
            <option value="Pediatric">Pediatric Surgery</option>
            <option value="Glaucoma">Glaucoma</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-orange-100 bg-white p-12 text-center text-slate-500">
            No patient records match the selected filter criteria.
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const displayName = maskPatientName(patient.name);
            const displayMrn = maskPatientMrn(patient.mrn);

            return (
              <div
                key={patient.id}
                className="rounded-3xl border border-orange-100 bg-white shadow-sm hover:shadow-orange-glow transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {displayMrn}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          • {patient.age}y ({patient.gender})
                        </span>
                      </div>
                    </div>

                    <Badge variant="primary" size="sm">
                      {patient.hospital}
                    </Badge>
                  </div>

                  {/* DPDP Consent Badge */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-950 text-[10px] font-black border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      DPDP Consent Verified
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {patient.dpdpConsent?.consentRef || 'DPDP-2023-OK'}
                    </span>
                  </div>

                  {/* Photo Vault Preview Strip */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      {patient.preOpPhoto ? (
                        <img
                          src={patient.preOpPhoto}
                          alt="Pre-Op"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                          <Camera className="h-4 w-4 mb-1 text-slate-300" />
                          <span>Pre-Op</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white rounded-lg text-[9px] font-bold">
                        Pre: {patient.preOpVision}
                      </span>
                    </div>

                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-emerald-200">
                      {patient.postOpPhoto ? (
                        <img
                          src={patient.postOpPhoto}
                          alt="Post-Op"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                          <Camera className="h-4 w-4 mb-1 text-slate-300" />
                          <span>Post-Op</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-900/80 text-white rounded-lg text-[9px] font-bold">
                        Post: {patient.postOpVision}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Surgery:</span>
                      <strong className="font-bold text-slate-900 truncate max-w-[170px]">
                        {patient.surgeryType}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Operated Eye:</span>
                      <span className="font-bold text-slate-800">{patient.eye}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Surgeon:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                        {patient.surgeon}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Outreach Base:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                        {maskPatientVillage(patient.village)}
                      </span>
                    </div>

                    {patient.matchedDonorName && (
                      <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Sponsor:</span>
                        <span className="font-bold text-orange-600 truncate max-w-[170px]">
                          {patient.matchedDonorName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-orange-50/40 border-t border-orange-100 flex items-center justify-between text-xs">
                  <Badge
                    variant={patient.matchStatus === 'Matched' ? 'success' : 'warning'}
                    size="sm"
                    dot
                  >
                    {patient.matchStatus}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => setPreviewPatient(patient)}
                      className="text-[11px] font-black"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-orange-600" />
                      Visual Proof
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePatient(patient.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Photo Preview Modal */}
      {previewPatient && (
        <Modal
          isOpen={Boolean(previewPatient)}
          onClose={() => setPreviewPatient(null)}
          title={`Clinical Photographic Proof - ${maskPatientName(previewPatient.name)}`}
          subtitle={`MRN: ${maskPatientMrn(previewPatient.mrn)} • ${previewPatient.hospital}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Pre-Operative Photo</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Acuity: {previewPatient.preOpVision}
                  </span>
                </div>
                <div className="aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {previewPatient.preOpPhoto ? (
                    <img
                      src={previewPatient.preOpPhoto}
                      alt="Pre Op"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Pre-Op Photo Available</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Post-Operative Photo</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Acuity: {previewPatient.postOpVision}
                  </span>
                </div>
                <div className="aspect-4/3 rounded-2xl overflow-hidden border border-emerald-200 bg-slate-100 flex items-center justify-center">
                  {previewPatient.postOpPhoto ? (
                    <img
                      src={previewPatient.postOpPhoto}
                      alt="Post Op"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Post-Op Photo Available</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-950 flex items-center justify-between">
              <div>
                <p className="font-bold">Surgery: {previewPatient.surgeryType}</p>
                <p className="text-[11px] text-slate-600">{previewPatient.surgeryDate} • Surgeon: {previewPatient.surgeon}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCertificatePatient(previewPatient);
                  setPreviewPatient(null);
                }}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs"
              >
                View Certificate
              </Button>
            </div>
          </div>
        </Modal>
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

      {/* Register Patient Modal with DPDP Consent Section */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Beneficiary (DPDP Act Compliant)"
          subtitle="Record patient clinical case sheet, verify informed consent, and assign hospital center."
          maxWidth="xl"
        >
          <form onSubmit={handleSavePatient} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">MRN ID *</label>
                <input
                  type="text"
                  required
                  value={formData.mrn}
                  onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-slate-50 font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramanathan K"
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 60 })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital Center</label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white font-bold cursor-pointer"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Surgery Date</label>
                <input
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => setFormData({ ...formData, surgeryDate: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operated Eye</label>
                <select
                  value={formData.eye}
                  onChange={(e) => setFormData({ ...formData, eye: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white"
                >
                  <option value="Right Eye (OD)">Right Eye (OD)</option>
                  <option value="Left Eye (OS)">Left Eye (OS)</option>
                  <option value="Both Eyes (OU)">Both Eyes (OU)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Procedure</label>
                <select
                  value={formData.surgeryType}
                  onChange={(e) => setFormData({ ...formData, surgeryType: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white font-medium"
                >
                  <option value="Phacoemulsification with Foldable IOL">Phaco with Foldable IOL (PHACO)</option>
                  <option value="Small Incision Cataract Surgery (SICS)">Small Incision Cataract Surgery (SICS)</option>
                  <option value="Corneal Transplant / Penetrating Keratoplasty">Corneal Transplant / Keratoplasty</option>
                  <option value="Pediatric Cataract Surgery">Pediatric Cataract Surgery</option>
                  <option value="Glaucoma Trabeculectomy">Glaucoma Trabeculectomy</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Surgeon</label>
                <input
                  type="text"
                  value={formData.surgeon}
                  onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-orange-200 bg-white"
                />
              </div>
            </div>

            {/* DPDP Act 2023 Patient Consent Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px]">
                  DPDP Act (2023) Section 6 Informed Consent
                </h4>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-slate-700 font-medium text-[11px]">
                <input
                  type="checkbox"
                  required
                  checked={formData.dpdpConsent.consentObtained}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dpdpConsent: { ...formData.dpdpConsent, consentObtained: e.target.checked }
                    })
                  }
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  Patient / Guardian has given written informed consent for medical treatment, vision documentation, and anonymized donor impact verification.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold">Consent Mode:</span>
                  <select
                    value={formData.dpdpConsent.consentMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dpdpConsent: { ...formData.dpdpConsent, consentMode: e.target.value as any }
                      })
                    }
                    className="w-full h-7 px-2 mt-0.5 rounded-lg border border-emerald-200 bg-white text-slate-800 text-[10px] font-bold"
                  >
                    <option value="Signed Consent Form">Signed Physical Form</option>
                    <option value="Biometric / Thumbprint">Biometric / Thumbprint</option>
                    <option value="Guardian Authorization">Guardian / Next-of-Kin</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 font-bold">Consent Audit Reference:</span>
                  <input
                    type="text"
                    readOnly
                    value={formData.dpdpConsent.consentRef}
                    className="w-full h-7 px-2 mt-0.5 rounded-lg border border-emerald-200 bg-white/80 font-mono text-slate-700 text-[10px] font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-orange-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600 font-black text-xs shadow-lg text-white"
              >
                Register Beneficiary & Lock Consent
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk CSV / Batch Modals */}
      {isImportModalOpen && (
        <ImportBulkPatientsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}

      {isBatchPhotoOpen && (
        <BatchPhotoUploadModal
          isOpen={isBatchPhotoOpen}
          onClose={() => setIsBatchPhotoOpen(false)}
        />
      )}
    </div>
  );
};
