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
  universitySlug?: string;
  hostelSlug?: string;
  vibeScore: number;
  isVerified?: boolean;
  creator?: {
    username: string;
    avatar_url: string | null;
  };
  tags?: TagData[];
  isCuratorPick?: boolean;
  imageStyle?: any;
}

interface RoomCardInternalProps extends RoomCardProps {
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

export function RoomCard({ id, image, hostel, vibeScore, isVerified, tags = [], isCuratorPick, imageStyle, onClick }: RoomCardInternalProps) {
  return (
    <motion.div
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-6 group cursor-pointer"
      whileHover={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
    >
      <div className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl">
        <motion.img
          layoutId={`room-image-${id}`}
          src={image}
          alt={hostel}
          className="w-full h-full object-cover min-h-[400px]"
          loading="lazy"
          style={imageStyle}
        />
      </div>

      {/* Curator's Pick Badge */}
      {isCuratorPick && (
        <div className="absolute top-3 right-3 md:top-6 md:right-6 z-20">
          <div className="glass px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-yellow-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)] bg-black/40 backdrop-blur-md">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] md:text-xs font-serif font-bold text-yellow-50 tracking-wide uppercase">top 1% Vibe</span>
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {isVerified && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
          <div className="glass px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xl">
            <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 text-blue-400 fill-blue-400/20" />
          </div>
        </div>
      )}

      {/* Product Tags */}
      {tags.map(tag => (
        <ProductTag key={tag.id} x={tag.x} y={tag.y} label={tag.label} />
      ))}

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex items-end justify-between pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div>
            <p className="font-bold text-white text-sm md:text-xl mb-0.5 md:mb-1 leading-tight">{hostel}</p>
            <p className="text-white/70 text-[10px] md:text-sm font-medium leading-none">Tap to rate</p>
          </div>
          <div className="glass px-2 py-1 md:px-3 md:py-1.5 rounded-2xl flex items-center gap-0.5 md:gap-1 border-white/10 bg-black/20 backdrop-blur-md">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-white text-xs md:text-base">{vibeScore > 0 ? vibeScore : '—'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
