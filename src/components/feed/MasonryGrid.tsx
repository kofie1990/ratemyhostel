"use client";

import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { RoomCard, RoomCardProps } from "./RoomCard";
import { TheaterMode } from "./TheaterMode";

interface MasonryGridProps {
  rooms: RoomCardProps[];
  userId?: string | null;
}

export function MasonryGrid({ rooms, userId }: MasonryGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomCardProps | null>(null);

  return (
    <LayoutGroup>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 w-full mx-auto">
        {rooms.map((room) => (
          <div key={room.id} className="break-inside-avoid">
            <RoomCard {...room} onClick={() => setSelectedRoom(room)} />
          </div>
        ))}
      </div>

      {/* Theater Mode Lightbox */}
      {selectedRoom && (
        <TheaterMode
          room={selectedRoom}
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          userId={userId}
        />
      )}
    </LayoutGroup>
  );
}
