import { Skeleton } from "@/components/ui/Skeleton";

export default function PublicProfileLoading() {
  const cardHeights = [400, 340, 460, 360, 420, 320];

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col items-center text-center mb-16">
        {/* Avatar */}
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full mb-6" />
        {/* Name */}
        <Skeleton className="h-12 md:h-14 w-56 rounded-xl mb-2" />
        {/* Handle */}
        <Skeleton className="h-6 w-36 rounded-lg mb-6" />
        {/* Stats card */}
        <Skeleton className="h-24 w-72 rounded-3xl" />
      </div>

      {/* Portfolio section */}
      <div className="mt-8">
        <Skeleton className="h-8 w-32 rounded-lg mb-8 ml-2" />
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 w-full mx-auto">
          {cardHeights.map((height, i) => (
            <div key={i} className="break-inside-avoid mb-3 md:mb-6">
              <Skeleton
                className="w-full rounded-2xl md:rounded-3xl"
                style={{ height: `${height}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
