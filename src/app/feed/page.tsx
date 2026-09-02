import { MasonryGrid } from "@/components/feed/MasonryGrid";
import { createClient } from "@/utils/supabase/server";
import { getCachedFeedRooms } from "@/lib/queries";
import Link from "next/link";

import { UploadModal } from "@/components/upload/UploadModal";

export default async function FeedPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const filter = (searchParams.filter as string) || "trending";

  // Cached query — 60s revalidation, tagged 'feed'
  const rooms = await getCachedFeedRooms(filter);

  const displayRooms = rooms.map((r, i) => ({ ...r, renderKey: `${r.id}-${i}` }));

  // User check is NOT cached (auth is per-request)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Rate A Room here.</h1>
          {/* <p className="text-lg text-foreground/60 font-medium max-w-xl">
            Explore real room setups from students across Ghana. Discover inspiration, tag artisan products, and see how others transform their spaces.
          </p> */}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full sm:w-auto">
            <Link href="/feed?filter=trending" className={`px-6 py-2 rounded-full font-medium transition-colors shrink-0 ${filter === 'trending' ? 'bg-foreground text-background hover:bg-foreground/90' : 'glass hover:bg-white/10'}`}>
              Trending
            </Link>
            <Link href="/feed?filter=top-rated" className={`px-6 py-2 rounded-full font-medium transition-colors shrink-0 ${filter === 'top-rated' ? 'bg-foreground text-background hover:bg-foreground/90' : 'glass hover:bg-white/10'}`}>
              Top Rated
            </Link>
            <Link href="/feed?filter=newest" className={`px-6 py-2 rounded-full font-medium transition-colors shrink-0 ${filter === 'newest' ? 'bg-foreground text-background hover:bg-foreground/90' : 'glass hover:bg-white/10'}`}>
              Newest
            </Link>
          </div>
          <UploadModal isLoggedIn={!!user} />
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
