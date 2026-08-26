import { HostelCard } from "@/components/directory/HostelCard";
import { SearchFilter } from "@/components/directory/SearchFilter";
import Link from "next/link";
import { getCachedDirectoryHostels } from "@/lib/queries";

export const metadata = {
  title: "Directory | RateMyHostel",
  description: "Search and review student hostels across Ghana.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || '';
  const area = resolvedParams.area || 'All';

  // Cached query — 120s revalidation, tagged 'directory'
  const processedHostels = await getCachedDirectoryHostels(q, area);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {/* <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Hostel Directory.</h1>
        <p className="text-lg text-foreground/60 font-medium mb-12">
          Discover and review the best student accommodations across Ghana's top universities.
        </p> */}

        <SearchFilter />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedHostels.map((hostel: any) => (
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
            <p className="text-foreground/60 font-medium mb-6">Try adjusting your search or filters.</p>
            <Link 
              href="/request"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
            >
              Can't find your hostel? Add it here
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
