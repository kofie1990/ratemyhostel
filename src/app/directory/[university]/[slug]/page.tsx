import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { MapPin, Star, Share } from "lucide-react";
import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { ReviewSection } from "@/components/directory/ReviewSection";
import { HostelRadarChart } from "@/components/directory/HostelRadarChart";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { getCachedHostelDetail } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ university: string, slug: string }> }) {
  const resolvedParams = await params;
  const result = await getCachedHostelDetail(resolvedParams.university, resolvedParams.slug);
  return { title: result ? `${result.hostel.name} | RateMyHostel` : 'Hostel Not Found' };
}

export default async function HostelProfilePage({ params }: { params: Promise<{ university: string, slug: string }> }) {
  const resolvedParams = await params;
  const { university, slug } = resolvedParams;

  // Cached query — 120s revalidation, tagged 'directory'
  const result = await getCachedHostelDetail(university, slug);

  if (!result) {
    notFound();
  }

  const { hostel, reviews: safeReviews, rooms } = result;
  const id = hostel.id;
  const reviewCount = safeReviews.length;

  const getAvg = (key: string) => reviewCount > 0 ? safeReviews.reduce((acc: number, curr: any) => acc + (curr[key] || 0), 0) / reviewCount : 0;

  const averageRating = getAvg('rating');
  const radarData = [
    { category: 'Cleanliness', score: getAvg('rating_cleanliness'), fullMark: 5 },
    { category: 'Management', score: getAvg('rating_management'), fullMark: 5 },
    { category: 'Water', score: getAvg('rating_water'), fullMark: 5 },
    { category: 'Network', score: getAvg('rating_network'), fullMark: 5 },
    { category: 'Location', score: getAvg('rating_location'), fullMark: 5 },
  ];

  const amenities = hostel.amenities || [];
  const totalVibeScore = rooms.reduce((acc: number, room: any) => acc + room.vibeScore, 0);

  // Auth/saved state — NOT cached (per-request)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const hasReviewed = user ? safeReviews.some((r: any) => r.user_id === user.id) : false;

  let initialIsSaved = false;
  if (user) {
    const { data: savedHostel } = await supabase
      .from('favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', 'hostel')
      .eq('item_id', id)
      .single();
    if (savedHostel) initialIsSaved = true;
  }

  return (
    <div className="min-h-screen bg-background pb-32">

      {/* 1. The Hero Strip */}
      <div className="w-full h-[60vh] md:h-[70vh] relative">
        {hostel.cover_image_url ? (
          <img src={hostel.cover_image_url} alt={hostel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-foreground/5 flex items-center justify-center font-serif text-6xl md:text-8xl font-bold text-foreground/10">
            {hostel.name.charAt(0)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Top Right Actions */}
        <div className="absolute top-24 md:top-32 right-4 md:right-12 z-20 flex items-center gap-3">
          <button className="p-3 rounded-full glass border border-white/20 hover:bg-white/10 transition-colors shadow-lg z-20">
            <Share className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <BookmarkButton 
            itemId={id} 
            itemType="hostel" 
            userId={user?.id} 
            initialIsSaved={initialIsSaved} 
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full px-4 md:px-6 pb-12 pt-32">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-serif font-bold text-foreground mb-4 leading-tight">{hostel.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-border backdrop-blur-md">
                  <MapPin className="w-4 h-4" />
                  {hostel.area}
                </div>
                {totalVibeScore > 0 && (
                  <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-yellow-500 border border-yellow-500/20 bg-yellow-500/10 backdrop-blur-md">
                    <Star className="w-4 h-4 fill-current" />
                    {totalVibeScore} Vibe Score
                  </div>
                )}
              </div>
            </div>

            <div className="glass px-8 py-6 rounded-[2rem] flex items-center gap-6 shadow-2xl border border-border backdrop-blur-xl">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-foreground/60 uppercase tracking-widest mb-1">Global Rating</span>
                <span className="text-4xl md:text-5xl font-bold font-serif">{averageRating > 0 ? averageRating.toFixed(1) : '-'} <span className="text-foreground/40 text-xl md:text-2xl">/ 5</span></span>
              </div>
              <div className="w-px h-16 bg-border mx-2" />
              <div className="flex flex-col items-center">
                <Star className="w-10 h-10 fill-yellow-500 text-yellow-500 mb-2" />
                <span className="text-sm font-bold text-foreground/60">{reviewCount} Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-24 mt-16">

        {/* 2. The Utility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">Amenities & Features</h2>
            <div className="flex flex-wrap gap-3">
              {amenities.length > 0 ? amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="glass px-6 py-4 rounded-2xl border border-border text-lg font-medium shadow-sm hover:shadow-md transition-shadow">
                  {amenity}
                </div>
              )) : (
                <div className="text-foreground/60 italic">No amenities listed yet.</div>
              )}
            </div>
            <p className="text-foreground/60 mt-8 max-w-md leading-relaxed text-lg">
              Explore the core offerings of {hostel.name}, verified by students living on campus.
            </p>
          </div>

          <div className="glass-card rounded-[3rem] p-8 md:p-12 border border-border">
            <h3 className="text-center font-bold text-foreground/60 uppercase tracking-widest text-sm mb-8">Dimension Breakdown</h3>
            <HostelRadarChart data={radarData} />
          </div>
        </div>
        {/* 4. The Written Reviews */}
        <div className="pt-12 border-t border-border">
          <ReviewSection
            hostelId={id}
            hostelName={hostel.name}
            isLoggedIn={!!user}
            hasReviewed={hasReviewed}
            reviews={safeReviews}
          />
        </div>

        {/* 3. The Social Proof (Masonry Grid) */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Inside {hostel.name}</h2>
              <p className="text-foreground/60 text-lg">See actual student room setups and get inspired.</p>
            </div>
            <div className="glass px-6 py-2 rounded-full font-bold text-sm">
              {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} Uploaded
            </div>
          </div>

          {rooms.length > 0 ? (
            <MasonryGrid rooms={rooms} />
          ) : (
            <div className="glass-card rounded-[3rem] p-24 text-center border border-border border-dashed">
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">No rooms inside yet</h3>
              <p className="text-foreground/60 text-xl max-w-md mx-auto">Be the very first student to show off your room in {hostel.name}!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
