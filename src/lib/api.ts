import type { Medicine } from '../types';
import { supabase } from './supabase';

export async function getMedicines(): Promise<Medicine[]> {
  if (supabase) {
    const { data, error } = await supabase.from('medicines').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Medicine[];
  }
  const res = await fetch('/api/medicines');
  if (!res.ok) throw new Error('فشل في جلب الأدوية');
  return res.json();
}

export async function addMedicine(data: Omit<Medicine, 'id' | 'createdAt'>): Promise<Medicine> {
  if (supabase) {
    const { data: newMedicine, error } = await supabase.from('medicines').insert([data]).select().single();
    if (error) throw error;
    return newMedicine as Medicine;
  }
  const res = await fetch('/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('فشل في إضافة الدواء');
  return res.json();
}

export async function deleteMedicine(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const res = await fetch(`/api/medicines/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل في حذف الدواء');
}

export async function getStats(): Promise<{ totalMedicines: number, recentDonations: number }> {
  if (supabase) {
    const { data, error } = await supabase.from('medicines').select('createdAt', { count: 'exact' });
    if (error) throw error;
    
    const now = new Date();
    // Count donations in the last 7 days
    const recent = data?.filter(m => {
      const ms = now.getTime() - new Date(m.createdAt).getTime();
      return ms < 7 * 24 * 60 * 60 * 1000;
    }).length || 0;

    return { totalMedicines: data?.length || 0, recentDonations: recent };
  }
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('فشل في جلب الإحصائيات');
  return res.json();
}
