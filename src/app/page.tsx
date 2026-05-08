import { HeroSection } from "@/components/home/HeroSection";
import { CuratedSpacesMarquee } from "@/components/home/CuratedSpacesMarquee";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch top 10 published rooms by vibe_score
  const { data: rawRooms } = await supabase
    .from('rooms')
    .select(`
      id,
      image_url,
      vibe_score,
      hostels ( name )
    `)
    .eq('status', 'published')
    .order('vibe_score', { ascending: false })
    .limit(10);

  const rooms = (rawRooms || []).map((room: any) => ({
    id: room.id,
    image: room.image_url,
    hostel: (Array.isArray(room.hostels) ? room.hostels[0]?.name : room.hostels?.name) || "Unknown Hostel",
    vibeScore: room.vibe_score || 0,
    tags: [] // Tags not needed for marquee
  }));

  // Duplicate the array purely for visual testing if there's less than 6 rooms so marquee flows nicely
  const displayRooms = rooms.length < 6 && rooms.length > 0 
    ? [...rooms, ...rooms, ...rooms, ...rooms].map((r, i) => ({ ...r, id: `${r.id}-${i}` }))
    : rooms;

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      {displayRooms.length > 0 && <CuratedSpacesMarquee rooms={displayRooms} />}
    </div>
  );
}
