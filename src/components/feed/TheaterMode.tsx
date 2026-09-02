"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Star, BadgeCheck, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ProductTag } from "./ProductTag";
import Link from "next/link";
import { TagData } from "./RoomCard";
import { BookmarkButton } from "../ui/BookmarkButton";
import { useRouter } from "next/navigation";
import { revalidateFeed } from "@/app/actions/revalidate";

interface TheaterModeProps {
  room: {
    id: string | number;
    image: string;
    hostel: string;
    universitySlug?: string;
    hostelSlug?: string;
    vibeScore: number;
    isVerified?: boolean;
    creator?: {
      username: string;
      avatar_url: string | null;
    };
    tags?: TagData[];
  };
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  expandSide?: 'left' | 'right';
}

export function TheaterMode({ room, isOpen, onClose, userId, expandSide = 'left' }: TheaterModeProps) {
  const supabase = createClient();
  const router = useRouter();

  const [sliderValue, setSliderValue] = useState(5.0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [displayScore, setDisplayScore] = useState(room.vibeScore || 0);
  const [showTags, setShowTags] = useState(false);
  const [existingVote, setExistingVote] = useState<number | null>(null);
  const [initialIsSaved, setInitialIsSaved] = useState<boolean | null>(null);

  // Check if user already voted on this room
  useEffect(() => {
    if (!isOpen || !userId) return;
    async function checkVote() {
      const { data } = await supabase
        .from('room_votes')
        .select('score')
        .eq('room_id', room.id)
        .eq('user_id', userId!)
        .single();
      if (data) {
        setExistingVote(data.score);
        setHasVoted(true);
        setShowTags(true);
      }

      const { data: savedData } = await supabase
        .from('favourites')
        .select('id')
        .eq('user_id', userId!)
        .eq('item_type', 'room')
        .eq('item_id', room.id)
        .single();

      setInitialIsSaved(!!savedData);
    }
    checkVote();
  }, [isOpen, userId, room.id]);

  // Haptic feedback on slider change (mobile)
  const handleSliderChange = (value: number) => {
    const prevTens = Math.floor(sliderValue * 10);
    const nextTens = Math.floor(value * 10);
    if (prevTens !== nextTens && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
    setSliderValue(value);
  };

  const handleVoteSubmit = async () => {
    if (!userId || isSubmittingVote) return;
    setIsSubmittingVote(true);

    try {
      // Upsert the vote
      const { error } = await supabase
        .from('room_votes')
        .upsert({
          room_id: room.id,
          user_id: userId,
          score: sliderValue,
        }, { onConflict: 'room_id,user_id' });

      if (error) throw error;

      // Optimistic UI: calculate new average
      // We don't know all other votes, but we can show their submitted score
      setDisplayScore(sliderValue);
      setHasVoted(true);

      // Reveal tags after a brief delay
      setTimeout(() => setShowTags(true), 400);

      // Bust the server cache and refresh
      revalidateFeed();
      router.refresh();

    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // Slider glow color based on score
  const getGlowColor = (score: number) => {
    if (score <= 3) return 'rgba(100, 100, 120, 0.5)';
    if (score <= 5) return 'rgba(160, 140, 80, 0.5)';
    if (score <= 7) return 'rgba(230, 180, 40, 0.6)';
    return 'rgba(255, 215, 0, 0.8)';
  };

  const getGlowColorSolid = (score: number) => {
    if (score <= 3) return '#6b7280';
    if (score <= 5) return '#d4a520';
    if (score <= 7) return '#f59e0b';
    return '#fbbf24';
  };

  const formatUniversity = (slug?: string) => {
    if (!slug) return '';
    return slug.replace(/-/g, ' ').toUpperCase();
  };

  // We remove handleDragEnd because vertical dragging conflicts with vertical scrolling
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Scrollable Container */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative z-10 w-full max-w-2xl md:max-w-5xl my-auto md:my-auto flex flex-col bg-background md:rounded-[2rem] overflow-hidden shadow-2xl md:h-[85vh] ${
            expandSide === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
          }`}
        >
          {/* Floating Actions on Image (Mobile Only) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-20 backdrop-blur-md md:hidden"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {initialIsSaved !== null && (
            <div className="absolute top-4 left-4 z-20 md:hidden">
              <div className="bg-black/50 rounded-full backdrop-blur-md p-1">
                <BookmarkButton
                  itemId={String(room.id)}
                  itemType="room"
                  userId={userId}
                  initialIsSaved={initialIsSaved}
                />
              </div>
            </div>
          )}

          {/* The Image (Full Resolution) */}
          <div className="relative w-full md:w-1/2 bg-foreground/5 min-h-[50vh] md:min-h-0 md:h-full rounded-t-3xl md:rounded-none shrink-0 flex items-center justify-center overflow-hidden">
            <motion.img
              layoutId={`room-image-${room.id}`}
              src={room.image}
              alt={room.hostel}
              className="w-full h-auto md:h-full object-cover rounded-t-3xl md:rounded-none md:absolute md:inset-0"
            />

            {/* Tags — only visible after voting */}
            <AnimatePresence>
              {showTags && room.tags && room.tags.map(tag => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: Math.random() * 0.3 }}
                >
                  <ProductTag x={tag.x} y={tag.y} label={tag.label} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Content Below Image (Pinterest Style) */}
          <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 bg-background md:w-1/2 md:overflow-y-auto md:h-full">

            {/* Desktop Actions */}
            <div className="hidden md:flex justify-between items-center w-full">
              {initialIsSaved !== null ? (
                <div className="bg-foreground/5 hover:bg-foreground/10 transition-colors rounded-full p-1 border border-border">
                  <BookmarkButton
                    itemId={String(room.id)}
                    itemType="room"
                    userId={userId}
                    initialIsSaved={initialIsSaved}
                  />
                </div>
              ) : <div />}
              
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors border border-border"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Header: Hostel & Creator */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
                    {room.universitySlug && room.hostelSlug ? (
                      <Link
                        href={`/directory/${room.universitySlug}/${room.hostelSlug}`}
                        onClick={onClose}
                        className="hover:underline decoration-border underline-offset-4"
                      >
                        {room.hostel}
                      </Link>
                    ) : (
                      room.hostel
                    )}
                  </h2>
                  {room.universitySlug && (
                    <p className="text-sm font-bold text-foreground/60 uppercase tracking-wider">
                      {formatUniversity(room.universitySlug)}
                    </p>
                  )}
                </div>

                {room.creator && (
                  <Link
                    href={`/profile/${room.creator.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 group w-fit"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-foreground/10 border border-border">
                      {room.creator.avatar_url ? (
                        <img src={room.creator.avatar_url} alt={room.creator.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-lg text-foreground/60">
                          {room.creator.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-foreground group-hover:text-blue-500 transition-colors">
                        @{room.creator.username}
                      </span>
                      <div className="flex items-center gap-1">
                        {room.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />}
                        <span className={`text-xs font-medium ${room.isVerified ? 'text-blue-500' : 'text-foreground/60'}`}>
                          {room.isVerified ? 'Verified Student' : 'Room Resident'}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Vibe Score Display */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Vibe Score</span>
                <motion.div
                  className="glass px-4 py-2 rounded-2xl flex items-center gap-2 border border-border bg-foreground/5 shadow-inner"
                  animate={hasVoted ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Star className="w-5 h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-500" />
                  <span className="text-2xl md:text-3xl font-bold font-serif text-foreground tabular-nums">
                    {displayScore > 0 ? displayScore.toFixed(1) : '—'}
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* Voting Section */}
            <AnimatePresence mode="wait">
              {!hasVoted && userId && (
                <motion.div
                  key="voting-slider"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full bg-foreground/5 rounded-[2rem] p-6 md:p-8 border border-border"
                >
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-foreground/60 font-bold text-sm uppercase tracking-widest">Rate this vibe</p>
                    <motion.span
                      className="text-4xl md:text-5xl font-bold font-serif tabular-nums"
                      key={sliderValue.toFixed(1)}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      style={{ color: getGlowColorSolid(sliderValue) }}
                    >
                      {sliderValue.toFixed(1)}
                    </motion.span>
                  </div>

                  <div className="relative pt-4 pb-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={sliderValue}
                      onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer bg-foreground/10 relative z-10"
                      style={{
                        background: `linear-gradient(to right, ${getGlowColorSolid(sliderValue)} 0%, ${getGlowColorSolid(sliderValue)} ${((sliderValue - 1) / 9) * 100}%, transparent ${((sliderValue - 1) / 9) * 100}%, transparent 100%)`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-bold text-foreground/40 mt-1 px-1">
                    <span>1.0</span>
                    <span>10.0</span>
                  </div>

                  <button
                    onClick={handleVoteSubmit}
                    disabled={isSubmittingVote}
                    className="w-full mt-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    style={{
                      backgroundColor: getGlowColorSolid(sliderValue),
                      color: sliderValue > 5 ? '#000' : '#fff',
                    }}
                  >
                    {isSubmittingVote ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </motion.div>
              )}

              {/* Already voted state */}
              {hasVoted && (
                <motion.div
                  key="voted-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-6 bg-green-500/10 rounded-[2rem] border border-green-500/20 flex flex-col items-center gap-2"
                >
                  <BadgeCheck className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-foreground font-bold text-lg">
                    {existingVote ? `You rated this ${existingVote.toFixed(1)}` : 'Vote cast successfully!'}
                  </p>
                  <p className="text-foreground/60 text-sm">Tags are now unlocked on the image.</p>
                </motion.div>
              )}

              {/* Not logged in */}
              {!userId && (
                <motion.div
                  key="not-logged-in"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 bg-foreground/5 rounded-[2rem] border border-border"
                >
                  <p className="text-foreground/60 font-bold text-base mb-4">Log in to rate rooms and unlock tags</p>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="inline-block bg-foreground text-background px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                  >
                    Go to Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
