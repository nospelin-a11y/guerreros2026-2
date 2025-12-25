import React, { useState } from 'react';
import { AppState, User, Activity } from '../types';
import { 
  Users, 
  Zap, 
  ChevronRight, 
  UserPlus, 
  Save, 
  ShieldCheck,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

interface AdminPanelProps {
  state: AppState;
  onUpdateActivities: (activities: Activity[]) => void;
  onUpdateUsers: (users: User[]) => void;
  onAddWorkout: (workout: any) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateActivities, onUpdateUsers, onAddWorkout }) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'points' | 'users' | 'add_user' | 'add_workout'>('menu');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editPointValue, setEditPointValue] = useState<string>('');
  
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });
  const [selectedUserForWorkout, setSelectedUserForWorkout] = useState<User | null>(null);
  const [selectedActId, setSelectedActId] = useState('');

  const handleUpdatePoints = (id: string) => {
    const points = parseFloat(editPointValue);
    if (isNaN(points)) return;
    
    const newActivities = state.activities.map(act => 
      act.id === id ? { ...act, points } : act
    );
    
    onUpdateActivities(newActivities);
    setEditingActivityId(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) return;
    
    const createdUser: User = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      is_admin: false
    };

    onUpdateUsers([...state.users, createdUser]);
    setNewUser({ name: '', username: '', password: '' });
    setActiveSection('users');
  };

  const handleAddExtraWorkout = async () => {
    if (!selectedUserForWorkout || !selectedActId) return;
    const act = state.activities.find(a => a.id === selectedActId);
    if (!act) return;

    const newWorkout = {
      user_id: selectedUserForWorkout.id,
      activity_id: act.id,
      activity_name: act.name,
      points: act.points,
      date: new Date().toISOString()
    };

    await onAddWorkout(newWorkout);
    setActiveSection('users');
    setSelectedUserForWorkout(null);
    setSelectedActId('');
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar a este guerrero?")) {
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
        <span className="text-white font-bold">Baremo de Puntos</span>
      </div>
      
      {state.activities.map(act => (
        <div key={act.id} className="glass rounded-3xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center">
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
              <button onClick={() => handleUpdatePoints(act.id)} className="bg-orange-600 p-2 rounded-xl">
                <Save size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-200">{act.points} pts</span>
              <button onClick={() => { setEditingActivityId(act.id); setEditPointValue(act.points.toString()); }} className="text-slate-600">
                <Edit2 size={16} />
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
        <span className="text-white font-bold">Guerreros</span>
      </div>

      <button 
        onClick={() => setActiveSection('add_user')}
        className="w-full bg-orange-600 p-4 rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-xs"
      >
        <UserPlus size={20} />
        Añadir Guerrero
      </button>

      {state.users.map(u => (
        <div key={u.id} className="glass rounded-3xl p-4 flex flex-col gap-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                 {u.name.charAt(0)}
               </div>
               <div>
                 <p className="font-bold text-slate-200 text-sm">{u.name}</p>
                 <p className="text-[10px] text-slate-500 uppercase">@{u.username}</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
                {!u.is_admin && (
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500">
                        <Trash2 size={18} />
                    </button>
                )}
                {u.is_admin && <ShieldCheck size={18} className="text-orange-500" />}
             </div>
           </div>
           <button 
             onClick={() => { setSelectedUserForWorkout(u); setActiveSection('add_workout'); }}
             className="w-full bg-slate-800/50 p-2 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"
           >
             <Plus size={12} /> Añadir Entreno
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
        <span className="text-white font-bold text-sm uppercase">Nuevo Perfil</span>
      </div>

      <form onSubmit={handleAddUser} className="glass rounded-[2rem] p-6 space-y-4">
        <input 
          type="text" placeholder="Nombre completo" value={newUser.name}
          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm" required
        />
        <input 
          type="text" placeholder="Usuario" value={newUser.username}
          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm" required
        />
        <input 
          type="password" placeholder="Contraseña" value={newUser.password}
          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm" required
        />
        <button type="submit" className="w-full bg-orange-600 h-14 rounded-2xl text-white font-black uppercase tracking-widest text-xs">
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
        <span className="text-white font-bold">Entreno Extra</span>
      </div>

      <div className="glass rounded-[2rem] p-6 space-y-6">
        <p className="text-center text-xs font-bold text-slate-500 uppercase">Añadiendo a {selectedUserForWorkout?.name}</p>
        <div className="grid grid-cols-2 gap-3">
          {state.activities.map(act => (
            <button
              key={act.id} onClick={() => setSelectedActId(act.id)}
              className={`p-4 rounded-2xl border-2 text-[10px] font-bold uppercase transition-all ${
                selectedActId === act.id ? 'border-orange-600 bg-orange-600/10 text-orange-500' : 'border-slate-800 bg-slate-900/50 text-slate-500'
              }`}
            >
              {act.name}
            </button>
          ))}
        </div>
        <button 
          onClick={handleAddExtraWorkout} disabled={!selectedActId}
          className="w-full h-14 rounded-2xl bg-orange-600 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50"
        >
          CONFIRMAR
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
        <p className="text-slate-500 text-sm">Configuración de la Legión</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => setActiveSection('points')} className="glass rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-slate-800/50">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white"><Zap size={28} /></div>
          <div><h3 className="text-lg font-black text-white uppercase italic">Baremo Puntos</h3><p className="text-slate-500 text-xs">Valores de esfuerzo</p></div>
          <ChevronRight className="ml-auto text-slate-700" />
        </button>
        <button onClick={() => setActiveSection('users')} className="glass rounded-[2rem] p-8 flex items-center gap-6 group hover:bg-slate-800/50">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300"><Users size={28} /></div>
          <div><h3 className="text-lg font-black text-white uppercase italic">Guerreros</h3><p className="text-slate-500 text-xs">Gestión de miembros</p></div>
          <ChevronRight className="ml-auto text-slate-700" />
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;