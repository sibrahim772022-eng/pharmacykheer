-- Run this in your Supabase SQL Editor to apply modifications to the medicines table
-- Instead of dropping the whole table, we just remove the column that is no longer needed

ALTER TABLE IF EXISTS medicines DROP COLUMN IF EXISTS "expiryDate";


-- Note: RLS policies can be setup if you want to secure the table
-- Enable public reading
-- CREATE POLICY "Allow public read" on medicines for SELECT using (true);
-- Enable public inserts (if authentication is not required for donations)
-- CREATE POLICY "Allow public insert" on medicines for INSERT with check (true);
-- Enable public deletes (to allow removing a medicine when ordered)
-- CREATE POLICY "Allow public delete" on medicines for DELETE using (true);
