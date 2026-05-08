import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Settings, Heart, Star, BadgeCheck } from "lucide-react";
import { RoomCard } from "@/components/feed/RoomCard";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch optimistic user rooms (both published and pending_mapping)
  const { data: rooms } = await supabase
    .from('rooms')
    .select(`
      id,
      image_url,
      vibe_score,
      status,
      hostel_id,
      hostels ( name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Mock total vibe score for the profile header
  const totalVibeScore = rooms?.reduce((acc, room) => acc + (Number(room.vibe_score) || 0), 0) || 0;

  const isVerified = profile?.is_verified_student === true;

  return (
    <div className="flex flex-col gap-12 pt-8">
      {/* Profile Header */}
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
              <h1 className="text-4xl font-serif font-bold">{isVerified ? "Verified Student" : (profile?.display_name || "Resident")}</h1>
              {isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/20" />}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className={`font-medium ${isVerified ? 'text-blue-500' : 'text-foreground/60'}`}>
                {isVerified ? 'Verified Student Member' : 'Verified Member'}
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
          <button className="p-3 rounded-full glass hover:bg-foreground/5 transition-colors">
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
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-border">
        <button className="pb-4 font-bold border-b-2 border-foreground">My Rooms</button>
        <button className="pb-4 font-medium text-foreground/60 hover:text-foreground transition-colors">Reviews</button>
        <button className="pb-4 font-medium text-foreground/60 hover:text-foreground transition-colors">Saved</button>
      </div>

      {/* Content Grid */}
      {rooms && rooms.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 w-full">
          {rooms.map((room) => (
            <div key={room.id} className="break-inside-avoid relative group">
              <RoomCard
                id={room.id}
                image={room.image_url}
                hostel={((room.hostels as any)?.name) || ((room.hostels as any)?.[0]?.name) || "Pending Hostel"}
                vibeScore={room.vibe_score}
                isVerified={isVerified}
                tags={[]} // Tags would be fetched separately or in a joined query
              />
              {room.status === 'pending_mapping' && (
                <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-yellow-400 bg-yellow-400/10 border-yellow-400/20 z-10 shadow-lg backdrop-blur-md">
                  Pending Review
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[2rem] p-8 md:p-12 min-h-[300px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No rooms yet</h2>
          <p className="text-foreground/60 max-w-md mb-6">
            You haven't uploaded any rooms. Submit your setup to build your Vibe Score and inspire others!
          </p>
          <Link 
            href="/submit-room"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Submit a Room</span>
          </Link>
        </div>
      )}
    </div>
  );
}
