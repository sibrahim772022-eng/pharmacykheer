import type { Medicine } from '../types';
import { supabase } from './supabase';
import toast from 'react-hot-toast';

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
  let allMeds: Medicine[] = [];
  const localMeds = getLocalMedicines();

  try {
    if (supabase) {
      const { data, error } = await supabase.from('medicines').select('*').order('createdAt', { ascending: false });
      if (error) {
        console.error('Supabase Fetch Error:', error);
      } else if (data) {
        allMeds = data as Medicine[];
      }
    }
  } catch (e) {
    console.error('Supabase getMedicines Exception:', e);
  }
  
  // If we got nothing from Supabase, try the backend
  if (allMeds.length === 0) {
    try {
      const res = await fetch('/api/medicines');
      if (res.ok) {
        allMeds = await res.json();
      }
    } catch (e) {
      console.warn("Backend not found or failing");
    }
  }
  
  // Combine with local storage to ensure users don't "lose" data they just added (deduplicating by ID)
  const combined = [...allMeds];
  const existingIds = new Set(allMeds.map(m => m.id));
  
  for (const local of localMeds) {
    if (!existingIds.has(local.id)) {
      combined.push(local);
    }
  }
  
  return combined.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

export async function addMedicine(data: Omit<Medicine, 'id' | 'createdAt'>): Promise<Medicine> {
  const newLocalMed: Medicine = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      // Explicitly map keys to match the quoted column names in Postgres if necessary
      const payload = {
        name: data.name,
        imageUrl: data.imageUrl,
        ownerName: data.ownerName,
        phone: data.phone,
        city: data.city
      };

      const { data: newMedicine, error } = await supabase
        .from('medicines')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase Add Error Details:', error);
        toast.error(`لم يتم الرفع للسحابة: ${error.message}. سيتم الحفظ محلياً حالياً.`);
        // Fallback to local
      } else if (newMedicine) {
        return newMedicine as Medicine;
      }
    } catch (e: any) {
      console.error('Supabase Add Exception:', e);
      toast.error('فشل الاتصال بـ Supabase. سيتم الحفظ محلياً.');
    }
  }

  // Always save to local storage as a safety net if we haven't returned yet
  const list = getLocalMedicines();
  list.push(newLocalMed);
  saveLocalMedicines(list);
  return newLocalMed;
}

export async function deleteMedicine(id: string): Promise<void> {
  // Always clean up local storage
  const list = getLocalMedicines().filter(m => m.id !== id);
  saveLocalMedicines(list);

  if (supabase) {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) {
        console.error('Supabase Delete Error:', error);
        // We don't throw here to allow the local deletion to be considered a success for the UI
      }
    } catch (e) {
      console.error('Supabase Delete Exception:', e);
    }
  }
  
  try {
    await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
  } catch (e) {}
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
