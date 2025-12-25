
import React, { useState } from 'react';
import { AppState, User, Activity, Workout } from '../types';
import { 
  Settings, 
  Users, 
  Zap, 
  ChevronRight, 
  UserPlus, 
  Save, 
  ShieldCheck,
  Edit2,
  Trash2,
  Dumbbell,
  Plus
} from 'lucide-react';

interface AdminPanelProps {
  state: AppState;
  onUpdateActivities: (activities: Activity[]) => void;
  onUpdateUsers: (users: User[]) => void;
  onAddWorkout: (workout: Workout) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateActivities, onUpdateUsers, onAddWorkout }) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'points' | 'users' | 'add_user' | 'add_workout'>('menu');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editPointValue, setEditPointValue] = useState<string>('');
  
  // Add User Form State
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  
  // Add Workout Form State
  const [selectedUserForWorkout, setSelectedUserForWorkout] = useState<User | null>(null);
  const [selectedActId, setSelectedActId] = useState('');

  const handleUpdatePoints = (id: string) => {
    const points = parseFloat(editPointValue);
    if (isNaN(points)) return;
    
    const newActivities = state.activities.map(a => 
      a.id === id ? { ...a, points } : a
    );
    onUpdateActivities(newActivities);
    setEditingActivityId(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) return;
    
    const userExists = state.users.find(u => u.username === newUser.username);
    if (userExists) {
        alert("El nombre de usuario ya existe");
        return;
    }

    const created: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      isAdmin: false
    };

    onUpdateUsers([...state.users, created]);
    setNewUser({ name: '', username: '', password: '' });
    setActiveSection('users');
  };

  const handleAddExtraWorkout = () => {
    if (!selectedUserForWorkout || !selectedActId) return;
    const act = state.activities.find(a => a.id === selectedActId);
    if (!act) return;

    const newWorkout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      userId: selectedUserForWorkout.id,
      activityId: act.id,
      activityName: act.name,
      date: new Date().toISOString(),
      points: act.points
    };

    onAddWorkout(newWorkout);
    alert(`Entreno añadido a ${selectedUserForWorkout.name}`);
    setActiveSection('users');
    setSelectedUserForWorkout(null);
    setSelectedActId('');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar a este guerrero? Se perderán sus datos.")) {
        onUpdateUsers(state.users.filter(u => u.id !== id));
    }
  };

  const renderPoints = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveSection('menu')} className="text-slate-500 hover:text-white transition-colors">
          Admin
        </button>
        <ChevronRight size={16} className="text-slate-700" />
        <span className="text-white font-bold">Puntos por Actividad</span>
      </div>
      
      {state.activities.map(act => (
        <div key={act.id} className="glass rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center">
               <Zap size={20} />
             </div>
             <div>
               <p className="font-bold text-slate-200">{act.name}</p>
             </div>
          </div>
          
          {editingActivityId === act.id ? (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.05"
                value={editPointValue}
                onChange={(e) => setEditPointValue(e.target.value)}
                className="w-20 bg-slate-900 border border-orange-500 rounded-xl px-2 py-1 text-white text-center focus:outline-none"
                autoFocus
              />
              <button 
                onClick={() => handleUpdatePoints(act.id)}
                className="bg-orange-600 p-2 rounded-xl text-white"
              >
                <Save size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-200">{act.points} pts</span>
              <button onClick={() => { setEditingActivityId(act.id); setEditPointValue(act.points.toString()); }} className="text-slate-500 hover:text-orange-500">
                <Edit2 size={18} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveSection('menu')} className="text-slate-500 hover:text-white transition-colors">
          Admin
        </button>
        <ChevronRight size={16} className="text-slate-700" />
        <span className="text-white font-bold">Gestión de Guerreros</span>
      </div>

      <button 
        onClick={() => setActiveSection('add_user')}
        className="w-full bg-orange-600 p-4 rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all mb-4"
      >
        <UserPlus size={24} />
        Añadir Nuevo Guerrero
      </button>

      {state.users.map(u => (
        <div key={u.id} className="glass rounded-3xl p-4 flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               {u.avatar ? (
                 <img src={u.avatar} className="w-10 h-10 rounded-2xl object-cover border border-slate-700" alt="" />
               ) : (
                 <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                   {u.name.charAt(0)}
                 </div>
               )}
               <div>
                 <p className="font-bold text-slate-200">{u.name}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">@{u.username}</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
                {!u.isAdmin && (
                    <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
                {u.isAdmin && (
                    <div className="flex items-center gap-1 bg-orange-600/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        <ShieldCheck size={12} />
                        ADMIN
                    </div>
                )}
             </div>
           </div>
           
           <button 
             onClick={() => { setSelectedUserForWorkout(u); setActiveSection('add_workout'); }}
             className="w-full bg-slate-800/50 p-3 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
           >
             <Plus size={14} />
             Añadir Entreno Extra
           </button>
        </div>
      ))}
    </div>
  );

  const renderAddUser = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveSection('users')} className="text-slate-500 hover:text-white transition-colors">
          Guerreros
        </button>
        <ChevronRight size={16} className="text-slate-700" />
        <span className="text-white font-bold">Añadir Guerrero</span>
      </div>

      <form onSubmit={handleAddUser} className="glass rounded-[2rem] p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nombre Completo</label>
          <input 
            type="text" 
            placeholder="Ej: Manuel Pérez"
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Usuario (Login)</label>
          <input 
            type="text" 
            placeholder="Ej: manuel23"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-all"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Contraseña Inicial</label>
          <input 
            type="text" 
            placeholder="Ej: g26"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-all"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 h-14 rounded-2xl text-white font-black uppercase tracking-widest mt-4 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
        >
          CREAR GUERRERO
        </button>
      </form>
    </div>
  );

  const renderAddWorkout = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setActiveSection('users')} className="text-slate-500 hover:text-white transition-colors">
          Guerreros
        </button>
        <ChevronRight size={16} className="text-slate-700" />
        <span className="text-white font-bold">Añadir Entreno Extra</span>
      </div>

      <div className="glass rounded-[2rem] p-6 space-y-6">
        <div className="text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Añadiendo a</p>
            <h3 className="text-xl font-black text-orange-500 uppercase italic">{selectedUserForWorkout?.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {state.activities.map(act => (
            <button
              key={act.id}
              onClick={() => setSelectedActId(act.id)}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 group ${
                selectedActId === act.id 
                ? 'border-orange-600 bg-orange-600/10 text-orange-500' 
                : 'border-slate-800 bg-slate-900/50 text-slate-400'
              }`}
            >
              <Dumbbell size={20} className={selectedActId === act.id ? 'text-orange-500' : 'text-slate-600'} />
              <span className="font-bold text-[10px] uppercase">{act.name}</span>
              <span className="text-[10px] font-black">+{act.points}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleAddExtraWorkout}
          disabled={!selectedActId}
          className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl transition-all ${
            selectedActId ? 'bg-orange-600 text-white shadow-orange-900/20 active:scale-95' : 'bg-slate-800 text-slate-600'
          }`}
        >
          CONFIRMAR ENTRENO
        </button>
      </div>
    </div>
  );

  if (activeSection === 'points') return renderPoints();
  if (activeSection === 'users') return renderUsers();
  if (activeSection === 'add_user') return renderAddUser();
  if (activeSection === 'add_workout') return renderAddWorkout();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Centro de Control</h2>
        <p className="text-slate-500 text-sm">Ajustes globales del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setActiveSection('points')}
          className="glass rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-slate-800/50 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic">Baremo Puntos</h3>
            <p className="text-slate-500 text-sm">Gestiona cuánto vale cada esfuerzo</p>
          </div>
          <ChevronRight className="ml-auto text-slate-700" size={24} />
        </button>

        <button 
          onClick={() => setActiveSection('users')}
          className="glass rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-slate-800/50 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic">Guerreros</h3>
            <p className="text-slate-500 text-sm">Gestión, bajas y entrenos extra</p>
          </div>
          <ChevronRight className="ml-auto text-slate-700" size={24} />
        </button>
      </div>

      <div className="mt-8 p-6 glass rounded-3xl bg-orange-500/5 border-orange-500/10">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-orange-500" size={20} />
          <h4 className="font-black text-slate-200 uppercase text-sm">Info Sistema</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold">
          Versión 1.1.0 "Legión" <br/>
          Control total habilitado para el administrador.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
