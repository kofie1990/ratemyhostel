"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { ProductTag } from "./ProductTag";

export interface TagData {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface RoomCardProps {
  id: string | number;
  image: string;
  hostel: string;
  vibeScore: number;
  isVerified?: boolean;
  tags?: TagData[];
}

interface RoomCardInternalProps extends RoomCardProps {
  onClick?: () => void;
}

export function RoomCard({ id, image, hostel, vibeScore, isVerified, tags = [], onClick }: RoomCardInternalProps) {
  return (
    <motion.div 
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-6 group cursor-pointer"
      whileHover={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
    >
      <motion.img
        layoutId={`room-image-${id}`}
        src={image}
        alt={hostel}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {/* Verified Badge */}
      {isVerified && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
          <div className="glass px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xl">
            <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-400 fill-blue-400/20" />
            <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">Verified Student</span>
          </div>
        </div>
      )}

      {/* Product Tags */}
      {tags.map(tag => (
        <ProductTag key={tag.id} x={tag.x} y={tag.y} label={tag.label} />
      ))}

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none">
        <div className="flex items-end justify-between pointer-events-auto">
          <div>
            <p className="font-bold text-white text-sm md:text-xl mb-0.5 md:mb-1 leading-tight">{hostel}</p>
            <p className="text-white/70 text-[10px] md:text-sm font-medium leading-none">Tap to rate</p>
          </div>
          <div className="glass px-2 py-1 md:px-3 md:py-1.5 rounded-2xl flex items-center gap-0.5 md:gap-1 border-white/10">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-white text-xs md:text-base">{vibeScore > 0 ? vibeScore : '—'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
