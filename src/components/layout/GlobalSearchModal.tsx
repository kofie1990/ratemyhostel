"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const { data } = await supabase
        .from("hostels")
        .select("id, name, area, university_slug, hostel_slug")
        .ilike("name", `%${query}%`)
        .limit(5);
      
      setResults(data || []);
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/directory?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K) handler could be added here or in Navbar

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[101] flex flex-col gap-4"
          >
            <form 
              onSubmit={handleSubmit}
              className="relative rounded-3xl glass border border-foreground/10 bg-foreground/5 dark:bg-black/40 overflow-hidden shadow-2xl flex items-center p-2"
            >
              <div className="pl-5 pr-3 text-foreground/50">
                <Search className="w-6 h-6" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hostels, e.g. Bani, Evandy..."
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 text-xl px-2 py-4 font-medium"
              />
              <div className="pr-4 flex items-center gap-2">
                {isLoading && <Loader2 className="w-5 h-5 text-foreground/40 animate-spin" />}
                <button 
                  type="button" 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Results */}
            {query.trim() && (
              <div className="glass rounded-[2rem] border border-foreground/10 bg-background/80 backdrop-blur-3xl overflow-hidden shadow-2xl">
                {results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-6 py-3 text-xs font-bold text-foreground/40 uppercase tracking-wider">
                      Hostels
                    </div>
                    {results.map((hostel) => (
                      <Link
                        key={hostel.id}
                        href={`/directory/${hostel.university_slug || 'unknown'}/${hostel.hostel_slug || hostel.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-6 py-4 hover:bg-foreground/5 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:bg-foreground group-hover:text-background transition-colors">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{hostel.name}</p>
                            <p className="text-sm text-foreground/60 font-medium">{hostel.area}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-foreground group-hover:-rotate-45 transition-all" />
                      </Link>
                    ))}
                    <button 
                      onClick={handleSubmit}
                      className="w-full text-left px-6 py-5 mt-2 border-t border-foreground/10 text-sm font-bold text-blue-500 hover:bg-blue-500/5 transition-colors"
                    >
                      See all results for "{query}" &rarr;
                    </button>
                    <div className="border-t border-foreground/10 px-6 py-4 flex justify-center bg-foreground/5">
                      <Link 
                        href="/request"
                        onClick={onClose}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-bold text-sm bg-background border border-foreground/10 text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        Can't find your hostel? Add it here
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center text-center">
                    {isLoading ? (
                      <p className="text-foreground/60 font-medium">Searching...</p>
                    ) : (
                      <>
                        <p className="text-foreground/80 font-bold text-lg mb-4">No results found.</p>
                        <Link 
                          href="/request"
                          onClick={onClose}
                          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                        >
                          Can't find your hostel? Add it here
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
