"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface BookmarkButtonProps {
  itemId: string;
  itemType: "hostel" | "room";
  userId?: string | null;
  initialIsSaved?: boolean;
  className?: string;
}

export function BookmarkButton({ itemId, itemType, userId, initialIsSaved = false, className = "" }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("Please log in to save this to your collection.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const newSavedState = !isSaved;
    
    // Optimistic UI update
    setIsSaved(newSavedState);

    try {
      if (newSavedState) {
        const { error } = await supabase
          .from("favourites")
          .insert({ user_id: userId, item_type: itemType, item_id: itemId });

        if (error) throw error;
        
        toast.success(itemType === "hostel" ? "🔖 Added to your Shortlist" : "🔖 Saved to Moodboard");
      } else {
        const { error } = await supabase
          .from("favourites")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType)
          .eq("item_id", itemId);

        if (error) throw error;
        
        toast.success("Removed from saved items");
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      // Revert optimistic update
      setIsSaved(!newSavedState);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`p-3 rounded-full flex items-center justify-center transition-colors shadow-lg z-20 ${
        isSaved 
          ? "bg-foreground text-background" 
          : "glass border border-white/20 hover:bg-white/10"
      } ${className}`}
      whileTap={{ scale: 0.9 }}
      title={isSaved ? "Remove from saved" : "Save"}
    >
      <motion.div
        animate={isSaved ? { scale: [1, 1.3] } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <Bookmark 
          className={`w-5 h-5 md:w-6 md:h-6 transition-all ${
            isSaved ? "fill-background text-background" : "text-white"
          }`} 
        />
      </motion.div>
    </motion.button>
  );
}
