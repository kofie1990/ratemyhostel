import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testVoteTrigger() {
  // 1. Fetch a room to test
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, vibe_score')
    .limit(1)
    .single()
  
  if (roomError) {
    console.error("Error fetching room:", roomError)
    return
  }
  
  console.log("Initial room:", room)
  
  // 2. Fetch a user to use for voting
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single()

  if (userError) {
    console.error("Error fetching user:", userError)
    return
  }

  // 3. Upsert a vote
  const testScore = Math.floor(Math.random() * 10) + 1;
  console.log(`Upserting vote: ${testScore} for room ${room.id} by user ${user.id}`)
  const { error: voteError } = await supabase
    .from('room_votes')
    .upsert({
      room_id: room.id,
      user_id: user.id,
      score: testScore
    })
  
  if (voteError) {
    console.error("Error upserting vote:", voteError)
    return
  }
  
  // 4. Fetch the room again to see if vibe_score changed
  const { data: updatedRoom, error: updatedRoomError } = await supabase
    .from('rooms')
    .select('id, vibe_score')
    .eq('id', room.id)
    .single()
    
  console.log("Updated room:", updatedRoom)
}

testVoteTrigger()
