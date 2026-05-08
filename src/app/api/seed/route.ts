import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { MOCK_ROOMS } from "@/lib/mock-data";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in first so we can tie the mock data to your account." }, { status: 401 });
  }

  try {
    for (const mockRoom of MOCK_ROOMS) {
      // 1. Check if hostel exists, if not, create it
      let { data: hostel } = await supabase
        .from('hostels')
        .select('id')
        .eq('name', mockRoom.hostel)
        .single();

      if (!hostel) {
        const { data: newHostel, error: hostelError } = await supabase
          .from('hostels')
          .insert({ name: mockRoom.hostel, area: "University Campus" })
          .select('id')
          .single();
          
        if (hostelError) throw hostelError;
        hostel = newHostel;
      }

      // 2. Insert Room
      // Multiplying vibeScore by 10 so it looks like a realistic integer vote count (e.g. 9.5 -> 95 votes)
      const fakeVoteCount = Math.floor(mockRoom.vibeScore * 10);
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          user_id: user.id,
          hostel_id: hostel.id,
          image_url: mockRoom.image,
          vibe_score: fakeVoteCount, 
          status: 'published'
        })
        .select('id')
        .single();
        
      if (roomError) throw roomError;

      // 3. Insert Tags if any
      if (mockRoom.tags.length > 0) {
        const tagInserts = mockRoom.tags.map(t => ({
          room_id: room.id,
          user_id: user.id,
          x_pos: t.x,
          y_pos: t.y,
          label: t.label
        }));
        
        const { error: tagError } = await supabase.from('room_tags').insert(tagInserts);
        if (tagError) throw tagError;
      }
    }

    return NextResponse.json({ success: true, message: "Mock data successfully pushed to Supabase!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
