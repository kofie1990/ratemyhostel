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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * POST /api/admin/requests/[id]/resolve
 *
 * Body for mapping to an existing hostel:
 *   { action: 'map', hostel_id: string, room_id: string }
 *
 * Body for creating a brand-new hostel and mapping to it:
 *   { action: 'create', room_id: string, name: string, area: string,
 *     university_slug: string, hostel_slug?: string,
 *     description?: string, cover_image_url?: string, amenities?: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: requestId } = await params;
  const body = await request.json();
  const { action, room_id } = body;

  if (!action || !room_id) {
    return NextResponse.json({ error: 'action and room_id are required' }, { status: 400 });
  }

  const supabase = getAdminClient();

  let targetHostelId: string;

  if (action === 'map') {
    // Map to an existing hostel
    const { hostel_id } = body;
    if (!hostel_id) return NextResponse.json({ error: 'hostel_id required for map action' }, { status: 400 });
    targetHostelId = hostel_id;

  } else if (action === 'create') {
    // Create a new hostel first
    const { name, area, university_slug, hostel_slug, description, cover_image_url, amenities } = body;
    if (!name || !area || !university_slug) {
      return NextResponse.json({ error: 'name, area, university_slug required for create action' }, { status: 400 });
    }

    const finalSlug = hostel_slug || slugify(name);

    const { data: newHostel, error: hostelErr } = await supabase
      .from('hostels')
      .insert({
        name,
        area,
        university_slug,
        hostel_slug: finalSlug,
        description: description || null,
        cover_image_url: cover_image_url || null,
        amenities: amenities || [],
      })
      .select('id')
      .single();

    if (hostelErr || !newHostel) {
      return NextResponse.json({ error: hostelErr?.message || 'Failed to create hostel' }, { status: 500 });
    }
    targetHostelId = newHostel.id;

  } else {
    return NextResponse.json({ error: 'action must be "map" or "create"' }, { status: 400 });
  }

  // Update the room: set hostel_id and mark as published
  const { error: roomErr } = await supabase
    .from('rooms')
    .update({ hostel_id: targetHostelId, status: 'published' })
    .eq('id', room_id);

  if (roomErr) return NextResponse.json({ error: roomErr.message }, { status: 500 });

  // Mark the hostel_request as approved
  const { error: reqErr } = await supabase
    .from('hostel_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  return NextResponse.json({ success: true, hostel_id: targetHostelId });
}
