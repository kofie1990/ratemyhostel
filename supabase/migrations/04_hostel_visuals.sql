-- 04_hostel_visuals.sql

-- 1. Add amenities column
ALTER TABLE hostels ADD COLUMN amenities JSONB DEFAULT '[]'::jsonb;

-- 2. Add detailed rating columns
ALTER TABLE reviews ADD COLUMN rating_cleanliness INTEGER CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5);
ALTER TABLE reviews ADD COLUMN rating_security INTEGER CHECK (rating_security >= 1 AND rating_security <= 5);
ALTER TABLE reviews ADD COLUMN rating_location INTEGER CHECK (rating_location >= 1 AND rating_location <= 5);
ALTER TABLE reviews ADD COLUMN rating_facilities INTEGER CHECK (rating_facilities >= 1 AND rating_facilities <= 5);
ALTER TABLE reviews ADD COLUMN rating_vibe INTEGER CHECK (rating_vibe >= 1 AND rating_vibe <= 5);

-- 3. Seed cover images and amenities for existing hostels
UPDATE hostels SET 
  cover_image_url = (ARRAY[
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2000', 
    'https://images.unsplash.com/photo-1522771731470-8ee116315ee4?auto=format&fit=crop&q=80&w=2000', 
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=2000', 
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=2000', 
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000', 
    'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&q=80&w=2000'
  ])[floor(random() * 6 + 1)],
  amenities = '["⚡ Backup Generator", "💧 24/7 Water", "🔒 Walled & Gated", "🧹 Weekly Cleaning"]'::jsonb
WHERE id IS NOT NULL;
