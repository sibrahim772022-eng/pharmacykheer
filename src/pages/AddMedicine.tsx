import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pill, Image as ImageIcon, CheckCircle2, Loader2, MapPin, Phone, User, FileText, X, PlusCircle } from 'lucide-react';
import { addMedicine } from '../lib/api';
import type { Medicine } from '../types';
import { motion } from 'motion/react';

type FormData = Omit<Medicine, 'id' | 'created_at' | 'status' | 'image_urls'>;

export default function AddMedicine() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const f = file as File;
        if (f.size > 2 * 1024 * 1024) {
          toast.error(`حجم الصورة ${f.name} كبير جداً، أقصى حجم 2 ميجابايت`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(f);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (imageUrls.length === 0) {
      toast.error('يرجى رفع صورة واحدة على الأقل');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        image_urls: imageUrls,
        status: 'available'
      };
      
      await addMedicine(payload as any);
      toast.success('تمت إضافة الدواء بنجاح!', { icon: '💚' });
      navigate('/');
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع بيانات الدواء');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-sm";
  const labelClasses = "block text-xs font-bold text-slate-600 mb-1.5";
  const iconClasses = "absolute top-3 w-4 h-4 text-slate-400";

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary-600 to-indigo-800 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Pill className="w-16 h-16 mb-4 text-white/20" />
            <h1 className="text-4xl font-black tracking-tight mb-3">إضافة دواء للتبرع</h1>
            <p className="text-primary-100 font-medium text-lg leading-relaxed max-w-lg">
              تبرعك قد يكون سبباً في شفاء إنسان. أدخل البيانات بدقة للمساعدة في مطابقة الدواء مع المحتاجين.
            </p>
          </div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-10 -top-10 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-12 space-y-10">
          {/* Section 1: Medicine Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">بيانات الدواء الرئيسية</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClasses}>اسم الدواء</label>
                <div className="relative">
                  <input
                    {...register('drug_name', { required: 'اسم الدواء مطلوب' })}
                    className={`${inputClasses} ${errors.drug_name ? 'border-red-500' : ''}`}
                    placeholder="مثال: بنادول، أوجمنتين"
                  />
                  <Pill className={iconClasses + " right-3"} />
                </div>
                {errors.drug_name && <p className="text-red-500 text-[10px] mt-1">{errors.drug_name.message}</p>}
              </div>

              <div className="relative">
                <label className={labelClasses}>الكمية</label>
                <div className="relative">
                  <input
                    {...register('quantity', { required: 'الكمية مطلوبة' })}
                    className={`${inputClasses} ${errors.quantity ? 'border-red-500' : ''}`}
                    placeholder="مثال: علبة واحدة، 10 كبسولات"
                  />
                  <FileText className={iconClasses + " right-3"} />
                </div>
                {errors.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.quantity.message}</p>}
              </div>
            </div>
          </section>

          {/* Section 2: Contact Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">بيانات المتبرع والتوصيل</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClasses}>اسم المتبرع</label>
                <div className="relative">
                  <input
                    {...register('donator_name', { required: 'الاسم مطلوب' })}
                    className={`${inputClasses} ${errors.donator_name ? 'border-red-500' : ''}`}
                    placeholder="الاسم الكامل أو الكنية"
                  />
                  <User className={iconClasses + " right-3"} />
                </div>
                {errors.donator_name && <p className="text-red-500 text-[10px] mt-1">{errors.donator_name.message}</p>}
              </div>

              <div className="relative">
                <label className={labelClasses}>رقم الهاتف للتواصل</label>
                <div className="relative">
                  <input
                    {...register('phone_number', { required: 'رقم الهاتف مطلوب' })}
                    className={`${inputClasses} dir-ltr text-right ${errors.phone_number ? 'border-red-500' : ''}`}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                  <Phone className={iconClasses + " right-3"} />
                </div>
                {errors.phone_number && <p className="text-red-500 text-[10px] mt-1 text-right">{errors.phone_number.message}</p>}
              </div>

              <div className="relative md:col-span-2">
                <label className={labelClasses}>العنوان (المدينة والحي)</label>
                <div className="relative">
                  <input
                    {...register('address', { required: 'العنوان مطلوب' })}
                    className={`${inputClasses} ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="مثال: الرياض - حي الرحمانية شارع التخصصي"
                  />
                  <MapPin className={iconClasses + " right-3"} />
                </div>
                {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </section>

          {/* Section 3: Images */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">صور الدواء</h3>
            </div>

            <div className="space-y-4">
              <label className={labelClasses}>صور الدواء (يمكنك رفع أكثر من صورة)</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-slate-100">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-slate-100 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-all">
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <PlusCircle className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold">إضافة صورة</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              
              <p className="text-[10px] text-slate-400 italic font-medium">يفضل رفع صور واضحة تظهر اسم الدواء وتفاصيله من زوايا مختلفة.</p>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-7 h-7" />
                إتمام رفع التبرع الآن
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
