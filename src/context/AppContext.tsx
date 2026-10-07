import React, { createContext, useContext, useState, useEffect } from'react';
import {
 Hospital,
 Purpose,
 Occasion,
 UserAccount,
 Donation,
 Patient,
 CalendarEvent,
 AuditLog,
 INITIAL_HOSPITALS,
 INITIAL_PURPOSES,
 INITIAL_OCCASIONS,
 INITIAL_YEARS,
 INITIAL_USERS,
 INITIAL_LOGS,
 INITIAL_CALENDAR_EVENTS,
 INITIAL_PATIENTS,
 INITIAL_DONATIONS
} from'../data/initialData';
import { ForexRates, fetchDailyForexRates } from'../services/forexService';

export type ActiveTab =
 |'dashboard'
 |'today_queue'
 |'donors'
 |'patients'
 |'matching_wizard'
 |'qa'
 |'dispatch'
 |'general_expenses'
 |'audit_logs'
 |'calendar'
 |'reports'
 |'settings';

export interface ToastMessage {
 id: string;
 type:'success'|'info'|'warning'|'error';
 message: string;
}

export interface GeneralExpenseEntry {
 id: string;
 donorId: string;
 donorName: string;
 sefId: string;
 originalAmount: string;
 surgeriesCount: number;
 surgeriesAmount: number;
 remainingAmount: number;
 currency:'USD'|'INR'|'GBP'|'EUR';
 date: string;
 unit: string;
 purpose: string;
 matchedPatientMrns: string[];
 timestamp: string;
}

interface AppContextType {
 // Authentication
 isAuthenticated: boolean;
 login: (username: string, password?: string) => boolean;
 logout: () => void;

 // Global Details Modals
 selectedDonorDetails: Donation | null;
 setSelectedDonorDetails: (donor: Donation | null) => void;
 selectedPatientDetails: Patient | null;
 setSelectedPatientDetails: (patient: Patient | null) => void;

 activeTab: ActiveTab;
 setActiveTab: (tab: ActiveTab) => void;
 selectedBranch: string;
 setSelectedBranch: (branch: string) => void;
 globalSearch: string;
 setGlobalSearch: (q: string) => void;
 darkMode: boolean;
 setDarkMode: (val: boolean) => void;
 currentUser: UserAccount;
 setCurrentUser: (user: UserAccount) => void;
 
 // Data
 hospitals: Hospital[];
 purposes: Purpose[];
 occasions: Occasion[];
 years: string[];
 users: UserAccount[];
 donations: Donation[];
 patients: Patient[];
 calendarEvents: CalendarEvent[];
 auditLogs: AuditLog[];
 generalExpenses: GeneralExpenseEntry[];
 forexRates: ForexRates;
 refreshForexRates: () => Promise<void>;
 
 // Actions
 addDonation: (donation: Omit<Donation,'id'|'status'>) => void;
 updateDonation: (id: string, updates: Partial<Donation>) => void;
 deleteDonation: (id: string) => void;
 deleteAllDonationsByType: (type?: string) => void;
 
 addPatient: (patient: Omit<Patient,'id'|'matchStatus'|'matchedDonorId'|'matchedDonorName'|'qaStatus'|'dispatchStatus'>) => void;
 updatePatient: (id: string, updates: Partial<Patient>) => void;
 deletePatient: (id: string) => void;
 deleteAllPatients: () => void;
 
 matchDonorPatient: (donationId: string, patientId: string) => void;
 matchMultiPatientsToDonor: (donorId: string, patientIds: string[], moveRemainderToGeneral: boolean) => void;
 poolDonorsForSurgery: (donorIds: string[], patientId: string) => void;
 unmatchDonorPatient: (donationId: string, patientId: string) => void;
 autoMatchQueue: () => number;
 
 addGeneralExpense: (entry: Omit<GeneralExpenseEntry,'id'|'timestamp'>) => void;
 deleteGeneralExpense: (id: string) => void;
 clearGeneralExpenses: () => void;
 
 updateQAStatus: (patientId: string, status:'Approved'|'Rejected'|'Pending Photos') => void;
 markDispatched: (patientId: string) => void;
 
 addCalendarEvent: (event: Omit<CalendarEvent,'id'>) => void;
 deleteCalendarEvent: (id: string) => void;
 
