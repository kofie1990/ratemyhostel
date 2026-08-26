"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { RoomCard, RoomCardProps } from "../feed/RoomCard";

interface CuratedSpacesProps {
  rooms: RoomCardProps[];
}

export function CuratedSpaces({ rooms }: CuratedSpacesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollX } = useScroll({ container: containerRef });

  // We'll use a fixed card width for consistent math and feel across devices
  const CARD_WIDTH = 320;
  const GAP = 32;
  const ITEM_WIDTH = CARD_WIDTH + GAP;

  return (
    <section className="py-24 bg-background relative border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold">Curated Spaces.</h2>
        <p className="text-foreground/60 font-medium mt-3">The masterpiece setups of the week.</p>
      </div>

      <div 
        ref={containerRef}
        className="flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar w-full"
        style={{ 
          paddingLeft: `calc(50vw - ${CARD_WIDTH / 2}px)`,
          paddingRight: `calc(50vw - ${CARD_WIDTH / 2}px)`,
          gap: GAP 
        }}
      >
        {rooms.map((room, i) => (
          <CuratedCardWrapper 
            key={`${room.id}-${i}`} 
            room={room} 
            i={i} 
            scrollX={scrollX} 
            itemWidth={ITEM_WIDTH}
            cardWidth={CARD_WIDTH}
          />
        ))}
      </div>
    </section>
  );
}

interface WrapperProps {
  room: RoomCardProps;
  i: number;
  scrollX: any;
  itemWidth: number;
  cardWidth: number;
}

function CuratedCardWrapper({ room, i, scrollX, itemWidth, cardWidth }: WrapperProps) {
  // Calculate the target scroll position where this card is centered
  const targetScrollX = i * itemWidth;
  
  // Input range: [Card is to the right, Card is centered, Card is to the left]
  const input = [targetScrollX - itemWidth, targetScrollX, targetScrollX + itemWidth];
  
  // Spotlight scaling & opacity
  const scale = useTransform(scrollX, input, [0.95, 1.05, 0.95], { clamp: false });
  const opacity = useTransform(scrollX, input, [0.4, 1, 0.4], { clamp: false });
  
  // Parallax: image moves subtly in the opposite direction
  const parallaxX = useTransform(scrollX, input, [-40, 0, 40], { clamp: false });

  return (
    <motion.div 
      style={{ 
        width: cardWidth,
        scale, 
        opacity,
      }} 
      className="shrink-0 relative py-8 snap-center" // snap-center ensures the card snaps to center
    >
      <div className="pointer-events-none">
        <RoomCard 
          {...room} 
          isCuratorPick={true} 
          imageStyle={{ x: parallaxX, scale: 1.1 }} // Scale 1.1 to prevent edge clipping during parallax
        />
      </div>
    </motion.div>
  );
}
