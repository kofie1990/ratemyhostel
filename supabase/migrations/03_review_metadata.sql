-- 03_review_metadata.sql

-- Add additional metadata to reviews to track the specific room conditions
ALTER TABLE reviews ADD COLUMN floor TEXT;
ALTER TABLE reviews ADD COLUMN room_number TEXT;
ALTER TABLE reviews ADD COLUMN room_capacity INTEGER CHECK (room_capacity >= 1 AND room_capacity <= 6);
