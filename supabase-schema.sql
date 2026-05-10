-- Run this in your Supabase SQL Editor to create the medicines table

DROP TABLE IF EXISTS medicines;

CREATE TABLE medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "imageUrl" text,
  "city" text NOT NULL,
  "phone" text NOT NULL,
  "ownerName" text NOT NULL,
  "createdAt" timestamptz DEFAULT now()
);

-- Note: RLS policies can be setup if you want to secure the table
-- Enable public reading
-- CREATE POLICY "Allow public read" on medicines for SELECT using (true);
-- Enable public inserts (if authentication is not required for donations)
-- CREATE POLICY "Allow public insert" on medicines for INSERT with check (true);
-- Enable public deletes (to allow removing a medicine when ordered)
-- CREATE POLICY "Allow public delete" on medicines for DELETE using (true);
