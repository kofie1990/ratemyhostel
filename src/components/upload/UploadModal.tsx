"use client";

import { useState } from "react";
import { RoomUploadFlow } from "./RoomUploadFlow";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 shrink-0"
      >
        <Plus className="w-5 h-5" />
        Upload Room
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col"
          >
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-full glass border border-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <RoomUploadFlow />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
