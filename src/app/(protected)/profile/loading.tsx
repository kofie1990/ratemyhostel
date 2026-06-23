import { Skeleton } from "@/components/ui/Skeleton";

export default function MyProfileLoading() {
  const cardHeights = [380, 320, 440, 360, 400, 340, 420, 350];

  return (
    <div className="flex flex-col gap-12 pt-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div>
            <Skeleton className="h-10 w-48 rounded-xl mb-2" />
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-11 h-11 rounded-full" />
          <Skeleton className="w-11 h-11 rounded-full" />
          <Skeleton className="w-40 h-11 rounded-full" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-8 border-b border-border pb-4">
        <Skeleton className="h-5 w-24 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-lg" />
      </div>

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 w-full">
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
