import type { Medicine } from '../types';
import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'khair_pharmacy_medicines';

function getLocalMedicines(): Medicine[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalMedicines(medicines: Medicine[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(medicines));
}

// Ensure mock data exists
if (getLocalMedicines().length === 0) {
  saveLocalMedicines([
    {
      id: "1",
      name: "بنادول إكسترا",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400",
      ownerName: "أحمد محمد",
      phone: "0501234567",
      city: "الرياض",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "أوجمنتين 1 جم",
      imageUrl: "https://images.unsplash.com/photo-1550572017-edb7f2aebe16?auto=format&fit=crop&q=80&w=400",
      ownerName: "سارة خالد",
      phone: "0559876543",
      city: "جدة",
      createdAt: new Date().toISOString()
    }
  ]);
}

export async function getMedicines(): Promise<Medicine[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('medicines').select('*').order('createdAt', { ascending: false });
      if (error) {
        console.error('Supabase Fetch Error:', error);
      } else if (data) {
        return data as Medicine[];
      }
    }
  } catch (e) {
    console.error('Supabase getMedicines Exception:', e);
  }
  
  try {
    const res = await fetch('/api/medicines');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend not found, using localStorage");
  }
  
  return getLocalMedicines().sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function addMedicine(data: Omit<Medicine, 'id' | 'createdAt'>): Promise<Medicine> {
  if (supabase) {
    try {
      const { data: newMedicine, error } = await supabase.from('medicines').insert([data as any]).select().single();
      if (error) {
        console.error('Supabase Add Error:', error);
        // If it's a PGRST116 error, it might mean the insert worked but we can't select it back due to RLS
        if (error.code === 'PGRST116') {
          return {
            ...data,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString()
          } as Medicine;
        }
        throw new Error(error.message || 'حدث خطأ أثناء الرفع إلى Supabase');
      }
      return newMedicine as Medicine;
    } catch (e: any) {
      console.error('Supabase Add Exception:', e);
      throw e;
    }
  }

  try {
    const res = await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {}

  const newMedicine: Medicine = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString()
  };
  const list = getLocalMedicines();
  list.push(newMedicine);
  saveLocalMedicines(list);
  return newMedicine;
}

export async function deleteMedicine(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error:', error);
      throw error;
    }
    return;
  }
  
  try {
    const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (e) {}

  const list = getLocalMedicines().filter(m => m.id !== id);
  saveLocalMedicines(list);
}

export async function getStats(): Promise<{ totalMedicines: number, recentDonations: number }> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('medicines').select('createdAt');
      if (error) {
        console.error('Supabase Stats Error:', error);
      } else if (data) {
        const now = new Date();
        const recent = data.filter(m => {
          if (!m.createdAt) return false;
          const date = new Date(m.createdAt);
          if (isNaN(date.getTime())) return false;
          const ms = now.getTime() - date.getTime();
          return ms < 7 * 24 * 60 * 60 * 1000;
        }).length;

        return { totalMedicines: data.length, recentDonations: recent };
      }
    }
  } catch (e) {
    console.error('Stats Exception:', e);
  }
  
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  const list = getLocalMedicines();
  const now = new Date();
  const recent = list.filter(m => {
    if (!m.createdAt) return false;
    const date = new Date(m.createdAt);
    if (isNaN(date.getTime())) return false;
    const ms = now.getTime() - date.getTime();
    return ms < 7 * 24 * 60 * 60 * 1000;
  }).length;
  
  return { totalMedicines: list.length, recentDonations: recent };
}
