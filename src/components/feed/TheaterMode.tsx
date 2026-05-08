"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Star, BadgeCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ProductTag } from "./ProductTag";
import { TagData } from "./RoomCard";

interface TheaterModeProps {
  room: {
    id: string | number;
    image: string;
    hostel: string;
    vibeScore: number;
    isVerified?: boolean;
    tags?: TagData[];
  };
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
}

export function TheaterMode({ room, isOpen, onClose, userId }: TheaterModeProps) {
  const supabase = createClient();
  
  const [sliderValue, setSliderValue] = useState(5.0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [displayScore, setDisplayScore] = useState(room.vibeScore || 0);
  const [showTags, setShowTags] = useState(false);
  const [existingVote, setExistingVote] = useState<number | null>(null);

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

  // Swipe down to close
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        />

        {/* Draggable Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          className="relative z-10 w-full max-w-3xl mx-4 flex flex-col items-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* The Image */}
          <div className="relative w-full rounded-[2rem] shadow-2xl">
            <motion.img
              layoutId={`room-image-${room.id}`}
              src={room.image}
              alt={room.hostel}
              className="w-full h-auto max-h-[70vh] object-contain rounded-[2rem]"
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

            {/* Hostel name overlay */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-bold text-white text-xl mb-1">{room.hostel}</p>
                  <div className="flex items-center gap-2">
                    {room.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />}
                    <p className={`text-sm font-medium ${room.isVerified ? 'text-blue-400' : 'text-white/60'}`}>
                      {room.isVerified ? 'Verified Resident' : 'Room Resident'}
                    </p>
                  </div>
                </div>

                {/* Score display */}
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 0 30px ${getGlowColor(displayScore)}`,
                  }}
                  animate={hasVoted ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <motion.span
                    className="font-bold text-white text-lg tabular-nums"
                    key={displayScore}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {displayScore > 0 ? displayScore.toFixed(1) : '—'}
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Voting Slider — shown only if user hasn't voted and is logged in */}
          <AnimatePresence>
            {!hasVoted && userId && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-lg mt-8 glass rounded-[2rem] p-8 border border-white/10"
                style={{ boxShadow: `0 0 60px ${getGlowColor(sliderValue)}` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-white/60 font-bold text-sm uppercase tracking-widest">Rate this vibe</p>
                  <motion.span
                    className="text-4xl font-bold font-serif text-white tabular-nums"
                    key={sliderValue.toFixed(1)}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    style={{ color: getGlowColorSolid(sliderValue) }}
                  >
                    {sliderValue.toFixed(1)}
                  </motion.span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={sliderValue}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${getGlowColorSolid(sliderValue)} 0%, ${getGlowColorSolid(sliderValue)} ${((sliderValue - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((sliderValue - 1) / 9) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs font-bold text-white/20 mt-2 px-1">
                  <span>1.0</span>
                  <span>10.0</span>
                </div>

                <button
                  onClick={handleVoteSubmit}
                  disabled={isSubmittingVote}
                  className="w-full mt-6 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: getGlowColorSolid(sliderValue),
                    color: sliderValue > 5 ? '#000' : '#fff',
                  }}
                >
                  {isSubmittingVote ? 'Casting...' : 'Cast Your Vote'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Already voted state */}
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-white/40 font-bold text-sm uppercase tracking-widest">
                {existingVote ? `You rated this ${existingVote.toFixed(1)}` : 'Vote cast!'} • Swipe down to close
              </p>
            </motion.div>
          )}

          {/* Not logged in */}
          {!userId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <p className="text-white/40 font-bold text-sm">Log in to rate rooms and unlock tags</p>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
