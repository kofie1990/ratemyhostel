'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Hostel } from './AdminDashboard';

interface Props {
  token: string;
  hostel: Hostel;
  onDeleted: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ token, hostel, onDeleted, onClose }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');

    const res = await fetch(`/api/admin/hostels/${hostel.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });

    setDeleting(false);
    if (res.ok) {
      onDeleted();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to delete hostel.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111118] border border-white/10 rounded-3xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Delete Hostel</h2>
              <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-white/70 text-sm mb-2">
          You are about to permanently delete:
        </p>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 mb-5">
          <p className="font-semibold text-white text-sm">{hostel.name}</p>
          <p className="text-white/40 text-xs mt-0.5">{hostel.area}</p>
        </div>
        <p className="text-white/50 text-xs mb-5">
          All associated reviews, rooms, tags, and votes will also be permanently removed.
        </p>

        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-white/60 hover:text-white rounded-xl border border-white/10 hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {deleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Delete Hostel
          </button>
        </div>
      </div>
    </div>
  );
}
