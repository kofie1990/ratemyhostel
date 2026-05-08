"use client";

import { motion } from "framer-motion";
import { Search, Droplets, ShieldCheck, Wifi } from "lucide-react";
import { DraggableCardStack } from "./DraggableCardStack";

export function HeroSection() {
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
            <span className="text-sm font-medium text-foreground/80">1,204 Students exploring right now</span>
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
            <div className="relative rounded-[2rem] glass p-2 flex items-center border border-foreground/10 bg-foreground/5 dark:bg-black/40">
              <div className="pl-5 pr-3 text-foreground/50">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                placeholder="Search Bani, Evandy..." 
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 text-lg px-2 py-4 font-medium"
              />
              <button className="bg-foreground text-background px-8 py-4 rounded-3xl font-bold hover:bg-white/90 transition-colors shadow-lg">
                Explore
              </button>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-5 mt-6"
          >
            <div className="flex -space-x-4">
              <img className="w-12 h-12 rounded-full border-2 border-background object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Avatar" />
              <img className="w-12 h-12 rounded-full border-2 border-background object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="Avatar" />
              <img className="w-12 h-12 rounded-full border-2 border-background object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Avatar" />
              <div className="w-12 h-12 rounded-full border-2 border-background bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold">
                +5k
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
          <DraggableCardStack />
        </motion.div>
      </div>
    </section>
  );
}
