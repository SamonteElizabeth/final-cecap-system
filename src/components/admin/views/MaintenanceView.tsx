import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  X,
  Power,
} from 'lucide-react';
import { MaintenanceSubTab } from '../AdminSidebar';
import { MasterCategoryItem } from '../../../types';
import {
  TICKET_CATEGORIES_MASTER,
} from '../../../data/adminMockData';

interface MaintenanceViewProps {
  subTab?: MaintenanceSubTab;
  setSubTab?: (sub: MaintenanceSubTab) => void;
  searchQuery?: string;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ searchQuery = '' }) => {
  const [ticketCats, setTicketCats] = useState<MasterCategoryItem[]>(TICKET_CATEGORIES_MASTER);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterCategoryItem | null>(null);

  // Form State (Category Code and SLA Target Hours removed per requirements)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const query = searchQuery.toLowerCase();

  const filteredItems = ticketCats.filter(
    item =>
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  const handleToggleActive = (id: string) => {
    setTicketCats(prev =>
      prev.map(item => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
    setToastMsg('✅ Master category status toggled!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Preserve existing code if editing, or auto-generate code from category name
    const generatedCode =
      editingItem?.code ||
      name.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() ||
      `CAT-${ticketCats.length + 1}`;

    const newItem: MasterCategoryItem = {
      id: editingItem ? editingItem.id : `CAT-${Date.now()}`,
      code: generatedCode,
      name: name.trim(),
      description: description.trim(),
      isActive: editingItem ? editingItem.isActive : true,
      itemCount: editingItem ? editingItem.itemCount : 0,
    };

    if (editingItem) {
      setTicketCats(prev => prev.map(item => (item.id === editingItem.id ? newItem : item)));
    } else {
      setTicketCats(prev => [newItem, ...prev]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setName('');
    setDescription('');
    setToastMsg(`✅ ${editingItem ? 'Updated' : 'Added'} category entry successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterCategoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
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

      {/* Maintenance Header & Action Bar (Service Types removed) */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Module Title & Counter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF5401] shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#2B2B2B]">Ticket Categories</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#FF5401]">
                {filteredItems.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Manage support ticket categories and active status</p>
          </div>
        </div>

        {/* Add New Entry Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#FF5401] hover:bg-[#E54A00] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[12%]">Code</th>
                <th className="py-3.5 px-4 sm:px-5 w-[26%]">Category Name</th>
                <th className="py-3.5 px-4 sm:px-5 w-[44%]">Description</th>
                <th className="py-3.5 px-4 sm:px-5 whitespace-nowrap w-[10%]">Active Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[#2B2B2B]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-xs">
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5 align-middle font-mono font-bold text-[#FF5401] whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle font-extrabold text-[#2B2B2B]">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle text-slate-600">
                      <div className="line-clamp-2 leading-relaxed" title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 align-middle whitespace-nowrap">
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
                    <td className="py-3.5 px-4 sm:px-5 align-middle text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer inline-flex items-center"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Master Data Modal (Category Code and SLA Target Hours removed) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-[#2B2B2B]">
                {editingItem ? 'Edit Category Entry' : 'Add New Category Entry'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                  Category Name <span className="text-[#FF5401]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Voltage Fluctuation, Meter Discrepancy..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-3 text-xs font-bold text-[#2B2B2B] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter description of what this category covers..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF5401] focus:bg-white rounded-xl p-3 text-xs font-medium text-[#2B2B2B] focus:outline-none transition-all"
                />
              </div>

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
                  {editingItem ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
