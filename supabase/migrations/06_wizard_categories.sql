-- 06_wizard_categories.sql

-- 1. Rename columns to match the new 5 core Utility categories
ALTER TABLE reviews RENAME COLUMN rating_security TO rating_management;
ALTER TABLE reviews RENAME COLUMN rating_facilities TO rating_water;
ALTER TABLE reviews RENAME COLUMN rating_vibe TO rating_network;

-- The columns are now: rating_cleanliness, rating_management, rating_water, rating_network, rating_location
