-- Alter table registrations to add racepack_claimed_at
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS racepack_claimed_at timestamptz DEFAULT NULL;
