-- Run this in your Supabase SQL Editor to create the medicines table

CREATE TABLE medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text NOT NULL,
  "expiryDate" date NOT NULL,
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
