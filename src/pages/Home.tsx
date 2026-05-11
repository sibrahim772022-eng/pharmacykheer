import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Search, Pill, MapPin, Calendar, User, Phone, CheckCircle2, ChevronRight, Loader2, X, AlertCircle } from 'lucide-react';
import { getMedicines, deleteMedicine } from '../lib/api';
import type { Medicine } from '../types';
import toast from 'react-hot-toast';
import { safeFormatDistanceToNow } from '../lib/dateUtils';

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الأدوية');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (id: string) => {
    console.log('Order confirmed for ID:', id);
    setIsOrdering(true);
    try {
      await deleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setSelectedMedicine(null);
      setShowConfirm(false);
      toast.success('تم طلب الدواء بنجاح!', { icon: '🎉' });
    } catch (error) {
      toast.error('حدث خطأ أثناء طلب الدواء');
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      (m.drug_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner Bento */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center shadow-xl shadow-primary-500/10">
        <div className="relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-4 border border-white/10">
              معاً لحياة أفضل
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 tracking-tight">
              شارك الفائض،<br /> ازرع الأمل.
            </h1>
            <p className="text-lg md:text-xl text-primary-100 opacity-90 max-w-md leading-relaxed">
              منصتنا تجمع القلوب الرحيمة، تبرع بأدويتك الفائضة لتصل لمن هم في أمس الحاجة إليها.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-8">
            <Link to="/add" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <PlusCircle className="w-5 h-5" />
              أضف دواء الآن
            </Link>
          </motion.div>
        </div>
        <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-primary-500 rounded-full opacity-30 blur-3xl hidden md:block"></div>
        <div className="absolute right-10 -top-10 w-48 h-48 bg-primary-400 rounded-full opacity-20 blur-2xl hidden md:block"></div>
      </section>

      {/* Search Bar matching Bento header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="text-primary-500 w-6 h-6" />
            الأدوية المتاحة للتبرع
          </h2>
          
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث باسم الدواء أو المدينة..."
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 placeholder-slate-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Content Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary-500" />
            <p className="font-medium">جاري تحميل الأدوية...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Pill className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد أدوية متاحة</h3>
            <p className="text-slate-500 max-w-md mx-auto">لم يتم العثور على أدوية مطابقة لبحثك، أو لم يتم إضافة أي أدوية بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMedicines.map((medicine) => (
                <motion.div
                  key={medicine.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-primary-200 transition-all cursor-pointer group flex flex-col gap-3"
                  onClick={() => setSelectedMedicine(medicine)}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden relative shadow-sm">
                      <img
                        src={medicine.image_urls?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400'}
                        alt={medicine.drug_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{medicine.drug_name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{medicine.quantity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {medicine.address?.split('-')[0] || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <button className="w-full text-xs py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-colors">
                      عرض التفاصيل
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Details */}
      <AnimatePresence>
        {selectedMedicine && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedicine(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedMedicine(null)}
                className="absolute top-4 left-4 p-2 bg-slate-100/80 backdrop-blur hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="w-full sm:w-40 space-y-2">
                    <div className="w-full aspect-square bg-slate-50 rounded-[2rem] border border-slate-100 shrink-0 overflow-hidden relative shadow-inner">
                      <img
                        src={selectedMedicine.image_urls?.[0]}
                        alt={selectedMedicine.drug_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedMedicine.image_urls && selectedMedicine.image_urls.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedMedicine.image_urls.slice(1, 5).map((url, i) => (
                           <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-100">
                             <img src={url} className="w-full h-full object-cover" />
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">{selectedMedicine.drug_name}</h2>
                    <div className="flex flex-wrap gap-2 text-sm font-bold">
                      <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                        {selectedMedicine.quantity}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-slate-500 font-medium">
                      <MapPin className="w-4 h-4 text-primary-500"/>
                      <span>{selectedMedicine.address}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl space-y-1 border border-slate-100">
                    <span className="text-slate-500 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                      <User className="w-4 h-4"/> المُتبرع
                    </span>
                    <p className="text-slate-800 font-black text-lg">{selectedMedicine.donator_name}</p>
                  </div>
                  <div className="bg-primary-600 p-5 rounded-3xl space-y-1 shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors">
                    <span className="text-white/70 text-xs font-bold flex items-center gap-1">
                      <Phone className="w-4 h-4"/> رقم التواصل (اضغط للاتصال)
                    </span>
                    <a href={`tel:${selectedMedicine.phone_number}`} className="text-white font-black text-xl text-right block w-full outline-none" dir="ltr">
                      {selectedMedicine.phone_number}
                    </a>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 transition-all">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 leading-relaxed font-bold">
                      تنبيه هام: نرجو الضغط على "طلب الدواء" فقط <span className="underline">بعد تأكيد الاستلام</span> من المتبرع، حيث سيتم حذف الدواء من القائمة لضمان عدم ازدواجية الطلبات.
                    </p>
                    {showConfirm && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-red-600 font-black mt-3"
                      >
                        تأكيد نهائي: سيتم اعتبار الطلب مكتملاً وحذف البيانات. هل أنت متأكد؟
                      </motion.p>
                    )}
                  </div>
                </div>

                {!showConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    طلب هذا الدواء الآن
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleOrder(selectedMedicine.id)}
                      disabled={isOrdering}
                      className="bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد وحذف'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      disabled={isOrdering}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black py-5 rounded-2xl transition-all"
                    >
                      إلغاء التراجع
                    </button>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 text-center font-medium">
                  تمت الإضافة في: {new Date(selectedMedicine.created_at).toLocaleDateString('ar-SA')} ({safeFormatDistanceToNow(selectedMedicine.created_at)})
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
