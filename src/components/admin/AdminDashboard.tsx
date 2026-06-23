'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, LogOut, Hotel, Star, Trash2, Pencil, RefreshCw, Search, Inbox } from 'lucide-react';
import HostelFormModal from './HostelFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import HostelRequestsTab from './HostelRequestsTab';

export interface Hostel {
  id: string;
  name: string;
  area: string;
  description: string | null;
  cover_image_url: string | null;
  amenities: string[];
  university_slug: string;
  hostel_slug: string;
  averageRating: number;
  reviewCount: number;
  created_at: string;
}

interface Props {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: Props) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'hostels' | 'requests'>('hostels');
  const [pendingCount, setPendingCount] = useState(0);
  const [formModal, setFormModal] = useState<{ open: boolean; hostel?: Hostel }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; hostel?: Hostel }>({ open: false });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/hostels', {
      headers: { 'x-admin-token': token },
    });
    if (res.ok) {
      const data = await res.json();
      setHostels(data.hostels);
    }
    setLoading(false);
  }, [token]);

  const fetchPendingCount = useCallback(async () => {
    const res = await fetch('/api/admin/requests', {
      headers: { 'x-admin-token': token },
    });
    if (res.ok) {
      const data = await res.json();
      setPendingCount(data.requests?.length ?? 0);
    }
  }, [token]);

  useEffect(() => { fetchHostels(); fetchPendingCount(); }, [fetchHostels, fetchPendingCount]);

  const filtered = hostels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.area.toLowerCase().includes(search.toLowerCase()) ||
    h.university_slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = (msg: string) => {
    setFormModal({ open: false });
    fetchHostels();
    showToast(msg);
  };

  const handleDeleted = () => {
    setDeleteModal({ open: false });
    fetchHostels();
    showToast('Hostel deleted successfully.');
  };

  const stats = {
    total: hostels.length,
    ug: hostels.filter(h => h.university_slug === 'ug').length,
    knust: hostels.filter(h => h.university_slug === 'knust').length,
    ucc: hostels.filter(h => h.university_slug === 'ucc').length,
  };

  const handleRequestResolved = (msg: string) => {
    fetchPendingCount();
    showToast(msg);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Hotel className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">RateMyHostel</span>
              <span className="ml-2 text-[10px] uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">Admin</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Hostels', value: stats.total },
            { label: 'UG Legon', value: stats.ug },
            { label: 'KNUST', value: stats.knust },
            { label: 'UCC', value: stats.ucc },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <p className="text-white/40 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 w-fit mb-8">
          <button
            onClick={() => setActiveTab('hostels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'hostels'
                ? 'bg-white/[0.08] text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Hotel className="w-4 h-4" />
            Hostels
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-white/[0.08] text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Pending Requests
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'requests' && (
          <HostelRequestsTab token={token} onResolved={handleRequestResolved} />
        )}

        {activeTab === 'hostels' && (<>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search hostels…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchHostels} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors text-white/60 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="admin-add-hostel-btn"
              onClick={() => setFormModal({ open: true })}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Hostel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Hotel className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No hostels found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-5 py-3">Hostel</th>
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Area</th>
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell">University</th>
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Rating</th>
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Reviews</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((hostel, i) => (
                    <tr
                      key={hostel.id}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {hostel.cover_image_url ? (
                            <img src={hostel.cover_image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 opacity-80" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                              <Hotel className="w-4 h-4 text-white/30" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white leading-tight">{hostel.name}</p>
                            <p className="text-white/30 text-xs mt-0.5 md:hidden">{hostel.area}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/60 hidden md:table-cell">{hostel.area}</td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="uppercase text-[11px] font-bold tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-1">
                          {hostel.university_slug}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-white/70 text-sm">{hostel.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/50 text-sm hidden lg:table-cell">{hostel.reviewCount}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setFormModal({ open: true, hostel })}
                            className="p-2 rounded-lg text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, hostel })}
                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-white/20 text-xs mt-4 text-right">{filtered.length} of {hostels.length} hostels</p>
        </>)}
      </main>

      {/* Modals */}
      {formModal.open && (
        <HostelFormModal
          token={token}
          hostel={formModal.hostel}
          onSaved={handleSaved}
          onClose={() => setFormModal({ open: false })}
        />
      )}
      {deleteModal.open && deleteModal.hostel && (
        <DeleteConfirmModal
          token={token}
          hostel={deleteModal.hostel}
          onDeleted={handleDeleted}
          onClose={() => setDeleteModal({ open: false })}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl text-emerald-300 text-sm font-medium px-5 py-3 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
