import React, { useState } from'react';
import { useApp } from'../context/AppContext';
import { CalendarEvent } from'../data/initialData';
import { Badge } from'../components/ui/Badge';
import { Button } from'../components/ui/Button';
import { Modal } from'../components/ui/Modal';
import {
 Calendar as CalendarIcon,
 Plus,
 Building2,
 Trash2,
 Heart,
 Eye,
 MapPin,
 Clock,
 Sparkles,
 ChevronLeft,
 ChevronRight,
 Filter
} from'lucide-react';

export const CalendarEventsView: React.FC = () => {
 const {
 calendarEvents,
 hospitals,
 selectedBranch,
 addCalendarEvent,
 deleteCalendarEvent
 } = useApp();

 const [categoryFilter, setCategoryFilter] = useState('All');
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

 const [formData, setFormData] = useState({
 title:'',
 date: new Date().toISOString().slice(0, 10),
 location:'Coimbatore',
 category:'Annadhanam'as CalendarEvent['category'],
 description:'',
 sponsorName:'',
 amount:''
 });

 const filteredEvents = calendarEvents.filter((ev) => {
 const matchesBranch =
 selectedBranch ==='All Branches'||
 ev.location.toLowerCase().includes(selectedBranch.toLowerCase());
 const matchesCategory =
 categoryFilter ==='All'|| ev.category === categoryFilter;

 return matchesBranch && matchesCategory;
 });

 const handleOpenAddModal = () => {
 setFormData({
 title:'',
 date: selectedDate,
 location: selectedBranch ==='All Branches'?'Coimbatore': selectedBranch,
 category:'Annadhanam',
 description:'',
 sponsorName:'',
 amount:'Rs. 10,000'
 });
 setIsAddModalOpen(true);
 };

 const handleSaveEvent = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.title.trim()) return;

 addCalendarEvent(formData);
 setIsAddModalOpen(false);
 };

 const categories = ['All','Annadhanam','Eye Camp','Special Day','Pediatric','Awareness'];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
 <CalendarIcon className="h-6 w-6 text-sankara-800"/>
 Events & Seva Calendar (calendar.sql)
 </h1>
 <p className="text-xs text-slate-700 mt-1">
 Tracking Annadhanam meal sponsorships, rural mobile eye camps, and donor memorial events across hospitals.
 </p>
 </div>

 <Button
 variant="primary"
 size="sm"
 icon={<Plus className="h-4 w-4"/>}
 onClick={handleOpenAddModal}
 className="bg-sankara-800 hover:bg-sankara-900"
 >
 Add Calendar Event
 </Button>
 </div>

 {/* Category Pills */}
 <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
 {categories.map((cat) => {
 const count = cat ==='All'? calendarEvents.length : calendarEvents.filter(e => e.category === cat).length;
 return (
 <button
 key={cat}
 onClick={() => setCategoryFilter(cat)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
 categoryFilter === cat
 ?'bg-sankara-800 text-white'
 :'text-slate-700 hover:bg-slate-100'
 }`}
 >
 <span>{cat}</span>
 <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
 categoryFilter === cat ?'bg-white/20 text-white':'bg-slate-200 text-slate-700'
 }`}>
 {count}
 </span>
 </button>
 );
 })}
 </div>

 {/* Events Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredEvents.length === 0 ? (
 <div className="col-span-full py-12 text-center text-xs text-slate-700">
 No events scheduled for the selected filters.
 </div>
 ) : (
 filteredEvents.map((ev) => (
 <div
 key={ev.id}
 className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-origin transition-all hover:shadow-origin-md flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between gap-2">
 <div>
 <h3 className="font-extrabold text-sm text-slate-900">
 {ev.title}
 </h3>
 <div className="flex items-center gap-2 mt-1 text-xs text-slate-700">
 <CalendarIcon className="h-3.5 w-3.5 text-slate-700"/>
 <span className="font-semibold">{ev.date}</span>
 </div>
 </div>

 <Badge
 variant={
 ev.category ==='Annadhanam'
 ?'purple'
 : ev.category ==='Eye Camp'
 ?'primary'
 :'amber'
 }
 size="sm"
 >
 {ev.category}
 </Badge>
 </div>

 <p className="mt-3 text-xs text-slate-700 leading-relaxed">
 {ev.description}
 </p>

 <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1">
 <div className="flex items-center justify-between">
 <span className="text-slate-700">Hospital Branch:</span>
 <span className="font-bold text-slate-900">{ev.location}</span>
 </div>
 {ev.sponsorName && (
 <div className="flex items-center justify-between">
 <span className="text-slate-700">Dedicated Sponsor:</span>
 <span className="font-bold text-sankara-800">{ev.sponsorName}</span>
 </div>
 )}
 {ev.amount && (
 <div className="flex items-center justify-between">
 <span className="text-slate-700">Seva Amount:</span>
 <span className="font-semibold text-emerald-600">{ev.amount}</span>
 </div>
 )}
 </div>
 </div>

 <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
 <button
 onClick={() => deleteCalendarEvent(ev.id)}
 className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
 title="Delete Event"
 >
 <Trash2 className="h-4 w-4"/>
 </button>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Add Event Modal */}
 {isAddModalOpen && (
 <Modal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 title="Schedule Seva / Camp Event"
 subtitle="Add Annadhanam food distributions, eye screening camps, or donor celebrations."
 maxWidth="xl"
 >
 <form onSubmit={handleSaveEvent} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Event Title *
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Annadhanam - Patient Meals Distribution"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Event Date
 </label>
 <input
 type="date"
 required
 value={formData.date}
 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Hospital Location
 </label>
 <select
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500"
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
 Category
 </label>
 <select
 value={formData.category}
 onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sankara-500"
 >
 <option value="Annadhanam">Annadhanam</option>
 <option value="Eye Camp">Eye Camp</option>
 <option value="Special Day">Special Day</option>
 <option value="Pediatric">Pediatric</option>
 <option value="Awareness">Awareness</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Dedicated Sponsor (Optional)
 </label>
 <input
 type="text"
 placeholder="e.g. Dr. Indra Balachandran"
 value={formData.sponsorName}
 onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Estimated / Seva Amount
 </label>
 <input
 type="text"
 placeholder="e.g. Rs. 10,000"
 value={formData.amount}
 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
 className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Event Description & Activities *
 </label>
 <textarea
 rows={3}
 required
 placeholder="Describe the camp outreach, meal distribution details, or dedication..."
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sankara-500"
 />
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
 <Button variant="outline"size="sm"type="button"onClick={() => setIsAddModalOpen(false)}>
 Cancel
 </Button>
 <Button variant="primary"size="sm"type="submit"className="bg-sankara-800 hover:bg-sankara-900">
 Schedule Event
 </Button>
 </div>
 </form>
 </Modal>
 )}
 </div>
 );
};
