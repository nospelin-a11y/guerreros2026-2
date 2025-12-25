
import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  History, 
  Settings, 
  PlusCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'ranking', icon: Trophy, label: 'Ranking' },
    { id: 'new', icon: PlusCircle, label: 'Registro', primary: true },
    { id: 'history', icon: History, label: 'Historial' },
    { id: 'profile', icon: UserIcon, label: 'Perfil' },
    ...(user?.is_admin ? [{ id: 'admin', icon: Settings, label: 'Admin' }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 pb-28">
      <header className="sticky top-0 z-40 glass px-6 py-4 flex justify-between items-center rounded-b-[2rem] mb-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-700" alt="Avatar" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <UserIcon size={18} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic leading-none">
              G2026
            </h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
              {user?.name || 'Guerrero'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-all active:scale-90"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 px-4 max-w-lg mx-auto w-full page-transition">
        {children}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl border-slate-800/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.primary) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center -mt-10 h-16 w-16 rounded-full transition-all shadow-xl ${
                  isActive ? 'bg-orange-600 text-white ring-4 ring-slate-950 scale-110 shadow-orange-900/20' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Icon size={28} />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                isActive ? 'text-orange-500 bg-orange-500/10' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <Icon size={22} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