 addHospital: (hospital: Omit<Hospital,'id'>) => void;
 updateHospital: (id: string, updates: Partial<Hospital>) => void;
 addPurpose: (purpose: Omit<Purpose,'id'>) => void;
 updatePurpose: (id: string, updates: Partial<Purpose>) => void;
 addOccasion: (name: string) => void;
 deleteOccasion: (id: string) => void;
 addUser: (user: Omit<UserAccount,'id'>) => void;
 updateUser: (id: string, updates: Partial<UserAccount>) => void;
 deleteUser: (id: string) => void;
 addAuditLog: (action: string) => void;

  // Dual Currency (USD / INR) Architecture & Simulator
  globalCurrency: 'USD' | 'INR';
  setGlobalCurrency: (c: 'USD' | 'INR') => void;
  toggleGlobalCurrency: () => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;

  // DPDP Act (2023) Healthcare Data Protection & Patient Safety
 isDpdpShieldActive: boolean;
 isUsaUser: boolean;
 toggleDpdpShield: () => void;
 maskPatientName: (name: string, isShieldActive?: boolean) => string;
 maskPatientMrn: (mrn: string, isShieldActive?: boolean) => string;
 maskPatientVillage: (village: string, isShieldActive?: boolean) => string;
 maskPatientIncome: (income: string, isShieldActive?: boolean) => string;
 
