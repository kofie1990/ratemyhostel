"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Droplets, ShieldCheck, Wifi, X, Loader2, MapPin, ArrowRight } from "lucide-react";
import { DraggableCardStack } from "./DraggableCardStack";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface HeroSectionProps {
  userCount?: number;
  avatars?: string[];
  stackRooms?: any[];
}

export function HeroSection({ userCount = 0, avatars = [], stackRooms = [] }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from("hostels")
        .select("id, name, area, university_slug, hostel_slug")
        .ilike("name", `%${searchQuery.trim()}%`)
        .limit(8);
      
      if (!error && data) {
        setSearchResults(data);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/directory');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Rating Badges */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="hidden lg:flex absolute top-1/4 left-1/4 z-0 glass px-4 py-2 rounded-2xl items-center gap-3 -rotate-6"
      >
        <div className="bg-blue-500/20 p-2 rounded-full">
          <Droplets className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-foreground/60 font-medium">Water</p>
          <p className="text-sm font-bold text-foreground">9.8/10</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        className="hidden lg:flex absolute bottom-1/4 left-[40%] z-0 glass px-4 py-2 rounded-2xl items-center gap-3 rotate-3"
      >
        <div className="bg-green-500/20 p-2 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-xs text-foreground/60 font-medium">Security</p>
          <p className="text-sm font-bold text-foreground">10/10</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
        className="hidden lg:flex absolute top-1/3 right-[45%] z-0 glass px-4 py-2 rounded-2xl items-center gap-3 rotate-[12deg]"
      >
        <div className="bg-purple-500/20 p-2 rounded-full">
          <Wifi className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="text-xs text-foreground/60 font-medium">Network</p>
          <p className="text-sm font-bold text-foreground">8.5/10</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 lg:gap-8 items-center z-10 relative">

        {/* Left Column: Typography & Search */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-8 max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 glass px-5 py-2.5 rounded-full w-fit mb-2 border border-foreground/10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-foreground/80">{userCount.toLocaleString()} Students exploring right now</span>
          </motion.div>

          <h1 className="text-[4.5rem] md:text-[6.5rem] lg:text-[7.5rem] font-serif leading-[0.95] tracking-tighter">
            Real ratings. <br/>
            <span className="text-foreground/40 italic">Better hostels.</span>
          </h1>

          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative mt-4 group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <form
              onSubmit={handleSearch}
              className="relative rounded-[2rem] glass p-2 flex items-center border border-foreground/10 bg-foreground/5 dark:bg-black/40"
            >
              <div className="pl-5 pr-3 text-foreground/50">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your hostel here..."
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 text-lg px-2 py-4 font-medium"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-8 py-4 rounded-3xl font-bold hover:bg-foreground/90 transition-colors shadow-lg"
              >
                Explore
              </button>

              {/* Mobile Click Overlay */}
              <div 
                className="absolute inset-0 z-10 md:hidden cursor-pointer"
                onClick={() => setIsMobileSearchOpen(true)}
              />
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-2 pl-4"
          >
            <p className="text-sm text-foreground/60 font-medium">
              Want to show off your room?{" "}
              <Link href="/feed" className="text-foreground font-bold hover:underline underline-offset-4 decoration-foreground/30 transition-all">
                Share it here <ArrowRight className="inline-block w-3.5 h-3.5 -mt-0.5 ml-0.5" />
              </Link>
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-5 mt-6"
          >
            <div className="flex -space-x-4">
              {avatars.map((avatar, idx) => (
                <img
                  key={idx}
                  className="w-12 h-12 rounded-full border-2 border-background object-cover bg-foreground/10"
                  src={avatar}
                  alt="Student Avatar"
                />
              ))}
              {/* Fill remaining slots with placeholders if fewer than 3 avatars exist */}
              {Array.from({ length: Math.max(0, 3 - avatars.length) }).map((_, idx) => (
                <div key={`placeholder-${idx}`} className="w-12 h-12 rounded-full border-2 border-background bg-foreground/10 flex items-center justify-center">
                  <span className="text-foreground/40 font-bold text-sm">U</span>
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-background bg-foreground/5 backdrop-blur-md flex items-center justify-center text-xs font-bold text-foreground/80">
                +{userCount > 3 ? (userCount - 3).toLocaleString() : 0}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-0.5 text-yellow-400 text-sm mb-0.5">
                ★★★★★
              </div>
              <span className="text-foreground/60 text-sm font-medium">Trusted by students</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative w-full flex items-center justify-center lg:justify-end py-12"
        >
          <DraggableCardStack rooms={stackRooms} />
        </motion.div>
      </div>

      {/* Full Screen Mobile Search Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl md:hidden flex flex-col"
          >
            <div className="p-4 border-b border-foreground/10 flex items-center gap-3 pt-6">
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setIsMobileSearchOpen(false); 
                  if (searchQuery.trim()) {
                    router.push(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
                  } else {
                    router.push('/directory');
                  }
                }} 
                className="flex-1 relative glass rounded-full flex items-center px-4 py-2 bg-foreground/5"
              >
                <Search className="w-5 h-5 text-foreground/50 mr-2" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hostels..."
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-foreground/40 text-lg"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="p-1 rounded-full hover:bg-foreground/10 text-foreground/50">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 text-foreground/60 font-medium text-sm"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-20">
              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {searchResults.map((hostel) => (
                    <Link 
                      key={hostel.id}
                      href={`/directory/${hostel.university_slug}/${hostel.hostel_slug}`}
                      className="flex items-center justify-between p-4 rounded-2xl glass bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      onClick={() => setIsMobileSearchOpen(false)}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{hostel.name}</h4>
                        <div className="flex items-center text-sm text-foreground/60 mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {hostel.area}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-foreground/40" />
                    </Link>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border flex justify-center">
                    <Link 
                      href="/request"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-sm bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
                    >
                      Can't find your hostel? Add it here
                    </Link>
                  </div>
                </div>
              ) : searchQuery.length > 1 ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <p className="text-foreground/50 mb-4">No hostels found for "{searchQuery}"</p>
                  <Link 
                    href="/request"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                  >
                    Can't find your hostel? Add it here
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10 text-foreground/50">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
