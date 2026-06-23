'use client';

import { useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { uploadHostelImage } from '@/utils/supabase/storage';

interface Props {
  value: string; // the current cover_image_url
  onChange: (url: string) => void;
}

export default function HostelImagePicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    setUploadError('');
    setUploading(true);
    const { url, error } = await uploadHostelImage(file);
    setUploading(false);
    if (error || !url) {
      setUploadError(error || 'Upload failed.');
    } else {
      onChange(url);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-3">
      <label className="block text-white/60 text-xs font-medium">Cover Image</label>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'upload' ? 'bg-white/[0.10] text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'url' ? 'bg-white/[0.10] text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <LinkIcon className="w-3 h-3" />
          Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          {value ? (
            /* Preview with remove */
            <div className="relative group rounded-xl overflow-hidden h-36">
              <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = ''; }}
                  className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragging
                  ? 'border-violet-400/60 bg-violet-500/10'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/40 text-xs">Uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white/30" />
                  </div>
                  <p className="text-white/50 text-xs font-medium">
                    Drop image here or <span className="text-violet-400 underline">browse</span>
                  </p>
                  <p className="text-white/25 text-[11px]">PNG, JPG, WEBP — max 5 MB</p>
                </div>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          {uploadError && (
            <p className="text-red-400 text-xs mt-1.5">{uploadError}</p>
          )}
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/…"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 transition-all"
          />
          {value && (
            <div className="relative group rounded-xl overflow-hidden h-28">
              <img
                src={value}
                alt="URL preview"
                className="w-full h-full object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-lg p-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
