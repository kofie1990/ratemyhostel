"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, Loader2, X, ChevronRight, ChevronLeft, CheckCircle2, Upload, Check, Camera } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { uploadRoomImage } from "@/utils/supabase/storage";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { revalidateDirectory, revalidateFeed } from "@/app/actions/revalidate";

interface ReviewWizardProps {
  hostelId: string;
  hostelName: string;
  isOpen: boolean;
  onClose: () => void;
}

function StarRatingRow({ label, rating, setRating }: { label: string; rating: number; setRating: (v: number) => void }) {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border/50 last:border-0">
      <label className="text-lg font-bold">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-125 active:scale-95"
          >
            <Star
              className={`w-10 h-10 ${star <= (hoverRating || rating)
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'fill-transparent text-border'
                } transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewWizard({ hostelId, hostelName, isOpen, onClose }: ReviewWizardProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Utility
  const [cleanliness, setCleanliness] = useState(0);
  const [management, setManagement] = useState(0);
  const [water, setWater] = useState(0);
  const [network, setNetwork] = useState(0);
  const [location, setLocation] = useState(0);

  // Step 2: Context
  const [capacity, setCapacity] = useState("");
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  // Step 3: Photo (optional)
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<{ x: number; y: number; label: string }[]>([]);
  const [pendingTagPos, setPendingTagPos] = useState<{ x: number; y: number } | null>(null);
  const [tagLabelInput, setTagLabelInput] = useState("");

  // Step 4: Voice
  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const removePhoto = () => {
    setFile(null);
    setPreviewUrl(null);
    setTags([]);
    setPendingTagPos(null);
    setTagLabelInput("");
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
    if (step === 1) {
      if (!cleanliness || !management || !water || !network || !location) {
        setError("Please rate all 5 utilities.");
        return;
      }
    }
    if (step === 2) {
      if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1 || Number(capacity) > 6) {
        setError("Please select a valid room capacity.");
        return;
      }
    }
    // Step 3 (photo) is always optional — no validation needed
    setError(null);
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failed. Please log in again.");

      const overallRating = Math.round((cleanliness + management + water + network + location) / 5);

      // 1. Insert the review
      const { error: insertError } = await supabase.from('reviews').insert({
        hostel_id: hostelId,
        user_id: user.id,
        rating: overallRating,
        rating_cleanliness: cleanliness,
        rating_management: management,
        rating_water: water,
        rating_network: network,
        rating_location: location,
        comment: comment.trim() || null,
        floor: floor.trim() || null,
        room_number: roomNumber.trim() || null,
        room_capacity: Number(capacity)
      });

      if (insertError) throw insertError;

      // 2. If a photo was uploaded, create a room entry too
      if (file) {
        const { url, error: uploadError } = await uploadRoomImage(file);
        if (uploadError || !url) throw new Error(uploadError || "Photo upload failed");

        const { data: room, error: roomError } = await supabase.from('rooms').insert({
          user_id: user.id,
          hostel_id: hostelId,
          image_url: url,
          status: 'published',
        }).select('id').single();

        if (roomError || !room) throw roomError;

        // 3. Insert tags for the room
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
      }

      // Success! Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA28', '#FFECB3']
      });

      // Bust the server cache
      revalidateDirectory();
      if (file) revalidateFeed(); // Room photo was uploaded too

      setTimeout(() => {
        onClose();
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
      setIsSubmitting(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const stepLabels = ['Utility', 'Context', 'Lifestyle', 'Voice'];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-background border border-border shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-border/50">
            <div>
              <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-1">Rate Your Experience</p>
              <h2 className="text-2xl font-serif font-bold">{hostelName}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-foreground/5 rounded-full hover:bg-foreground/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
            {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm">{error}</div>}

            {/* Step 1: The Utility */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-2">
                <h3 className="text-3xl font-serif font-bold mb-6">The Utility</h3>
                <StarRatingRow label="Cleanliness" rating={cleanliness} setRating={setCleanliness} />
                <StarRatingRow label="Management" rating={management} setRating={setManagement} />
                <StarRatingRow label="Water Reliability" rating={water} setRating={setWater} />
                <StarRatingRow label="Network & Connectivity" rating={network} setRating={setNetwork} />
                <StarRatingRow label="Location & Proximity" rating={location} setRating={setLocation} />
              </motion.div>
            )}

            {/* Step 2: The Context */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
                <h3 className="text-3xl font-serif font-bold">The Context</h3>

                <div>
                  <label className="block text-xl font-bold mb-4">How many in a room? *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setCapacity(num.toString())}
                        className={`py-4 rounded-2xl font-bold text-lg border-2 transition-all ${capacity === num.toString() ? 'border-foreground bg-foreground text-background scale-105' : 'border-border bg-foreground/5 hover:border-foreground/30'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-bold mb-3 pl-2">Floor <span className="text-foreground/40 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={floor}
                      onChange={e => setFloor(e.target.value)}
                      placeholder="e.g. 3rd Floor"
                      className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-3 pl-2">Room No. <span className="text-foreground/40 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                      placeholder="e.g. C34"
                      className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: The Lifestyle (Photo — Optional) */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <div>
                  <h3 className="text-3xl font-serif font-bold">The Lifestyle</h3>
                  <p className="text-foreground/60 text-lg mt-2">
                    Upload a photo of your room setup. <span className="text-foreground/40 italic">This step is optional.</span>
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                />

                {!previewUrl ? (
                  /* Upload Zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-[2rem] p-16 hover:border-foreground hover:bg-foreground/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-5 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10 text-foreground/60" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">Click to upload a room photo</div>
                      <div className="text-sm text-foreground/40">JPEG, PNG, WEBP (Max 5MB)</div>
                    </div>
                  </div>
                ) : (
                  /* Photo Preview + Tagging */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground/60">Click on the image to add tags (up to 5)</p>
                      <button
                        onClick={removePhoto}
                        className="px-4 py-2 rounded-full text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>

                    <div className="relative w-full rounded-[2rem] bg-foreground/5 border border-border">
                      <img
                        src={previewUrl}
                        alt="Room preview"
                        className="w-full h-auto max-h-[50vh] object-contain cursor-crosshair"
                        onClick={handleImageClick}
                      />

                      {/* Existing tags */}
                      {tags.map((tag, i) => (
                        <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${tag.x}%`, top: `${tag.y}%` }}>
                          <div className="w-4 h-4 rounded-full bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.5)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 pointer-events-auto">
                            {tag.label}
                            <button onClick={(e) => { e.stopPropagation(); removeTag(i); }} className="hover:text-red-400 p-0.5"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}

                      {/* Pending tag input */}
                      {pendingTagPos && (
                        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${Math.max(15, Math.min(85, pendingTagPos.x))}%`, top: `${pendingTagPos.y}%` }}>
                          <div className={`absolute ${pendingTagPos.y > 75 ? 'bottom-8' : 'top-6'} left-1/2 -translate-x-1/2 w-48 glass p-2 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200`}>
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
                                className="w-full bg-transparent z-1000 text-white placeholder:text-white/50 outline-none text-sm px-2"
                              />
                              <button onClick={saveTag} className="p-1.5 rounded-lg bg-white text-black hover:bg-white/90">
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full bg-white/80 animate-pulse shadow-[0_0_15px_rgba(255,255,255,1)]" />
                        </div>
                      )}
                    </div>

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
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: The Voice */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <h3 className="text-3xl font-serif font-bold">The Voice</h3>
                <p className="text-foreground/60 text-lg">
                  Share your honest experience living here. The good, the bad, and the ugly.
                </p>
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Write your review here..."
                    rows={6}
                    className="w-full bg-foreground/5 border-2 border-transparent rounded-3xl p-8 outline-none focus:border-foreground/20 transition-colors resize-none font-serif text-2xl leading-relaxed"
                  />
                  {comment && (
                    <div className="absolute -bottom-8 right-4 text-sm font-bold text-foreground/40">
                      Looking good.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-8 bg-foreground/5 border-t border-border/50 flex items-center justify-between">
            {/* Step indicator dots + labels */}
            <div className="flex items-center gap-3">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${i + 1 === step ? 'bg-foreground scale-125' : i + 1 < step ? 'bg-foreground/60' : 'bg-foreground/20'}`} />
                  {i + 1 === step && <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider hidden md:inline">{label}</span>}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-4 rounded-full font-bold bg-background border border-border hover:bg-foreground/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                >
                  {step === 3 && !file ? 'Skip' : 'Next'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Publish Review
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
