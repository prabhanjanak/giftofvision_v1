import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Inbox,
  Users,
  GitMerge,
  ShieldCheck,
  Send,
  Calendar,
  BarChart3,
  Settings,
  HeartHandshake,
  LogOut,
  Coins,
  ShieldAlert,
  Sparkles,
  FileCheck2,
  Lock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, donations, patients, calendarEvents, generalExpenses, currentUser, logout } = useApp();

  const role = currentUser.role || 'Super Admin';
  const username = currentUser.username.toLowerCase();

  const isSuperAdmin = role === 'Super Admin' || ['prabhanjan', 'saravanan'].includes(username);
  const isAdmin = role === 'Admin' || username === 'admin';
  const isSefManagement = role === 'SEF Management' || username === 'sefmgmt';
  const isSefUsa = role === 'SEF USA' || ['kalamurali', 'sefusa', 'sefusa2', 'sefusa3', 'sefusa4'].includes(username);

  const pendingMatches = donations.filter((d) => d.status === 'Pending Match').length;
  const pendingQA = patients.filter((p) => p.qaStatus === 'Pending QA').length;
  const readyDispatch = patients.filter((p) => p.dispatchStatus === 'Ready for Dispatch').length;
  const matchedPatientsCount = patients.filter((p) => p.matchStatus === 'Matched').length;

  type NavItem = {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeVariant?: 'primary' | 'warning' | 'success';
  };

  // 1. Super Admin Navigation (All Modules)
  const superAdminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Financial Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donor Management', icon: HeartHandshake },
    { id: 'patients', label: 'Patient Registry', icon: Users },
    {
      id: 'matching_wizard',
      label: 'Matching Studio',
      icon: GitMerge,
      badge: pendingMatches > 0 ? pendingMatches : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'qa',
      label: 'Quality Assurance',
      icon: ShieldCheck,
      badge: pendingQA > 0 ? pendingQA : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'dispatch',
      label: 'Dispatch & Feedback',
      icon: Send,
      badge: readyDispatch > 0 ? readyDispatch : undefined,
      badgeVariant: 'success'
    },
    { id: 'audit_logs', label: 'Security & Audit Trail', icon: ShieldAlert },
    { id: 'calendar', label: 'Events & Calendar', icon: Calendar, badge: calendarEvents.length },
    { id: 'reports', label: 'Reports & Bulk Upload', icon: BarChart3 },
    { id: 'settings', label: 'Master Settings', icon: Settings }
  ];

  // 2. Admin Navigation (Entry & Match + All Reports + Bulk Upload)
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donors', label: 'Donor Entry & Records', icon: HeartHandshake },
    { id: 'patients', label: 'Patient Registry & Entry', icon: Users },
    {
      id: 'matching_wizard',
      label: 'Matching Studio',
      icon: GitMerge,
      badge: pendingMatches > 0 ? pendingMatches : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'qa',
      label: 'Quality Assurance',
      icon: ShieldCheck,
      badge: pendingQA > 0 ? pendingQA : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'dispatch',
      label: 'Dispatch & Feedback',
      icon: Send,
      badge: readyDispatch > 0 ? readyDispatch : undefined,
      badgeVariant: 'success'
    },
    { id: 'reports', label: 'Reports & Bulk Upload', icon: BarChart3 }
  ];

  // 3. SEF Management Navigation (Financial Dashboard + Patient Data Dashboard)
  const sefManagementNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Financial Intelligence', icon: LayoutDashboard },
    {
      id: 'patients',
      label: 'Patient Data Dashboard',
      icon: Users,
      badge: matchedPatientsCount,
      badgeVariant: 'success'
    },
    { id: 'reports', label: 'Executive Reports', icon: BarChart3 }
  ];

  // 4. SEF USA Navigation (Donor Data Entry + Validate Payment + Add Patient)
  const sefUsaNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Financial Dashboard', icon: LayoutDashboard },
    {
      id: 'donors',
      label: 'SEF USA Donors & Validate',
      icon: HeartHandshake,
      badge: pendingMatches > 0 ? pendingMatches : undefined,
      badgeVariant: 'primary'
    },
    {
      id: 'patients',
      label: 'Matched Beneficiaries & Add',
      icon: Users,
      badge: matchedPatientsCount,
      badgeVariant: 'success'
    },
    { id: 'reports', label: 'SEF USA Reports', icon: BarChart3 }
  ];

  const navItems = isSuperAdmin
    ? superAdminNavItems
    : isAdmin
    ? adminNavItems
    : isSefManagement
    ? sefManagementNavItems
    : sefUsaNavItems;

  const roleLabel = isSuperAdmin
    ? '⚡ Super Admin Access'
    : isAdmin
    ? '🛡️ Operations Admin'
    : isSefManagement
    ? '📊 SEF Management'
    : '🇺🇸 SEF USA Operations';

  return (
    <aside className="w-64 shrink-0 border-r border-orange-200/80 bg-white/95 backdrop-blur-md p-4 flex flex-col justify-between no-print shadow-sm hidden md:flex sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-20">
      <div className="space-y-6">
        <div>
          <div className="px-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-orange-950/70">
              {roleLabel}
            </p>
          </div>

          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-700 hover:bg-orange-50/80 hover:text-orange-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-orange-600/70 group-hover:text-orange-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : item.badgeVariant === 'primary'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : item.badgeVariant === 'warning'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : item.badgeVariant === 'success'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / System Status & Logout */}
      <div className="space-y-2 pt-4 border-t border-orange-100">
        <div className="px-3 py-2.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-[11px] text-orange-950 flex items-center gap-2.5">
          <img src="/images/sankara_favicon.png" alt="Sankara Emblem" className="h-7 w-7 object-contain rounded-full shadow-sm" />
          <div>
            <div className="font-black text-xs text-orange-950 leading-tight">
              {isSefUsa ? 'Sankara Eye Foundation USA' : 'Sankara Eye Foundation'}
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              {isSefUsa ? '🇺🇸 Partner Portal Access' : '80/20 Free Rural Eye Care'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="h-4 w-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
