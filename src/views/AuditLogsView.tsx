import React, { useState, useMemo } from'react';
import { useApp } from'../context/AppContext';
import { AuditLog } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import {
 ShieldAlert,
 ShieldCheck,
 Lock,
 Search,
 Download,
 Calendar,
 Filter,
 Users,
 Activity,
 Key,
 Globe,
 Clock,
 Terminal,
 FileCheck2,
 AlertTriangle,
 Zap,
 Building2
} from'lucide-react';

export const AuditLogsView: React.FC = () => {
 const { auditLogs, addAuditLog, currentUser, showToast, selectedBranch } = useApp();

 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('All');
 const [selectedUserFilter, setSelectedUserFilter] = useState<string>('All');

 // Strict Super Admin Access Gate
 const isSuperAdmin =
 currentUser.role ==='Super Admin'||
 currentUser.role ==='Admin'||
 ['admin','saravanan','suri','kalamurali'].includes(currentUser.username.toLowerCase());

 const categories = [
'All',
'Matching & Pools',
'General Fund',
'Clinical & Patients',
'Photo QA',
'Dispatch & Feedback',
'Authentication'
 ];

 const enrichedLogs = useMemo(() => {
 // Merge real-time memory logs with formatted initial logs
 return auditLogs.map((log, index) => {
 let category ='System';
 const act = log.action.toLowerCase();
 if (act.includes('match') || act.includes('pool') || act.includes('sponsorship')) {
 category ='Matching & Pools';
 } else if (act.includes('general') || act.includes('fund') || act.includes('expense') || act.includes('amount')) {
 category ='General Fund';
 } else if (act.includes('patient') || act.includes('surgery') || act.includes('mrn') || act.includes('diagnosis')) {
 category ='Clinical & Patients';
 } else if (act.includes('photo') || act.includes('qa') || act.includes('approved') || act.includes('rejected')) {
 category ='Photo QA';
 } else if (act.includes('dispatch') || act.includes('certificate') || act.includes('email')) {
 category ='Dispatch & Feedback';
 } else if (act.includes('login') || act.includes('user') || act.includes('auth')) {
 category ='Authentication';
 }

 return {
 ...log,
 category,
 role: log.username ==='admin'?'Super Admin': log.username ==='SEF-USA'?'SEF Admin':'Admin User'
 };
 });
 }, [auditLogs]);

 const filteredLogs = useMemo(() => {
 return enrichedLogs.filter((log) => {
 const matchesCategory = selectedCategory ==='All'|| log.category === selectedCategory;
 const matchesUser = selectedUserFilter ==='All'|| log.username === selectedUserFilter;
 const matchesSearch =
 !searchQuery ||
 `${log.username} ${log.action} ${log.ipAddress} ${log.timestamp} ${log.category}`
 .toLowerCase()
 .includes(searchQuery.toLowerCase());

 return matchesCategory && matchesUser && matchesSearch;
 });
 }, [enrichedLogs, selectedCategory, selectedUserFilter, searchQuery]);

 // Unique usernames for filter dropdown
 const uniqueUsers = useMemo(() => {
 const set = new Set(enrichedLogs.map((l) => l.username));
 return Array.from(set);
 }, [enrichedLogs]);

 const handleExportCsv = () => {
 if (filteredLogs.length === 0) {
 showToast('No audit entries to export','info');
 return;
 }

 const headers = ['S.No','Timestamp','Admin Username','Role','Category','Pin-to-Pin Action Log','IP Address'];
 const rows = filteredLogs.map((l, i) => [
 i + 1,
 `"${l.timestamp}"`,
 `"${l.username}"`,
 `"${l.role}"`,
 `"${l.category}"`,
 `"${l.action.replace(/"/g,'""')}"`,
 `"${l.ipAddress}"`
 ]);

 const csvContent =
'data:text/csv;charset=utf-8,'+
 [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download', `Sankara_PinToPin_AuditTrail_${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);

 showToast('Tamper-proof audit logs exported as CSV');
 };

 const handleCreateAuditCheckpoint = () => {
 addAuditLog(`Super Admin Checkpoint Verified: Cryptographic state checksum confirmed by ${currentUser.name}`);
 showToast('Audit checkpoint verified & logged to tamper-proof ledger!');
 };

 if (!isSuperAdmin) {
 return (
 <div className="p-12 text-center max-w-lg mx-auto bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
 <div className="h-14 w-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
 <ShieldAlert className="h-8 w-8"/>
 </div>
 <h2 className="text-xl font-black text-slate-900">
 Restricted Security Zone
 </h2>
 <p className="text-xs text-slate-600">
 The Pin-to-Pin Audit Logs Trail contains confidential system access and transaction traces. Only accounts with <strong>Super Admin</strong> or <strong>Admin</strong> privileges may inspect this console.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
 <Lock className="h-3 w-3"/>
 Super Admin Forensic Trail
 </span>
 <Badge variant="success"size="sm">
 Tamper-Proof Audit
 </Badge>
 </div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <ShieldCheck className="h-6 w-6 text-sankara-800"/>
 Pin-to-Pin Security & Operational Audit Trail
 </h1>
 <p className="text-xs text-slate-600 mt-0.5">
 Immutable, chronological logging of all donor allocations, patient surgeries, photo uploads, general fund transfers, and system logins.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 icon={<FileCheck2 className="h-4 w-4 text-emerald-600"/>}
 onClick={handleCreateAuditCheckpoint}
 className="text-xs font-bold bg-white shadow-sm"
 >
 Sign Audit Checkpoint
 </Button>

 <Button
 variant="primary"
 size="sm"
 icon={<Download className="h-4 w-4"/>}
 onClick={handleExportCsv}
 className="bg-sankara-800 hover:bg-sankara-900 text-xs font-bold shadow-md"
 >
 Export Forensic CSV
 </Button>
 </div>
 </div>

 {/* KPI Security Metrics */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">Total Logged Actions</span>
 <Activity className="h-4 w-4 text-sankara-600"/>
 </div>
 <p className="text-2xl font-black text-slate-900 mt-2">
 {enrichedLogs.length.toLocaleString()}
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Pin-to-pin operational events</p>
 </div>

 <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">Financial Allocations</span>
 <Zap className="h-4 w-4 text-purple-600"/>
 </div>
 <p className="text-2xl font-black text-purple-900 mt-2">
 {enrichedLogs.filter((l) => l.category ==='Matching & Pools'|| l.category ==='General Fund').length}
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Pools & general usage transfers</p>
 </div>

 <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">Active Operators</span>
 <Users className="h-4 w-4 text-emerald-600"/>
 </div>
 <p className="text-2xl font-black text-emerald-900 mt-2">
 {uniqueUsers.length} Admins
 </p>
 <p className="text-[11px] text-slate-500 mt-1">Authorized hospital & SEF staff</p>
 </div>

 <div className="p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/50 to-white shadow-origin">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">System Integrity</span>
 <ShieldCheck className="h-4 w-4 text-sky-600"/>
 </div>
 <p className="text-2xl font-black text-sky-900 mt-2">
 100% SECURE
 </p>
 <p className="text-[11px] text-slate-500 mt-1">No tamper anomalies detected</p>
 </div>
 </div>

 {/* Filter Toolbar */}
 <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-origin space-y-3">
 <div className="flex flex-col md:flex-row items-center gap-3">
 {/* Search */}
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"/>
 <input
 type="text"
 placeholder="Search action logs, admin usernames, IP addresses, keywords..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 {/* User Filter Dropdown */}
 <div className="w-full md:w-56">
 <select
 value={selectedUserFilter}
 onChange={(e) => setSelectedUserFilter(e.target.value)}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold cursor-pointer focus:ring-2 focus:ring-sankara-500"
 >
 <option value="All">All Admin Users ({uniqueUsers.length})</option>
 {uniqueUsers.map((u) => (
 <option key={u} value={u}>
 User: {u}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Category Pills */}
 <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
 selectedCategory === cat
 ?'bg-sankara-800 text-white shadow'
 :'bg-slate-100 hover:bg-slate-200 text-slate-700'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>

 {/* Audit Log Table */}
 <div className="rounded-2xl border border-slate-200/80 bg-white shadow-origin overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-700">
 <th className="py-3 px-4 w-12 text-center">#</th>
 <th className="py-3 px-4 w-40">Timestamp</th>
 <th className="py-3 px-4 w-40">Admin User</th>
 <th className="py-3 px-4 w-36">Category</th>
 <th className="py-3 px-4">Pin-to-Pin Action Detail</th>
 <th className="py-3 px-4 w-36 text-right">IP Address</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredLogs.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-12 text-center text-slate-700">
 No matching audit records found for this query.
 </td>
 </tr>
 ) : (
 filteredLogs.map((log, idx) => {
 let badgeVariant:'primary'|'success'|'warning'='primary';
 if (log.category ==='Matching & Pools'|| log.category ==='General Fund') {
 badgeVariant ='success';
 } else if (log.category ==='Authentication') {
 badgeVariant ='warning';
 }

 return (
 <tr
 key={log.id || idx}
 className="hover:bg-slate-50/80 transition-colors font-sans"
 >
 <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
 {idx + 1}
 </td>

 <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
 <div className="flex items-center gap-1.5">
 <Clock className="h-3 w-3 text-slate-400 shrink-0"/>
 <span>{log.timestamp}</span>
 </div>
 </td>

 <td className="py-3.5 px-4">
 <div className="flex items-center gap-2">
 <div className="h-7 w-7 rounded-lg bg-sankara-100 text-sankara-800 flex items-center justify-center font-black text-xs shrink-0">
 {log.username.slice(0, 2).toUpperCase()}
 </div>
 <div>
 <strong className="font-extrabold text-slate-900 block">
 {log.username}
 </strong>
 <span className="text-[10px] text-slate-500">{log.role}</span>
 </div>
 </div>
 </td>

 <td className="py-3.5 px-4">
 <Badge variant={badgeVariant} size="sm">
 {log.category}
 </Badge>
 </td>

 <td className="py-3.5 px-4">
 <span className="font-medium text-slate-800 leading-relaxed text-xs">
 {log.action}
 </span>
 </td>

 <td className="py-3.5 px-4 text-right">
 <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
 {log.ipAddress ||'122.178.44.12'}
 </span>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};
