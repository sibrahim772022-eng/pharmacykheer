import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMedicines, getStats, deleteMedicine } from '../lib/api';
import type { Medicine } from '../types';
import toast from 'react-hot-toast';
import { TrendingUp, Package, Loader2, AlertCircle, MapPin, Calendar, User, Phone, X, CheckCircle2, Download } from 'lucide-react';
import { safeFormatDistanceToNow } from '../lib/dateUtils';

export default function AdminDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState({ totalMedicines: 0, recentDonations: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, statsRes] = await Promise.allSettled([getMedicines(), getStats()]);
      
      const meds = medsRes.status === 'fulfilled' ? medsRes.value : [];
      const statsObj = statsRes.status === 'fulfilled' ? statsRes.value : { totalMedicines: 0, recentDonations: 0 };
      
      setMedicines(meds);
      setStats(statsObj);
      
      if (medsRes.status === 'rejected' || statsRes.status === 'rejected') {
        console.error('Partial fetch failure:', medsRes, statsRes);
      }
    } catch (error) {
      console.error('General fetch error:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (id: string) => {
    console.log('Complete order confirmed for ID:', id);
    setIsCompleting(true);
    try {
      console.log('Starting deletion process...');
      await deleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setStats((prev) => ({ ...prev, totalMedicines: Math.max(0, prev.totalMedicines - 1) }));
      setSelectedMedicine(null);
      setShowConfirm(false);
      toast.success('تم إتمام الطلب وحذف البيانات بنجاح', { icon: '✅' });
    } catch (error) {
      console.error('Error in handleCompleteOrder:', error);
      toast.error('حدث خطأ أثناء اتمام الطلب');
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">الأدوية المتاحة</h1>
          <p className="text-slate-500 font-medium">مراقبة وعرض تفاصيل الأدوية المرفوعة في المنصة</p>
        </div>
        <a 
          href="https://median.co/share/xlpxxwy#apk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Download className="w-5 h-5" />
          تحميل التطبيق
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">إجمالي الأدوية المتاحة</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.totalMedicines}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">أُضيفت مؤخراً (آخر 7 أيام)</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.recentDonations}</h3>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">سجل الأدوية المرفوعة</h2>
        </div>
        
        {medicines.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-500">
            <AlertCircle className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium">لا توجد أدوية في قاعدة البيانات حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4 font-bold border-b border-slate-100 w-16">#</th>
                  <th className="p-4 font-bold border-b border-slate-100">الاسم والدواء</th>
                  <th className="p-4 font-bold border-b border-slate-100">المدينة</th>
                  <th className="p-4 font-bold border-b border-slate-100">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {medicines.map((medicine, index) => (
                  <motion.tr 
                    key={medicine.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <td className="p-4 text-slate-400 font-medium">{index + 1}</td>
                     <td className="p-4">
                      <div className="flex items-center gap-3">
                         <img src={medicine.image_urls?.[0]} alt={medicine.drug_name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{medicine.drug_name}</p>
                          <p className="text-[10px] text-slate-500">{medicine.donator_name} - <span dir="ltr" className="inline-block">{medicine.phone_number}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700 text-sm">{medicine.address?.split('-')[0] || 'غير محدد'}</td>
                    <td className="p-4 text-xs text-slate-500">
                      {safeFormatDistanceToNow(medicine.created_at)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
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
                      تنبيه هام ومباشر: نرجو الضغط على "إتمام الطلب" فقط <span className="underline">بعد تأكيد الاستلام</span> من المتبرع، حيث سيتم حذف الدواء نهائياً من القائمة.
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
                    إتمام الطلب والمطابقة
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(selectedMedicine.id)}
                      disabled={isCompleting}
                      className="bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد الحذف النهائي'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      disabled={isCompleting}
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
