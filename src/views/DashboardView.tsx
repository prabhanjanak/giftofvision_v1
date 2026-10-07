import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import {
  Coins,
  DollarSign,
  Building2,
  BarChart3,
  Download,
  Activity,
  Globe,
  Calculator
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { HospitalUnitDetailView } from './HospitalUnitDetailView';
import { Hospital } from '../data/initialData';

interface DashboardViewProps {
  onOpenNewDonation: () => void;
  onOpenNewPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewDonation,
  onOpenNewPatient
}) => {
  const {
    donations,
    patients,
    hospitals,
    forexRates,
    selectedBranch,
    setActiveTab,
    showToast,
    globalCurrency,
    setGlobalCurrency,
    setIsSimulatorOpen
  } = useApp();

  // Selected Unit for Detailed Statistics Page
  const [selectedUnit, setSelectedUnit] = React.useState<Hospital | null>(null);

  const filteredDonations = useMemo(() => {
    return selectedBranch === 'All Branches'
      ? donations
      : donations.filter(
          (d) =>
            d.location.toLowerCase().includes(selectedBranch.toLowerCase()) ||
            d.location === 'Any'
        );
  }, [donations, selectedBranch]);

  // Primary Financial Metrics Computation
  const financeMetrics = useMemo(() => {
    let sefUsdTotal = 0;
    let indiaInrTotal = 0;
    let internationalUsdEquivalent = 0;
    let totalSurgeriesFunded = 0;

    filteredDonations.forEach((d) => {
      const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
      const isInr = d.amount.includes('R') || d.amount.includes('₹');
      const isUsd = d.amount.includes('$');
      const isGbp = d.amount.includes('£');
      const isEur = d.amount.includes('€');

      if (isUsd) {
        sefUsdTotal += raw;
      } else if (isInr) {
        indiaInrTotal += raw;
      } else if (isGbp) {
        internationalUsdEquivalent += raw * 1.30;
      } else if (isEur) {
        internationalUsdEquivalent += raw * 1.08;
      } else {
        sefUsdTotal += raw;
      }
    });

    patients.forEach((p) => {
      if (p.matchStatus === 'Matched') {
        totalSurgeriesFunded += 1;
      }
    });

    const fxRate = forexRates.INR || 83.50;
    
    // Grand Total Inflow in USD and INR
    const grandTotalUsd = sefUsdTotal + internationalUsdEquivalent + (indiaInrTotal / fxRate);
    const grandTotalInr = indiaInrTotal + (sefUsdTotal + internationalUsdEquivalent) * fxRate;

    return {
      grandTotalUsd,
      grandTotalInr,
      sefUsdTotal,
      sefInrEquivalent: sefUsdTotal * fxRate,
      indiaInrTotal,
      internationalUsdEquivalent,
      totalSurgeriesFunded,
      surgeriesCostUsd: totalSurgeriesFunded * 50,
      surgeriesCostInr: totalSurgeriesFunded * 3500,
      fxRate
    };
  }, [filteredDonations, patients, forexRates]);

  // Donations Used & Allocated According to 13 Sankara Units
  const unitUtilizationData = useMemo(() => {
    const rate = forexRates.INR || 83.50;

    return hospitals.map((h) => {
      const branchDonations = donations.filter(
        (d) => d.location.toLowerCase().includes(h.name.toLowerCase()) || d.location === 'Any'
      );

      let usdReceived = 0;
      let inrReceived = 0;

      branchDonations.forEach((d) => {
        const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
        if (d.amount.includes('$')) {
          usdReceived += raw;
        } else if (d.amount.includes('R') || d.amount.includes('₹')) {
          inrReceived += raw;
        } else {
          usdReceived += raw;
        }
      });

      // Branch patients & conducted surgeries
      const branchPatients = patients.filter((p) =>
        p.hospital.toLowerCase().includes(h.name.toLowerCase())
      );
      const surgeriesCount = branchPatients.filter((p) => p.matchStatus === 'Matched').length;
      const waitingCount = branchPatients.filter((p) => p.matchStatus === 'Pending Match').length;

      // Used funds for surgeries
      const surgeriesUsedUsd = surgeriesCount * 50;
      const surgeriesUsedInr = surgeriesCount * 3500;

      // Total unit inflow converted
      const totalInflowUsd = usdReceived + inrReceived / rate;
      const totalInflowInr = inrReceived + usdReceived * rate;
      const utilizationRate = totalInflowUsd > 0
        ? Math.min(100, Math.round((surgeriesUsedUsd / totalInflowUsd) * 100))
        : 0;

      return {
        id: h.id,
        name: h.name,
        code: h.code,
        state: h.state,
        beds: h.beds,
        donationsCount: branchDonations.length,
        usdReceived,
        inrReceived,
        totalInflowUsd: Math.round(totalInflowUsd),
        totalInflowInr: Math.round(totalInflowInr),
        totalInflowUsdK: parseFloat((totalInflowUsd / 1000).toFixed(1)),
        totalInflowInrLakhs: parseFloat((totalInflowInr / 100000).toFixed(2)),
        surgeriesCount,
        waitingCount,
        surgeriesUsedUsd,
        surgeriesUsedInr,
        surgeriesUsedUsdK: parseFloat((surgeriesUsedUsd / 1000).toFixed(1)),
        surgeriesUsedInrLakhs: parseFloat((surgeriesUsedInr / 100000).toFixed(2)),
        utilizationRate
      };
    });
  }, [hospitals, donations, patients, forexRates]);

  // Country / Chapter Inflow Breakdown (100% Dynamically Computed from Live Data)
  const countryBreakdown = useMemo(() => {
    let usaTotal = 0;
    let indiaTotal = 0;
    let ukTotal = 0;
    let otherTotal = 0;
    let grandTotal = 0;

    donations.forEach((d) => {
      const raw = parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0;
      const c = (d.country || '').toLowerCase();
      const isUsd = d.amount.includes('$') || c.includes('usa');
      const isInr = d.amount.includes('₹') || d.amount.includes('r') || c.includes('india');
      const isGbp = d.amount.includes('£') || c.includes('uk') || c.includes('united kingdom');

      if (isUsd) {
        usaTotal += raw;
        grandTotal += raw;
      } else if (isInr) {
        indiaTotal += raw;
        grandTotal += raw / (forexRates.INR || 83.5);
      } else if (isGbp) {
        ukTotal += raw;
        grandTotal += raw * 1.3;
      } else {
        otherTotal += raw;
        grandTotal += raw;
      }
    });

    if (grandTotal === 0) {
      return [
        { name: 'USA (SEF USA - 501c3)', share: 0, amountDisplay: '$0 USD', color: '#ea580c', flag: '🇺🇸' },
        { name: 'India (Direct 80G)', share: 0, amountDisplay: '₹0 INR', color: '#10b981', flag: '🇮🇳' },
        { name: 'United Kingdom (SEF UK)', share: 0, amountDisplay: '£0 GBP', color: '#6366f1', flag: '🇬🇧' },
        { name: 'Canada, Australia & Global', share: 0, amountDisplay: '$0 USD', color: '#f59e0b', flag: '🌍' }
      ];
    }

    const usaShare = Math.round((usaTotal / grandTotal) * 100);
    const indiaShare = Math.round(((indiaTotal / (forexRates.INR || 83.5)) / grandTotal) * 100);
    const ukShare = Math.round(((ukTotal * 1.3) / grandTotal) * 100);
    const otherShare = Math.max(0, 100 - (usaShare + indiaShare + ukShare));

    const fx = forexRates.INR || 83.5;

    return [
      {
        name: 'USA (SEF USA - 501c3)',
        share: usaShare,
        amountDisplay: globalCurrency === 'USD'
          ? `$${Math.round(usaTotal).toLocaleString()} USD`
          : `₹${((usaTotal * fx) / 100000).toFixed(2)} Lakhs`,
        color: '#ea580c',
        flag: '🇺🇸'
      },
      {
        name: 'India (Direct 80G)',
        share: indiaShare,
        amountDisplay: globalCurrency === 'USD'
          ? `$${Math.round(indiaTotal / fx).toLocaleString()} USD`
          : `₹${(indiaTotal / 100000).toFixed(2)} Lakhs`,
        color: '#10b981',
        flag: '🇮🇳'
      },
      {
        name: 'United Kingdom (SEF UK)',
        share: ukShare,
        amountDisplay: globalCurrency === 'USD'
          ? `$${Math.round(ukTotal * 1.3).toLocaleString()} USD`
          : `₹${((ukTotal * 1.3 * fx) / 100000).toFixed(2)} Lakhs`,
        color: '#6366f1',
        flag: '🇬🇧'
      },
      {
        name: 'Canada, Australia & Global',
        share: otherShare,
        amountDisplay: globalCurrency === 'USD'
          ? `$${Math.round(otherTotal).toLocaleString()} USD`
          : `₹${((otherTotal * fx) / 100000).toFixed(2)} Lakhs`,
        color: '#f59e0b',
        flag: '🌍'
      }
    ];
  }, [donations, forexRates, globalCurrency]);

  const handleExportCsv = () => {
    const headers = [
      'Sankara Unit Code',
      'Hospital Center',
      'State',
      'Total USD Inflow ($)',
      'Total INR Inflow (₹)',
      'Surgeries Conducted',
      'Surgeries Utilized Amount ($)',
      'Surgeries Utilized Amount (₹)',
      'Fund Utilization Rate %'
    ];

    const rows = unitUtilizationData.map((u) => [
      u.code,
      `"${u.name}"`,
      `"${u.state}"`,
      u.totalInflowUsd,
      u.totalInflowInr,
      u.surgeriesCount,
      u.surgeriesUsedUsd,
      u.surgeriesUsedInr,
      `${u.utilizationRate}%`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sankara_Unit_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Hospital unit financial ledger exported as CSV');
  };

  // If a specific hospital unit is selected, show its full dedicated intelligence page
  if (selectedUnit) {
    return (
      <HospitalUnitDetailView
        hospital={selectedUnit}
        onBack={() => setSelectedUnit(null)}
        onOpenNewDonation={onOpenNewDonation}
        onOpenNewPatient={onOpenNewPatient}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 p-6 sm:p-8 text-white shadow-orange-glow border border-orange-300">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-md mb-3 border border-white/30 shadow-sm">
              <Building2 className="h-3.5 w-3.5 text-amber-200" />
              <span>Sankara Eye Foundation • Financial Analytics & Unit Allocation Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Donations & Unit Allocation Intelligence
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-50 font-medium leading-relaxed">
              Real-time financial telemetry tracking Total Donations Received, SEF USA Dollar Remittances, and Surgical Funds Utilized across all 13 Sankara Eye Hospital Units in India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="white"
              size="md"
              icon={<Calculator className="h-4 w-4 text-orange-600" />}
              onClick={() => setIsSimulatorOpen(true)}
              className="font-black shadow-lg"
            >
              Impact Simulator
            </Button>
            <Button
              variant="white"
              size="md"
              icon={<Coins className="h-4 w-4 text-orange-600" />}
              onClick={onOpenNewDonation}
              className="font-black shadow-lg"
            >
              Record Remittance
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
              className="border-white/40 text-white hover:bg-white/15 font-bold"
            >
              Export Unit CSV
            </Button>
          </div>
        </div>

        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      {/* 2. Primary Financial Stat Cards (Real-time Live Dual Currency Synchronized) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Donations Received (Toggleable USD ⇋ INR) */}
        <div className="p-5 rounded-3xl bg-white border border-orange-200 shadow-sm hover:shadow-orange-glow transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Donations Received
              </span>
              <div className="flex items-center gap-1 bg-orange-100/80 p-0.5 rounded-lg border border-orange-200">
                <button
                  type="button"
                  onClick={() => setGlobalCurrency('USD')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded transition-all ${
                    globalCurrency === 'USD'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-orange-950 hover:bg-orange-200'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalCurrency('INR')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded transition-all ${
                    globalCurrency === 'INR'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-orange-950 hover:bg-orange-200'
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {globalCurrency === 'USD'
                ? `$${Math.round(financeMetrics.grandTotalUsd).toLocaleString()} USD`
                : `₹${(financeMetrics.grandTotalInr / 100000).toFixed(2)} Lakhs`}
            </p>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {globalCurrency === 'USD'
                ? `≈ ₹${(financeMetrics.grandTotalInr / 100000).toFixed(2)} Lakhs Total Inflow`
                : `≈ $${Math.round(financeMetrics.grandTotalUsd).toLocaleString()} USD Equivalent`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-semibold">Global Chapters</span>
            <span className="font-extrabold text-orange-600">100% Audited</span>
          </div>
        </div>

        {/* Metric 2: SEF USA Donations in Dollars ($) */}
        <StatCard
          title="SEF USA Donations"
          value={
            globalCurrency === 'USD'
              ? `$${financeMetrics.sefUsdTotal.toLocaleString()} USD`
              : `₹${(financeMetrics.sefInrEquivalent / 100000).toFixed(2)} Lakhs`
          }
          subtitle={
            globalCurrency === 'USD'
              ? `${Math.floor(financeMetrics.sefUsdTotal / 50).toLocaleString()} Surgeries Sponsored`
              : `≈ $${financeMetrics.sefUsdTotal.toLocaleString()} USD from USA Chapter`
          }
          badgeText="🇺🇸 SEF USA (501c3)"
          badgeVariant="primary"
          icon={DollarSign}
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          onClick={() => setActiveTab('donors')}
        />

        {/* Metric 3: Donations Used for Surgeries Conducted */}
        <StatCard
          title="Surgeries Conducted & Funded"
          value={`${financeMetrics.totalSurgeriesFunded.toLocaleString()} Patients`}
          subtitle={
            globalCurrency === 'USD'
              ? `$${financeMetrics.surgeriesCostUsd.toLocaleString()} Allocated across 13 Units`
              : `₹${(financeMetrics.surgeriesCostInr / 100000).toFixed(2)} Lakhs Allocated`
          }
          badgeText="100% QA Verified"
          badgeVariant="success"
          icon={Activity}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
          onClick={() => setActiveTab('patients')}
        />
      </div>

      {/* 3. Primary Visualization: Donations Used According to 13 Sankara Units (Bar Chart) */}
      <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Donations Received vs. Utilized According to Sankara Units
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Compares Total Inflow vs Surgical Usage across all 13 Sankara Eye Hospital centers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Unit Currency:</span>
            <div className="flex items-center gap-1 bg-orange-100/80 p-1 rounded-xl border border-orange-200">
              <button
                type="button"
                onClick={() => setGlobalCurrency('USD')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                  globalCurrency === 'USD'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-orange-950 hover:bg-orange-200'
                }`}
              >
                🇺🇸 USD ($k)
              </button>
              <button
                type="button"
                onClick={() => setGlobalCurrency('INR')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
                  globalCurrency === 'INR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-orange-950 hover:bg-orange-200'
                }`}
              >
                🇮🇳 INR (₹ Lakhs)
              </button>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={unitUtilizationData}
              margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => globalCurrency === 'USD' ? `$${v}k` : `₹${v}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#fdba74',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.15)',
                  fontSize: '12px',
                  fontWeight: 700
                }}
                formatter={(val: any, name?: any) => {
                  if (name === 'totalInflow') {
                    return [
                      globalCurrency === 'USD' ? `$${val}k USD` : `₹${val} Lakhs`,
                      'Total Donations Received'
                    ];
                  }
                  if (name === 'surgeriesUsed') {
                    return [
                      globalCurrency === 'USD' ? `$${val}k USD` : `₹${val} Lakhs`,
                      'Donations Used for Surgeries'
                    ];
                  }
                  return [val, name || ''];
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => {
                  if (val === 'totalInflow') return 'Total Donations Received';
                  if (val === 'surgeriesUsed') return 'Donations Used for Surgeries';
                  return val;
                }}
              />
              <Bar
                dataKey={globalCurrency === 'USD' ? 'totalInflowUsdK' : 'totalInflowInrLakhs'}
                fill="#ea580c"
                radius={[6, 6, 0, 0]}
                name="totalInflow"
              />
              <Bar
                dataKey={globalCurrency === 'USD' ? 'surgeriesUsedUsdK' : 'surgeriesUsedInrLakhs'}
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="surgeriesUsed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Sankara Hospital Network Matrix (13 Unit Operational Cards - Live Real-Time USD ⇋ INR) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            Sankara Hospital Network Utilization Matrix (13 Units)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Click any hospital card to open detailed clinical records, datewise telemetry, and matching records
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {unitUtilizationData.map((unit) => (
            <div
              key={unit.id}
              onClick={() => {
                const h = hospitals.find((x) => x.id === unit.id || x.name === unit.name);
                if (h) setSelectedUnit(h);
              }}
              className="p-4 rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-orange-glow hover:border-orange-400 transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:scale-[1.02]"
              title={`Click to open full telemetry, finances, and patient matching details for ${unit.name}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {unit.state} • {unit.beds} Beds
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 font-mono font-black text-[10px] border border-orange-200 shrink-0">
                    {unit.code}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Donations Inflow:</span>
                    <strong className="text-orange-600 font-black">
                      {globalCurrency === 'USD'
                        ? `$${unit.totalInflowUsd.toLocaleString()} USD`
                        : `₹${(unit.totalInflowInr / 100000).toFixed(2)} Lakhs`}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Surgeries Operated:</span>
                    <strong className="text-emerald-700 font-black">
                      {unit.surgeriesCount} Cases
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-orange-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Utilization</span>
                  <span className="text-emerald-700 font-black">{unit.utilizationRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${unit.utilizationRate}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-black text-orange-600 flex items-center justify-end gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Unit Telemetry</span>
                  <span>➔</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Country / Chapter Origin Split Row */}
      <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-600" />
              Donor Country & Chapter Contribution Breakdown
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Distribution of donor sponsorships across SEF USA, India, UK, and Global Chapters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {countryBreakdown.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-orange-100 bg-orange-50/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">{c.name}</h4>
                  <p className="text-xs font-black text-orange-600">{c.amountDisplay}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-orange-200 font-black text-xs text-slate-900 shadow-xs">
                {c.share}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
