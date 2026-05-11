-- 1. Create the medicines table with original field names
create table if not exists public.medicines (
  id uuid default gen_random_uuid() primary key,
  drug_name text not null,           -- اسم الدواء
  quantity text not null,            -- الكمية
  donator_name text not null,        -- اسم المتبرع
  phone_number text not null,        -- رقم الهاتف
  address text not null,             -- العنوان (المدينة والحي)
  image_urls text[] not null,        -- روابط الصور
  status text default 'available',    -- الحالة (متاح، تم الطلب)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) on the table
alter table public.medicines enable row level security;

-- 3. Create policies for the table
DO $$
BEGIN
    if not exists (select * from pg_policies where policyname = 'Allow public read access on medicines' and tablename = 'medicines') then
        create policy "Allow public read access on medicines" on public.medicines for select using (true);
    end if;
    if not exists (select * from pg_policies where policyname = 'Allow public insert on medicines' and tablename = 'medicines') then
        create policy "Allow public insert on medicines" on public.medicines for insert with check (true);
    end if;
    if not exists (select * from pg_policies where policyname = 'Allow public update on medicines' and tablename = 'medicines') then
        create policy "Allow public update on medicines" on public.medicines for update using (true);
    end if;
    if not exists (select * from pg_policies where policyname = 'Allow public delete on medicines' and tablename = 'medicines') then
        create policy "Allow public delete on medicines" on public.medicines for delete using (true);
    end if;
END
$$;

-- 4. Create the storage bucket for images
insert into storage.buckets (id, name, public)
values ('medicines-images', 'medicines-images', true)
on conflict (id) do nothing;

-- 5. Create storage policies to allow anonymous image uploads and reading
DO $$
BEGIN
    if not exists (select * from pg_policies where policyname = 'Allow public viewing of images' and tablename = 'objects') then
        create policy "Allow public viewing of images" on storage.objects for select using ( bucket_id = 'medicines-images' );
    end if;
    if not exists (select * from pg_policies where policyname = 'Allow public uploads of images' and tablename = 'objects') then
        create policy "Allow public uploads of images" on storage.objects for insert with check ( bucket_id = 'medicines-images' );
    end if;
END
$$;
