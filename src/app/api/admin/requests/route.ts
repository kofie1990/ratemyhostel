import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function isAuthorized(request: NextRequest) {
  return request.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/requests
// Returns all pending hostel requests joined with the room that triggered them
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();

  // Fetch pending requests
  const { data: requests, error } = await supabase
    .from('hostel_requests')
    .select('id, requested_name, requested_area, status, created_at, user_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For each request, find the associated pending_mapping room (by user_id + closest created_at)
  const enriched = await Promise.all(
    (requests || []).map(async (req) => {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, image_url, vibe_score, created_at')
        .eq('user_id', req.user_id)
        .eq('status', 'pending_mapping')
        .order('created_at', { ascending: false })
        .limit(1);

      return { ...req, room: rooms?.[0] ?? null };
    })
  );

  return NextResponse.json({ requests: enriched });
}
