import { Skeleton } from "@/components/ui/Skeleton";

export default function HostelDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero image placeholder */}
      <div className="w-full h-[60vh] md:h-[70vh] relative">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Title area */}
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-6 pb-12 pt-32">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="max-w-3xl">
              <Skeleton className="h-14 md:h-20 w-80 md:w-[500px] rounded-2xl mb-4" />
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-10 w-48 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-full" />
              </div>
            </div>
            {/* Rating card */}
            <Skeleton className="h-28 w-64 rounded-[2rem]" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-24 mt-16">
        {/* Amenities + Radar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <Skeleton className="h-9 w-64 rounded-xl mb-8" />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-5 w-80 rounded-lg mt-8" />
          </div>
          <Skeleton className="h-80 rounded-[3rem]" />
        </div>

        {/* Reviews section */}
        <div className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <Skeleton className="h-10 w-64 rounded-xl mb-2" />
              <Skeleton className="h-5 w-80 rounded-lg" />
            </div>
            <Skeleton className="h-14 w-48 rounded-full" />
          </div>
          <div className="grid gap-6 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-[2rem]" />
            ))}
          </div>
        </div>

        {/* Room gallery */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <Skeleton className="h-10 w-72 rounded-xl mb-2" />
              <Skeleton className="h-5 w-96 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6">
            {[380, 320, 420, 360, 400, 340].map((h, i) => (
              <div key={i} className="break-inside-avoid mb-3 md:mb-6">
                <Skeleton className="w-full rounded-2xl md:rounded-3xl" style={{ height: `${h}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
