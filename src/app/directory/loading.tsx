import { Skeleton } from "@/components/ui/Skeleton";

export default function DirectoryLoading() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Search + Filter area */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <Skeleton className="w-full h-14 rounded-full flex-1" />
          <div className="flex gap-2 w-full md:w-auto">
            <Skeleton className="w-16 h-12 rounded-full" />
            <Skeleton className="w-16 h-12 rounded-full" />
            <Skeleton className="w-20 h-12 rounded-full" />
            <Skeleton className="w-16 h-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hostel cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[2rem] overflow-hidden border border-border">
            {/* Cover image */}
            <Skeleton className="h-48 w-full rounded-none" />
            {/* Card body */}
            <div className="p-6 flex flex-col gap-3">
              <Skeleton className="h-7 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <div className="flex items-center gap-4 mt-4">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
