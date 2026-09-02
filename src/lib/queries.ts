import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/utils/supabase/static";

// ─────────────────────────────────────────────
// Feed: Published rooms with filters
// ─────────────────────────────────────────────

export const getCachedFeedRooms = (filter: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();

      let query = supabase
        .from("rooms")
        .select(`
          id,
          image_url,
          vibe_score,
          hostels ( name, university_slug, hostel_slug ),
          room_tags ( id, x_pos, y_pos, label ),
          profiles ( is_verified_student, username, avatar_url, is_public )
        `)
        .eq("status", "published");

      if (filter === "top-rated") {
        query = query
          .order("vibe_score", { ascending: false })
          .order("created_at", { ascending: false });
      } else if (filter === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query
          .order("vibe_score", { ascending: false })
          .order("created_at", { ascending: false });
      }

      const { data: rawRooms } = await query;

      return (rawRooms || []).map((room: any) => ({
        id: room.id,
        image: room.image_url,
        hostel:
          (Array.isArray(room.hostels)
            ? room.hostels[0]?.name
            : room.hostels?.name) || "Unknown Hostel",
        universitySlug:
          Array.isArray(room.hostels)
            ? room.hostels[0]?.university_slug
            : room.hostels?.university_slug,
        hostelSlug:
          Array.isArray(room.hostels)
            ? room.hostels[0]?.hostel_slug
            : room.hostels?.hostel_slug,
        vibeScore: room.vibe_score || 0,
        isVerified: room.profiles?.is_verified_student || false,
        creator:
          room.profiles?.is_public && room.profiles?.username
            ? {
                username: room.profiles.username,
                avatar_url: room.profiles.avatar_url,
              }
            : undefined,
        tags: (room.room_tags || []).map((tag: any) => ({
          id: tag.id,
          x: tag.x_pos,
          y: tag.y_pos,
          label: tag.label,
        })),
      }));
    },
    ["feed-rooms", filter],
    { revalidate: 60, tags: ["feed"] }
  )();

// ─────────────────────────────────────────────
// Home: Curated rooms (top 10 by vibe)
// ─────────────────────────────────────────────

export const getCachedCuratedRooms = unstable_cache(
  async () => {
    const supabase = createAnonClient();

    const { data: rawCuratedRooms } = await supabase
      .from("rooms")
      .select(`id, image_url, vibe_score, hostels ( name, university_slug, hostel_slug )`)
      .eq("status", "published")
      .order("vibe_score", { ascending: false })
      .limit(10);

    return (rawCuratedRooms || []).map((room: any) => ({
      id: room.id,
      image: room.image_url,
      hostel:
        (Array.isArray(room.hostels)
          ? room.hostels[0]?.name
          : room.hostels?.name) || "Unknown Hostel",
      universitySlug:
        Array.isArray(room.hostels)
          ? room.hostels[0]?.university_slug
          : room.hostels?.university_slug,
      hostelSlug:
        Array.isArray(room.hostels)
          ? room.hostels[0]?.hostel_slug
          : room.hostels?.hostel_slug,
      vibeScore: room.vibe_score || 0,
      tags: [],
    }));
  },
  ["curated-rooms"],
  { revalidate: 120, tags: ["feed"] }
);

// ─────────────────────────────────────────────
// Home: Stack rooms (top 5 by vibe)
// ─────────────────────────────────────────────

export const getCachedStackRooms = unstable_cache(
  async () => {
    const supabase = createAnonClient();

    const { data: rawStackRooms } = await supabase
      .from("rooms")
      .select(`id, image_url, vibe_score, hostels ( name, university_slug, hostel_slug )`)
      .eq("status", "published")
      .order("vibe_score", { ascending: false })
      .limit(5);

    return (rawStackRooms || []).map((room: any) => ({
      id: room.id,
      image: room.image_url,
      hostel:
        (Array.isArray(room.hostels)
          ? room.hostels[0]?.name
          : room.hostels?.name) || "Unknown Hostel",
      universitySlug:
        Array.isArray(room.hostels)
          ? room.hostels[0]?.university_slug
          : room.hostels?.university_slug,
      hostelSlug:
        Array.isArray(room.hostels)
          ? room.hostels[0]?.hostel_slug
          : room.hostels?.hostel_slug,
      vibeScore: room.vibe_score || 0,
    }));
  },
  ["stack-rooms"],
  { revalidate: 120, tags: ["feed"] }
);

// ─────────────────────────────────────────────
// Home: User count + avatars
// ─────────────────────────────────────────────

