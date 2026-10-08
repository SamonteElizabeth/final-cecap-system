import React, { useState } from 'react';
import {
  Radio,
  Zap,
  FileQuestion,
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Send,
  Calendar,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Heading,
  Link,
  Code,
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AdvisoriesSubTab } from '../AdminSidebar';
import { NotificationItem, OutageAdvisoryItem, FAQItem, SelfServiceGuideItem } from '../../../types';
import { OUTAGE_ADVISORIES_LIST, SELF_SERVICE_GUIDES_LIST } from '../../../data/adminMockData';
import { MOCK_FAQS } from '../../../data/mockBillingData';

interface AdvisoriesViewProps {
  subTab: AdvisoriesSubTab;
  setSubTab: (sub: AdvisoriesSubTab) => void;
  searchQuery?: string;
}

export const AdvisoriesView: React.FC<AdvisoriesViewProps> = ({ subTab, setSubTab, searchQuery = '' }) => {
  const { notifications, createAnnouncement, deleteAnnouncement } = useApp();

  const [outages, setOutages] = useState<OutageAdvisoryItem[]>(OUTAGE_ADVISORIES_LIST);
  const [guides, setGuides] = useState<SelfServiceGuideItem[]>(SELF_SERVICE_GUIDES_LIST);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [faqsList, setFaqsList] = useState<FAQItem[]>(MOCK_FAQS);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Content Form State
  const [title, setTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL'>('ALL');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY'>('NORMAL');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-08-10T08:00');
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (subTab === 'announcements') {
      createAnnouncement({
        title,
        message: contentBody,
        type: urgency === 'EMERGENCY' ? 'OUTAGE_EMERGENCY' : 'ANNOUNCEMENT',
        targetAudience,
        urgency,
      });
      setToastMsg('✅ Announcement published live to customers!');
    } else if (subTab === 'outages') {
      const newOutage: OutageAdvisoryItem = {
        id: `OUT-${Date.now()}`,
        referenceNo: `ADV-OUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        affectedAreas: ['Clark Freeport Zone', 'Berthaphil Sector'],
        scheduleStart: isScheduled ? scheduledDateTime : 'Immediate',
        scheduleEnd: 'Scheduled Window',
        reason: contentBody,
        status: isScheduled ? 'Scheduled' : 'Published',
        urgency,
        targetAudience,
        updatedAt: 'Just now',
        author: 'Engr. Roberto Santos',
      };
      setOutages([newOutage, ...outages]);
      setToastMsg('✅ Outage Advisory posted and pushed to mobile alerts!');
    } else if (subTab === 'faqs') {
      const newFaq: FAQItem = {
        id: `FAQ-${Date.now()}`,
        category: targetAudience === 'ALL' ? 'General' : targetAudience,
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
        readTime: '4 min read',
        status: 'Published',
        updatedAt: 'Just now',
        viewsCount: 1,
        imageUrl: attachedImageUrl || undefined,
      };
      setGuides([newGuide, ...guides]);
      setToastMsg('✅ Self-Service Guide published to Knowledge Base!');
    }

    setIsModalOpen(false);
    setTitle('');
    setContentBody('');
    setAttachedImageUrl(null);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-white hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Advisories Sub-Tab Navigation Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto">
          <button
            type="button"
            onClick={() => setSubTab('announcements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'announcements'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Announcements ({notifications.filter(n => n.createdByAdmin).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('outages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'outages'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Outage Advisories ({outages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('faqs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'faqs'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>FAQs ({faqsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('guides')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'guides'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Self-Service Guides ({guides.length})</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setPreviewMode(false);
          }}
          className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 w-full xl:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            Create New {subTab === 'announcements' ? 'Announcement' : subTab === 'outages' ? 'Outage Advisory' : subTab === 'faqs' ? 'FAQ' : 'Guide'}
          </span>
        </button>
      </div>

      {/* Content Render Area */}
      {subTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-[#2B2B2B] uppercase tracking-wider">Live Broadcast Announcements</h3>
            <span className="text-[10px] text-slate-400 font-bold">Push Notification Hub</span>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.filter(n => n.createdByAdmin).length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400 font-bold">No custom broadcast announcements published yet</p>
            ) : (
              notifications
                .filter(n => n.createdByAdmin)
                .map(n => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#2B2B2B]">{n.title}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5401]">
                          {n.targetAudience || 'ALL'} CUSTOMERS
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-slate-400 font-medium">Author: {n.authorName || 'Admin'} • {n.timestamp}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(n.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {subTab === 'outages' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Advisory Title & Reason</th>
                  <th className="py-3.5 px-4">Schedule Window</th>
                  <th className="py-3.5 px-4">Target Audience</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {outages.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF5401]">{o.referenceNo}</td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-extrabold text-[#2B2B2B]">{o.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{o.reason}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{o.scheduleStart}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">{o.targetAudience}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setOutages(outages.filter(item => item.id !== o.id))}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden divide-y divide-slate-100">
          {faqsList.map(faq => (
            <div key={faq.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#FF5401] uppercase">{faq.category}</span>
                <h4 className="font-extrabold text-xs text-[#2B2B2B]">{faq.question}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>

              <button
                type="button"
                onClick={() => setFaqsList(faqsList.filter(f => f.id !== faq.id))}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer shrink-0"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'guides' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden divide-y divide-slate-100">
          {guides.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-400 font-bold">No self-service guides created yet</p>
          ) : (
            guides.map(g => {
              const isExpanded = expandedGuideId === g.id;
              return (
                <div key={g.id} className="transition-colors">
                  <div
                    onClick={() => setExpandedGuideId(isExpanded ? null : g.id)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
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
                    <div className="p-4 bg-[#F8FAFC] border-t border-slate-100 space-y-3 animate-fade-in text-xs">
                      <div className="space-y-1">
                        <h5 className="font-bold text-[#2B2B2B] text-xs">Overview & Summary</h5>
                        <p className="text-slate-600 leading-relaxed">{g.summary}</p>
                      </div>
                      {g.content && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                          <h5 className="font-bold text-[#2B2B2B] text-xs">Guide Content & Instructions</h5>
                          <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-[#E5E7EB]">
                            {g.content}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-medium">
                        <span>Status: <strong className="text-emerald-600 font-bold">{g.status}</strong> • Updated {g.updatedAt}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuides(guides.filter(item => item.id !== g.id));
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
      )}

      {/* Add / Edit Content Modal with Rich Text & Live Customer Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                  Create {subTab === 'announcements' ? 'Announcement' : subTab === 'outages' ? 'Outage Advisory' : subTab === 'faqs' ? 'FAQ' : 'Guide'}
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
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Content Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter headline or title..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Target Audience</label>
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
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Urgency Level</label>
                    <select
                      value={urgency}
                      onChange={e => setUrgency(e.target.value as any)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none cursor-pointer"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH Priority</option>
                      <option value="EMERGENCY">EMERGENCY Broadcast</option>
                    </select>
                  </div>
                </div>

                {/* Simulated Rich Text Toolbar */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Content Body</label>
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:border-[#FF5401]">
                    <div className="bg-[#F8FAFC] p-2 border-b border-[#E2E8F0] flex items-center gap-2 text-slate-600">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Heading"><Heading className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Insert Link"><Link className="w-3.5 h-3.5" /></button>
                      <button type="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer" title="Code"><Code className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={contentBody}
                      onChange={e => setContentBody(e.target.value)}
                      placeholder="Write advisory content, reason, or guide text..."
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
                  Customer Notification Preview Card
                </div>

                <div className="max-w-sm mx-auto bg-white rounded-2xl border-2 border-[#FF5401] p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF5401] px-2.5 py-0.5 rounded-full">
                      {subTab.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Just now</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#2B2B2B]">{title || 'Sample Title Preview'}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{contentBody || 'Sample content text will appear here...'}</p>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Back to Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
