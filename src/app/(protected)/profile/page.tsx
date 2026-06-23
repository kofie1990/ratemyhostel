import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Star, Heart } from "lucide-react";
import { RoomCard } from "@/components/feed/RoomCard";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { HostelCard } from "@/components/directory/HostelCard";

export default async function ProfilePage(props: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || 'uploads';

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user rooms
  const { data: myRooms } = await supabase
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

  const totalVibeScore = profile?.total_vibe_score || 0;
  const isVerified = profile?.is_verified_student === true;

  // Fetch Saved Tab Data
  let savedHostels: any[] = [];
  let savedRooms: any[] = [];

  if (activeTab === 'saved') {
    const { data: favourites } = await supabase
      .from('favourites')
      .select('item_id, item_type')
      .eq('user_id', user.id);

    if (favourites && favourites.length > 0) {
      const hostelIds = favourites.filter(f => f.item_type === 'hostel').map(f => f.item_id);
      const roomIds = favourites.filter(f => f.item_type === 'room').map(f => f.item_id);

      if (hostelIds.length > 0) {
        const { data: hostelsData } = await supabase
          .from('hostels')
          .select('*, reviews(id, rating)')
          .in('id', hostelIds);

        if (hostelsData) {
          savedHostels = hostelsData.map(h => {
            const hostelReviews = h.reviews || [];
            const avg = hostelReviews.length > 0
              ? hostelReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / hostelReviews.length
              : h.average_rating || 0;
            return {
              ...h,
              reviewCount: hostelReviews.length,
              averageRating: avg
            };
          });
        }
      }

      if (roomIds.length > 0) {
        const { data: rawRooms } = await supabase
          .from('rooms')
          .select(`
            id,
            image_url,
            vibe_score,
            hostels ( name ),
            room_tags ( id, x_pos, y_pos, label ),
            profiles ( is_verified_student, username, avatar_url, is_public )
          `)
          .in('id', roomIds)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        savedRooms = (rawRooms || []).map((room: any) => ({
          id: room.id,
          image: room.image_url,
          hostel: (Array.isArray(room.hostels) ? room.hostels[0]?.name : room.hostels?.name) || "Unknown Hostel",
          vibeScore: room.vibe_score || 0,
          isVerified: room.profiles?.is_verified_student || false,
          creator: room.profiles?.is_public && room.profiles?.username ? {
            username: room.profiles.username,
            avatar_url: room.profiles.avatar_url
          } : undefined,
          tags: (room.room_tags || []).map((tag: any) => ({
            id: tag.id,
            x: tag.x_pos,
            y: tag.y_pos,
            label: tag.label
          }))
        }));
      }
    }
  }

  return (
    <div className="flex flex-col gap-12 pt-8">
      <ProfileHeader
        profile={profile}
        totalVibeScore={totalVibeScore}
        isVerified={isVerified}
      />

      <div className="flex gap-8 border-b border-border font-sans">
        <Link
          href="?tab=uploads"
          className={`pb-4 transition-colors ${activeTab === 'uploads' ? 'font-bold border-b-2 border-foreground text-foreground' : 'font-medium text-foreground/60 hover:text-foreground'}`}
        >
          My Uploads
        </Link>
        <Link
          href="?tab=saved"
          className={`pb-4 transition-colors ${activeTab === 'saved' ? 'font-bold border-b-2 border-foreground text-foreground' : 'font-medium text-foreground/60 hover:text-foreground'}`}
        >
          Saved
        </Link>
      </div>

      {activeTab === 'uploads' && (
        <>
          {myRooms && myRooms.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 w-full">
              {myRooms.map((room) => (
                <div key={room.id} className="break-inside-avoid relative group">
                  <RoomCard
                    id={room.id}
                    image={room.image_url}
                    hostel={((room.hostels as any)?.name) || ((room.hostels as any)?.[0]?.name) || "Pending Hostel"}
                    vibeScore={room.vibe_score}
                    isVerified={isVerified}
                    tags={[]}
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
        </>
      )}

      {activeTab === 'saved' && (
        <div className="flex flex-col gap-16">
          {savedHostels.length === 0 && savedRooms.length === 0 && (
            <div className="glass-card rounded-[2rem] p-8 md:p-12 min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-foreground/40" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Nothing saved yet</h2>
              <p className="text-foreground/60 max-w-md mb-6">
                Save your favourite hostels to your Shortlist and stunning rooms to your Moodboard to easily find them later.
              </p>
              <Link
                href="/directory"
                className="px-6 py-3 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors"
              >
                Browse Directory
              </Link>
            </div>
          )}

          {/* Shortlist (Hostels) - Horizontal Scroll */}
          {savedHostels.length > 0 && (
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">Your Shortlist</h3>
              <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {savedHostels.map((hostel) => (
                  <div key={hostel.id} className="w-[85vw] md:w-[400px] shrink-0 snap-center">
                    <HostelCard
                      id={hostel.id}
                      name={hostel.name}
                      area={hostel.area}
                      universitySlug={hostel.university_slug}
                      hostelSlug={hostel.hostel_slug}
                      averageRating={hostel.averageRating}
                      reviewCount={hostel.reviewCount}
                      coverImage={hostel.cover_image_url}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moodboard (Rooms) - Masonry Grid */}
          {savedRooms.length > 0 && (
            <div>
              <h3 className="text-2xl font-serif font-bold mb-6">Your Moodboard</h3>
              <MasonryGrid rooms={savedRooms} userId={user.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
