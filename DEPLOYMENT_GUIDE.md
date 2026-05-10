# دليل تشغيل البرنامج على Vercel و Supabase

لكي يعمل البرنامج بشكل صحيح عند رفعه على Vercel، يجب اتباع الخطوات التالية:

## 1. إعداد متغيرات البيئة (Environment Variables) في Vercel
يجب إضافة القيم التالية في إعدادات مشروعك على Vercel (Settings > Environment Variables):

1. **VITE_SUPABASE_URL**: رابط مشروع Supabase الخاص بك.
2. **VITE_SUPABASE_ANON_KEY**: المفتاح العام (anon key) الخاص بمشروعك.

**ملاحظة:** تأكد من أن الأسماء تبدأ بـ `VITE_` لكي يتمكن Vite من الوصول إليها في المتصفح.

## 2. إعداد قاعدة البيانات (SQL)
قم بنسخ هذا الكود وتشغيله في **SQL Editor** داخل Supabase:

```sql
-- حذف الجدول القديم إذا وجد لإنشاء الهيكل الجديد المتوافق
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

-- تفعيل الحماية والسماح بالوصول العام (مؤقتاً للتشغيل)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all" ON medicines FOR ALL USING (true) WITH CHECK (true);
```

## 3. لماذا لا تعمل البيانات في Vercel حالياً؟
إذا كنت ترفع الكود لـ Vercel وترى البرنامج يعمل ولكن البيانات لا تظهر، فالسبب هو:
- عدم إضافة المفاتيح المذكورة في الخطوة رقم 1 في لوحة تحكم Vercel.
- البرنامج في بيئة العمل (AI Studio) يستخدم مفاتيح مخفية قمت بإعدادها لك، ولكن عند نقله لـ Vercel يجب إعدادها يدوياً هناك.
