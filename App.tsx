import React, { useState, useEffect } from 'react';
import { User, Workout, Activity, AppState } from './types';
import { supabase } from './services/supabase';
import { INITIAL_USERS, INITIAL_ACTIVITIES } from './constants';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Ranking from './views/Ranking';
import RegisterWorkout from './views/RegisterWorkout';
import HistoryView from './views/HistoryView';
import AdminPanel from './views/AdminPanel';
import Login from './views/Login';
import ProfileView from './views/ProfileView';
import { Trophy, Loader2, Database, AlertCircle, RefreshCw, Terminal, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ users: [], workouts: [], activities: [] });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, activitiesRes, workoutsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('workouts').select('*').order('date', { ascending: false })
      ]);

      if (usersRes.error) throw usersRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (workoutsRes.error) throw workoutsRes.error;

      setState({
        users: usersRes.data || [],
        activities: (activitiesRes.data || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        workouts: workoutsRes.data || []
      });
    } catch (err: any) {
      console.error("Supabase Error:", err);
      const message = err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('guerreros_session');
    if (savedUser && state.users.length > 0) {
      try {
        const parsed = JSON.parse(savedUser);
        const actualUser = state.users.find(u => u.id === parsed.id);
        if (actualUser) setCurrentUser(actualUser);
      } catch (e) {
        localStorage.removeItem('guerreros_session');
      }
    }
  }, [state.users]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('guerreros_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guerreros_session');
    setActiveTab('dashboard');
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: uErr } = await supabase.from('users').upsert(INITIAL_USERS);
      const { error: aErr } = await supabase.from('activities').upsert(INITIAL_ACTIVITIES);
      if (uErr || aErr) throw uErr || aErr;
      await fetchData();
    } catch (err: any) {
      setError(err.message || "No se pudieron crear las tablas. ¿Has ejecutado el SQL en Supabase?");
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workout: any) => {
    try {
      const { data, error: wErr } = await supabase.from('workouts').insert([workout]).select();
      if (wErr) throw wErr;
      if (data) {
        setState(prev => ({ ...prev, workouts: [data[0] as Workout, ...prev.workouts] }));
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      alert("Error: " + (err.message || "Error al registrar"));
    }
  };

  const deleteWorkout = async (id: string) => {
    const { error: dErr } = await supabase.from('workouts').delete().eq('id', id);
    if (!dErr) {
      setState(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }));
    }
  };

  const updateProfile = async (updatedUser: User) => {
    const { error: pErr } = await supabase
      .from('users')
      .update({ avatar: updatedUser.avatar, password: updatedUser.password })
      .eq('id', updatedUser.id);
    if (!pErr) {
      setState(prev => ({ ...prev, users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u) }));
      setCurrentUser(updatedUser);
      localStorage.setItem('guerreros_session', JSON.stringify(updatedUser));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <Trophy className="text-orange-600 animate-pulse mb-8" size={64} />
        <Loader2 className="text-slate-700 animate-spin mb-4" size={24} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Conectando Legión...</p>
      </div>
    );
  }

  if (error || state.users.length === 0 || showSqlGuide) {
    const sqlScript = `-- 1. CREAR TABLAS (ID de usuario es su NOMBRE)
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Almacenará el NOMBRE del usuario
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  avatar TEXT
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points NUMERIC NOT NULL
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id), -- Almacenará el NOMBRE del usuario
  activity_id TEXT REFERENCES activities(id),
  activity_name TEXT NOT NULL,
  points NUMERIC NOT NULL,
  date TIMESTAMPTZ DEFAULT now()
);

-- 2. HABILITAR RLS Y CREAR POLÍTICAS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_users" ON users FOR UPDATE TO anon USING (true);

CREATE POLICY "public_read_activities" ON activities FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_activities" ON activities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update_activities" ON activities FOR UPDATE TO anon USING (true);

CREATE POLICY "public_read_workouts" ON workouts FOR SELECT TO anon USING (true);
CREATE POLICY "public_write_workouts" ON workouts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_delete_workouts" ON workouts FOR DELETE TO anon USING (true);`;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-600 border border-orange-600/20">
              <Database size={32} />
            </div>
          </div>
          
          <h2 className="text-xl font-black text-white uppercase italic text-center mb-2">Configura Supabase</h2>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest text-center mb-6 leading-relaxed">
            Ejecuta este SQL en el panel de Supabase. El user_id ahora será el nombre del usuario.
          </p>

          <div className="relative group mb-6">
            <pre className="bg-slate-950 p-4 rounded-2xl text-[9px] font-mono text-slate-400 overflow-x-auto border border-slate-800 h-60 scrollbar-hide">
              {sqlScript}
            </pre>
            <button 
              onClick={() => { navigator.clipboard.writeText(sqlScript); alert('¡Copiado!'); }}
              className="absolute top-2 right-2 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={seedDatabase} 
              className="w-full h-14 bg-orange-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
            >
              <Check size={16} /> YA HE EJECUTADO EL SQL
            </button>
            <button 
              onClick={fetchData} 
              className="w-full h-14 bg-slate-800 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              REINTENTAR CONEXIÓN
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-red-400 break-all">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login users={state.users} onLogin={handleLogin} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard state={state} user={currentUser} setActiveTab={setActiveTab} />}
      {activeTab === 'ranking' && <Ranking state={state} />}
      {activeTab === 'new' && <RegisterWorkout activities={state.activities} user={currentUser} workouts={state.workouts} onAdd={addWorkout} />}
      {activeTab === 'history' && <HistoryView state={state} user={currentUser} onDelete={currentUser.is_admin ? deleteWorkout : undefined} />}
      {activeTab === 'profile' && <ProfileView user={currentUser} onUpdate={updateProfile} />}
      {activeTab === 'admin' && currentUser.is_admin && (
        <AdminPanel state={state} onUpdateActivities={fetchData} onUpdateUsers={fetchData} onAddWorkout={addWorkout} />
      )}
    </Layout>
  );
};

export default App;