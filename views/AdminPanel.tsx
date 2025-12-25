import React, { useState } from 'react';
import { AppState, User, Activity, Workout } from '../types';
import { supabase } from '../services/supabase';
import { 
  Users, 
  Zap, 
  ChevronRight, 
  UserPlus, 
  Save, 
  ShieldCheck,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  History,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface AdminPanelProps {
  state: AppState;
  onUpdateActivities: () => Promise<void>;
  onUpdateUsers: () => Promise<void>;
  onAddWorkout: (workout: any) => Promise<void>;
  onDeleteWorkout: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  state, 
  onUpdateActivities, 
  onUpdateUsers, 
  onAddWorkout,
  onDeleteWorkout
}) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'points' | 'users' | 'add_user' | 'add_workout' | 'user_history' | 'add_activity'>('menu');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editPointValue, setEditPointValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // States for new items
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [newActivity, setNewActivity] = useState({ name: '', points: '' });
  
  // Management states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedActId, setSelectedActId] = useState('');

  const handleUpdatePoints = async (id: string) => {
    const points = parseFloat(editPointValue);
    if (isNaN(points)) return;
    
    setLoading(true);
    const { error } = await supabase.from('activities').update({ points }).eq('id', id);
    if (!error) {
      await onUpdateActivities();
      setEditingActivityId(null);
    }
    setLoading(false);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseFloat(newActivity.points);
    if (!newActivity.name || isNaN(pts)) return;

    setLoading(true);
    const { error } = await supabase.from('activities').insert([{
      id: `act-${Date.now()}`,
      name: newActivity.name,
      points: pts
    }]);

    if (!error) {
      await onUpdateActivities();
      setNewActivity({ name: '', points: '' });
      setActiveSection('points');
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) return;
    
    setLoading(true);
    const { error } = await supabase.from('users').insert([{
      id: newUser.name, 
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      is_admin: false
    }]);

    if (!error) {
      await onUpdateUsers();
      setNewUser({ name: '', username: '', password: '' });
      setActiveSection('users');
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const handleAddExtraWorkout = async () => {
    if (!selectedUser || !selectedActId) return;
    const act = state.activities.find(a => a.id === selectedActId);
    if (!act) return;

    setLoading(true);
    const newWorkout = {
      user_id: selectedUser.id,
      activity_id: act.id,
      activity_name: act.name,
      points: act.points,
      date: new Date().toISOString()
    };

    await onAddWorkout(newWorkout);
    setLoading(false);
    setActiveSection('users');
    setSelectedUser(null);
    setSelectedActId('');
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar a este guerrero?")) {
      setLoading(true);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) await onUpdateUsers();
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm("¿Eliminar este entrenamiento de la base de datos?")) {
      setLoading(true);
      await onDeleteWorkout(id);
      setLoading(false);
    }
  };

  const renderPoints = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveSection('menu')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Admin</button>
          <ChevronRight size={14} className="text-slate-700" />
          <span className="text-white font-black uppercase text-[10px] tracking-widest">Baremo Puntos</span>
        </div>
        <button 
          onClick={() => setActiveSection('add_activity')}
          className="bg-orange-600/10 text-orange-500 p-2 rounded-xl border border-orange-500/20"
        >
          <Plus size={18} />
        </button>
      </div>

      {state.activities.map(act => (
        <div key={act.id} className="glass rounded-[1.5rem] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-500 flex items-center justify-center">
               <Zap size={20} />
             </div>
             <p className="font-bold text-slate-200 uppercase text-xs">{act.name}</p>
          </div>
          {editingActivityId === act.id ? (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.05" 
                value={editPointValue} 
                onChange={(e) => setEditPointValue(e.target.value)}
                className="w-16 bg-slate-900 border border-orange-600 rounded-xl px-2 py-1 text-white text-center text-xs"
                autoFocus
              />
              <button 
                onClick={() => handleUpdatePoints(act.id)}
                className="bg-orange-600 p-2 rounded-xl text-white"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-200 text-sm">{act.points} pts</span>
              <button 
                onClick={() => { setEditingActivityId(act.id); setEditPointValue(act.points.toString()); }}
                className="text-slate-600 hover:text-orange-500 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAddActivity = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 px-2">
        <button onClick={() => setActiveSection('points')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Puntos</button>
        <ChevronRight size={14} className="text-slate-700" />
        <span className="text-white font-black text-[10px] uppercase tracking-widest">Nuevo Deporte</span>
      </div>
      <form onSubmit={handleAddActivity} className="glass rounded-[2.5rem] p-8 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre del Deporte</label>
          <input 
            type="text" 
            placeholder="Ej: Natación" 
            value={newActivity.name}
            onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Puntos por Sesión</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="Ej: 1.0" 
            value={newActivity.points}
            onChange={(e) => setNewActivity({...newActivity, points: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-orange-600 h-16 rounded-[1.5rem] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-900/20 active:scale-95 transition-all mt-4"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "GUARDAR DEPORTE"}
        </button>
      </form>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2 mb-4 px-2">
        <button onClick={() => setActiveSection('menu')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Admin</button>
        <ChevronRight size={14} className="text-slate-700" />
        <span className="text-white font-black uppercase text-[10px] tracking-widest">Guerreros</span>
      </div>
      <button 
        onClick={() => setActiveSection('add_user')}
        className="w-full bg-orange-600 p-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-900/20"
      >
        <UserPlus size={20} /> Añadir Guerrero
      </button>
      {state.users.map(u => (
        <div key={u.id} className="glass rounded-[2rem] p-5 flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700 overflow-hidden">
                 {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
               </div>
               <div>
                 <p className="font-bold text-slate-200 text-sm uppercase">{u.name}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">@{u.username}</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
                {!u.is_admin && (
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
                {u.is_admin && <ShieldCheck size={18} className="text-orange-500" />}
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => { setSelectedUser(u); setActiveSection('add_workout'); }}
               className="bg-slate-800/50 p-3 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-700/50 hover:bg-slate-800 transition-all"
             >
               <Plus size={12} /> Entreno
             </button>
             <button 
               onClick={() => { setSelectedUser(u); setActiveSection('user_history'); }}
               className="bg-slate-800/50 p-3 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-700/50 hover:bg-slate-800 transition-all"
             >
               <History size={12} /> Gestionar
             </button>
           </div>
        </div>
      ))}
    </div>
  );

  const renderUserHistory = () => {
    const userWorkouts = state.workouts.filter(w => w.user_id === selectedUser?.id);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveSection('users')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Guerreros</button>
            <ChevronRight size={14} className="text-slate-700" />
            <span className="text-white font-black uppercase text-[10px] tracking-widest truncate max-w-[100px]">{selectedUser?.name}</span>
          </div>
          <button onClick={() => setActiveSection('users')} className="text-slate-500"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Historial de entrenos</p>
          {userWorkouts.length > 0 ? userWorkouts.map(w => (
            <div key={w.id} className="glass rounded-2xl p-4 flex items-center justify-between border-l-2 border-orange-600">
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase">{w.activity_name}</span>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase mt-1">
                  <Calendar size={10} />
                  {format(new Date(w.date), "d MMM, HH:mm", { locale: es })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-orange-500">+{w.points} pts</span>
                <button 
                  onClick={() => handleDeleteWorkout(w.id)}
                  disabled={loading}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors bg-slate-900 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 glass rounded-3xl opacity-50">
              <History size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-[9px] font-black uppercase text-slate-600">Sin entrenos registrados</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddUser = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 px-2">
        <button onClick={() => setActiveSection('users')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Guerreros</button>
        <ChevronRight size={14} className="text-slate-700" />
        <span className="text-white font-black text-[10px] uppercase tracking-widest">Nuevo Perfil</span>
      </div>
      <form onSubmit={handleAddUser} className="glass rounded-[2.5rem] p-8 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre</label>
          <input 
            type="text" 
            placeholder="Ej: Carlos" 
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Usuario</label>
          <input 
            type="text" 
            placeholder="Ej: carlitos" 
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contraseña</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-600"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-orange-600 h-16 rounded-[1.5rem] text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-900/20 active:scale-95 transition-all mt-4"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "CREAR GUERRERO"}
        </button>
      </form>
    </div>
  );

  const renderAddWorkout = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 px-2">
        <button onClick={() => setActiveSection('users')} className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Guerreros</button>
        <ChevronRight size={14} className="text-slate-700" />
        <span className="text-white font-black uppercase text-[10px] tracking-widest">Entreno Extra</span>
      </div>
      <div className="glass rounded-[2.5rem] p-8 space-y-6">
        <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Asignando esfuerzo a <span className="text-orange-500">{selectedUser?.name}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {state.activities.map(act => (
            <button
              key={act.id}
              onClick={() => setSelectedActId(act.id)}
              className={`p-4 rounded-2xl border-2 text-[10px] font-bold uppercase transition-all ${
                selectedActId === act.id 
                ? 'border-orange-600 bg-orange-600/10 text-orange-500' 
                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
              }`}
            >
              {act.name}
            </button>
          ))}
        </div>
        <button 
          onClick={handleAddExtraWorkout}
          disabled={!selectedActId || loading}
          className="w-full h-16 rounded-[1.5rem] bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-orange-900/20 disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "ASIGNAR PUNTOS"}
        </button>
      </div>
    </div>
  );

  if (activeSection === 'points') return renderPoints();
  if (activeSection === 'add_activity') return renderAddActivity();
  if (activeSection === 'users') return renderUsers();
  if (activeSection === 'add_user') return renderAddUser();
  if (activeSection === 'add_workout') return renderAddWorkout();
  if (activeSection === 'user_history') return renderUserHistory();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider leading-none mb-2">Centro de Control</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">Modo Administrador</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setActiveSection('points')}
          className="glass rounded-[2.5rem] p-8 flex items-center gap-6 group hover:bg-slate-800/30 transition-all active:scale-95"
        >
          <div className="w-14 h-14 rounded-[1.25rem] bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
            <Zap size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-white uppercase italic leading-none mb-1">Baremo Puntos</h3>
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-black">Configurar esfuerzos</p>
          </div>
          <ChevronRight className="ml-auto text-slate-700 group-hover:text-orange-500 transition-colors" />
        </button>
        <button 
          onClick={() => setActiveSection('users')}
          className="glass rounded-[2.5rem] p-8 flex items-center gap-6 group hover:bg-slate-800/30 transition-all active:scale-95"
        >
          <div className="w-14 h-14 rounded-[1.25rem] bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Users size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-white uppercase italic leading-none mb-1">Guerreros</h3>
            <p className="text-slate-500 text-[9px] uppercase tracking-widest font-black">Gestionar la legión</p>
          </div>
          <ChevronRight className="ml-auto text-slate-700 group-hover:text-orange-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;