export const getCachedHomeStats = unstable_cache(
  async () => {
    const supabase = createAnonClient();

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const { data: profilesWithAvatars } = await supabase
      .from("profiles")
      .select("avatar_url")
      .not("avatar_url", "is", null)
      .limit(3);

    const avatars = (profilesWithAvatars || [])
      .map((p) => p.avatar_url)
      .filter(Boolean) as string[];

    return { userCount: totalUsers || 0, avatars };
  },
  ["home-stats"],
  { revalidate: 300, tags: ["profiles"] }
);

// ─────────────────────────────────────────────
// Directory: Hostel listing with search/filter
// ─────────────────────────────────────────────

export const getCachedDirectoryHostels = (q: string, area: string, page: number = 1, limit: number = 12) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();

      let query = supabase
        .from("hostels")
        .select("*, reviews(id, rating)", { count: "exact" })
        .order("name");

      if (q) {
        query = query.ilike("name", `%${q}%`);
      }

      if (area !== "All") {
        if (area === "UG") query = query.ilike("area", "%University of Ghana%");
        if (area === "KNUST") query = query.ilike("area", "%KNUST%");
        if (area === "UCC") query = query.ilike("area", "%Cape Coast%");
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data: hostels, count } = await query.range(from, to);

      const processedHostels = (hostels || []).map((h: any) => {
        const reviews = h.reviews || [];
        const avg =
          reviews.length > 0
            ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
              reviews.length
            : h.average_rating || 0;
        return {
          ...h,
          reviewCount: reviews.length,
          averageRating: avg,
        };
      });
      
      return { hostels: processedHostels, totalCount: count || 0 };
    },
    ["directory", q || "__all__", area || "All", String(page), String(limit)],
    { revalidate: 120, tags: ["directory"] }
  )();

// ─────────────────────────────────────────────
// Hostel Detail: Full hostel data + reviews + rooms
// ─────────────────────────────────────────────

export const getCachedHostelDetail = (university: string, slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();

      // Fetch hostel
      const { data: hostel } = await supabase
        .from("hostels")
        .select("*")
        .eq("university_slug", university)
        .eq("hostel_slug", slug)
        .single();

      if (!hostel) return null;

      // Fetch reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("*, profiles(display_name, is_verified_student)")
        .eq("hostel_id", hostel.id)
        .order("created_at", { ascending: false });

      // Fetch rooms
      const { data: rawRooms } = await supabase
        .from("rooms")
        .select(`id, image_url, vibe_score, room_tags ( id, x_pos, y_pos, label )`)
        .eq("hostel_id", hostel.id)
        .eq("status", "published")
        .order("vibe_score", { ascending: false });

      const rooms = (rawRooms || []).map((room: any) => ({
        id: room.id,
        image: room.image_url,
        hostel: hostel.name,
        universitySlug: university,
        hostelSlug: slug,
        vibeScore: room.vibe_score || 0,
        tags: (room.room_tags || []).map((tag: any) => ({
          id: tag.id,
          x: tag.x_pos,
          y: tag.y_pos,
          label: tag.label,
        })),
      }));

      return { hostel, reviews: reviews || [], rooms };
    },
    ["hostel", university, slug],
    { revalidate: 120, tags: ["directory"] }
  )();

// ─────────────────────────────────────────────
// Public Profile: Profile + their rooms
// ─────────────────────────────────────────────

export const getCachedPublicProfile = (username: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnonClient();

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .eq("is_public", true)
        .single();

      if (error || !profile) return null;

      const { data: rawRooms } = await supabase
        .from("rooms")
        .select(`
          id,
          image_url,
          vibe_score,
          hostels ( name, university_slug, hostel_slug ),
          room_tags ( id, x_pos, y_pos, label )
        `)
        .eq("user_id", profile.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      const rooms = (rawRooms || []).map((room: any) => ({
        id: room.id,
        image: room.image_url,
        hostel:
          (Array.isArray(room.hostels)
            ? room.hostels[0]?.name
            : room.hostels?.name) || "Unknown Hostel",
        universitySlug:
          Array.isArray(room.hostels)
            ? room.hostels[0]?.university_slug
            : room.hostels?.university_slug,
        hostelSlug:
          Array.isArray(room.hostels)
            ? room.hostels[0]?.hostel_slug
            : room.hostels?.hostel_slug,
        vibeScore: room.vibe_score || 0,
        isVerified: profile.is_verified_student || false,
        creator: {
          username: profile.username,
          avatar_url: profile.avatar_url,
        },
        tags: (room.room_tags || []).map((tag: any) => ({
          id: tag.id,
          x: tag.x_pos,
          y: tag.y_pos,
          label: tag.label,
        })),
      }));

      return { profile, rooms };
    },
    ["profile", username],
    { revalidate: 60, tags: ["profiles"] }
  )();
