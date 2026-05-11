# دليل تشغيل البرنامج وحل المشكلات (Vercel & Supabase)

## 1. حل مشكلة "البيانات لا ترفع" في Vercel
السبب الرئيسي هو عدم تعرف البرنامج على قاعدة بيانات Supabase الخارجية.
**الحل:**
1. اذهب لمشروعك في Vercel ثم اذهب لـ **Settings > Environment Variables**.
2. أضف المتغيرين التاليين (تأكد من كتابة الأسماء بدقة):
   - `VITE_SUPABASE_URL`: (تجد رابط API في إعدادات Supabase).
   - `VITE_SUPABASE_ANON_KEY`: (تجد مفتاح anon key في إعدادات Supabase).
3. بعد الإضافة، قم بإعادة بناء المشروع (Redeploy) في Vercel ليتم تفعيلها.

## 2. جدول البيانات SQL (كامل وبدون أخطاء)
انسخ هذا الكود بالكامل في **SQL Editor** في Supabase وقم بتشغيله:

```sql
-- 1. إنشاء الجدول
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

-- 2. إعداد الحماية
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- 3. السماح بالوصول العام (لغرض العرض)
DROP POLICY IF EXISTS "Public Access" ON medicines;
CREATE POLICY "Public Access" ON medicines FOR ALL TO public USING (true) WITH CHECK (true);
```

## 3. مشكلة "الأزرار غير فعالة"
- تم حل هذه المشكلة برمجياً عبر استبدال نافذة التأكيد (window.confirm) بنظام تأكيد داخلي في الواجهة، لأن بعض المتصفحات والبيئات البرمجية تمنع النوافذ المنبثقة.
- الأزرار الآن تعمل مباشرة وتطلب التأكيد داخل الصفحة لضمان الاستجابة.
