import { HeroSection } from "@/components/home/HeroSection";
import { CuratedSpaces } from "@/components/home/CuratedSpacesMarquee";
import {
  getCachedCuratedRooms,
  getCachedStackRooms,
  getCachedHomeStats,
} from "@/lib/queries";

export default async function Home() {
  // All three queries are cached — 120s for rooms, 300s for stats
  const [curatedRooms, stackRooms, { userCount, avatars }] = await Promise.all([
    getCachedCuratedRooms(),
    getCachedStackRooms(),
    getCachedHomeStats(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection userCount={userCount} avatars={avatars} stackRooms={stackRooms} />
      {curatedRooms.length > 0 && <CuratedSpaces rooms={curatedRooms} />}
    </div>
  );
}
