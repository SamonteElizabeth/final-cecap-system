import React, { useState } from 'react';
import {
  Radio,
  Zap,
  FileQuestion,
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Bold,
  Italic,
  List,
  Heading,
  Link,
  Code,
  ShieldAlert,
  Pencil,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AdvisoriesSubTab } from '../AdminSidebar';
import { NotificationItem, OutageAdvisoryItem, FAQItem, SelfServiceGuideItem } from '../../../types';
import { OUTAGE_ADVISORIES_LIST, SELF_SERVICE_GUIDES_LIST } from '../../../data/adminMockData';
import { MOCK_FAQS } from '../../../data/mockBillingData';

interface AdvisoriesViewProps {
  subTab: AdvisoriesSubTab;
  setSubTab?: (sub: AdvisoriesSubTab) => void;
  searchQuery?: string;
}

type CombinedAdvisoryFilter = 'ALL' | 'ANNOUNCEMENTS' | 'OUTAGES';

export const AdvisoriesView: React.FC<AdvisoriesViewProps> = ({ subTab, searchQuery = '' }) => {
  const { notifications, createAnnouncement, deleteAnnouncement, editAnnouncement } = useApp();

  const [outages, setOutages] = useState<OutageAdvisoryItem[]>(OUTAGE_ADVISORIES_LIST);
  const [guides, setGuides] = useState<SelfServiceGuideItem[]>(SELF_SERVICE_GUIDES_LIST);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [faqsList, setFaqsList] = useState<FAQItem[]>(MOCK_FAQS);

  // Sub-filter inside Combined Announcements & Outages
  const [combinedFilter, setCombinedFilter] = useState<CombinedAdvisoryFilter>('ALL');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'ANNOUNCEMENT' | 'OUTAGE';
    title: string;
    message: string;
    urgency?: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editUrgency, setEditUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY'>('NORMAL');

  // Content Form State
  const [advisoryType, setAdvisoryType] = useState<'ANNOUNCEMENT' | 'OUTAGE'>('ANNOUNCEMENT');
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL'>('ALL');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY'>('NORMAL');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-08-10T08:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('2026-08-10T12:00');
  const [affectedAreasInput, setAffectedAreasInput] = useState('Clark Freeport Zone, Berthaphil Sector');

  // FAQ Category state
  const [faqCategory, setFaqCategory] = useState('Billing');

  const query = (localSearch || searchQuery).trim().toLowerCase();

  // Active admin broadcast announcements
  const adminAnnouncements = notifications.filter(
    n => n.createdByAdmin || n.type === 'ANNOUNCEMENT' || n.type === 'PROMOTION'
  );

  // Filter combined announcements and outages
  const filteredAnnouncements = adminAnnouncements.filter(n => {
    if (combinedFilter === 'OUTAGES') return false;
    if (!query) return true;
    return (
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query) ||
      (n.authorName && n.authorName.toLowerCase().includes(query))
    );
  });

  const filteredOutages = outages.filter(o => {
    if (combinedFilter === 'ANNOUNCEMENTS') return false;
    if (!query) return true;
    return (
      o.title.toLowerCase().includes(query) ||
      o.reason.toLowerCase().includes(query) ||
      o.referenceNo.toLowerCase().includes(query) ||
      o.affectedAreas.some(area => area.toLowerCase().includes(query))
    );
  });

  const totalCombinedCount = adminAnnouncements.length + outages.length;

  // Filter FAQs
  const filteredFaqs = faqsList.filter(f => {
    if (!query) return true;
    return (
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query)
    );
  });

  // Filter Guides
  const filteredGuides = guides.filter(g => {
    if (!query) return true;
    return (
      g.title.toLowerCase().includes(query) ||
      g.summary.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query)
    );
  });

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (subTab === 'announcements') {
      if (advisoryType === 'ANNOUNCEMENT') {
        createAnnouncement({
          title,
          message: contentBody,
          type: urgency === 'EMERGENCY' ? 'OUTAGE_EMERGENCY' : 'ANNOUNCEMENT',
          targetAudience,
          urgency,
          authorName: 'Admin Operations',
        });
        setToastMsg('✅ Broadcast Announcement published live to customers!');
      } else {
        const areas = affectedAreasInput
          .split(',')
          .map(a => a.trim())
          .filter(Boolean);
        const newOutage: OutageAdvisoryItem = {
          id: `OUT-${Date.now()}`,
          referenceNo: `ADV-OUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title,
          affectedAreas: areas.length > 0 ? areas : ['Clark Freeport Zone'],
          scheduleStart: isScheduled ? scheduledDateTime.replace('T', ' ') : 'Immediate',
          scheduleEnd: isScheduled ? scheduleEndTime.replace('T', ' ') : 'Until Further Notice',
          reason: contentBody,
          status: isScheduled ? 'Scheduled' : 'Published',
          urgency,
          targetAudience,
          updatedAt: 'Just now',
          author: 'Engr. Roberto Santos',
        };
        setOutages([newOutage, ...outages]);
        setToastMsg('✅ Outage Advisory posted and pushed to mobile alerts!');
      }
    } else if (subTab === 'faqs') {
      const newFaq: FAQItem = {
        id: `FAQ-${Date.now()}`,
        category: faqCategory || 'General',
        question: title,
        answer: contentBody,
      };
      setFaqsList([newFaq, ...faqsList]);
      setToastMsg('✅ New FAQ question & answer published!');
    } else if (subTab === 'guides') {
      const newGuide: SelfServiceGuideItem = {
        id: `GUIDE-${Date.now()}`,
        title,
        category: 'General',
        summary: title,
        content: contentBody,
        readTime: '3 min read',
        status: 'Published',
        updatedAt: 'Just now',
        viewsCount: 1,
      };
      setGuides([newGuide, ...guides]);
      setToastMsg('✅ Self-Service Guide published to Knowledge Base!');
    }

    setIsModalOpen(false);
    setTitle('');
    setContentBody('');
    setAffectedAreasInput('Clark Freeport Zone, Berthaphil Sector');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpenEdit = (item: {
    id: string;
    type: 'ANNOUNCEMENT' | 'OUTAGE';
    title: string;
    message: string;
    urgency?: 'NORMAL' | 'HIGH' | 'EMERGENCY';
  }) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditMessage(item.message);
    setEditUrgency(item.urgency || 'NORMAL');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;

    if (editingItem.type === 'ANNOUNCEMENT') {
      editAnnouncement(editingItem.id, {
        title: editTitle.trim(),
        message: editMessage.trim(),
        urgency: editUrgency,
      });
      setToastMsg('✅ Announcement details updated successfully!');
    } else {
      setOutages(prev =>
        prev.map(o =>
          o.id === editingItem.id
            ? { ...o, title: editTitle.trim(), reason: editMessage.trim(), urgency: editUrgency }
            : o
        )
      );
      setToastMsg('✅ Outage advisory details updated successfully!');
    }

    setEditingItem(null);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-white hover:text-slate-200 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* SUB-MODULE 1: COMBINED ANNOUNCEMENT & OUTAGE ADVISORIES */}
      {subTab === 'announcements' && (
        <div className="space-y-4">
          {/* Quick Filter Bar & Search */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col xl:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto">
              <button
                type="button"
                onClick={() => setCombinedFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  combinedFilter === 'ALL'
                    ? 'bg-[#FF5401] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({totalCombinedCount})
              </button>
              <button
                type="button"
                onClick={() => setCombinedFilter('OUTAGES')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  combinedFilter === 'OUTAGES'
                    ? 'bg-[#FF5401] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Outage Advisories ({outages.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCombinedFilter('ANNOUNCEMENTS')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  combinedFilter === 'ANNOUNCEMENTS'
                    ? 'bg-[#FF5401] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Announcements ({adminAnnouncements.length})</span>
              </button>
            </div>

            {/* Local Search & Create New Advisory Button */}
            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
              <div className="relative flex-1 xl:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search advisories or outages..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl text-xs font-medium text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setPreviewMode(false);
                }}
                className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap">Create New Advisory</span>
              </button>
            </div>
          </div>

          {/* Combined Advisories Table Container */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF5401]" />
                <h3 className="font-extrabold text-xs text-[#2B2B2B] uppercase tracking-wider">
                  Created Advisories & Announcements
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {filteredAnnouncements.length + filteredOutages.length} Total Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Title & Details</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">Author / Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAnnouncements.length === 0 && filteredOutages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 space-y-2 text-slate-400 font-bold">
                        <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">No advisories or announcements found</p>
                        <p className="text-[11px] text-slate-400 font-normal">Try adjusting your filter or search query</p>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Outage Advisories */}
                      {filteredOutages.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                              <Zap className="w-3 h-3 text-amber-700" />
                              Outage Advisory
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="font-extrabold text-sm text-[#2B2B2B]">{o.title}</div>
                            <div className="text-xs text-slate-600 leading-relaxed mt-0.5 line-clamp-2">{o.reason}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                o.urgency === 'EMERGENCY'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : o.urgency === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {o.urgency}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                            <div className="font-bold text-[#2B2B2B]">{o.author || 'Admin Lead'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEdit({
                                    id: o.id,
                                    type: 'OUTAGE',
                                    title: o.title,
                                    message: o.reason,
                                    urgency: o.urgency as any,
                                  })
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#FF5401] hover:border-[#FF5401]/30 hover:bg-orange-50/50 text-xs font-bold transition-all cursor-pointer"
                                title="Edit Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOutages(outages.filter(item => item.id !== o.id));
                                  setToastMsg('Outage advisory deleted');
                                  setTimeout(() => setToastMsg(''), 2500);
                                }}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete Advisory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Broadcast Announcements */}
                      {filteredAnnouncements.map(n => (
                        <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300/60">
                              <Megaphone className="w-3 h-3 text-blue-700" />
                              Announcement
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="font-extrabold text-sm text-[#2B2B2B]">{n.title}</div>
                            <div className="text-xs text-slate-600 leading-relaxed mt-0.5 line-clamp-2">{n.message}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                n.urgency === 'EMERGENCY'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : n.urgency === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {n.urgency || 'NORMAL'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                            <div className="font-bold text-[#2B2B2B]">{n.authorName || 'Admin Lead'}</div>
                            <div className="text-[10px] text-slate-400">{n.timestamp}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEdit({
                                    id: n.id,
                                    type: 'ANNOUNCEMENT',
                                    title: n.title,
                                    message: n.message,
                                    urgency: n.urgency as any,
                                  })
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#FF5401] hover:border-[#FF5401]/30 hover:bg-orange-50/50 text-xs font-bold transition-all cursor-pointer"
                                title="Edit Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAnnouncement(n.id);
                                  setToastMsg('Announcement deleted');
                                  setTimeout(() => setToastMsg(''), 2500);
                                }}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Delete Announcement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODULE 2: FAQS */}
      {subTab === 'faqs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQs by question or answer..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl text-xs font-medium text-[#2B2B2B] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {filteredFaqs.length} FAQs Published
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setPreviewMode(false);
                }}
                className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap">Create New FAQ</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden divide-y divide-slate-100">
            {filteredFaqs.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400 font-bold">No FAQs found matching your criteria</p>
            ) : (
              filteredFaqs.map(faq => (
                <div key={faq.id} className="p-4.5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-extrabold text-[#FF5401] uppercase px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 inline-block">
                      {faq.category}
                    </span>
                    <h4 className="font-extrabold text-xs text-[#2B2B2B]">{faq.question}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFaqsList(faqsList.filter(f => f.id !== faq.id));
                      setToastMsg('FAQ item deleted');
                      setTimeout(() => setToastMsg(''), 2500);
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer shrink-0"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-MODULE 3: SELF SERVICE GUIDES */}
      {subTab === 'guides' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search self service guides..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl text-xs font-medium text-[#2B2B2B] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {filteredGuides.length} Guides Available
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setPreviewMode(false);
                }}
                className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap">Create New Guide</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden divide-y divide-slate-100">
            {filteredGuides.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400 font-bold">No self-service guides found</p>
            ) : (
              filteredGuides.map(g => {
                const isExpanded = expandedGuideId === g.id;
                return (
                  <div key={g.id} className="transition-colors">
                    <div
                      onClick={() => setExpandedGuideId(isExpanded ? null : g.id)}
                      className="p-4.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-orange-50 text-[#FF5401] border border-orange-200/60 rounded-lg uppercase shrink-0">
                          {g.category}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-[#2B2B2B] truncate">{g.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{g.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block text-[10px] text-slate-400 font-medium">
                          <span>{g.readTime}</span> • <span>{g.viewsCount} reads</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#FF5401]" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Dropdown Content */}
                    {isExpanded && (
                      <div className="p-4.5 bg-[#F8FAFC] border-t border-slate-100 space-y-3 animate-fade-in text-xs">
                        <div className="space-y-1">
                          <h5 className="font-bold text-[#2B2B2B] text-xs">Overview & Summary</h5>
                          <p className="text-slate-600 leading-relaxed">{g.summary}</p>
                        </div>
                        {g.content && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                            <h5 className="font-bold text-[#2B2B2B] text-xs">Guide Content & Instructions</h5>
                            <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
                              {g.content}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-medium">
                          <span>Status: <strong className="text-emerald-600 font-bold">{g.status}</strong> • Updated {g.updatedAt}</span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setGuides(guides.filter(item => item.id !== g.id));
                              setToastMsg('Guide deleted');
                              setTimeout(() => setToastMsg(''), 2500);
                            }}
                            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Guide</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL: WITH TYPE PICKER FOR COMBINED ADVISORIES */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                  {subTab === 'announcements'
                    ? advisoryType === 'OUTAGE'
                      ? 'Publish Power Outage Advisory'
                      : 'Publish Broadcast Announcement'
                    : subTab === 'faqs'
                    ? 'Create New FAQ'
                    : 'Create Self-Service Guide'}
                </h3>
                <p className="text-xs text-slate-400">Compose and preview content before publishing live.</p>
              </div>

              {/* Mode Tabs: Editor vs Live Preview */}
              <div className="flex items-center bg-[#F8FAFC] border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !previewMode ? 'bg-[#FF5401] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Editor Form
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode ? 'bg-[#FF5401] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Customer Preview
                </button>
              </div>
            </div>

            {!previewMode ? (
              <form onSubmit={handleCreateContent} className="space-y-4">
                {/* Advisory Type Selection (Only when creating in Combined Announcements) */}
                {subTab === 'announcements' && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1.5">
                      Advisory Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAdvisoryType('ANNOUNCEMENT')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          advisoryType === 'ANNOUNCEMENT'
                            ? 'border-[#FF5401] bg-orange-50/70 text-[#FF5401] font-bold ring-2 ring-[#FF5401]/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Megaphone className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs">Broadcast Announcement</div>
                          <div className="text-[10px] text-slate-400 font-normal">Push notification / Notice</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdvisoryType('OUTAGE')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          advisoryType === 'OUTAGE'
                            ? 'border-[#FF5401] bg-orange-50/70 text-[#FF5401] font-bold ring-2 ring-[#FF5401]/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Zap className="w-4 h-4 shrink-0" />
                        <div>
                          <div className="text-xs">Power Outage Advisory</div>
                          <div className="text-[10px] text-slate-400 font-normal">Scheduled or Emergency</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* FAQ Category Picker */}
                {subTab === 'faqs' && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      FAQ Category
                    </label>
                    <select
                      value={faqCategory}
                      onChange={e => setFaqCategory(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                    >
                      <option value="Billing">Billing & Rates</option>
                      <option value="Payments">Payment Methods</option>
                      <option value="Technical">Power & Meters</option>
                      <option value="General">General Inquiries</option>
                    </select>
                  </div>
                )}

                {/* Content Title */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    {subTab === 'faqs' ? 'Question' : 'Advisory Title / Headline'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={
                      subTab === 'faqs'
                        ? 'e.g., How do I view my daily consumption?'
                        : subTab === 'guides'
                        ? 'e.g., How to submit a billing inquiry'
                        : advisoryType === 'OUTAGE'
                        ? 'e.g., Emergency Feeder 3 Power Interruption'
                        : 'e.g., System Maintenance Notice'
                    }
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                  />
                </div>

                {/* Target Audience & Urgency (for Announcements & Outages) */}
                {subTab === 'announcements' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={e => setTargetAudience(e.target.value as any)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">ALL Customers</option>
                        <option value="RESIDENTIAL">RESIDENTIAL Only</option>
                        <option value="COMMERCIAL">COMMERCIAL Only</option>
                        <option value="INDUSTRIAL">INDUSTRIAL Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                      >
                        <option value="NORMAL">NORMAL Priority</option>
                        <option value="HIGH">HIGH Priority</option>
                        <option value="EMERGENCY">EMERGENCY Broadcast</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Additional Outage-Specific Fields */}
                {subTab === 'announcements' && advisoryType === 'OUTAGE' && (
                  <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-amber-900 mb-1">
                        Affected Areas (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={affectedAreasInput}
                        onChange={e => setAffectedAreasInput(e.target.value)}
                        placeholder="e.g., Clark Freeport Zone, Berthaphil Sector"
                        className="w-full bg-white border border-amber-300 focus:border-[#FF5401] rounded-xl p-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-amber-900 mb-1">
                          Schedule Window Start
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={e => setScheduledDateTime(e.target.value)}
                          className="w-full bg-white border border-amber-300 focus:border-[#FF5401] rounded-xl p-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-amber-900 mb-1">
                          Estimated Restoration / End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduleEndTime}
                          onChange={e => setScheduleEndTime(e.target.value)}
                          className="w-full bg-white border border-amber-300 focus:border-[#FF5401] rounded-xl p-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Rich Text Toolbar & Content Body */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                    {subTab === 'faqs' ? 'Answer / Explanation' : 'Advisory Details & Message Body'}
                  </label>
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:border-[#FF5401]">
                    <div className="bg-[#F8FAFC] p-2 border-b border-[#E2E8F0] flex items-center gap-2 text-slate-600">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Bold">
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Italic">
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Heading">
                        <Heading className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Bullet List">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Insert Link">
                        <Link className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Code">
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={contentBody}
                      onChange={e => setContentBody(e.target.value)}
                      placeholder={
                        subTab === 'faqs'
                          ? 'Provide clear, step-by-step guidance for this question...'
                          : advisoryType === 'OUTAGE'
                          ? 'Describe technical cause, scope of maintenance, and safety advisory...'
                          : 'Write notification message body to be broadcasted to customers...'
                      }
                      className="w-full p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Live Now</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Live Customer Mobile Preview Card */
              <div className="space-y-4 py-2">
                <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Customer App Preview Card
                </div>

                <div className="max-w-sm mx-auto bg-white rounded-2xl border-2 border-[#FF5401] p-4.5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5401] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      {subTab === 'announcements' && advisoryType === 'OUTAGE' ? (
                        <>
                          <Zap className="w-3 h-3" /> OUTAGE ADVISORY
                        </>
                      ) : subTab === 'announcements' ? (
                        <>
                          <Megaphone className="w-3 h-3" /> ANNOUNCEMENT
                        </>
                      ) : (
                        subTab.toUpperCase()
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Just now</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[#2B2B2B]">{title || 'Sample Title Preview'}</h4>

                  {subTab === 'announcements' && advisoryType === 'OUTAGE' && (
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                      <div><strong>Areas:</strong> {affectedAreasInput || 'Clark Freeport Zone'}</div>
                      <div><strong>Window:</strong> {scheduledDateTime.replace('T', ' ')} - {scheduleEndTime.replace('T', ' ')}</div>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">{contentBody || 'Sample content text will appear here...'}</p>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back to Editor Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT ADVISORY / ANNOUNCEMENT MODAL */}
      {editingItem && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto"
        >
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 md:p-7 space-y-5 my-auto relative border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-[#FF5401] rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                    Edit {editingItem.type === 'OUTAGE' ? 'Outage Advisory' : 'Announcement'} Details
                  </h3>
                  <p className="text-[11px] text-slate-400">Update headline, description, and urgency.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Details / Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={editMessage}
                  onChange={e => setEditMessage(e.target.value)}
                  placeholder="Enter message details..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                  Urgency Level
                </label>
                <select
                  value={editUrgency}
                  onChange={e => setEditUrgency(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                >
                  <option value="NORMAL">Normal Urgency</option>
                  <option value="HIGH">High Priority</option>
                  <option value="EMERGENCY">Emergency Critical</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
