"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, MapPin, Check, Loader2, X, Plus, Camera, ChevronRight, ChevronLeft } from "lucide-react";
import { uploadRoomImage } from "@/utils/supabase/storage";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export function RoomUploadFlow() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 2: Hostel Selection
  const [hostels, setHostels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  const [selectedHostelName, setSelectedHostelName] = useState("");
  const [isAddingNewHostel, setIsAddingNewHostel] = useState(false);
  const [newHostelName, setNewHostelName] = useState("");
  const [newHostelArea, setNewHostelArea] = useState("");
  const [vibeScore, setVibeScore] = useState(5.0);

  // Step 3: Tagging
  const [tags, setTags] = useState<{ x: number; y: number; label: string }[]>([]);
  const [pendingTagPos, setPendingTagPos] = useState<{ x: number; y: number } | null>(null);
  const [tagLabelInput, setTagLabelInput] = useState("");

  // Step 4: Publishing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHostels() {
      const { data } = await supabase.from('hostels').select('id, name, area').order('name');
      if (data) setHostels(data);
    }
    fetchHostels();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tags.length >= 5) {
      setError("Maximum of 5 tags allowed.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingTagPos({ x, y });
    setError(null);
  };

  const saveTag = () => {
    if (pendingTagPos && tagLabelInput.trim()) {
      setTags([...tags, { ...pendingTagPos, label: tagLabelInput.trim() }]);
      setPendingTagPos(null);
      setTagLabelInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !file) {
      setError("Please upload a photo first.");
      return;
    }
    if (step === 2) {
      if (!selectedHostelId && !isAddingNewHostel) {
        setError("Please select a hostel.");
        return;
      }
      if (isAddingNewHostel && (!newHostelName.trim() || !newHostelArea.trim())) {
        setError("Please provide the hostel name and area.");
        return;
      }
    }
    setError(null);
    setStep(s => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  };

  const handleBack = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload Image
      const { url, error: uploadError } = await uploadRoomImage(file);
      if (uploadError || !url) throw new Error(uploadError || "Upload failed");

      // 2. Handle Hostel (Optimistic Flow)
      let finalHostelId = selectedHostelId;
      let status = 'published';

      if (isAddingNewHostel) {
        const { error: requestError } = await supabase.from('hostel_requests').insert({
          user_id: user.id,
          requested_name: newHostelName.trim(),
          requested_area: newHostelArea.trim(),
        });
        if (requestError) throw requestError;
        finalHostelId = null;
        status = 'pending_mapping';
      }

      // 3. Insert Room
      const { data: room, error: roomError } = await supabase.from('rooms').insert({
        user_id: user.id,
        hostel_id: finalHostelId,
        image_url: url,
        vibe_score: vibeScore,
        status: status,
      }).select('id').single();

      if (roomError || !room) throw roomError;

      // 4. Insert Tags
      if (tags.length > 0) {
        const tagInserts = tags.map(t => ({
          room_id: room.id,
          user_id: user.id,
          x_pos: t.x,
          y_pos: t.y,
          label: t.label,
        }));
        const { error: tagError } = await supabase.from('room_tags').insert(tagInserts);
        if (tagError) throw tagError;
      }

      // Success!
      setIsPublished(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA28', '#FFECB3']
      });

      setTimeout(() => {
        router.push('/feed');
        router.refresh();
      }, 2500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const filteredHostels = hostels.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Slider color based on vibe score
  const getSliderGlow = (score: number) => {
    if (score <= 3) return 'rgba(120, 120, 140, 0.4)';
    if (score <= 5) return 'rgba(180, 160, 100, 0.4)';
    if (score <= 7) return 'rgba(255, 200, 40, 0.5)';
    return 'rgba(255, 220, 60, 0.7)';
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">

        {/* ===================== STEP 1: THE CANVAS ===================== */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex-1 flex flex-col items-center justify-center px-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-2xl aspect-[3/4] border-2 border-dashed border-border rounded-[3rem] hover:border-foreground hover:bg-foreground/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group"
              >
                <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-12 h-12 text-foreground/40" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-serif font-bold mb-2">Drop your photo</p>
                  <p className="text-foreground/40 font-medium px-10">JPEG, PNG, WEBP — Max 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-3xl flex flex-col items-center">
                {/* Ambient glow behind image */}
                <div
                  className="absolute inset-0 rounded-[3rem] blur-3xl opacity-30 scale-105 -z-10"
                  style={{
                    backgroundImage: `url(${previewUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <img
                  src={previewUrl}
                  alt="Your room"
                  className="w-full max-h-[75vh] object-contain rounded-[2rem] shadow-2xl"
                />
                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 p-3 rounded-full glass border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {error && <p className="text-red-500 mt-6 text-sm font-bold">{error}</p>}

            {previewUrl && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="mt-8 px-10 py-5 rounded-full bg-foreground text-background font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
              >
                Next
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ===================== STEP 2: THE ANCHOR ===================== */}
        {step === 2 && previewUrl && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col items-center justify-center relative px-4"
          >
            {/* Background photo (dimmed) */}
            <div className="absolute inset-0 -z-10">
              <img src={previewUrl} alt="" className="w-full h-full object-cover opacity-30 blur-sm" />
              <div className="absolute inset-0 bg-background/70" />
            </div>

            {/* Glassmorphic Panel */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl glass-card rounded-[3rem] p-8 md:p-12 border border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-bold">Where is this?</h2>
                <button onClick={handleBack} className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Back</button>
              </div>

              {!isAddingNewHostel ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search hostels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium"
                  />

                  {selectedHostelId && (
                    <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-2xl border-2 border-foreground/20">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-bold">{selectedHostelName}</span>
                      <button onClick={() => { setSelectedHostelId(null); setSelectedHostelName(""); }} className="ml-auto text-foreground/40 hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  )}

                  {!selectedHostelId && (
                    <div className="max-h-48 overflow-y-auto rounded-2xl border border-border bg-background/50 divide-y divide-border">
                      {filteredHostels.map(hostel => (
                        <button
                          key={hostel.id}
                          onClick={() => { setSelectedHostelId(hostel.id); setSelectedHostelName(hostel.name); }}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-foreground/5 transition-colors text-left"
                        >
                          <MapPin className="w-5 h-5 text-foreground/40 shrink-0" />
                          <div>
                            <div className="font-bold">{hostel.name}</div>
                            <div className="text-xs text-foreground/60">{hostel.area}</div>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => setIsAddingNewHostel(true)}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-foreground/5 transition-colors text-left bg-foreground/5"
                      >
                        <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                          <Plus className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="font-bold">Can&apos;t find your hostel?</div>
                          <div className="text-xs text-foreground/60">Add it here to continue</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 pl-1">Hostel Name</label>
                    <input type="text" value={newHostelName} onChange={(e) => setNewHostelName(e.target.value)} placeholder="e.g. Bani Hostel, Block C" className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 pl-1">Area / University</label>
                    <input type="text" value={newHostelArea} onChange={(e) => setNewHostelArea(e.target.value)} placeholder="e.g. University of Ghana, Legon" className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium" />
                  </div>
                  <button onClick={() => setIsAddingNewHostel(false)} className="text-sm font-bold text-foreground/60 hover:text-foreground">← Back to search</button>
                </div>
              )}

              {/* Vibe Score Slider */}
              <div className="mt-10 pt-8 border-t border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold">Set Your Vibe</h3>
                  <div
                    className="text-3xl md:text-4xl font-bold font-serif tabular-nums px-6 py-3 rounded-2xl"
                    style={{ boxShadow: `0 0 40px ${getSliderGlow(vibeScore)}` }}
                  >
                    {vibeScore.toFixed(1)}
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={vibeScore}
                  onChange={(e) => setVibeScore(parseFloat(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer accent-foreground bg-foreground/10"
                  style={{
                    background: `linear-gradient(to right, var(--foreground) 0%, var(--foreground) ${((vibeScore - 1) / 9) * 100}%, rgba(128,128,128,0.2) ${((vibeScore - 1) / 9) * 100}%, rgba(128,128,128,0.2) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs font-bold text-foreground/30 mt-2 px-1">
                  <span>1.0</span>
                  <span>10.0</span>
                </div>
              </div>

              {error && <p className="text-red-500 mt-6 text-sm font-bold">{error}</p>}

              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="flex-1 py-4 rounded-full font-bold bg-background border border-border hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button onClick={handleNext} className="flex-1 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ===================== STEP 3: THE ATELIER ===================== */}
        {step === 3 && previewUrl && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col items-center px-4 py-8"
          >
            <div className="w-full max-w-4xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif font-bold">Tag the artisans.</h2>
                  <p className="text-foreground/60 mt-1">Tap items on the photo to tag them.</p>
                </div>
                <div className="glass px-5 py-3 rounded-full font-bold text-sm border border-border">
                  {tags.length}/5 Tags
                </div>
              </div>

              <div className="relative w-full rounded-[2rem] bg-foreground/5 border border-border shadow-2xl">
                <img
                  src={previewUrl}
                  alt="Your room"
                  className="w-full h-auto max-h-[65vh] object-contain cursor-crosshair"
                  onClick={handleImageClick}
                />

                {/* Existing tags */}
                {tags.map((tag, i) => (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${tag.x}%`, top: `${tag.y}%` }}>
                    <div className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_0_12px_rgba(255,255,255,0.5)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-auto">
                      {tag.label}
                      <button onClick={(e) => { e.stopPropagation(); removeTag(i); }} className="hover:text-red-400 p-0.5"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}

                {/* Pending tag input */}
                {pendingTagPos && (
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${Math.max(15, Math.min(85, pendingTagPos.x))}%`, top: `${pendingTagPos.y}%` }}>
                    <div className={`absolute ${pendingTagPos.y > 75 ? 'bottom-8' : 'top-7'} left-1/2 -translate-x-1/2 w-52 glass p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200`}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={tagLabelInput}
                          onChange={(e) => setTagLabelInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTag();
                            if (e.key === 'Escape') setPendingTagPos(null);
                          }}
                          placeholder="What's this?"
                          className="w-full bg-transparent z-[10000] text-white placeholder:text-white/50 outline-none text-sm px-2"
                        />
                        <button onClick={saveTag} className="p-1.5 rounded-lg bg-white text-black hover:bg-white/90">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/80 animate-pulse shadow-[0_0_15px_rgba(255,255,255,1)]" />
                  </div>
                )}
              </div>

              {/* Tags list */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <div key={i} className="glass px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-border">
                      {tag.label}
                      <button onClick={() => removeTag(i)} className="text-foreground/40 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 py-4 rounded-full font-bold bg-background border border-border hover:bg-foreground/5 transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button onClick={handleNext} className="flex-1 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                  {tags.length >= 1 ? 'Ready to Post' : 'Skip Tags'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== STEP 4: THE DROP ===================== */}
        {step === 4 && previewUrl && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col items-center justify-center px-4"
          >
            {!isPublished ? (
              <div className="flex flex-col items-center gap-8 max-w-lg text-center">
                {/* Mini preview */}
                <motion.div
                  className="relative w-64 rounded-[2rem] overflow-hidden shadow-2xl border border-border"
                  animate={isSubmitting ? { scale: [1, 0.95, 1], opacity: [1, 0.8, 1] } : {}}
                  transition={{ repeat: isSubmitting ? Infinity : 0, duration: 1.5 }}
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-sm">{selectedHostelName || newHostelName || "Your Room"}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 font-bold text-xs">⭐ {vibeScore.toFixed(1)}</span>
                      <span className="text-white/60 text-xs">• {tags.length} tags</span>
                    </div>
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Ready to drop?</h2>
                  <p className="text-foreground/60 text-lg">Your room will appear on the global feed for the community to rate and explore.</p>
                </div>

                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                <div className="flex gap-4 w-full">
                  <button onClick={handleBack} disabled={isSubmitting} className="flex-1 py-4 rounded-full font-bold bg-background border border-border hover:bg-foreground/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                    ) : (
                      <><Upload className="w-5 h-5" /> Post to Feed</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success State */
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <motion.div
                  className="w-48 rounded-[2rem] overflow-hidden shadow-2xl border border-border"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 0.85], y: [0, 30] }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <img src={previewUrl} alt="Published" className="w-full h-auto" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Dropped. 🔥</h2>
                  <p className="text-foreground/60 text-lg">Redirecting you to the feed...</p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
