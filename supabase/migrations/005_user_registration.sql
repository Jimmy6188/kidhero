-- Add new fields for user registration
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height numeric(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight numeric(5,1);
