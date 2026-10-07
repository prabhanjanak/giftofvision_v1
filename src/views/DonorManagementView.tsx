import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Donation } from '../data/initialData';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImportBulkDonorsModal } from '../components/modals/ImportBulkDonorsModal';
import {
  HeartHandshake,
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  Mail,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Globe,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DonorManagementView: React.FC = () => {
  const {
    donations,
    purposes,
    hospitals,
    selectedBranch,
    addDonation,
    updateDonation,
    deleteDonation,
    setSelectedDonorDetails,
    currentUser,
    showToast
  } = useApp();

  const isUsaUser =
    currentUser.role === 'SEF USA' ||
    ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser.username.toLowerCase());

  const [activeTypeTab, setActiveTypeTab] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  const [formData, setFormData] = useState({
    donorName: '',
    country: 'USA (SEF USA)',
    sefId: '',
    amount: '$50',
    purpose: 'Cataract Surgery',
    date: new Date().toISOString().slice(0, 10),
    location: 'Coimbatore',
    email: '',
    specialRequest: '',
    type: 'One-Time' as 'One-Time' | 'Endowment' | 'Recurring OEM' | 'Recurring OEW' | 'Bulk',
    paymentStatus: 'Verified' as 'Verified' | 'Pending Verification'
  });

  const handleOpenAddModal = () => {
    setEditingDonation(null);
    setFormData({
      donorName: '',
      country: isUsaUser ? 'USA (SEF USA)' : 'India',
      sefId: isUsaUser ? `SEF-USA-${Math.floor(400000 + Math.random() * 99999)}` : `SEF-IND-${Math.floor(200000 + Math.random() * 99999)}`,
      amount: isUsaUser ? '$50' : '₹3,500',
      purpose: 'Cataract Surgery',
      date: new Date().toISOString().slice(0, 10),
      location: selectedBranch === 'All Branches' ? 'Coimbatore' : selectedBranch,
      email: '',
      specialRequest: '',
      type: 'One-Time',
      paymentStatus: 'Verified'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      donorName: donation.donorName,
      country: donation.country || (donation.amount.includes('$') ? 'USA (SEF USA)' : 'India'),
      sefId: donation.sefId,
      amount: donation.amount,
      purpose: donation.purpose,
      date: donation.date,
      location: donation.location,
      email: donation.email,
      specialRequest: donation.specialRequest || '',
      type: donation.type,
      paymentStatus: donation.paymentStatus || 'Verified'
    });
    setIsModalOpen(true);
  };

  const handleSaveDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName.trim()) return;

    if (editingDonation) {
      updateDonation(editingDonation.id, formData);
    } else {
      addDonation(formData);
    }
    setIsModalOpen(false);
  };

  // 1-Click Payment Verification Toggle
  const handleTogglePaymentStatus = (e: React.MouseEvent, donor: Donation) => {
    e.stopPropagation();
    const current = donor.paymentStatus || 'Verified';
    const nextStatus = current === 'Verified' ? 'Pending Verification' : 'Verified';
    updateDonation(donor.id, { paymentStatus: nextStatus });
    showToast(
      nextStatus === 'Verified'
        ? `Payment verified for ${donor.donorName}! Remittance cleared for matching.`
        : `Payment marked as pending verification for ${donor.donorName}.`,
      nextStatus === 'Verified' ? 'success' : 'info'
    );
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesBranch =
        selectedBranch === 'All Branches' ||
        d.location.toLowerCase().includes(selectedBranch.toLowerCase()) ||
        d.location === 'Any';

      const matchesType =
        activeTypeTab === 'All'
          ? true
          : activeTypeTab === 'SEF_USA'
          ? d.amount.includes('$') || (d.country && d.country.includes('USA'))
          : d.type === activeTypeTab;

      const matchesPayment =
        paymentFilter === 'All'
          ? true
          : paymentFilter === 'Verified'
          ? (d.paymentStatus || 'Verified') === 'Verified'
          : d.paymentStatus === 'Pending Verification';

      const matchesSearch =
        !searchQuery ||
        `${d.donorName} ${d.sefId} ${d.email} ${d.location} ${d.purpose} ${d.amount} ${d.country || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesBranch && matchesType && matchesPayment && matchesSearch;
    });
  }, [donations, selectedBranch, activeTypeTab, paymentFilter, searchQuery]);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const typeTabs = [
    { id: 'All', label: 'All Donors' },
    { id: 'SEF_USA', label: '🇺🇸 SEF USA Remittances ($)' },
    { id: 'One-Time', label: 'One-Time' },
    { id: 'Endowment', label: 'Endowment' },
    { id: 'Recurring OEM', label: 'OEM (Monthly)' },
    { id: 'Recurring OEW', label: 'OEW (Weekly)' },
    { id: 'Bulk', label: 'Bulk Entries' }
  ];

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredDonations.map((d) => ({
        'Donor Name': d.donorName,
        'SEF ID': d.sefId,
        Amount: d.amount,
        Country: d.country || (d.amount.includes('$') ? 'USA (SEF USA)' : 'India'),
        PaymentStatus: d.paymentStatus || 'Verified',
        Type: d.type,
        Purpose: d.purpose,
        'Hospital Location': d.location,
        Date: d.date,
        Email: d.email,
        'Special Occasion/Dedication': d.specialRequest || '',
        'Matched Patient': d.matchedPatientName || 'None',
        Status: d.status
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DonorsRegistry');
    XLSX.writeFile(wb, `GiftOfVision_Donors_${activeTypeTab}.xlsx`);
    showToast('Donor records exported to Excel');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-orange-glow border border-orange-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-black text-orange-950 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
              {isUsaUser ? '🇺🇸 SEF USA Remittance Portal' : 'Sankara Global Donor Console'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Live Audited Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Donor Records & Payment Validation Console
          </h1>
          <p className="text-xs text-orange-50 mt-0.5 font-medium">
            Manage incoming remittances, validate wire/check payments, upload bulk spreadsheets, and allocate to 13 Sankara hospital units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="white"
            size="sm"
            icon={<Upload className="h-4 w-4 text-orange-600" />}
            onClick={() => setIsImportModalOpen(true)}
            className="text-xs font-black shadow-lg"
          >
            Bulk Donor Upload & Template
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportExcel}
            className="border-white/40 text-white hover:bg-white/15 font-bold text-xs"
          >
            Export Excel
          </Button>

          <Button
            variant="white"
            size="sm"
            icon={<Plus className="h-4 w-4 text-orange-600" />}
            onClick={handleOpenAddModal}
            className="text-xs font-black shadow-lg"
          >
            Add New Donor
          </Button>
        </div>
      </div>

      {/* Tabs, Payment Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-orange-200/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {typeTabs.map((tab) => {
            const count =
              tab.id === 'All'
                ? donations.length
                : tab.id === 'SEF_USA'
                ? donations.filter((d) => d.amount.includes('$') || (d.country && d.country.includes('USA'))).length
                : donations.filter((d) => d.type === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTypeTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  activeTypeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-orange-50 hover:text-orange-950'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTypeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-100 text-orange-950'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Payment Status Filter */}
          <div className="flex items-center gap-1 bg-orange-100/70 p-1 rounded-xl border border-orange-200">
            <button
              onClick={() => setPaymentFilter('All')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                paymentFilter === 'All' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setPaymentFilter('Verified')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                paymentFilter === 'Verified' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </button>
            <button
              onClick={() => setPaymentFilter('Pending')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                paymentFilter === 'Pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3 w-3" />
              Pending
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
            <input
              type="text"
              placeholder="Search donor name, SEF ID, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8.5 pl-9 pr-3 text-xs bg-white border border-orange-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Donors Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedDonations.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-600 bg-white rounded-3xl border border-orange-100 shadow-sm">
            No donor records match your current filters. Click "Add New Donor" or "Bulk Donor Upload" above to add records!
          </div>
        ) : (
          paginatedDonations.map((donor) => {
            const isPaymentVerified = (donor.paymentStatus || 'Verified') === 'Verified';

            return (
              <div
                key={donor.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-orange-glow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedDonorDetails(donor)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {donor.donorName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-600">
                          {donor.sefId}
                        </span>
                        {donor.country && (
                          <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {donor.country}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge variant={donor.type === 'Endowment' ? 'purple' : 'primary'} size="sm">
                      {donor.type}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Donation Amount:</span>
                      <strong className="font-black text-base text-orange-600">
                        {donor.amount}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Purpose / Tariff:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[160px]">
                        {donor.purpose}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Hospital Center:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-orange-500" />
                        {donor.location}
                      </span>
                    </div>

                    {donor.specialRequest && (
                      <div className="pt-2 border-t border-orange-100">
                        <p className="text-[11px] text-slate-600 italic line-clamp-1">
                          "{donor.specialRequest}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action & Payment Validation Footer */}
                <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
                  {/* Payment Verification Badge / Button */}
                  <button
                    type="button"
                    onClick={(e) => handleTogglePaymentStatus(e, donor)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all border shadow-xs ${
                      isPaymentVerified
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                    title="Click to toggle Payment Verification status"
                  >
                    {isPaymentVerified ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Payment Verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Pending Payment</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(donor)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                      title="Edit Donor"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDonation(donor.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-orange-200">
        <p className="text-xs text-slate-600 font-medium">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredDonations.length)} of {filteredDonations.length} donors
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ChevronLeft className="h-3.5 w-3.5" />}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="border-orange-200 text-xs font-bold"
          >
            Previous
          </Button>
          <span className="text-xs font-bold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="border-orange-200 text-xs font-bold"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Add / Edit Donor Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDonation ? 'Edit Donor Sponsorship Record' : 'Record New Donor Sponsorship'}
          subtitle="Add donor details, select country/chapter, set payment status, and allocate to hospital branch."
          maxWidth="xl"
        >
          <form onSubmit={handleSaveDonation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Donor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh & Falguni Patel"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Country / Chapter *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => {
                    const country = e.target.value;
                    let defaultAmt = '$50';
                    let defaultSef = `SEF-USA-${Math.floor(400000 + Math.random() * 99999)}`;
                    if (country.includes('India')) {
                      defaultAmt = '₹3,500';
                      defaultSef = `SEF-IND-${Math.floor(200000 + Math.random() * 99999)}`;
                    } else if (country.includes('UK')) {
                      defaultAmt = '£40';
                      defaultSef = `SEF-UK-${Math.floor(300000 + Math.random() * 99999)}`;
                    }
                    setFormData({
                      ...formData,
                      country,
                      amount: defaultAmt,
                      sefId: defaultSef
                    });
                  }}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="USA (SEF USA)">🇺🇸 USA (SEF USA - 501c3)</option>
                  <option value="India">🇮🇳 India (Direct 80G)</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom (SEF UK)</option>
                  <option value="Canada">🇨🇦 Canada (SEF Canada)</option>
                  <option value="Australia">🇦🇺 Australia (SEF AU)</option>
                  <option value="UAE / Middle East">🇦🇪 UAE / Middle East</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Other Global Chapter">🌍 Other Global Chapter</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SEF ID / Account *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SEF-USA-492100"
                  value={formData.sefId}
                  onChange={(e) => setFormData({ ...formData, sefId: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Received *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. $180 or ₹3,500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Verification *
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Verified">✅ Verified (Payment Cleared)</option>
                  <option value="Pending Verification">⏳ Pending Verification</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Branch Allocation
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Any">Any Branch (National Pool)</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.code} - {h.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose / Tariff
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {purposes.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Donor Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. donor@sefusa.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Occasion / Memorial / Dedication
              </label>
              <input
                type="text"
                placeholder="e.g. In loving memory of parents / Send certificate by mail"
                value={formData.specialRequest}
                onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600 font-black text-xs shadow-lg"
              >
                {editingDonation ? 'Save Changes' : 'Record Donor Sponsorship'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Donor Import & Staging Verification Modal */}
      {isImportModalOpen && (
        <ImportBulkDonorsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </div>
  );
};
