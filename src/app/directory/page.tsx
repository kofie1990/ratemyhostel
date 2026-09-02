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
  searchParams: Promise<{ q?: string; area?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase() || '';
  const area = resolvedParams.area || 'All';
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 12;

  // Cached query — 120s revalidation, tagged 'directory'
  const { hostels, totalCount } = await getCachedDirectoryHostels(q, area, page, limit);
  const totalPages = Math.ceil(totalCount / limit);

  const buildQueryString = (newPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (resolvedParams.area) params.set('area', resolvedParams.area);
    if (newPage > 1) params.set('page', newPage.toString());
    return params.toString();
  };

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
        {hostels.map((hostel: any) => (
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

        {hostels.length === 0 && (
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

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-4">
          {page > 1 ? (
            <Link
              href={`/directory?${buildQueryString(page - 1)}`}
              className="px-6 py-3 rounded-full font-medium glass hover:bg-foreground/5 transition-colors"
            >
              Previous
            </Link>
          ) : (
            <span className="px-6 py-3 rounded-full font-medium glass opacity-50 cursor-not-allowed">Previous</span>
          )}
          
          <span className="font-medium text-foreground/80">
            Page {page} of {totalPages}
          </span>
          
          {page < totalPages ? (
            <Link
              href={`/directory?${buildQueryString(page + 1)}`}
              className="px-6 py-3 rounded-full font-medium glass hover:bg-foreground/5 transition-colors"
            >
              Next
            </Link>
          ) : (
            <span className="px-6 py-3 rounded-full font-medium glass opacity-50 cursor-not-allowed">Next</span>
          )}
        </div>
      )}
    </div>
  );
}
