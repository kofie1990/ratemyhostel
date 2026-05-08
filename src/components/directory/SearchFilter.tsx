"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('q', e.target.value);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.replace(`/directory?${params.toString()}`);
    });
  };

  const setArea = (area: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (area === 'All') {
      params.delete('area');
    } else {
      params.set('area', area);
    }
    startTransition(() => {
      router.replace(`/directory?${params.toString()}`);
    });
  };

  const activeArea = searchParams.get('area') || 'All';

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      <div className="relative w-full flex-1">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 ${isPending ? 'animate-pulse text-foreground/80' : ''}`} />
        <input 
          type="text" 
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
             // Simple debounce could go here, but useTransition handles React rendering
             handleSearch(e);
          }}
          placeholder="Search hostels..." 
          className="w-full glass-card rounded-full py-4 pl-12 pr-6 border border-border outline-none focus:border-foreground/30 transition-colors bg-background/50"
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        {['All', 'UG', 'KNUST', 'UCC'].map(area => (
          <button 
            key={area}
            onClick={() => setArea(area)}
            className={`px-6 py-3.5 rounded-full font-medium transition-colors shrink-0 ${activeArea === area ? 'bg-foreground text-background' : 'glass hover:bg-foreground/5'}`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
