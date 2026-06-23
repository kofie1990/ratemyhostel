'use client';

import { useState, useEffect, useCallback } from 'react';
import { Hotel, MapPin, Image as ImageIcon, RefreshCw, CheckCheck, ChevronDown, Plus } from 'lucide-react';
import HostelImagePicker from './HostelImagePicker';

interface PendingRequest {
  id: string;
  requested_name: string;
  requested_area: string;
  status: string;
  created_at: string;
  user_id: string;
  room: {
    id: string;
    image_url: string;
    vibe_score: number;
    created_at: string;
  } | null;
}

interface ExistingHostel {
  id: string;
  name: string;
  area: string;
  university_slug: string;
}

const UNIVERSITIES = [
  { label: 'University of Ghana (UG)', slug: 'ug', areaHint: 'University of Ghana, Legon' },
  { label: 'KNUST', slug: 'knust', areaHint: 'KNUST, Kumasi' },
  { label: 'University of Cape Coast (UCC)', slug: 'ucc', areaHint: 'University of Cape Coast, Cape Coast' },
  { label: 'Other', slug: 'other', areaHint: '' },
];

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface Props {
  token: string;
  onResolved: (msg: string) => void;
}

export default function HostelRequestsTab({ token, onResolved }: Props) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [hostels, setHostels] = useState<ExistingHostel[]>([]);
  const [loading, setLoading] = useState(true);
  // Which request card is expanded
  const [expanded, setExpanded] = useState<string | null>(null);
  // Per-card action mode: 'map' | 'create' | null
  const [actionMode, setActionMode] = useState<Record<string, 'map' | 'create' | null>>({});
  // Map mode: selected hostel id
  const [mapSelection, setMapSelection] = useState<Record<string, string>>({});
  const [mapSearch, setMapSearch] = useState<Record<string, string>>({});
  // Create mode form fields
  const [createForm, setCreateForm] = useState<Record<string, { name: string; area: string; university_slug: string; hostel_slug: string; cover_image_url: string }>>({});
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [reqRes, hostelRes] = await Promise.all([
      fetch('/api/admin/requests', { headers: { 'x-admin-token': token } }),
      fetch('/api/admin/hostels', { headers: { 'x-admin-token': token } }),
    ]);
    if (reqRes.ok) {
      const d = await reqRes.json();
      setRequests(d.requests);
    }
    if (hostelRes.ok) {
      const d = await hostelRes.json();
      setHostels(d.hostels);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Initialise create form for a request
  const initCreateForm = (req: PendingRequest) => {
    if (!createForm[req.id]) {
      setCreateForm(f => ({
        ...f,
        [req.id]: {
          name: req.requested_name,
          area: req.requested_area,
          university_slug: 'ug',
          hostel_slug: slugify(req.requested_name),
          cover_image_url: '',
        },
      }));
    }
  };

  const updateCreate = (id: string, field: string, value: string) => {
    setCreateForm(f => ({ ...f, [id]: { ...f[id], [field]: value } }));
  };

  async function resolve(req: PendingRequest, action: 'map' | 'create') {
    if (!req.room) return;
    setResolving(req.id);

    let body: Record<string, unknown> = { action, room_id: req.room.id };

    if (action === 'map') {
      const hostel_id = mapSelection[req.id];
      if (!hostel_id) { setResolving(null); return; }
      body.hostel_id = hostel_id;
    } else {
      const f = createForm[req.id];
      if (!f?.name || !f?.area || !f?.university_slug) { setResolving(null); return; }
      body = { ...body, ...f };
    }

    const res = await fetch(`/api/admin/requests/${req.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(body),
    });

    setResolving(null);

    if (res.ok) {
      onResolved(action === 'map' ? 'Room mapped to existing hostel.' : 'New hostel created and room published.');
      fetchData();
    } else {
      const d = await res.json().catch(() => ({}));
      onResolved(`Error: ${d.error || 'Something went wrong.'}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-20 text-center">
        <CheckCheck className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
        <p className="text-white/40 text-sm font-medium">All caught up — no pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/40 text-sm">{requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>
        <button onClick={fetchData} className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors text-white/60 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {requests.map((req) => {
        const isExpanded = expanded === req.id;
        const mode = actionMode[req.id] ?? null;
        const filteredHostels = hostels.filter(h =>
          h.name.toLowerCase().includes((mapSearch[req.id] ?? '').toLowerCase()) ||
          h.area.toLowerCase().includes((mapSearch[req.id] ?? '').toLowerCase())
        );

        return (
          <div key={req.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
            {/* Card header — always visible */}
            <button
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpanded(isExpanded ? null : req.id)}
            >
              {/* Room thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/[0.06]">
                {req.room?.image_url ? (
                  <img src={req.room.image_url} alt="Room" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white/20" />
                  </div>
                )}
              </div>

              {/* Request info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                    Pending
                  </span>
                </div>
                <p className="font-semibold text-white text-sm truncate">{req.requested_name}</p>
                <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {req.requested_area}
                </p>
              </div>

              <div className="text-white/30 text-xs text-right shrink-0">
                <p>{new Date(req.created_at).toLocaleDateString()}</p>
                <ChevronDown className={`w-4 h-4 ml-auto mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Expanded actions */}
            {isExpanded && (
              <div className="border-t border-white/[0.06] p-4 space-y-4">
                {/* Room image preview */}
                {req.room?.image_url && (
                  <img
                    src={req.room.image_url}
                    alt="Uploaded room"
                    className="w-full max-h-48 object-cover rounded-xl opacity-80"
                  />
                )}

                {!req.room && (
                  <p className="text-amber-400/70 text-xs bg-amber-400/5 border border-amber-400/15 rounded-xl p-3">
                    No room found linked to this request. It may have been removed.
                  </p>
                )}

                {/* Action selector */}
                {req.room && mode === null && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActionMode(m => ({ ...m, [req.id]: 'map' }))}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-600/10 border border-violet-500/25 hover:bg-violet-600/20 transition-colors text-center"
                    >
                      <Hotel className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="font-semibold text-sm text-white">Map to Existing</p>
                        <p className="text-white/40 text-xs mt-0.5">Link room to a hostel already in the directory</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { initCreateForm(req); setActionMode(m => ({ ...m, [req.id]: 'create' })); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/25 hover:bg-emerald-600/20 transition-colors text-center"
                    >
                      <Plus className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-sm text-white">Add New Hostel</p>
                        <p className="text-white/40 text-xs mt-0.5">Create this hostel in the directory</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* MAP mode */}
                {mode === 'map' && (
                  <div className="space-y-3">
                    <p className="text-white/60 text-xs font-medium">Search and select the correct hostel:</p>
                    <input
                      type="text"
                      placeholder="Search hostels…"
                      value={mapSearch[req.id] ?? ''}
                      onChange={e => setMapSearch(s => ({ ...s, [req.id]: e.target.value }))}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-all"
                    />
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {filteredHostels.slice(0, 20).map(h => (
                        <button
                          key={h.id}
                          onClick={() => setMapSelection(s => ({ ...s, [req.id]: h.id }))}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                            mapSelection[req.id] === h.id
                              ? 'bg-violet-600/25 border-violet-500/50 text-white'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
                          }`}
                        >
                          <p className="font-medium leading-tight">{h.name}</p>
                          <p className="text-white/40 text-xs mt-0.5">{h.area}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setActionMode(m => ({ ...m, [req.id]: null }))}
                        className="flex-1 py-2 text-sm text-white/50 hover:text-white rounded-xl border border-white/10 hover:bg-white/[0.05] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        disabled={!mapSelection[req.id] || resolving === req.id}
                        onClick={() => resolve(req, 'map')}
                        className="flex-1 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {resolving === req.id && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Confirm Map
                      </button>
                    </div>
                  </div>
                )}

                {/* CREATE mode */}
                {mode === 'create' && createForm[req.id] && (
                  <div className="space-y-3">
                    <p className="text-white/60 text-xs font-medium">Verify and add this new hostel:</p>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">Hostel Name</label>
                        <input
                          type="text"
                          value={createForm[req.id].name}
                          onChange={e => updateCreate(req.id, 'name', e.target.value)}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">University</label>
                        <select
                          value={createForm[req.id].university_slug}
                          onChange={e => {
                            const uni = UNIVERSITIES.find(u => u.slug === e.target.value);
                            updateCreate(req.id, 'university_slug', e.target.value);
                            if (uni?.areaHint) updateCreate(req.id, 'area', uni.areaHint);
                          }}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 appearance-none"
                        >
                          {UNIVERSITIES.map(u => (
                            <option key={u.slug} value={u.slug} className="bg-[#111118]">{u.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">Area</label>
                        <input
                          type="text"
                          value={createForm[req.id].area}
                          onChange={e => updateCreate(req.id, 'area', e.target.value)}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">URL Slug</label>
                        <input
                          type="text"
                          value={createForm[req.id].hostel_slug}
                          onChange={e => updateCreate(req.id, 'hostel_slug', e.target.value)}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-white/30 outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <HostelImagePicker
                          value={createForm[req.id].cover_image_url}
                          onChange={url => updateCreate(req.id, 'cover_image_url', url)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setActionMode(m => ({ ...m, [req.id]: null }))}
                        className="flex-1 py-2 text-sm text-white/50 hover:text-white rounded-xl border border-white/10 hover:bg-white/[0.05] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        disabled={resolving === req.id}
                        onClick={() => resolve(req, 'create')}
                        className="flex-1 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {resolving === req.id && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Create & Publish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
