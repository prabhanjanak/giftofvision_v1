import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ForexConverterModal } from '../modals/ForexConverterModal';
import { SponsorshipSimulatorModal } from '../modals/SponsorshipSimulatorModal';
import {
  Search,
  Building2,
  Bell,
  Plus,
  HeartHandshake,
  LogOut,
  ArrowRightLeft,
  Calculator,
  Coins
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenNewDonation: () => void;
  onOpenNewPatient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewDonation,
  onOpenNewPatient
}) => {
  const {
    hospitals,
    selectedBranch,
    setSelectedBranch,
    globalSearch,
    setGlobalSearch,
    currentUser,
    donations,
    forexRates,
    refreshForexRates,
    setActiveTab,
    logout,
    globalCurrency,
    toggleGlobalCurrency,
    isSimulatorOpen,
    setIsSimulatorOpen,
    addDonation
  } = useApp();

  const [isForexModalOpen, setIsForexModalOpen] = useState(false);

  // Calculate live pending matches for notification bell
  const pendingMatches = donations.filter((d) => d.status === 'Pending Match').length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-orange-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md transition-all shadow-xs">
      {/* Left: Branch Filter & Mobile Space */}
      <div className="flex items-center gap-3">
        {/* Branch / Hospital Filter */}
        <div className="hidden lg:flex items-center pl-1">
          <div className="relative flex items-center">
            <Building2 className="absolute left-2.5 h-3.5 w-3.5 text-orange-600 pointer-events-none" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="h-8.5 pl-8 pr-7 text-xs font-bold bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer"
            >
              <option value="All Branches">All Branches (13 Hospitals)</option>
              {hospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.name}>
                  {hosp.name} ({hosp.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Universal USD ⇋ INR Currency Toggle Switch */}
        <div className="flex items-center gap-1 bg-orange-100/80 p-0.5 rounded-xl border border-orange-200 shadow-xs">
          <button
            type="button"
            onClick={() => globalCurrency !== 'USD' && toggleGlobalCurrency()}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
              globalCurrency === 'USD'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-orange-950 hover:bg-orange-200/70'
            }`}
            title="Set global platform viewing currency to USD ($)"
          >
            🇺🇸 USD ($)
          </button>
          <button
            type="button"
            onClick={() => globalCurrency !== 'INR' && toggleGlobalCurrency()}
            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
              globalCurrency === 'INR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-orange-950 hover:bg-orange-200/70'
            }`}
            title="Set global platform viewing currency to INR (₹)"
          >
            🇮🇳 INR (₹)
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <input
            type="text"
            placeholder="Search donors, patient MRN, SEF ID, hospital, surgeon..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-orange-200/80 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Simulator Launcher */}
        <button
          onClick={() => setIsSimulatorOpen(true)}
          title="Open Sponsorship Impact Calculator & Forex Purchasing Power Simulator"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-200 text-xs font-black text-orange-950 transition-all shadow-xs"
        >
          <Calculator className="h-3.5 w-3.5 text-orange-600" />
          <span className="hidden xl:inline">Impact Simulator</span>
        </button>

        {/* Quick Action: New Donation */}
        <Button
          variant="primary"
          size="sm"
          icon={<HeartHandshake className="h-3.5 w-3.5" />}
          onClick={onOpenNewDonation}
          className="hidden sm:inline-flex shadow-sm bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold"
        >
          New Donation
        </Button>

        {/* Quick Action: Register Patient */}
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5 text-orange-600" />}
          onClick={onOpenNewPatient}
          className="hidden sm:inline-flex border-orange-200 hover:bg-orange-50 font-bold text-slate-800"
        >
          Add Patient
        </Button>

        {/* Live Daily Forex Ticker Button */}
        <button
          onClick={() => setIsForexModalOpen(true)}
          title="Click to open daily USD / INR Forex Converter & Surgery Purchasing Power"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-black text-orange-950 transition-colors shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>1 USD = ₹{forexRates.INR.toFixed(2)}</span>
          <ArrowRightLeft className="h-3 w-3 text-orange-600 ml-0.5" />
        </button>

        {/* Notification Bell / Live Pending Matches */}
        <button
          onClick={() => setActiveTab('matching_wizard')}
          title={`${pendingMatches} Pending Matches (Click to open Matching Studio)`}
          className="relative rounded-xl p-2 text-slate-700 hover:bg-orange-50 hover:text-orange-900 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {pendingMatches > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-black text-white shadow">
              {pendingMatches > 99 ? '99+' : pendingMatches}
            </span>
          )}
        </button>

        {/* Authenticated Logged-In User Profile & Sign Out */}
        <div className="flex items-center pl-2.5 border-l border-orange-200 gap-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-bold text-orange-600">
                {currentUser.role}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<LogOut className="h-3.5 w-3.5 text-rose-500" />}
            onClick={logout}
            className="h-8 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-slate-200"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Daily Forex Converter Modal */}
      {isForexModalOpen && (
        <ForexConverterModal
          isOpen={isForexModalOpen}
          onClose={() => setIsForexModalOpen(false)}
          rates={forexRates}
          onRefreshRates={refreshForexRates}
        />
      )}

      {/* Sponsorship Impact Calculator & Forex Simulator Modal */}
      {isSimulatorOpen && (
        <SponsorshipSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          forexRate={forexRates.INR || 83.50}
          onApplyDonation={(amount, purpose, country) => {
            addDonation({
              donorName: 'New Valued Sponsor',
              sefId: `SEF-${Math.floor(100000 + Math.random() * 900000)}`,
              amount,
              purpose,
              date: new Date().toISOString().slice(0, 10),
              location: 'All Branches',
              email: 'donor@giftofvision.in',
              type: 'One-Time',
              country,
              paymentStatus: 'Verified'
            });
          }}
        />
      )}
    </header>
  );
};
