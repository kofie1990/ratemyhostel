import { createClient } from "@/utils/supabase/server";
import { HostelCard } from "@/components/directory/HostelCard";
import { SearchFilter } from "@/components/directory/SearchFilter";

export const metadata = {
  title: "Directory | RateMyHostel",
  description: "Search and review student hostels across Ghana.",
};

export const dynamic = 'force-dynamic';

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || '';
  const area = resolvedParams.area || 'All';

  let query = supabase.from('hostels').select('*, reviews(id, rating)').order('name');

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  if (area !== 'All') {
    // Basic mapping based on seeded data
    if (area === 'UG') query = query.ilike('area', '%University of Ghana%');
    if (area === 'KNUST') query = query.ilike('area', '%KNUST%');
    if (area === 'UCC') query = query.ilike('area', '%Cape Coast%');
  }

  const { data: hostels } = await query;

  // Process ratings
  const processedHostels = (hostels || []).map(h => {
    const reviews = h.reviews || [];
    const avg = reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length : h.average_rating || 0;
    return {
      ...h,
      reviewCount: reviews.length,
      averageRating: avg
    };
  });

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Hostel Directory.</h1>
        <p className="text-lg text-foreground/60 font-medium mb-12">
          Discover and review the best student accommodations across Ghana's top universities.
        </p>
        
        <SearchFilter />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedHostels.map(hostel => (
          <HostelCard 
            key={hostel.id}
            id={hostel.id}
            name={hostel.name}
            area={hostel.area}
            universitySlug={hostel.university_slug}
            hostelSlug={hostel.hostel_slug}
            averageRating={hostel.averageRating}
            reviewCount={hostel.reviewCount}
            coverImage={hostel.cover_image_url}
          />
        ))}
        
        {processedHostels.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card rounded-[2rem]">
            <h3 className="text-2xl font-bold mb-2">No hostels found.</h3>
            <p className="text-foreground/60 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
