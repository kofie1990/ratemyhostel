import Link from "next/link";
import { Star, MapPin } from "lucide-react";

export interface HostelCardProps {
  id: string;
  name: string;
  area: string;
  universitySlug: string;
  hostelSlug: string;
  averageRating: number;
  reviewCount: number;
  coverImage?: string;
}

export function HostelCard({ id, name, area, universitySlug, hostelSlug, averageRating, reviewCount, coverImage }: HostelCardProps) {
  return (
    <Link href={`/directory/${universitySlug}/${hostelSlug}`} className="block group h-full">
      <div className="glass-card rounded-[2rem] overflow-hidden border border-border transition-all duration-300 hover:border-foreground/30 hover:shadow-2xl h-full flex flex-col">
        <div className="h-48 w-full bg-foreground/5 relative overflow-hidden shrink-0">
          {coverImage ? (
            <img src={coverImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/20 font-serif text-4xl md:text-5xl font-bold group-hover:scale-105 transition-transform duration-500">
              {name.charAt(0)}
            </div>
          )}
          <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-2xl flex items-center gap-1 border border-border/50 backdrop-blur-xl bg-background/80">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-bold text-sm text-foreground">{Number(averageRating).toFixed(1)}</span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-2xl font-bold mb-2 font-serif group-hover:text-foreground/80 transition-colors">{name}</h3>
          <div className="flex items-center gap-2 text-foreground/60 text-sm mb-4">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{area}</span>
          </div>
          <div className="mt-auto flex items-center gap-4 text-sm font-medium pt-2">
            <span className="text-foreground/60">{reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}</span>
            <span className="text-foreground/40">•</span>
            <span className="text-foreground underline decoration-foreground/20 underline-offset-4 group-hover:decoration-foreground/60 transition-colors">View Profile</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
