import { Link, Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, PlusCircle, LayoutDashboard, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: HeartPulse },
    { name: 'إضافة دواء', path: '/add', icon: PlusCircle },
    { name: 'الأدوية المتاحة', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-tajawal bg-[#f8fafc] text-slate-800 selection:bg-primary-500 selection:text-white overflow-hidden">
      {/* Mobile Header (App-like) */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm p-4 flex justify-center items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-500/30">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-800">صيدلية <span className="text-primary-600">الخير</span></span>
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 p-6 shrink-0 h-screen overflow-y-auto">
        <Link to="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">صيدلية <span className="text-primary-600">الخير</span></h1>
        </Link>

        <nav className="flex-1 space-y-2 relative">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors relative ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {isActive && <span className="absolute right-3 w-2 h-2 rounded-full bg-primary-600"></span>}
                <link.icon className={`w-5 h-5 ${isActive ? 'mr-3' : ''}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="p-4 bg-primary-900 rounded-2xl text-white">
            <p className="text-xs opacity-70 mb-2">تبرعك قد ينقذ حياة</p>
            <Link to="/add" className="flex items-center justify-center w-full py-2 bg-primary-500 hover:bg-primary-400 rounded-lg text-sm font-bold transition-colors">
              إضافة دواء الآن
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 h-[calc(100vh-130px)] md:h-screen overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-6 py-3 pb-safe">
        <ul className="flex items-center justify-between">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path} className="flex-1">
                <Link
                  to={link.path}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all ${
                    isActive ? 'text-primary-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary-50' : ''}`}>
                    <link.icon className={`w-6 h-6 ${isActive ? 'fill-primary-100' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-primary-700' : ''}`}>
                    {link.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
