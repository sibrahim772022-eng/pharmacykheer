import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Medicine {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  expiryDate: string;
  ownerName: string;
  phone: string;
  city: string;
  createdAt: string;
}

// In-memory database
let medicines: Medicine[] = [
  {
    id: "1",
    name: "بنادول إكسترا",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5e4b6d43e?auto=format&fit=crop&q=80&w=400",
    description: "مسكن للآلام وخافض للحرارة، علبة شبه كاملة",
    expiryDate: "2026-10-01",
    ownerName: "أحمد محمد",
    phone: "0501234567",
    city: "الرياض",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "أوجمنتين 1 جم",
    imageUrl: "https://images.unsplash.com/photo-1550572017-edb7f2aebe16?auto=format&fit=crop&q=80&w=400",
    description: "مضاد حيوي واسع المجال، شريط واحد فقط",
    expiryDate: "2025-12-15",
    ownerName: "سارة خالد",
    phone: "0559876543",
    city: "جدة",
    createdAt: new Date().toISOString()
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---
  
  app.get('/api/medicines', (req, res) => {
    res.json(medicines.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post('/api/medicines', (req, res) => {
    const newMedicine: Medicine = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    medicines.push(newMedicine);
    res.status(201).json(newMedicine);
  });

  app.delete('/api/medicines/:id', (req, res) => {
    const { id } = req.params;
    medicines = medicines.filter(m => m.id !== id);
    res.json({ success: true });
  });

  app.get('/api/stats', (req, res) => {
    res.json({
      totalMedicines: medicines.length,
      recentDonations: medicines.slice(-5).length
    });
  });

  // --- Vite Middleware & Static Serving ---
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Determine dist directory handling __dirname differences in commonjs wrapper
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