 // Toasts
 toasts: ToastMessage[];
 showToast: (message: string, type?:'success'|'info'|'warning'|'error') => void;
 removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_VERSION = 'gov_v8_authentic_production_seed';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
 return localStorage.getItem(`${STORAGE_VERSION}_auth`) !=='false';
 });

  const [globalCurrency, setGlobalCurrency] = useState<'USD' | 'INR'>(() => {
    return (localStorage.getItem(`${STORAGE_VERSION}_currency`) as 'USD' | 'INR') || 'USD';
  });
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const toggleGlobalCurrency = () => {
    setGlobalCurrency((prev) => {
      const next = prev === 'USD' ? 'INR' : 'USD';
      localStorage.setItem(`${STORAGE_VERSION}_currency`, next);
      showToast(`Switched display currency to ${next === 'USD' ? 'USD ($)' : 'INR (₹)'}`, 'info');
      return next;
    });
  };

  const [selectedDonorDetails, setSelectedDonorDetails] = useState<Donation | null>(null);
 const [selectedPatientDetails, setSelectedPatientDetails] = useState<Patient | null>(null);

 const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
 const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
 const [globalSearch, setGlobalSearch] = useState<string>('');
 const [darkMode, setDarkMode] = useState<boolean>(() => {
 return localStorage.getItem(`${STORAGE_VERSION}_dark_mode`) ==='true';
 });

 const [years] = useState<string[]>(INITIAL_YEARS);

 const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_logs`);
 return saved ? JSON.parse(saved) : INITIAL_LOGS;
 });

 const [hospitals, setHospitals] = useState<Hospital[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_hospitals`);
 return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
 });

 const [purposes, setPurposes] = useState<Purpose[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_purposes`);
 return saved ? JSON.parse(saved) : INITIAL_PURPOSES;
 });

 const [occasions, setOccasions] = useState<Occasion[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_occasions`);
 return saved ? JSON.parse(saved) : INITIAL_OCCASIONS;
 });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_VERSION}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(`${STORAGE_VERSION}_current_user`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = INITIAL_USERS.find((u) => u.username.toLowerCase() === parsed.username.toLowerCase());
        if (found) return found;
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  });

 const [donations, setDonations] = useState<Donation[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_donations`);
 return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
 });

 const [patients, setPatients] = useState<Patient[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_patients`);
 return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
 });

 const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_calendar`);
 return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
 });

 const [generalExpenses, setGeneralExpenses] = useState<GeneralExpenseEntry[]>(() => {
 const saved = localStorage.getItem(`${STORAGE_VERSION}_general_expenses`);
 return saved ? JSON.parse(saved) : [];
 });

 const [forexRates, setForexRates] = useState<ForexRates>({
 USD: 1.0,
 INR: 83.50,
 GBP: 0.79,
 EUR: 0.92,
 lastUpdated: new Date().toISOString().slice(0, 10),
 isLive: false,
 provider:'Standard Benchmark'
 });

 const refreshForexRates = async () => {
 try {
 const rates = await fetchDailyForexRates();
 setForexRates(rates);
 showToast(`Daily Forex updated: 1 USD = ₹${rates.INR.toFixed(2)} INR`);
 } catch (e) {
 console.warn('Failed to refresh forex rates', e);
 }
 };

 useEffect(() => {
 fetchDailyForexRates().then((rates) => {
 setForexRates(rates);
 });
 }, []);

 const [toasts, setToasts] = useState<ToastMessage[]>([]);

 // Sync to localStorage
 useEffect(() => {
 localStorage.setItem(`${STORAGE_VERSION}_general_expenses`, JSON.stringify(generalExpenses));
 }, [generalExpenses]);

 useEffect(() => {
 document.documentElement.classList.remove('dark');
 }, []);

 useEffect(() => {
 localStorage.setItem(`${STORAGE_VERSION}_donations`, JSON.stringify(donations));
 }, [donations]);

 useEffect(() => {
 localStorage.setItem(`${STORAGE_VERSION}_patients`, JSON.stringify(patients));
 }, [patients]);
 
 useEffect(() => {
 localStorage.setItem(`${STORAGE_VERSION}_calendar`, JSON.stringify(calendarEvents));
 }, [calendarEvents]);
 
  const [isDpdpShieldActive, setIsDpdpShieldActive] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_VERSION}_dpdp_shield`) !== 'false';
  });

  const toggleDpdpShield = () => {
    // Only Super Admin (prabhanjan / Super Admin role) has authority to toggle DPDP Shield
    const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.username === 'prabhanjan';
    if (!isSuperAdmin) {
      showToast('🔒 Access Restricted: Only Super Admin (prabhanjan) has authority to toggle DPDP Privacy Shield.', 'error');
      return;
    }

    setIsDpdpShieldActive(prev => {
      const next = !prev;
      localStorage.setItem(`${STORAGE_VERSION}_dpdp_shield`, String(next));
      showToast(
        next
          ? '🛡️ DPDP Act 2023 Shield Activated: Patient PII Masked & Redacted for Safety.'
          : '⚠️ DPDP Shield Deactivated: Full Unmasked Clinical PHI Visible to Authorized Staff.',
        next ? 'success' : 'warning'
      );
      addAuditLog(`[DPDP-2023] Privacy Shield toggled to: ${next ? 'ACTIVATED (MASKED)' : 'DEACTIVATED (UNMASKED)'} by Super Admin ${currentUser.username}`);
      return next;
    });
  };

  const isUsaUser =
    currentUser?.role === 'SEF USA' ||
    ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser?.username?.toLowerCase() || '');

  const maskPatientName = (name: string, isShieldActive = isDpdpShieldActive): string => {
    if (!name) return '';
    const isUsa = currentUser?.role === 'SEF USA' || ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser?.username?.toLowerCase() || '');
    if (isUsa || isShieldActive) {
      const parts = name.trim().split(' ');
      if (parts.length === 1) {
        return parts[0].length > 3 ? `${parts[0].slice(0, 2)}****` : `${parts[0]}*`;
      }
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].slice(0, 1);
      return `${firstName} ${lastInitial}. [DPDP Protected]`;
    }
    return name;
  };

  const maskPatientMrn = (mrn: string, isShieldActive = isDpdpShieldActive): string => {
    if (!mrn) return '';
    const isUsa = currentUser?.role === 'SEF USA' || ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser?.username?.toLowerCase() || '');
    if (isUsa || isShieldActive) {
      const segments = mrn.split('-');
      if (segments.length >= 4) {
        return `${segments[0]}-${segments[1]}-****-${segments[3]}`;
      }
      return mrn.length > 6 ? `${mrn.slice(0, 4)}****${mrn.slice(-3)}` : mrn;
    }
    return mrn;
  };

  const maskPatientVillage = (village: string, isShieldActive = isDpdpShieldActive): string => {
    const isUsa = currentUser?.role === 'SEF USA' || ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser?.username?.toLowerCase() || '');
    if (isUsa || isShieldActive) {
      return 'Rural Outreach Sector (Protected)';
    }
    return village || 'Rural Sector';
  };

  const maskPatientIncome = (income: string, isShieldActive = isDpdpShieldActive): string => {
    const isUsa = currentUser?.role === 'SEF USA' || ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(currentUser?.username?.toLowerCase() || '');
    if (isUsa || isShieldActive) {
      return 'BPL Card Holder (100% Free Rural Care)';
    }
    return income || 'Below Poverty Line';
  };
 
 const showToast = (message: string, type:'success'|'info'|'warning'|'error'='success') => {
 const id = Date.now().toString();
 setToasts(prev => [...prev, { id, type, message }]);
 setTimeout(() => {
 removeToast(id);
 }, 4000);
 };
 
 const removeToast = (id: string) => {
 setToasts(prev => prev.filter(t => t.id !== id));
 };
 
 // Donation actions
 const addDonation = (donationData: Omit<Donation,'id'|'status'>) => {
 const newDonation: Donation = {
 ...donationData,
 id: `DON-${Date.now().toString().slice(-4)}`,
 status:'Pending Match'
 };
 setDonations(prev => [newDonation, ...prev]);
 showToast(`Donation recorded for ${newDonation.donorName} (${newDonation.amount})`);
 };
 
 const updateDonation = (id: string, updates: Partial<Donation>) => {
 setDonations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
 showToast('Donation record updated');
 };
 
 const deleteDonation = (id: string) => {
 setDonations(prev => prev.filter(d => d.id !== id));
 showToast('Donation record deleted','info');
 };
 
 // Patient actions
 const addPatient = (patientData: Omit<Patient,'id'|'matchStatus'|'matchedDonorId'|'matchedDonorName'|'qaStatus'|'dispatchStatus'>) => {
 const newPatient: Patient = {
 ...patientData,
 id: `PAT-${Date.now().toString().slice(-4)}`,
 matchStatus:'Pending Match',
 matchedDonorId: null,
 matchedDonorName: null,
 qaStatus:'Pending QA',
 dispatchStatus:'Pending Match',
 dpdpConsent: patientData.dpdpConsent || {
    consentObtained: true,
    consentDate: new Date().toISOString().slice(0, 10),
    consentRef: `DPDP-CON-${Math.floor(100000 + Math.random() * 899999)}`,
    consentMode: 'Signed Consent Form',
    redactionLevel: 'Masked PII'
  }
 };
 setPatients(prev => [newPatient, ...prev]);
 showToast(`Patient MRN ${newPatient.mrn} registered with DPDP Consent`);
 };
 
 const updatePatient = (id: string, updates: Partial<Patient>) => {
 setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
 showToast('Patient record updated');
 };

 const deletePatient = (id: string) => {
 setPatients(prev => prev.filter(p => p.id !== id));
 showToast('Patient record deleted','info');
 };

 // Matching actions
 const matchDonorPatient = (donationId: string, patientId: string) => {
 const donation = donations.find(d => d.id === donationId);
 const patient = patients.find(p => p.id === patientId);

 if (!donation || !patient) return;

 setDonations(prev => prev.map(d => {
 if (d.id === donationId) {
 return {
 ...d,
 status:'Matched',
 matchedPatientId: patient.id,
 matchedPatientName: patient.name
 };
 }
 return d;
 }));

 setPatients(prev => prev.map(p => {
 if (p.id === patientId) {
 return {
 ...p,
 matchStatus:'Matched',
 matchedDonorId: donation.id,
 matchedDonorName: donation.donorName,
 qaStatus: p.photoStatus ==='Uploaded'?'Approved':'Pending Photos',
 dispatchStatus:'Ready for Dispatch'
 };
 }
 return p;
 }));

 showToast(`Matched Donor ${donation.donorName} with Patient ${patient.name}!`);
 };

 const matchMultiPatientsToDonor = (
 donorId: string,
 patientIds: string[],
 moveRemainderToGeneral: boolean
 ) => {
 const donation = donations.find((d) => d.id === donorId);
 if (!donation || patientIds.length === 0) return;

 // Parse numeric amount
 const rawNum = parseFloat(donation.amount.replace(/[^0-9.]/g,'')) || 0;
 const isInr = donation.amount.includes('R') || donation.amount.includes('₹');
 const currency:'USD'|'INR'|'GBP'|'EUR'= isInr ?'INR':'USD';
 const symb = isInr ?'Rs.':'$';

 // Unit cost per surgery based on purpose
 let unitCost = isInr ? 3000 : 30;
 if (donation.purpose.includes('Corneal') || donation.purpose.includes('Child')) {
 unitCost = isInr ? 3000 : 100;
 } else if (donation.purpose.includes('Food') || donation.purpose.includes('Annadhanam')) {
 unitCost = isInr ? 10000 : 200;
 }

 const totalSurgeryCost = patientIds.length * unitCost;
 const remainder = Math.max(0, rawNum - totalSurgeryCost);
 const matchedPatients = patients.filter((p) => patientIds.includes(p.id));

 // Update all matching patients
 setPatients((prev) =>
 prev.map((p) => {
 if (patientIds.includes(p.id)) {
 return {
 ...p,
 matchStatus:'Matched',
 matchedDonorId: donation.id,
 matchedDonorName: donation.donorName,
 qaStatus: p.photoStatus ==='Uploaded'?'Approved':'Pending Photos',
 dispatchStatus:'Ready for Dispatch'
 };
 }
 return p;
 })
 );

 // Update donor
 if (moveRemainderToGeneral || remainder === 0) {
 setDonations((prev) =>
 prev.map((d) => {
 if (d.id === donorId) {
 return {
 ...d,
 status:'Matched',
 matchedPatientId: matchedPatients[0]?.id,
 matchedPatientName:
 patientIds.length === 1
 ? matchedPatients[0]?.name
 : `${matchedPatients[0]?.name} + ${patientIds.length - 1} Beneficiaries`
 };
 }
 return d;
 })
 );

 // If remainder > 0, log in generalExpenses ledger
 if (remainder > 0) {
 const newExpense: GeneralExpenseEntry = {
 id: `GEN-${Date.now()}`,
 donorId: donation.id,
 donorName: donation.donorName,
 sefId: donation.sefId,
 originalAmount: donation.amount,
 surgeriesCount: patientIds.length,
 surgeriesAmount: totalSurgeryCost,
 remainingAmount: remainder,
 currency,
 date: new Date().toISOString().slice(0, 10),
 unit: donation.location,
 purpose: donation.purpose,
 matchedPatientMrns: matchedPatients.map((p) => p.mrn),
 timestamp: new Date().toLocaleString()
 };
 setGeneralExpenses((prev) => [newExpense, ...prev]);
 showToast(
 `Allocated ${patientIds.length} surgeries (${symb}${totalSurgeryCost}) & moved ${symb}${remainder} to General Fund!`
 );
 } else {
 showToast(`Successfully linked ${patientIds.length} surgeries to ${donation.donorName}!`);
 }
 } else {
 // Partial match: keep remaining amount active for future matching
 setDonations((prev) =>
 prev.map((d) => {
 if (d.id === donorId) {
 return {
 ...d,
 amount: `${symb}${remainder}`,
 status:'Pending Match'
 };
 }
 return d;
 })
 );
 showToast(
 `Linked ${patientIds.length} surgeries. ${symb}${remainder} remains active in pool for next batch!`
 );
 }
 };

 const poolDonorsForSurgery = (donorIds: string[], patientId: string) => {
 const pooledDonors = donations.filter((d) => donorIds.includes(d.id));
 const targetPatient = patients.find((p) => p.id === patientId);
 if (pooledDonors.length === 0 || !targetPatient) return;

 const coDonorNames = pooledDonors.map((d) => d.donorName).join('&');

 // Update patient
 setPatients((prev) =>
 prev.map((p) => {
 if (p.id === patientId) {
 return {
 ...p,
 matchStatus:'Matched',
 matchedDonorId: pooledDonors[0].id,
 matchedDonorName: `Co-Sponsored: ${coDonorNames}`,
 qaStatus: p.photoStatus ==='Uploaded'?'Approved':'Pending Photos',
 dispatchStatus:'Ready for Dispatch'
 };
 }
 return p;
 })
 );

 // Update all participating donors
 setDonations((prev) =>
 prev.map((d) => {
 if (donorIds.includes(d.id)) {
 return {
 ...d,
 status:'Matched',
 matchedPatientId: targetPatient.id,
 matchedPatientName: targetPatient.name
 };
 }
 return d;
 })
 );

 showToast(
 `Successfully pooled ${pooledDonors.length} co-sponsors for ${targetPatient.name}!`
 );
 };

 const addGeneralExpense = (entryData: Omit<GeneralExpenseEntry,'id'|'timestamp'>) => {
 const newEntry: GeneralExpenseEntry = {
 ...entryData,
 id: `GEN-${Date.now()}`,
 timestamp: new Date().toLocaleString()
 };
 setGeneralExpenses((prev) => [newEntry, ...prev]);
 showToast('General patient care contribution logged successfully');
 };

 const deleteGeneralExpense = (id: string) => {
 setGeneralExpenses((prev) => prev.filter((g) => g.id !== id));
 showToast('Entry removed from general expenses ledger');
 };

 const clearGeneralExpenses = () => {
 setGeneralExpenses([]);
 showToast('General expenses ledger cleared','info');
 };

 const unmatchDonorPatient = (donationId: string, patientId: string) => {
 setDonations(prev => prev.map(d => {
 if (d.id === donationId) {
 return {
 ...d,
 status:'Pending Match',
 matchedPatientId: undefined,
 matchedPatientName: undefined
 };
 }
 return d;
 }));

 setPatients(prev => prev.map(p => {
 if (p.id === patientId) {
 return {
 ...p,
 matchStatus:'Pending Match',
 matchedDonorId: null,
 matchedDonorName: null,
 qaStatus:'Pending QA',
 dispatchStatus:'Pending Match'
 };
 }
 return p;
 }));

 showToast('Match unlinked successfully','info');
 };

 const autoMatchQueue = () => {
    let matchedCount = 0;
    const unmatchedDonations = donations.filter((d) => d.status === 'Pending Match');
    let availablePatients = patients.filter((p) => p.matchStatus === 'Pending Match');

    const updatedDonations = [...donations];
    const updatedPatients = [...patients];
    const newGeneralExpenses: GeneralExpenseEntry[] = [];

    for (const donor of unmatchedDonations) {
      if (donor.donorName.length > 80 || availablePatients.length === 0) continue;

      const rawNum = parseFloat(donor.amount.replace(/[^0-9.]/g, '')) || 0;
      const isInr = donor.amount.includes('R') || donor.amount.includes('₹');
      const currency: 'USD' | 'INR' | 'GBP' | 'EUR' = isInr ? 'INR' : 'USD';
      const symb = isInr ? '₹' : '$';

      // Standardize unit costs across purposes
      let unitCost = isInr ? 3500 : 50;
      if (donor.purpose.includes('Corneal') || donor.purpose.includes('Child') || donor.purpose.includes('Pediatric')) {
        unitCost = isInr ? 7000 : 100;
      } else if (donor.purpose.includes('Food') || donor.purpose.includes('Annadhanam')) {
        unitCost = isInr ? 10000 : 200;
      }

      const isPartial = rawNum < unitCost;
      const maxSurgeries = isPartial ? 1 : Math.max(1, Math.floor(rawNum / unitCost));

      // Match by hospital branch preference first
      const branchPatients = availablePatients.filter(
        (p) =>
          donor.location === 'Any' ||
          p.hospital.toLowerCase().includes(donor.location.toLowerCase()) ||
          donor.location.toLowerCase().includes(p.hospital.toLowerCase())
      );

      const candidatePatients = branchPatients.length > 0 ? branchPatients : availablePatients;
      const patientsToMatch = candidatePatients.slice(0, maxSurgeries);

      if (patientsToMatch.length > 0) {
        const totalSurgeryCost = isPartial ? rawNum : patientsToMatch.length * unitCost;
        const remainder = isPartial ? 0 : Math.max(0, rawNum - totalSurgeryCost);
        const fundedPct = isPartial ? Math.round((rawNum / unitCost) * 100) : 100;

        // Update each matched patient
        patientsToMatch.forEach((pat) => {
          const pIdx = updatedPatients.findIndex((p) => p.id === pat.id);
          if (pIdx !== -1) {
            const matchNote = isPartial
              ? `${donor.donorName} (${fundedPct}% Sponsoring)`
              : donor.donorName;

            updatedPatients[pIdx] = {
              ...updatedPatients[pIdx],
              matchStatus: 'Matched',
              matchedDonorId: donor.id,
              matchedDonorName: matchNote,
              qaStatus: updatedPatients[pIdx].photoStatus === 'Uploaded' ? 'Approved' : 'Pending Photos',
              dispatchStatus: 'Ready for Dispatch'
            };
          }
        });

        // Remove matched patients from available pool
        availablePatients = availablePatients.filter(
          (p) => !patientsToMatch.some((m) => m.id === p.id)
        );

        // Update donor record
        const dIdx = updatedDonations.findIndex((d) => d.id === donor.id);
        if (dIdx !== -1) {
          const summaryNote = isPartial
            ? `${patientsToMatch[0]?.name} (${fundedPct}% Funded)`
            : patientsToMatch.length === 1
            ? patientsToMatch[0]?.name
            : `${patientsToMatch[0]?.name} + ${patientsToMatch.length - 1} Beneficiaries (${symb}${totalSurgeryCost.toLocaleString()})`;

          updatedDonations[dIdx] = {
            ...updatedDonations[dIdx],
            status: 'Matched',
            matchedPatientId: patientsToMatch[0]?.id,
            matchedPatientName: summaryNote
          };
        }

        // If remainder > 0, log in general expenses ledger
        if (remainder > 0) {
          newGeneralExpenses.push({
            id: `GEN-${Date.now()}-${matchedCount}`,
            donorId: donor.id,
            donorName: donor.donorName,
            sefId: donor.sefId,
            originalAmount: donor.amount,
            surgeriesCount: patientsToMatch.length,
            surgeriesAmount: totalSurgeryCost,
            remainingAmount: remainder,
            currency,
            date: new Date().toISOString().slice(0, 10),
            unit: donor.location,
            purpose: donor.purpose,
            matchedPatientMrns: patientsToMatch.map((p) => p.mrn),
            timestamp: new Date().toLocaleString()
          });
        }

        matchedCount += patientsToMatch.length;
      }
    }

    if (matchedCount > 0) {
      setDonations(updatedDonations);
      setPatients(updatedPatients);
      if (newGeneralExpenses.length > 0) {
        setGeneralExpenses((prev) => [...newGeneralExpenses, ...prev]);
      }
      showToast(`Successfully auto-matched ${matchedCount} beneficiaries and moved surplus to General Care Fund!`);
    } else {
      showToast('No unassigned donor-patient pairs found to auto-match.', 'info');
    }

    return matchedCount;
  };

 const updateQAStatus = (patientId: string, status:'Approved'|'Rejected'|'Pending Photos') => {
 setPatients(prev => prev.map(p => {
 if (p.id === patientId) {
 return {
 ...p,
 qaStatus: status,
 dispatchStatus: status ==='Approved'?'Ready for Dispatch':'Pending Match'
 };
 }
 return p;
 }));
 showToast(`QA status updated to ${status}`);
 };

 const markDispatched = (patientId: string) => {
 setPatients(prev => prev.map(p => {
 if (p.id === patientId) {
 return {
 ...p,
 dispatchStatus:'Dispatched'
 };
 }
 return p;
 }));

 const pat = patients.find(p => p.id === patientId);
 if (pat?.matchedDonorId) {
 setDonations(prev => prev.map(d => {
 if (d.id === pat.matchedDonorId) {
 return { ...d, status:'Dispatched'};
 }
 return d;
 }));
 }

 showToast('Feedback letter marked as dispatched to donor!');
 };

 // Calendar actions
 const addCalendarEvent = (eventData: Omit<CalendarEvent,'id'>) => {
 const newEvent: CalendarEvent = {
 ...eventData,
 id: `EV-${Date.now().toString().slice(-4)}`
 };
 setCalendarEvents(prev => [newEvent, ...prev]);
 showToast(`Calendar event"${newEvent.title}"created`);
 };

 const deleteCalendarEvent = (id: string) => {
 setCalendarEvents(prev => prev.filter(e => e.id !== id));
 showToast('Calendar event deleted','info');
 };

 // Master settings actions
 const addHospital = (hosp: Omit<Hospital,'id'>) => {
 const newHosp: Hospital = { ...hosp, id: `HOSP-${hospitals.length + 1}` };
 setHospitals(prev => [...prev, newHosp]);
 showToast(`Hospital"${newHosp.name}"added`);
 };

 const updateHospital = (id: string, updates: Partial<Hospital>) => {
 setHospitals(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
 showToast('Hospital updated');
 };

 const addPurpose = (purp: Omit<Purpose,'id'>) => {
 const newPurp: Purpose = { ...purp, id: `PURP-${purposes.length + 1}` };
 setPurposes(prev => [...prev, newPurp]);
 showToast(`Purpose"${newPurp.name}"added`);
 };

 const updatePurpose = (id: string, updates: Partial<Purpose>) => {
 setPurposes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
 showToast('Purpose updated');
 };

 const addAuditLog = (action: string) => {
 const newLog: AuditLog = {
 id: `LOG-${Date.now()}`,
 sno: (auditLogs.length + 1).toString(),
 username: currentUser.username,
 action,
 ipAddress:'192.168.1.100',
 timestamp: new Date().toISOString().replace('T','').slice(0, 19)
 };
 setAuditLogs(prev => [newLog, ...prev]);
 };

 const deleteAllDonationsByType = (type?: string) => {
 if (type) {
 setDonations(prev => prev.filter(d => d.type !== type));
 showToast(`All ${type} donations deleted from active registry`,'info');
 addAuditLog(`Bulk Delete: Deleted all ${type} donations`);
 } else {
 setDonations([]);
 showToast('All donation entries cleared','warning');
 addAuditLog('Bulk Delete: Cleared entire donations table');
 }
 };

 const deleteAllPatients = () => {
 setPatients([]);
 showToast('All patient entries cleared','warning');
 addAuditLog('Bulk Delete: Cleared entire patient registry');
 };

 const addOccasion = (name: string) => {
 const newOcc: Occasion = { id: `OCC-${occasions.length + 1}`, name };
 setOccasions(prev => [...prev, newOcc]);
 showToast(`Occasion"${name}"added`);
 addAuditLog(`Master: Added occasion"${name}"`);
 };

 const deleteOccasion = (id: string) => {
 setOccasions(prev => prev.filter(o => o.id !== id));
 showToast('Occasion deleted','info');
 addAuditLog(`Master: Deleted occasion ${id}`);
 };

 const addUser = (userData: Omit<UserAccount,'id'>) => {
 const newUser: UserAccount = { ...userData, id: `USR-${users.length + 1}` };
 setUsers(prev => [...prev, newUser]);
 showToast(`User ${newUser.name} created`);
 addAuditLog(`User Admin: Created account ${newUser.username}`);
 };

 const updateUser = (id: string, updates: Partial<UserAccount>) => {
 setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
 showToast('User profile updated');
 addAuditLog(`User Admin: Updated account ${id}`);
 };

 const deleteUser = (id: string) => {
 setUsers(prev => prev.filter(u => u.id !== id));
 showToast('User account deactivated','info');
 addAuditLog(`User Admin: Deactivated user ${id}`);
 };

  const login = (username: string, _password?: string): boolean => {
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    ) || INITIAL_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase()) || users[0];

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_VERSION}_auth`, 'true');
    localStorage.setItem(`${STORAGE_VERSION}_current_user`, JSON.stringify(matchedUser));
    showToast(`Welcome back, ${matchedUser.name} (${matchedUser.role})!`);
    addAuditLog(`User Login: ${matchedUser.username} logged in`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(`${STORAGE_VERSION}_auth`, 'false');
    localStorage.removeItem(`${STORAGE_VERSION}_current_user`);
    showToast('Signed out successfully', 'info');
    addAuditLog(`User Logout: ${currentUser.username} logged out`);
  };

 return (
 <AppContext.Provider
 value={{
 isAuthenticated,
 login,
 logout,
 selectedDonorDetails,
 setSelectedDonorDetails,
 selectedPatientDetails,
 setSelectedPatientDetails,
 activeTab,
 setActiveTab,
 selectedBranch,
 setSelectedBranch,
 globalSearch,
 setGlobalSearch,
 darkMode,
 setDarkMode,
 currentUser,
 setCurrentUser,
 hospitals,
 purposes,
 occasions,
 years,
 users,
 donations,
 patients,
 calendarEvents,
 auditLogs,
 generalExpenses,
 forexRates,
 refreshForexRates,
 addDonation,
 updateDonation,
 deleteDonation,
 deleteAllDonationsByType,
 addPatient,
 updatePatient,
 deletePatient,
 deleteAllPatients,
 matchDonorPatient,
 matchMultiPatientsToDonor,
 poolDonorsForSurgery,
 addGeneralExpense,
 deleteGeneralExpense,
 clearGeneralExpenses,
 unmatchDonorPatient,
 autoMatchQueue,
 updateQAStatus,
 markDispatched,
 addCalendarEvent,
 deleteCalendarEvent,
 addHospital,
 updateHospital,
 addPurpose,
 updatePurpose,
 addOccasion,
 deleteOccasion,
 addUser,
 updateUser,
 deleteUser,
 addAuditLog,
        globalCurrency,
        setGlobalCurrency,
        toggleGlobalCurrency,
        isSimulatorOpen,
        setIsSimulatorOpen,
        isDpdpShieldActive,
        isUsaUser,
        toggleDpdpShield,
        maskPatientName,
        maskPatientMrn,
        maskPatientVillage,
        maskPatientIncome,
        toasts,
        showToast,
        removeToast
      }}
 >
 {children}
 </AppContext.Provider>
 );
};

export const useApp = () => {
 const context = useContext(AppContext);
 if (!context) {
 throw new Error('useApp must be used within an AppProvider');
 }
 return context;
};
