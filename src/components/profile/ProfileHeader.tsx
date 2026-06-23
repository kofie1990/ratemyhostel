"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Settings, Heart, Star, BadgeCheck } from "lucide-react";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

interface ProfileHeaderProps {
  profile: any;
  totalVibeScore: number;
  isVerified: boolean;
}

export function ProfileHeader({ profile, totalVibeScore, isVerified }: ProfileHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-foreground/5 overflow-hidden border-2 border-border shadow-xl">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center font-bold text-2xl ${isVerified ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground'}`}>
              {isVerified ? <BadgeCheck className="w-8 h-8" /> : (profile?.display_name?.charAt(0) || "U")}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{profile?.username}</h1>
            {isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/20" />}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className={`font-medium ${isVerified ? 'text-blue-500' : 'text-foreground/60'}`}>
              {isVerified ? 'Verified Student Member' : 'Member'}
            </span>
            <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full text-sm">
              <Star className="w-4 h-4 fill-current" />
              {totalVibeScore.toFixed(1)} Vibe Score
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="p-3 rounded-full glass hover:bg-foreground/5 transition-colors">
          <Heart className="w-5 h-5 text-foreground/80" />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-full glass hover:bg-foreground/5 transition-colors"
        >
          <Settings className="w-5 h-5 text-foreground/80" />
        </button>
        <Link
          href="/submit-room"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Submit a Room</span>
        </Link>
      </div>

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentProfile={{
          id: profile.id,
          display_name: profile.display_name,
          username: profile.username,
          is_public: profile.is_public,
          avatar_url: profile.avatar_url,
        }}
      />
    </div>
  );
}
