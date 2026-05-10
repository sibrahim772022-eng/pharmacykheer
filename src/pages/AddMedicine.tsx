import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pill, Image as ImageIcon, CheckCircle2, Loader2, MapPin, Phone, User, Calendar, FileText, X } from 'lucide-react';
import { addMedicine } from '../lib/api';
import type { Medicine } from '../types';
import { motion } from 'motion/react';

type FormData = Omit<Medicine, 'id' | 'createdAt'>;

export default function AddMedicine() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  const [imageBase64, setImageBase64] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً، أقصى حجم 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      data.imageUrl = imageBase64 || 'https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400';
      
      await addMedicine(data);
      toast.success('تمت إضافة الدواء بنجاح!', { icon: '💚' });
      navigate('/');
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع بيانات الدواء');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-3 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5";
  const iconClasses = "absolute top-3.5 right-3 w-5 h-5 text-slate-400";

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 sm:p-10 text-white text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="relative z-10 space-y-2">
            <Pill className="w-12 h-12 mx-auto mb-4 text-primary-200" />
            <h1 className="text-3xl font-bold tracking-tight">إضافة دواء للتبرع</h1>
            <p className="text-primary-100/90 font-medium leading-relaxed">خطوة بسيطة منك قد تنقذ حياة مريض،<br/>أدخل بيانات الدواء بعناية.</p>
          </div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute right-10 -top-10 w-32 h-32 bg-primary-400 rounded-full opacity-20 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-10 space-y-8">
          {/* Main Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">بيانات الدواء</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClasses}>اسم الدواء</label>
                <div className="relative">
                  <input
                    {...register('name', { required: 'اسم الدواء مطلوب' })}
                    className={`${inputClasses} ${errors.name ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="مثل: بنادول إكسترا"
                  />
                  <Pill className={iconClasses} />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="relative">
                <label className={labelClasses}>تاريخ الانتهاء</label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('expiryDate', { required: 'تاريخ الانتهاء مطلوب' })}
                    className={`${inputClasses} ${errors.expiryDate ? 'border-red-500' : ''}`}
                    placeholder="مثال: شهر 10 سنة 2025 أو 2025/10"
                  />
                  <Calendar className={iconClasses} />
                </div>
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
              </div>

              <div className="relative md:col-span-2">
                <label className={labelClasses}>صورة الدواء (اختياري)</label>
                <div className="relative flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="mb-2 text-sm text-slate-500 font-bold">اضغط لرفع صورة الدواء</p>
                      <p className="text-xs text-slate-400">PNG, JPG, JPEG (الحد الأقصى 5 ميجابايت)</p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imageBase64 && (
                  <div className="mt-4 relative rounded-xl overflow-hidden h-40 bg-slate-50 flex items-center justify-center border border-slate-200">
                    <img src={imageBase64} alt="معاينة" className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setImageBase64('')}
                      className="absolute top-2 right-2 bg-red-500/80 backdrop-blur text-white p-1.5 rounded-lg hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">بيانات التواصل</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClasses}>اسم صاحب الدواء</label>
                <div className="relative">
                  <input
                    {...register('ownerName', { required: 'اسمك مطلوب' })}
                    className={`${inputClasses} ${errors.ownerName ? 'border-red-500' : ''}`}
                    placeholder="الاسم الثلاثي أو المستعار"
                  />
                  <User className={iconClasses} />
                </div>
                {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>}
              </div>

              <div className="relative">
                <label className={labelClasses}>المدينة أو المنطقة</label>
                <div className="relative">
                  <input
                    {...register('city', { required: 'المدينة مطلوبة' })}
                    className={`${inputClasses} ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="مثل: الرياض، حي الياسمين"
                  />
                  <MapPin className={iconClasses} />
                </div>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>

              <div className="relative md:col-span-2">
                <label className={labelClasses}>رقم الهاتف</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-slate-200 bg-slate-100 text-slate-500 font-bold dir-ltr">
                    +966
                  </span>
                  <input
                    {...register('phone', { required: 'رقم الهاتف مطلوب' })}
                    className={`block w-full pl-3 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-l-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-left dir-ltr ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="5X XXX XXXX"
                    dir="ltr"
                  />
                  <Phone className={`${iconClasses} left-3 right-auto`} />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1 text-right">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                رفع البيانات الآن
                <CheckCircle2 className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
