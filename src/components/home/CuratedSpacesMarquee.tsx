"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RoomCard, RoomCardProps } from "../feed/RoomCard";

interface CuratedSpacesProps {
  rooms: RoomCardProps[];
}

export function CuratedSpaces({ rooms }: CuratedSpacesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion value to track the container's X position
  const x = useMotionValue(0);

  // We'll use a fixed card width for consistent math and feel across devices
  const CARD_WIDTH = 320;
  const GAP = 32;
  const ITEM_WIDTH = CARD_WIDTH + GAP;

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // Center offset to make sure the active card sits in the middle of the screen
  const centerOffset = containerWidth > 0 ? (containerWidth / 2) - (CARD_WIDTH / 2) : 0;

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    // Heavy physical feel: combine offset and velocity to predict intent
    const swipePower = offset.x + velocity.x * 0.5;
    const threshold = 100;

    if (swipePower < -threshold && currentIndex < rooms.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (swipePower > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="py-24 overflow-hidden bg-background relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-serif font-bold">Curated Spaces.</h2>
        <p className="text-foreground/60 font-medium mt-3">The masterpiece setups of the week.</p>
      </div>

      <div className="relative w-full" ref={containerRef}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }} // We constrain it strictly to handle our own snapping
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={{ x: -(currentIndex * ITEM_WIDTH) + centerOffset }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1.2 }}
          style={{ x, gap: GAP }}
          className="flex items-center cursor-grab active:cursor-grabbing"
        >
          {rooms.map((room, i) => (
            <CuratedCardWrapper 
              key={`${room.id}-${i}`} 
              room={room} 
              i={i} 
              x={x} 
              itemWidth={ITEM_WIDTH}
              cardWidth={CARD_WIDTH}
              centerOffset={centerOffset}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface WrapperProps {
  room: RoomCardProps;
  i: number;
  x: any;
  itemWidth: number;
  cardWidth: number;
  centerOffset: number;
}

function CuratedCardWrapper({ room, i, x, itemWidth, cardWidth, centerOffset }: WrapperProps) {
  // Calculate the target X position where this card is centered
  const targetX = -(i * itemWidth) + centerOffset;
  
  // Input range: [Card is to the right, Card is centered, Card is to the left]
  const input = [targetX + itemWidth, targetX, targetX - itemWidth];
  
  // Spotlight scaling & opacity
  const scale = useTransform(x, input, [0.95, 1.05, 0.95], { clamp: false });
  const opacity = useTransform(x, input, [0.4, 1, 0.4], { clamp: false });
  
  // Parallax: image moves subtly in the opposite direction
  const parallaxX = useTransform(x, input, [-40, 0, 40], { clamp: false });

  return (
    <motion.div 
      style={{ 
        width: cardWidth,
        scale, 
        opacity,
      }} 
      className="shrink-0 relative py-8" // padding for scale expansion
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
