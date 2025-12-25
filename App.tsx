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
import { Loader2, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ users: [], workouts: [], activities: [] });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Función para poblar la base de datos si está vacía
  const initializeDatabase = async (currentUsers: any[], currentActivities: any[]) => {
    if (currentUsers.length === 0 || currentActivities.length === 0) {
      setInitializing(true);
      console.log("Detectada base de datos vacía. Iniciando carga automática...");
      
      try {
        if (currentUsers.length === 0) {
          await supabase.from('users').insert(INITIAL_USERS);
        }
        if (currentActivities.length === 0) {
          await supabase.from('activities').insert(INITIAL_ACTIVITIES);
        }
        // Recargar después de insertar
        await fetchData();
      } catch (err) {
        console.error("Error en inicialización:", err);
      } finally {
        setInitializing(false);
      }
    }
  };

  const fetchData = async () => {
    try {
      const { data: users } = await supabase.from('users').select('*');
      const { data: activities } = await supabase.from('activities').select('*').order('name');
      const { data: workouts } = await supabase.from('workouts').select('*').order('date', { ascending: false });

      const fetchedUsers = users || [];
      const fetchedActivities = activities || [];
      
      setState({
        users: fetchedUsers,
        activities: fetchedActivities,
        workouts: workouts || []
      });

      return { users: fetchedUsers, activities: fetchedActivities };
    } catch (error) {
      console.error("Error cargando datos de Supabase:", error);
      return { users: [], activities: [] };
    }
  };

  useEffect(() => {
    const startApp = async () => {
      setLoading(true);
      const data = await fetchData();
      // Si no hay datos, intentamos inicializar
      if (data.users.length === 0 || data.activities.length === 0) {
        await initializeDatabase(data.users, data.activities);
      }
      setLoading(false);
    };
    startApp();
  }, []);

  // Manejo de sesión local persistente
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

  const addWorkout = async (workout: any) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workout])
      .select();

    if (!error && data) {
      setState(prev => ({
        ...prev,
        workouts: [data[0], ...prev.workouts]
      }));
      setActiveTab('dashboard');
    } else {
      console.error("Error insertando entreno:", error);
      alert("Error al guardar en la nube. Revisa las políticas RLS en Supabase.");
    }
  };

  const deleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (!error) {
      setState(prev => ({
        ...prev,
        workouts: prev.workouts.filter(w => w.id !== id)
      }));
    }
  };

  const updateProfile = async (updatedUser: User) => {
    const { error } = await supabase
      .from('users')
      .update({ 
        avatar: updatedUser.avatar, 
        password: updatedUser.password 
      })
      .eq('id', updatedUser.id);

    if (!error) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
      }));
      setCurrentUser(updatedUser);
      localStorage.setItem('guerreros_session', JSON.stringify(updatedUser));
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center">
        <Trophy className="text-orange-600 animate-pulse mb-8" size={64} />
        <Loader2 className="text-slate-700 animate-spin mb-4" size={24} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          {initializing ? "Cargando Legión por primera vez..." : "Conectando con la Legión..."}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login users={state.users} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={currentUser} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard state={state} user={currentUser} setActiveTab={setActiveTab} />}
      {activeTab === 'ranking' && <Ranking state={state} />}
      {activeTab === 'new' && (
        <RegisterWorkout 
          activities={state.activities} 
          user={currentUser} 
          workouts={state.workouts} 
          onAdd={addWorkout} 
        />
      )}
      {activeTab === 'history' && (
        <HistoryView 
          state={state} 
          user={currentUser} 
          onDelete={currentUser.is_admin ? deleteWorkout : undefined} 
        />
      )}
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