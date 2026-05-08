import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function isAuthorized(request: NextRequest) {
  const token = request.headers.get('x-admin-token');
  return token === process.env.ADMIN_PASSWORD;
}

// PATCH /api/admin/hostels/[id] - update a hostel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, area, description, cover_image_url, amenities, university_slug, hostel_slug } = body;

  const supabase = getAdminClient();
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (area !== undefined) updateData.area = area;
  if (description !== undefined) updateData.description = description;
  if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
  if (amenities !== undefined) updateData.amenities = amenities;
  if (university_slug !== undefined) updateData.university_slug = university_slug;
  if (hostel_slug !== undefined) updateData.hostel_slug = hostel_slug;

  const { data, error } = await supabase
    .from('hostels')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hostel: data });
}

// DELETE /api/admin/hostels/[id] - delete a hostel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getAdminClient();
  const { error } = await supabase.from('hostels').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
