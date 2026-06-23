import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testQuery() {
  const userId = 'c0fbf30d-a851-49ee-aa0f-b978d030e769'; // using the one from earlier
  const { data: votesData, error } = await supabase
    .from('room_votes')
    .select('score, rooms!inner(user_id)')
    .eq('rooms.user_id', userId);
    
  console.log(votesData, error)
  const totalVibeScore = votesData?.reduce((acc, vote) => acc + (Number(vote.score) || 0), 0) || 0;
  console.log('Total Vibe Score:', totalVibeScore)
}

testQuery()
