import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Star, BadgeCheck, MapPin } from "lucide-react";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { getCachedPublicProfile } from "@/lib/queries";

export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const username = params.username;

  // Cached query — 60s revalidation, tagged 'profiles'
  const result = await getCachedPublicProfile(username);

  if (!result) {
    notFound();
  }

  const { profile, rooms } = result;

  const totalVibeScore = profile.total_vibe_score || 0;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isVerified = profile.is_verified_student === true;

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 md:px-6 max-w-7xl mx-auto">

      {/* Hero Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="relative mb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-foreground/5 overflow-hidden border-4 border-background shadow-2xl">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center font-bold text-3xl md:text-4xl ${isVerified ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground'}`}>
                {isVerified ? <BadgeCheck className="w-12 h-12" /> : (profile.display_name?.charAt(0) || "U")}
              </div>
            )}
          </div>
          {isVerified && (
            <div className="absolute bottom-2 right-2 bg-background rounded-full p-1 shadow-lg z-10">
              <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/20" />
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2">
          {profile.username}
        </h1>
        <p className="text-xl text-foreground/60 font-medium mb-6">
          @{profile.username}
        </p>

        {/* The Flex: Stats */}
        <div className="flex items-center gap-6 glass px-8 py-4 rounded-3xl border border-foreground/10 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
              <Star className="w-6 h-6 fill-current" />
              <span className="text-3xl font-bold font-serif">
                {totalVibeScore >= 1000 ? `${(totalVibeScore / 1000).toFixed(1)}k` : totalVibeScore}
              </span>
            </div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Total Vibe</span>
          </div>

          <div className="w-px h-12 bg-foreground/10" />

          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold font-serif mb-1">{rooms.length}</span>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Pictures</span>
          </div>
        </div>
      </div>

      {/* Personal Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-8 pl-2">Portfolio</h2>
        {rooms.length > 0 ? (
          <MasonryGrid rooms={rooms} userId={user?.id || null} />
        ) : (
          <div className="glass-card rounded-[2rem] p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">No rooms published yet.</h2>
            <p className="text-foreground/60">This creator hasn't shared their space yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
