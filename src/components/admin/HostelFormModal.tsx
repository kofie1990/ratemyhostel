'use client';

import { useState, useEffect } from 'react';
import { X, Hotel } from 'lucide-react';
import type { Hostel } from './AdminDashboard';
import HostelImagePicker from './HostelImagePicker';

const UNIVERSITIES = [
  { label: 'University of Ghana (UG)', slug: 'ug', areaHint: 'University of Ghana, Legon' },
  { label: 'KNUST', slug: 'knust', areaHint: 'KNUST, Kumasi' },
  { label: 'University of Cape Coast (UCC)', slug: 'ucc', areaHint: 'University of Cape Coast, Cape Coast' },
  { label: 'Central University', slug: 'central', areaHint: 'Central University, Accra' },
  { label: 'Other', slug: 'other', areaHint: '' },
];

const DEFAULT_AMENITIES = [
  '⚡ Backup Generator',
  '💧 24/7 Water',
  '🔒 Walled & Gated',
  '🧹 Weekly Cleaning',
  '📶 Wi-Fi',
  '🚿 En-suite Bathrooms',
  '🔐 CCTV Security',
  '🅿️ Parking',
  '🛏️ Furnished',
  '🔌 Free Electricity',
  '❄️ Air Conditioning'
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface Props {
  token: string;
  hostel?: Hostel;
  onSaved: (msg: string) => void;
  onClose: () => void;
}

export default function HostelFormModal({ token, hostel, onSaved, onClose }: Props) {
  const isEdit = !!hostel;

  const [form, setForm] = useState({
    name: hostel?.name ?? '',
    area: hostel?.area ?? '',
    description: hostel?.description ?? '',
    cover_image_url: hostel?.cover_image_url ?? '',
    university_slug: hostel?.university_slug ?? 'ug',
    hostel_slug: hostel?.hostel_slug ?? '',
    amenities: hostel?.amenities ?? [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill area hint when university changes
  const handleUniversityChange = (slug: string) => {
    const uni = UNIVERSITIES.find(u => u.slug === slug);
    setForm(f => ({
      ...f,
      university_slug: slug,
      area: uni?.areaHint || f.area,
    }));
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && form.name) {
      setForm(f => ({ ...f, hostel_slug: slugify(form.name) }));
    }
  }, [form.name, isEdit]);

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const url = isEdit
      ? `/api/admin/hostels/${hostel!.id}`
      : '/api/admin/hostels';

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      onSaved(isEdit ? 'Hostel updated successfully.' : 'Hostel added successfully.');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#111118] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Hotel className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-bold text-white text-base">
              {isEdit ? 'Edit Hostel' : 'Add New Hostel'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Hostel Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Pentagon Hostel"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">University *</label>
              <select
                value={form.university_slug}
                onChange={e => handleUniversityChange(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 transition-all appearance-none"
              >
                {UNIVERSITIES.map(u => (
                  <option key={u.slug} value={u.slug} className="bg-[#111118]">{u.label}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Area / Location *</label>
              <input
                type="text"
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                required
                placeholder="e.g. University of Ghana, Legon"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">URL Slug *</label>
              <input
                type="text"
                value={form.hostel_slug}
                onChange={e => setForm(f => ({ ...f, hostel_slug: e.target.value }))}
                required
                placeholder="e.g. pentagon-hostel"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/50 font-mono transition-all"
              />
              <p className="text-white/30 text-xs mt-1">
                URL: /directory/{form.university_slug}/{form.hostel_slug || 'slug'}
              </p>
            </div>

            {/* Cover Image */}
            <HostelImagePicker
              value={form.cover_image_url}
              onChange={url => setForm(f => ({ ...f, cover_image_url: url }))}
            />

            {/* Description */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Brief description of the hostel…"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/50 resize-none transition-all"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_AMENITIES.map(a => {
                  const active = form.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${active
                        ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                        : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-white/20'
                        }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-end gap-3 shrink-0 bg-[#0d0d13]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-white/50 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Hostel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
