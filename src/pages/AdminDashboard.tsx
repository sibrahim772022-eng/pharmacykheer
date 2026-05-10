import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMedicines, getStats, deleteMedicine } from '../lib/api';
import type { Medicine } from '../types';
import toast from 'react-hot-toast';
import { TrendingUp, Package, Loader2, AlertCircle, MapPin, Calendar, User, Phone, X, CheckCircle2 } from 'lucide-react';
import { safeFormatDistanceToNow } from '../lib/dateUtils';

export default function AdminDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState({ totalMedicines: 0, recentDonations: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

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
    if (!window.confirm('هل أنت متأكد من إتمام هذا الطلب؟ سيتم حذف بيانات الدواء نهائياً من المنصة.')) {
      return;
    }
    
    setIsCompleting(true);
    try {
      await deleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      setStats((prev) => ({ ...prev, totalMedicines: prev.totalMedicines - 1 }));
      setSelectedMedicine(null);
      toast.success('تم تسليم الدواء وحذفه بنجاح', { icon: '✅' });
    } catch (error) {
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">الأدوية المتاحة</h1>
        <p className="text-slate-500 font-medium">مراقبة وعرض تفاصيل الأدوية المرفوعة في المنصة</p>
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
                        <img src={medicine.imageUrl} alt={medicine.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{medicine.name}</p>
                          <p className="text-xs text-slate-500">{medicine.ownerName} - <span dir="ltr" className="inline-block">{medicine.phone}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700 text-sm">{medicine.city}</td>
                    <td className="p-4 text-xs text-slate-500">
                      {safeFormatDistanceToNow(medicine.createdAt)}
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
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-32 h-32 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 overflow-hidden relative">
                    <img
                      src={selectedMedicine.imageUrl}
                      alt={selectedMedicine.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedMedicine.name}</h2>
                    <div className="flex flex-wrap gap-3 text-sm font-medium">
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100"><MapPin className="w-4 h-4"/> {selectedMedicine.city}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-1 border border-slate-100">
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1"><User className="w-4 h-4"/> المُتبرع</span>
                    <p className="text-slate-800 font-bold">{selectedMedicine.ownerName}</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-2xl space-y-1 border border-primary-100 hover:bg-primary-100 transition-colors">
                    <span className="text-primary-700/70 text-xs font-medium flex items-center gap-1"><Phone className="w-4 h-4"/> رقم التواصل (اضغط للاتصال)</span>
                    <a href={`tel:${selectedMedicine.phone}`} className="text-primary-700 font-bold text-right block w-full outline-none" dir="ltr">{selectedMedicine.phone}</a>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  أُضيف {safeFormatDistanceToNow(selectedMedicine.createdAt)}
                </p>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed font-medium">
                    تنبيه: نرجو الضغط على "تم الطلب والمطابقة" فقط <span className="font-bold underline">بعد استلامك للدواء</span> فعلياً من المتبرع، حيث سيتم حذف الدواء من المنصة مباشرة.
                  </p>
                </div>

                <button
                  onClick={() => handleCompleteOrder(selectedMedicine.id)}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  {isCompleting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      تم الطلب والمطابقة
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
