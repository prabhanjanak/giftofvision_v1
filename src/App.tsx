import React, { useState } from'react';
import { useApp } from'./context/AppContext';
import { Navbar } from'./components/layout/Navbar';
import { Sidebar } from'./components/layout/Sidebar';
import { ToastContainer } from'./components/ui/ToastContainer';
import { LoginView } from'./views/LoginView';
import { DashboardView } from './views/DashboardView';
import { DonorManagementView } from './views/DonorManagementView';
import { PatientManagementView } from'./views/PatientManagementView';
import { MatchingWizardView } from'./views/MatchingWizardView';
import { QualityAssuranceView } from'./views/QualityAssuranceView';
import { DispatchView } from './views/DispatchView';
import { AuditLogsView } from './views/AuditLogsView';
import { CalendarEventsView } from'./views/CalendarEventsView';
import { ReportsAnalyticsView } from'./views/ReportsAnalyticsView';
import { MasterSettingsView } from'./views/MasterSettingsView';
import { DonorDetailsModal } from'./components/modals/DonorDetailsModal';
import { PatientDetailsModal } from'./components/modals/PatientDetailsModal';
import { Modal } from'./components/ui/Modal';
import { Button } from'./components/ui/Button';

export const AppContent: React.FC = () => {
 const {
 isAuthenticated,
 activeTab,
 setActiveTab,
 addDonation,
 addPatient,
 hospitals,
 selectedBranch,
 purposes,
 donations,
 patients,
 selectedDonorDetails,
 setSelectedDonorDetails,
 selectedPatientDetails,
 setSelectedPatientDetails
 } = useApp();

 // Quick Action Modals
 const [isQuickDonationOpen, setIsQuickDonationOpen] = useState(false);
 const [isQuickPatientOpen, setIsQuickPatientOpen] = useState(false);

 // Quick Donation Form
 const [quickDonForm, setQuickDonForm] = useState({
 donorName: '',
 country: 'USA (SEF USA)',
 sefId: `SEF-USA-${Math.floor(400000 + Math.random() * 99999)}`,
 currency:'USD ($)'as'USD ($)'|'INR (₹)'|'GBP (£)'|'EUR (€)',
 numericAmount: 180,
 amount:'$180',
 purpose:'Cataract Surgery',
 date: new Date().toISOString().slice(0, 10),
 location: selectedBranch ==='All Branches'?'Coimbatore': selectedBranch,
 email:'',
 specialRequest:'',
 type:'One-Time'as const
 });

 // Quick Patient Form
 const [quickPatForm, setQuickPatForm] = useState({
 mrn: `SK-CBE-2026-${Math.floor(1000 + Math.random() * 8999)}`,
 name:'',
 age: 65,
 gender:'Male'as const,
 hospital: selectedBranch ==='All Branches'?'Coimbatore': selectedBranch,
 eye:'Right Eye (OD)',
 diagnosis:'Mature Senile Cataract',
 surgeryType:'Phacoemulsification with Foldable IOL',
 surgeryDate: new Date().toISOString().slice(0, 10),
 surgeon:'Dr. S. Ramasamy, MS',
 preOpVision:'6/60',
 postOpVision:'6/9',
 village:'Rural Sector',
 occupation:'Agricultural Laborer',
 annualIncome:'Rs. 32,000',
 photoStatus:'Uploaded'as const,
 preOpPhoto:'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
 postOpPhoto:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
 });

 if (!isAuthenticated) {
 return (
 <>
 <LoginView />
 <ToastContainer />
 </>
 );
 }

 const handleSaveQuickDonation = (e: React.FormEvent) => {
 e.preventDefault();
 if (!quickDonForm.donorName.trim()) return;
 addDonation(quickDonForm);
 setIsQuickDonationOpen(false);
 };

 const handleSaveQuickPatient = (e: React.FormEvent) => {
 e.preventDefault();
 if (!quickPatForm.name.trim()) return;
 addPatient(quickPatForm);
 setIsQuickPatientOpen(false);
 };

 const matchedPatientForSelectedDonor = selectedDonorDetails?.matchedPatientId
 ? patients.find((p) => p.id === selectedDonorDetails.matchedPatientId)
 : null;

 const matchedDonorForSelectedPatient = selectedPatientDetails?.matchedDonorId
 ? donations.find((d) => d.id === selectedPatientDetails.matchedDonorId)
 : null;

 return (
 <div className="flex min-h-screen flex-col bg-slate-50">
 <Navbar
 onOpenNewDonation={() => setIsQuickDonationOpen(true)}
 onOpenNewPatient={() => setIsQuickPatientOpen(true)}
 />

 <div className="flex flex-1">
 <Sidebar />

 <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
 {activeTab ==='dashboard'&& (
 <DashboardView
 onOpenNewDonation={() => setIsQuickDonationOpen(true)}
 onOpenNewPatient={() => setIsQuickPatientOpen(true)}
 />
 )}
 {activeTab ==='donors'&& <DonorManagementView />}
 {activeTab ==='patients'&& <PatientManagementView />}
 {activeTab ==='matching_wizard'&& <MatchingWizardView />}
 {activeTab ==='qa'&& <QualityAssuranceView />}
 {activeTab ==='dispatch'&& <DispatchView />}
 {activeTab ==='audit_logs'&& <AuditLogsView />}
 {activeTab ==='calendar'&& <CalendarEventsView />}
 {activeTab ==='reports'&& <ReportsAnalyticsView />}
 {activeTab ==='settings'&& <MasterSettingsView />}
 </main>
 </div>

 <ToastContainer />

 {/* Global Donor Details Panel Modal */}
 {selectedDonorDetails && (
 <DonorDetailsModal
 donation={selectedDonorDetails}
 matchedPatient={matchedPatientForSelectedDonor}
 isOpen={!!selectedDonorDetails}
 onClose={() => setSelectedDonorDetails(null)}
 onViewPatient={(p) => {
 setSelectedDonorDetails(null);
 setSelectedPatientDetails(p);
 }}
 onOpenMatchWizard={() => {
 setSelectedDonorDetails(null);
 setActiveTab('matching_wizard');
 }}
 />
 )}

 {/* Global Patient Details Panel Modal */}
 {selectedPatientDetails && (
 <PatientDetailsModal
 patient={selectedPatientDetails}
 matchedDonor={matchedDonorForSelectedPatient}
 isOpen={!!selectedPatientDetails}
 onClose={() => setSelectedPatientDetails(null)}
 onViewDonor={(d) => {
 setSelectedPatientDetails(null);
 setSelectedDonorDetails(d);
 }}
 />
 )}

 {/* Global Quick Donation Modal */}
 {isQuickDonationOpen && (
 <Modal
 isOpen={isQuickDonationOpen}
 onClose={() => setIsQuickDonationOpen(false)}
 title="Record Incoming Donation & Sponsorship"
 subtitle="Add SEF USA or India remittance with automatic surgery quantity calculation."
 maxWidth="lg"
 >
 <form onSubmit={handleSaveQuickDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Donor / Sponsor Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Naveen Immidisetty & Swapna Kancherla"
                  value={quickDonForm.donorName}
                  onChange={(e) => setQuickDonForm({ ...quickDonForm, donorName: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Country Selection & Currency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country / Chapter *
                  </label>
                  <select
                    value={quickDonForm.country || 'USA (SEF USA)'}
                    onChange={(e) => {
                      const country = e.target.value;
                      let curr: 'USD ($)' | 'INR (₹)' | 'GBP (£)' | 'EUR (€)' = 'USD ($)';
                      let symb = '$';
                      let defaultAmt = 180;

                      if (country.includes('India')) {
                        curr = 'INR (₹)';
                        symb = '₹';
                        defaultAmt = 3500;
                      } else if (country.includes('UK') || country.includes('United Kingdom')) {
                        curr = 'GBP (£)';
                        symb = '£';
                        defaultAmt = 150;
                      } else if (country.includes('Europe')) {
                        curr = 'EUR (€)';
                        symb = '€';
                        defaultAmt = 150;
                      }

                      setQuickDonForm({
                        ...quickDonForm,
                        country,
                        currency: curr,
                        numericAmount: defaultAmt,
                        amount: `${symb}${defaultAmt}`,
                        sefId: country.includes('USA') ? `SEF-USA-${Math.floor(400000 + Math.random() * 99999)}` : `SEF-IND-${Math.floor(200000 + Math.random() * 99999)}`
                      });
                    }}
                    className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 cursor-pointer"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={quickDonForm.currency}
                    onChange={(e) => {
                      const curr = e.target.value as any;
                      const symb = curr.includes('INR') ? '₹' : (curr.includes('GBP') ? '£' : (curr.includes('EUR') ? '€' : '$'));
                      setQuickDonForm({
                        ...quickDonForm,
                        currency: curr,
                        amount: `${symb}${quickDonForm.numericAmount}`
                      });
                    }}
                    className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="USD ($)">🇺🇸 USD ($ - SEF USA)</option>
                    <option value="INR (₹)">🇮🇳 INR (₹ - India)</option>
                    <option value="GBP (£)">🇬🇧 GBP (£ - UK)</option>
                    <option value="EUR (€)">🇪🇺 EUR (€ - Europe)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount Received *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 184"
                    value={quickDonForm.numericAmount}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      const symb = quickDonForm.currency.includes('INR') ? '₹' : (quickDonForm.currency.includes('GBP') ? '£' : (quickDonForm.currency.includes('EUR') ? '€' : '$'));
                      setQuickDonForm({
                        ...quickDonForm,
                        numericAmount: num,
                        amount: `${symb}${num}`
                      });
                    }}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Unit Allocation
                  </label>
                  <select
                    value={quickDonForm.location}
                    onChange={(e) => setQuickDonForm({ ...quickDonForm, location: e.target.value })}
                    className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
                  >
                    <option value="Any">Any Branch (National Allocation)</option>
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
                    value={quickDonForm.purpose}
                    onChange={(e) => setQuickDonForm({ ...quickDonForm, purpose: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
                  >
                    {purposes.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({quickDonForm.currency.includes('INR') ? `₹${p.costInr}` : `$${p.costUsd}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Surgery Quantity & General Care Split Banner */}
              {(() => {
                const isInr = quickDonForm.currency.includes('INR');
                let costPerSurg = isInr ? 3500 : 50;
                if (quickDonForm.purpose.includes('Corneal') || quickDonForm.purpose.includes('Child')) {
                  costPerSurg = isInr ? 7000 : 100;
                } else if (quickDonForm.purpose.includes('Food') || quickDonForm.purpose.includes('Annadhanam')) {
                  costPerSurg = isInr ? 10000 : 200;
                }

                const fullSurgeries = Math.floor(quickDonForm.numericAmount / costPerSurg);
                const remainder = quickDonForm.numericAmount - (fullSurgeries * costPerSurg);
                const symb = isInr ? '₹' : '$';

                return (
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs">
                    <p className="font-bold text-orange-950 flex items-center gap-1.5">
                      <span>✨ Sponsorship Allocation Split:</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                      <span className="font-bold bg-white px-2 py-0.5 rounded-lg border border-orange-200 text-orange-800">
                        🎯 {fullSurgeries > 0 ? `${fullSurgeries} Surgeries (${symb}${(fullSurgeries * costPerSurg).toLocaleString()})` : `Partial Co-Sponsorship (${Math.round((quickDonForm.numericAmount / costPerSurg) * 100)}% Funded)`}
                      </span>
                      {remainder > 0 && (
                        <span className="font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-emerald-800">
                          💊 +{symb}{remainder.toLocaleString()} to General Inpatient Medicines & Meals
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Dedication / Occasion / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday memorial / Send certificate to donor"
                  value={quickDonForm.specialRequest}
                  onChange={(e) => setQuickDonForm({ ...quickDonForm, specialRequest: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

 <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsQuickDonationOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-sankara-800 hover:bg-sankara-900 font-bold">
 Save & Add to Queue
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* Global Quick Patient Modal */}
 {isQuickPatientOpen && (
 <Modal
 isOpen={isQuickPatientOpen}
 onClose={() => setIsQuickPatientOpen(false)}
 title="Register Operated Patient"
 subtitle="Record patient clinical case sheet, procedure, and vision recovery details."
 maxWidth="2xl"
 >
 <form onSubmit={handleSaveQuickPatient} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Patient Full Name *
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Kuppusamy R"
 value={quickPatForm.name}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, name: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Hospital MRN ID *
 </label>
 <input
 type="text"
 required
 value={quickPatForm.mrn}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, mrn: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Hospital Branch
 </label>
 <select
 value={quickPatForm.hospital}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, hospital: e.target.value })}
 className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-sankara-500"
 >
 {hospitals.map((h) => (
 <option key={h.id} value={h.name}>
 {h.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Operated Eye
 </label>
 <select
 value={quickPatForm.eye}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, eye: e.target.value })}
 className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-sankara-500"
 >
 <option value="Right Eye (OD)">Right Eye (OD)</option>
 <option value="Left Eye (OS)">Left Eye (OS)</option>
 <option value="Both Eyes (OU)">Both Eyes (OU)</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Age & Gender
 </label>
 <div className="flex gap-2">
 <input
 type="number"
 value={quickPatForm.age}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, age: parseInt(e.target.value) || 60 })}
 className="w-16 h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
 />
 <select
 value={quickPatForm.gender}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, gender: e.target.value as any })}
 className="flex-1 h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
 >
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Surgical Procedure *
 </label>
 <select
 value={quickPatForm.surgeryType}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, surgeryType: e.target.value })}
 className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-sankara-500"
 >
 <option value="Small Incision Cataract Surgery (SICS) + Foldable IOL">
 Small Incision Cataract Surgery (SICS) + IOL
 </option>
 <option value="Phacoemulsification with Foldable IOL (PHACO)">
 Phacoemulsification with Foldable IOL (PHACO)
 </option>
 <option value="Extracapsular Cataract Extraction (ECCE) + IOL">
 Extracapsular Cataract Extraction (ECCE) + IOL
 </option>
 <option value="Corneal Graft / Penetrating Keratoplasty (PK)">
 Corneal Transplant / Penetrating Keratoplasty
 </option>
 <option value="Dacryocystorhinostomy (DCR)">
 Dacryocystorhinostomy (DCR)
 </option>
 <option value="Pediatric Cataract Surgery + Anterior Vitrectomy">
 Pediatric Cataract Surgery
 </option>
 <option value="Glaucoma Trabeculectomy + MMC">
 Glaucoma Trabeculectomy
 </option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Operating Surgeon
 </label>
 <input
 type="text"
 value={quickPatForm.surgeon}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, surgeon: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Pre-Op Vision (Before)
 </label>
 <input
 type="text"
 value={quickPatForm.preOpVision}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, preOpVision: e.target.value })}
 placeholder="Hand Movements (6/60)"
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Post-Op Vision (Restored)
 </label>
 <input
 type="text"
 value={quickPatForm.postOpVision}
 onChange={(e) => setQuickPatForm({ ...quickPatForm, postOpVision: e.target.value })}
 placeholder="6/9 Normal Sight"
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsQuickPatientOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-sankara-800 hover:bg-sankara-900 font-bold">
 Register & Save Case
 </Button>
 </div>
 </form>
 </Modal>
 )}
 </div>
 );
};

import { AppProvider } from'./context/AppContext';

export default function App() {
 return (
 <AppProvider>
 <AppContent />
 </AppProvider>
 );
}
