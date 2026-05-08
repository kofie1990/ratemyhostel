"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProductTagProps {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
}

export function ProductTag({ x, y, label }: ProductTagProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative w-5 h-5 cursor-pointer flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-white/40" />
        <div className="w-1.5 h-1.5 bg-white rounded-full relative z-10" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap glass px-4 py-2 rounded-xl text-sm font-medium text-white shadow-2xl pointer-events-none border-white/20"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
