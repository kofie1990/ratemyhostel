"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchModal } from "./GlobalSearchModal";

import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const profileLink = user ? "/profile" : "/login";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto glass rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold font-serif tracking-tight z-50 relative">
            RateMyHostel.
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
            <Link href="/directory" className="hover:text-foreground/70 transition-colors">Hostel Directory</Link>
            <Link href="/feed" className="hover:text-foreground/70 transition-colors">Rate My Room</Link>
            <Link href="/request" className="hover:text-foreground/70 transition-colors">Add Hostel</Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-4 z-50 relative">
            {/* <ThemeToggle /> */}
            <ThemeToggle />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-foreground/10 transition-colors hidden md:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href={profileLink} className="p-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors hidden md:block">
              <User className="w-5 h-5" />
            </Link>
            <button
              className="p-2 rounded-full md:hidden hover:bg-foreground/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            <Link
              href="/directory"
              className="text-3xl font-light hover:text-foreground/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hostel Directory
            </Link>
            <Link
              href="/feed"
              className="text-3xl font-light hover:text-foreground/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rate My Room
            </Link>
            <Link
              href="/request"
              className="text-3xl font-light hover:text-foreground/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Add Hostel
            </Link>
            <Link
              href={profileLink}
              className="text-3xl font-light hover:text-foreground/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user ? "Profile" : "Login"}
            </Link>
            <div className="flex gap-4 mt-8">
              <ThemeToggle />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setTimeout(() => setIsSearchOpen(true), 200);
                }}
                className="p-4 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
