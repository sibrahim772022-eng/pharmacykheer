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
      drug_name: "بنادول إكسترا",
      image_urls: ["https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400"],
      donator_name: "أحمد محمد",
      phone_number: "0501234567",
      address: "الرياض، حي النرجس",
      quantity: "2 علبة",
      status: "available",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      drug_name: "أوجمنتين 1 جم",
      image_urls: ["https://images.unsplash.com/photo-1550572017-edb7f2aebe16?auto=format&fit=crop&q=80&w=400"],
      donator_name: "سارة خالد",
      phone_number: "0559876543",
      address: "جدة، حي الروضة",
      quantity: "1 علبة",
      status: "available",
      created_at: new Date().toISOString()
    }
  ]);
}

export async function getMedicines(): Promise<Medicine[]> {
  let allMeds: Medicine[] = [];
  const localMeds = getLocalMedicines();

  try {
    if (supabase) {
      const { data, error } = await supabase.from('medicines').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase Fetch Error:', error);
      } else if (data) {
        // Map data to ensure all fields exist (graceful fallback for all historical schemas)
        allMeds = data.map((item: any) => ({
          ...item,
          drug_name: item.drug_name || item.name || 'دواء غير مسمى',
          address: item.address || item.city || 'غير محدد',
          donator_name: item.donator_name || item.donator || item.ownerName || 'متبرع',
          phone_number: item.phone_number || item.phone || '',
          image_urls: item.image_urls || [item.image_url || item.image || item.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400'],
          created_at: item.created_at || item.createdAt || new Date().toISOString()
        })) as Medicine[];
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
  
  for (const localItem of localMeds) {
    const local = {
      ...localItem,
      drug_name: localItem.drug_name || (localItem as any).name || (localItem as any).drug_name || 'دواء غير مسمى',
      address: localItem.address || (localItem as any).city || 'غير محدد',
      donator_name: localItem.donator_name || (localItem as any).donator || (localItem as any).donator_name || (localItem as any).ownerName || 'متبرع',
      phone_number: localItem.phone_number || (localItem as any).phone || (localItem as any).phone_number || '',
      image_urls: localItem.image_urls || [(localItem as any).image_url || (localItem as any).image || (localItem as any).imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400'],
      created_at: localItem.created_at || (localItem as any).createdAt || new Date().toISOString()
    } as Medicine;

    if (!existingIds.has(local.id)) {
      combined.push(local);
    }
  }
  
  return combined.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

export async function addMedicine(data: Omit<Medicine, 'id' | 'created_at'>): Promise<Medicine> {
  const newLocalMed: Medicine = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data: newMedicine, error } = await supabase
        .from('medicines')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Supabase Add Error Details:', error);
        toast.error(`لم يتم الرفع للسحابة: ${error.message}. سيتم الحفظ محلياً حالياً.`);
      } else if (newMedicine) {
        return newMedicine as Medicine;
      }
    } catch (e: any) {
      console.error('Supabase Add Exception:', e);
      toast.error('فشل الاتصال بـ Supabase. سيتم الحفظ محلياً.');
    }
  }

  const list = getLocalMedicines();
  list.push(newLocalMed);
  saveLocalMedicines(list);
  return newLocalMed;
}

export async function deleteMedicine(id: string): Promise<void> {
  const list = getLocalMedicines().filter(m => m.id !== id);
  saveLocalMedicines(list);

  if (supabase) {
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) {
        console.error('Supabase Delete Error:', error);
      }
    } catch (e) {
      console.error('Supabase Delete Exception:', e);
    }
  }
}

export async function getStats(): Promise<{ totalMedicines: number, recentDonations: number }> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('medicines').select('created_at');
      if (error) {
        console.error('Supabase Stats Error:', error);
      } else if (data) {
        const now = new Date();
        const recent = data.filter(m => {
          if (!m.created_at) return false;
          const date = new Date(m.created_at);
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
  
  const list = getLocalMedicines();
  const now = new Date();
  const recent = list.filter(m => {
    if (!m.created_at) return false;
    const date = new Date(m.created_at);
    if (isNaN(date.getTime())) return false;
    const ms = now.getTime() - date.getTime();
    return ms < 7 * 24 * 60 * 60 * 1000;
  }).length;
  
  return { totalMedicines: list.length, recentDonations: recent };
}
