import { createClient } from "./client";

export async function uploadRoomImage(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  
  // Create a highly unique filename to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage.from('room-images').upload(filePath, file, {
    cacheControl: '31536000', // 1 year cache
    upsert: false
  });

  if (error) {
    console.error("Storage upload error:", error);
    return { url: null, error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}
