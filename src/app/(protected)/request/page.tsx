"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RequestHostelPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase.from('hostel_requests').insert({
        user_id: user.id,
        requested_name: name.trim(),
        requested_area: area.trim(),
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/directory");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 mx-auto" />
          <h1 className="text-4xl font-serif font-bold mb-4">Request Sent!</h1>
          <p className="text-foreground/60 text-lg mb-8">
            Thanks for letting us know. Our team will review and add this hostel shortly.
          </p>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Back to Directory
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-10">
      <div className="w-full">
        <Link href="/directory" className="inline-flex items-center text-sm font-bold text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Directory
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Request a Hostel</h1>
        <p className="text-foreground/60 text-lg mb-10">
          Can't find your hostel? Add it here and we'll map it to the directory.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 pl-1">Hostel Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Bani Hostel, Block C" 
              className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2 pl-1">Area / University</label>
            <input 
              type="text" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              placeholder="e.g. University of Ghana, Legon" 
              className="w-full bg-foreground/5 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-foreground/20 transition-colors text-lg font-medium" 
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 rounded-full font-bold bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
