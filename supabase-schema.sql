-- RUN THIS IN SUPABASE SQL EDITOR
-- This schema matches the current React app data structure

DROP TABLE IF EXISTS medicines;

CREATE TABLE medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "imageUrl" TEXT DEFAULT 'https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400',
  "ownerName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and allow all actions for now (Public Demo Policy)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all" ON medicines;
CREATE POLICY "Allow public all" ON medicines FOR ALL TO public USING (true) WITH CHECK (true);

-- Optional: Initial Data
INSERT INTO medicines (name, "ownerName", phone, city)
VALUES 
('بنادول إكسترا', 'أحمد محمد', '0501234567', 'الرياض'),
('أوجمنتين 1 جم', 'سارة خالد', '0559876543', 'جدة');
