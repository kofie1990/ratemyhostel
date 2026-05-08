"use client";

import { motion } from "framer-motion";
import { RoomCard, RoomCardProps } from "../feed/RoomCard";

interface CuratedSpacesMarqueeProps {
  rooms: RoomCardProps[];
}

export function CuratedSpacesMarquee({ rooms }: CuratedSpacesMarqueeProps) {
  return (
    <section className="py-24 overflow-hidden bg-background relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold">Curated Spaces.</h2>
        <p className="text-foreground/60 font-medium mt-2">The highest-rated rooms this week.</p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex gap-6 px-6"
        >
          {/* We duplicate the array to create a seamless loop */}
          {[...rooms, ...rooms].map((room, i) => (
            <div key={`${room.id}-${i}`} className="w-[300px] md:w-[400px] shrink-0">
              <RoomCard {...room} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
