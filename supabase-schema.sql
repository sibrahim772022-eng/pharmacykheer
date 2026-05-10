-- RUN THIS IN SUPABASE SQL EDITOR
-- This schema matches the current React app data structure

DROP TABLE IF EXISTS medicines;

CREATE TABLE medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "imageUrl" TEXT,
  "ownerName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and allow all actions for now
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON medicines FOR ALL USING (true) WITH CHECK (true);
