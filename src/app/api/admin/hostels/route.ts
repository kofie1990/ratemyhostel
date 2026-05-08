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

// GET /api/admin/hostels - list all hostels
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('hostels')
    .select('*, reviews(id, rating)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const processed = (data || []).map((h) => {
    const reviews = h.reviews || [];
    const avg =
      reviews.length > 0
        ? reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length
        : h.average_rating || 0;
    return { ...h, reviewCount: reviews.length, averageRating: parseFloat(avg.toFixed(2)) };
  });

  return NextResponse.json({ hostels: processed });
}

// POST /api/admin/hostels - create a new hostel
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, area, description, cover_image_url, amenities, university_slug, hostel_slug } = body;

  if (!name || !area || !university_slug || !hostel_slug) {
    return NextResponse.json({ error: 'name, area, university_slug, hostel_slug are required' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('hostels')
    .insert({
      name,
      area,
      description: description || null,
      cover_image_url: cover_image_url || null,
      amenities: amenities || [],
      university_slug,
      hostel_slug,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hostel: data }, { status: 201 });
}
