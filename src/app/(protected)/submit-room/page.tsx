import { RoomUploadFlow } from "@/components/upload/RoomUploadFlow";

export const metadata = {
  title: "Share Your Room | RateMyHostel",
};

export default function SubmitRoomPage() {
  return (
    <div className="flex-1 flex flex-col">
      <RoomUploadFlow />
    </div>
  );
}
