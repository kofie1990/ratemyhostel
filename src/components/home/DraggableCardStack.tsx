"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const CARDS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800",
    vibeScore: 9.5,
    hostel: "Bani Hostel, Block C",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1522771731470-8ee116315ee4?auto=format&fit=crop&q=80&w=800",
    vibeScore: 8.8,
    hostel: "Evandy Hostel, Block A",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800",
    vibeScore: 9.2,
    hostel: "Pentagon, Block B",
  },
];

export function DraggableCardStack() {
  const [cards, setCards] = useState(CARDS);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.offset.y) > swipeThreshold) {
      setCards((prev) => {
        const newCards = [...prev];
        const removedCard = newCards.shift();
        if (removedCard) {
          newCards.push(removedCard); // Loop it back to the bottom
        }
        return newCards;
      });
    }
  };

  return (
    <div className="relative w-full max-w-md aspect-[4/5] mx-auto">
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const isTopCard = index === 0;
          return (
            <motion.div
              key={card.id}
              layout
              className="absolute inset-0 rounded-[2rem] overflow-hidden glass-card cursor-grab active:cursor-grabbing origin-bottom border border-foreground/10"
              style={{
                zIndex: cards.length - index,
              }}
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 24,
                rotateZ: index === 0 ? 0 : index % 2 === 0 ? index * 3 : -index * 3,
                opacity: 1 - index * 0.2,
              }}
              exit={{ x: 300, opacity: 0, scale: 0.9, rotateZ: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}
              drag={isTopCard}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={isTopCard ? handleDragEnd : undefined}
              whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            >
              <img
                src={card.image}
                alt="Room"
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end justify-between">
                  <div className="text-white">
                    <p className="font-bold text-2xl mb-1">{card.hostel}</p>
                    <p className="text-sm text-white/70 font-medium">Rate My Room</p>
                  </div>
                  <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-white text-lg">{card.vibeScore}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
