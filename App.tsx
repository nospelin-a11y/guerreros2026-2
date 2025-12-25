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
import { Trophy, Loader2, Database, CloudAlert } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ users: [], workouts: [], activities: [] });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, activitiesRes, workoutsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('activities').select('*').order('name'),
        supabase.from('workouts').select('*').order('date', { ascending: false })
      ]);

      if (usersRes.error) throw usersRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (workoutsRes.error) throw workoutsRes.error;

      setState({
        users: usersRes.data || [],
        activities: activitiesRes.data || [],
        workouts: workoutsRes.data || []
      });
    } catch (err: any) {
      console.error("Error al sincronizar con Supabase:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Gestionar sesión local
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

  // Acción: Inicializar base de datos si está vacía
  const seedDatabase = async () => {
    try {
      setLoading(true);
      // Insertar usuarios y actividades iniciales
      const { error: uErr } = await supabase.from('users').upsert(INITIAL_USERS);
      const { error: aErr } = await supabase.from('activities').upsert(INITIAL_ACTIVITIES);
      
      if (uErr || aErr) throw new Error("No se pudo inicializar la base de datos.");
      
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Acción: Añadir entrenamiento
  const addWorkout = async (workout: any) => {
    try {
      const { data, error: wErr } = await supabase
        .from('workouts')
        .insert([workout])
        .select();

      if (wErr) throw wErr;
      
      if (data) {
        setState(prev => ({
          ...prev,
          workouts: [data[0] as Workout, ...prev.workouts]
        }));
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      alert("Error al registrar: " + err.message);
    }
  };

  // Acción: Eliminar entrenamiento (solo Admin)
  const deleteWorkout = async (id: string) => {
    const { error: dErr } = await supabase.from('workouts').delete().eq('id', id);
    if (!dErr) {
      setState(prev => ({
        ...prev,
        workouts: prev.workouts.filter(w => w.id !== id)
      }));
    }
  };

  // Acción: Actualizar perfil (Avatar/Password)
  const updateProfile = async (updatedUser: User) => {
    const { error: pErr } = await supabase
      .from('users')
      .update({ avatar: updatedUser.avatar, password: updatedUser.password })
      .eq('id', updatedUser.id);

    if (!pErr) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
      }));
      setCurrentUser(updatedUser);
      localStorage.setItem('guerreros_session', JSON.stringify(updatedUser));
    }
  };

  // Pantalla de Carga
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <Trophy className="text-orange-600 animate-pulse mb-8" size={64} />
        <Loader2 className="text-slate-700 animate-spin mb-4" size={24} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Sincronizando con Supabase...</p>
      </div>
    );
  }

  // Pantalla de Error o BD Vacía
  if (error || state.users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 rounded-[2.5rem] bg-orange-600/10 flex items-center justify-center text-orange-600 mb-8 border border-orange-600/20 shadow-2xl">
          <Database size={40} />
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase mb-2 leading-tight">Legión en espera</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-10 leading-relaxed max-w-xs mx-auto font-bold">
          {error ? `Error: ${error}` : "La base de datos está conectada pero vacía. Vamos a reclutar a los guerreros."}
        </p>
        <button 
          onClick={seedDatabase} 
          className="w-full max-w-xs h-16 bg-orange-600 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
        >
          INICIALIZAR GUERREROS
        </button>
        {error && (
          <button onClick={() => window.location.reload()} className="mt-6 text-slate-600 text-[10px] font-black uppercase tracking-widest underline decoration-slate-800 underline-offset-4">
            Reintentar Conexión
          </button>
        )}
      </div>
    );
  }

  if (!currentUser) {
    return <Login users={state.users} onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard state={state} user={currentUser} setActiveTab={setActiveTab} />}
      {activeTab === 'ranking' && <Ranking state={state} />}
      {activeTab === 'new' && <RegisterWorkout activities={state.activities} user={currentUser} workouts={state.workouts} onAdd={addWorkout} />}
      {activeTab === 'history' && <HistoryView state={state} user={currentUser} onDelete={currentUser.is_admin ? deleteWorkout : undefined} />}
      {activeTab === 'profile' && <ProfileView user={currentUser} onUpdate={updateProfile} />}
      {activeTab === 'admin' && currentUser.is_admin && (
        <AdminPanel 
          state={state} 
          onUpdateActivities={fetchData} 
          onUpdateUsers={fetchData} 
          onAddWorkout={addWorkout} 
        />
      )}
    </Layout>
  );
};

export default App;