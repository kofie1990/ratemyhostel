import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ratemyhostel.co';
  const supabase = await createClient();

  // Static routes
  const routes = ['', '/feed', '/login', '/directory'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Hostels
  const { data: hostels } = await supabase
    .from('hostels')
    .select('university_slug, hostel_slug, created_at');

  const hostelRoutes = (hostels || []).map((hostel) => ({
    url: `${baseUrl}/directory/${hostel.university_slug}/${hostel.hostel_slug}`,
    lastModified: hostel.created_at ? new Date(hostel.created_at).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Public Profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, updated_at')
    .eq('is_public', true)
    .not('username', 'is', null);

  const profileRoutes = (profiles || []).map((profile) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at).toISOString() : new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...routes, ...hostelRoutes, ...profileRoutes];
}
