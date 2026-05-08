import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { createClient } from "@/utils/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();
  
  // Fetch published rooms with their hostel names and tags
  const { data: rawRooms } = await supabase
    .from('rooms')
    .select(`
      id,
      image_url,
      vibe_score,
      hostels ( name ),
      room_tags ( id, x_pos, y_pos, label ),
      profiles ( is_verified_student )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Map database shape to component props shape
  const rooms = (rawRooms || []).map((room: any) => ({
    id: room.id,
    image: room.image_url,
    hostel: (Array.isArray(room.hostels) ? room.hostels[0]?.name : room.hostels?.name) || "Unknown Hostel",
    vibeScore: room.vibe_score || 0,
    isVerified: room.profiles?.is_verified_student || false,
    tags: (room.room_tags || []).map((tag: any) => ({
      id: tag.id,
      x: tag.x_pos,
      y: tag.y_pos,
      label: tag.label
    }))
  }));

  // Duplicate the array purely for visual testing if there's less than 6 rooms
  const displayRooms = rooms.length < 6 && rooms.length > 0 
    ? [...rooms, ...rooms, ...rooms, ...rooms].map((r, i) => ({ ...r, id: `${r.id}-${i}` }))
    : rooms;

  // Get the currently logged-in user (if any)
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Rate My Room.</h1>
          <p className="text-lg text-foreground/60 font-medium max-w-xl">
            Explore real room setups from students across Ghana. Discover inspiration, tag artisan products, and see how others transform their spaces.
          </p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <button className="px-6 py-2 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors shrink-0">Trending</button>
          <button className="px-6 py-2 rounded-full glass font-medium hover:bg-white/10 transition-colors shrink-0">Top Rated</button>
          <button className="px-6 py-2 rounded-full glass font-medium hover:bg-white/10 transition-colors shrink-0">Newest</button>
        </div>
      </div>

      {displayRooms.length > 0 ? (
        <MasonryGrid rooms={displayRooms} userId={user?.id || null} />
      ) : (
        <div className="glass-card rounded-[2rem] p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">No rooms published yet.</h2>
          <p className="text-foreground/60">Be the first to share your vibe!</p>
        </div>
      )}
    </div>
  );
}
