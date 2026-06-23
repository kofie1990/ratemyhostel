import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedLoading() {
  // Heights that mirror the real masonry card proportions
  const cardHeights = [420, 340, 480, 360, 400, 320, 460, 380, 440, 350, 500, 370];

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Filter tabs */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <Skeleton className="w-28 h-10 rounded-full" />
          <Skeleton className="w-28 h-10 rounded-full" />
          <Skeleton className="w-28 h-10 rounded-full" />
        </div>
      </div>

      {/* Masonry grid skeleton */}
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
  );
}
