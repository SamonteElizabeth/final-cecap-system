import React, { useState } from 'react';
import {
  Tag,
  Zap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Power,
} from 'lucide-react';
import { MaintenanceSubTab } from '../AdminSidebar';
import { MasterCategoryItem } from '../../../types';
import {
  TICKET_CATEGORIES_MASTER,
  SERVICE_TYPES_MASTER,
} from '../../../data/adminMockData';

interface MaintenanceViewProps {
  subTab: MaintenanceSubTab;
  setSubTab: (sub: MaintenanceSubTab) => void;
  searchQuery?: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ subTab, setSubTab, searchQuery = '' }) => {
  const [ticketCats, setTicketCats] = useState<MasterCategoryItem[]>(TICKET_CATEGORIES_MASTER);
  const [serviceTypes, setServiceTypes] = useState<MasterCategoryItem[]>(SERVICE_TYPES_MASTER);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterCategoryItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slaHours, setSlaHours] = useState(12);

  const query = (localSearch || searchQuery).toLowerCase();

  const getActiveDataset = (): MasterCategoryItem[] => {
    switch (subTab) {
      case 'ticket-categories':
        return ticketCats;
      case 'service-types':
        return serviceTypes;
      default:
        return ticketCats;
    }
  };

  const filteredItems = getActiveDataset().filter(
    item =>
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  const handleToggleActive = (id: string) => {
    const updateFn = (list: MasterCategoryItem[]) =>
      list.map(item => (item.id === id ? { ...item, isActive: !item.isActive } : item));

    if (subTab === 'ticket-categories') setTicketCats(updateFn(ticketCats));
    if (subTab === 'service-types') setServiceTypes(updateFn(serviceTypes));

    setToastMsg('✅ Master category status toggled!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newItem: MasterCategoryItem = {
      id: editingItem ? editingItem.id : `MAINT-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      description,
      isActive: true,
      slaHours: slaHours,
      itemCount: 0,
    };

    const saveList = (list: MasterCategoryItem[]) => {
      if (editingItem) {
        return list.map(item => (item.id === editingItem.id ? newItem : item));
      }
      return [newItem, ...list];
    };

    if (subTab === 'ticket-categories') setTicketCats(saveList(ticketCats));
    if (subTab === 'service-types') setServiceTypes(saveList(serviceTypes));

    setIsModalOpen(false);
    setEditingItem(null);
    setCode('');
    setName('');
    setDescription('');
    setToastMsg(`✅ ${editingItem ? 'Updated' : 'Added'} master entry successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const openEditModal = (item: MasterCategoryItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description);
    setSlaHours(item.slaHours || 12);
    setIsModalOpen(true);
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

      {/* Maintenance Sub-Tab Navigation Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Sub-tabs bar */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubTab('ticket-categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'ticket-categories'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Ticket Categories ({ticketCats.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('service-types')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'service-types'
                ? 'bg-[#FF5401] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Service Types ({serviceTypes.length})</span>
          </button>
        </div>

        {/* Add New Entry button */}
        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setCode('');
            setName('');
            setDescription('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Table Data Render */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                {subTab === 'ticket-categories' && <th className="py-3.5 px-4">SLA Target</th>}
                <th className="py-3.5 px-4">Active Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FF5401]">{item.code}</td>
                  <td className="py-3.5 px-4 font-extrabold text-[#2B2B2B]">{item.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.description}</td>
                  {subTab === 'ticket-categories' && (
                    <td className="py-3.5 px-4 font-bold text-slate-700">{item.slaHours || 12} Hours</td>
                  )}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Master Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                {editingItem ? 'Edit' : 'Add New'} Master Entry
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Category Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. BILL, SERV, MTR"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter descriptive category name..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description of master entry scope..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-medium text-[#2B2B2B] focus:outline-none"
                />
              </div>

              {subTab === 'ticket-categories' && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">SLA Target (Hours)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={e => setSlaHours(parseInt(e.target.value) || 12)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-2.5 text-xs font-bold text-[#2B2B2B] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5401] hover:bg-[#E54A00] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
