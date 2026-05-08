-- 05_seo_slugs.sql

-- 1. Add columns
ALTER TABLE hostels ADD COLUMN university_slug TEXT;
ALTER TABLE hostels ADD COLUMN hostel_slug TEXT;

-- 2. Backfill for UG
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'pentagon-hostel' WHERE name = 'Pentagon Hostel';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'evandy-hostel' WHERE name = 'Evandy Hostel (UG)';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'bani-hostel' WHERE name = 'Bani Hostel';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'tf-hostel' WHERE name = 'TF Hostel';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'african-union-hall' WHERE name = 'African Union Hall';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'hilla-limann-hall' WHERE name = 'Hilla Limann Hall';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'alexander-kwapong-hall' WHERE name = 'Alexander Kwapong Hall';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'elizabeth-frances-sey-hall' WHERE name = 'Elizabeth Frances Sey Hall';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'jean-nelson-aka-hall' WHERE name = 'Jean Nelson Aka Hall';
UPDATE hostels SET university_slug = 'ug', hostel_slug = 'mensah-sarbah-hall' WHERE name = 'Mensah Sarbah Hall';

-- 3. Backfill for KNUST
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'brunei-complex' WHERE name = 'Brunei Complex';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'gaza-hostel' WHERE name = 'Gaza Hostel';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'src-hostel' WHERE name = 'SRC Hostel';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'tek-credit-hostel' WHERE name = 'Tek Credit Hostel';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'westend-hostel' WHERE name = 'Westend Hostel';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'frontline-inn' WHERE name = 'Frontline Inn';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'canam-hall' WHERE name = 'Canam Hall';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'crystal-rose-hostel' WHERE name = 'Crystal Rose Hostel';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'evandy-hostel' WHERE name = 'Evandy Hostel (KNUST)';
UPDATE hostels SET university_slug = 'knust', hostel_slug = 'shalom-hostel' WHERE name = 'Shalom Hostel';

-- 4. Backfill for UCC
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'casely-hayford-hall' WHERE name = 'Casely Hayford Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'atlantic-hall' WHERE name = 'Atlantic Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'oguaa-hall' WHERE name = 'Oguaa Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'adehye-hall' WHERE name = 'Adehye Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'valco-hall' WHERE name = 'Valco Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'kwame-nkrumah-hall' WHERE name = 'Kwame Nkrumah Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'src-hall' WHERE name = 'SRC Hall';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'ssnit-hostel' WHERE name = 'SSNIT Hostel';
UPDATE hostels SET university_slug = 'ucc', hostel_slug = 'ayensu-plaza' WHERE name = 'Ayensu Plaza';

-- Catch all for any missed ones or future ones to prevent NOT NULL errors 
UPDATE hostels SET 
  university_slug = 'other', 
  hostel_slug = REPLACE(LOWER(name), ' ', '-') 
WHERE university_slug IS NULL;

-- 5. Add Constraints
ALTER TABLE hostels ALTER COLUMN university_slug SET NOT NULL;
ALTER TABLE hostels ALTER COLUMN hostel_slug SET NOT NULL;
ALTER TABLE hostels ADD CONSTRAINT unique_university_hostel_slug UNIQUE (university_slug, hostel_slug);
