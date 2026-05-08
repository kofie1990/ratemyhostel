-- Initial Schema for RateMyHostel
-- Ensure we have the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. HOSTELS (The Core Directory)
CREATE TABLE hostels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HOSTEL REQUESTS (The Data Guardrail)
CREATE TABLE hostel_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requested_name TEXT NOT NULL,
  requested_area TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. REVIEWS (Strict 1 per user per hostel)
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(hostel_id, user_id) -- Ensures 1 review per Auth ID per Hostel
);

-- 5. ROOMS (Rate My Room Feed)
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  vibe_score INTEGER DEFAULT 0, -- Calculated from room_votes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. ROOM VOTES (The Vibe Score Engine)
CREATE TABLE room_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_value INTEGER NOT NULL CHECK (vote_value IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(room_id, user_id) -- One vote per user per room
);

-- 7. ROOM TAGS (The Interactive Dots)
CREATE TABLE room_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  x_pos NUMERIC(5,2) NOT NULL, -- Percentage (0-100)
  y_pos NUMERIC(5,2) NOT NULL, -- Percentage (0-100)
  label TEXT NOT NULL,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. FAVOURITES (The Utility Feature)
CREATE TABLE favourites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('room', 'hostel')),
  item_id UUID NOT NULL, -- Logical reference to either rooms(id) or hostels(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

-- RLS setup (Enable RLS on all tables)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Basic Policies
-- Profiles: Users can view all, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Hostels: Viewable by all, managed by admins (assume basic public read for now)
CREATE POLICY "Hostels are viewable by everyone." ON hostels FOR SELECT USING (true);

-- Hostel Requests: Users can insert, view their own
CREATE POLICY "Users can create requests." ON hostel_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests." ON hostel_requests FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Viewable by all, users can only insert/update their own
CREATE POLICY "Reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews." ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews." ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews." ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Rooms: Viewable by all, users can insert/update their own
CREATE POLICY "Rooms are viewable by everyone." ON rooms FOR SELECT USING (true);
CREATE POLICY "Users can insert own rooms." ON rooms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rooms." ON rooms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rooms." ON rooms FOR DELETE USING (auth.uid() = user_id);

-- Room Votes: Viewable by all, users can insert/update their own
CREATE POLICY "Room votes are viewable by everyone." ON room_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes." ON room_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes." ON room_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes." ON room_votes FOR DELETE USING (auth.uid() = user_id);

-- Room Tags: Viewable by all, users can insert/update their own
CREATE POLICY "Room tags are viewable by everyone." ON room_tags FOR SELECT USING (true);
CREATE POLICY "Users can insert own tags." ON room_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags." ON room_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags." ON room_tags FOR DELETE USING (auth.uid() = user_id);

-- Favourites: Users can only manage their own
CREATE POLICY "Users can view own favourites." ON favourites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favourites." ON favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favourites." ON favourites FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
