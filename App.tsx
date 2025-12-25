
import React, { useState, useEffect } from 'react';
import { User, Workout, Activity, AppState } from './types';
import { supabase } from './services/supabase';
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

  // Carga inicial de datos desde Supabase
  const fetchData = async () => {
    try {
      const { data: users } = await supabase.from('users').select('*');
      const { data: activities } = await supabase.from('activities').select('*').order('name');
      const { data: workouts } = await supabase.from('workouts').select('*').order('date', { ascending: false });

      setState({
        users: users || [],
        activities: activities || [],
        workouts: workouts || []
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
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
      const parsed = JSON.parse(savedUser);
      const actualUser = state.users.find(u => u.id === parsed.id);
      if (actualUser) setCurrentUser(actualUser);
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

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
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

  const adminUpdateUsers = async (users: User[]) => {
    // Para simplificar, refrescamos todo el estado de usuarios
    fetchData();
  };

  const adminUpdateActivities = async (activities: Activity[]) => {
    // Lógica para actualizar actividades una a una o refrescar
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
            <Trophy className="text-orange-600 animate-pulse" size={64} />
            <Loader2 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-700 animate-spin" size={24} />
        </div>
        <p className="mt-16 text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Sincronizando Legión...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login users={state.users} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} user={currentUser} setActiveTab={setActiveTab} />;
      case 'ranking':
        return <Ranking state={state} />;
      case 'new':
        return (
          <RegisterWorkout 
            activities={state.activities} 
            user={currentUser} 
            workouts={state.workouts}
            onAdd={addWorkout} 
          />
        );
      case 'history':
        return (
          <HistoryView 
            state={state} 
            user={currentUser} 
            onDelete={currentUser.isAdmin ? deleteWorkout : undefined} 
          />
        );
      case 'profile':
        return <ProfileView user={currentUser} onUpdate={updateProfile} />;
      case 'admin':
        return currentUser.isAdmin ? (
          <AdminPanel 
            state={state} 
            onUpdateActivities={adminUpdateActivities} 
            onUpdateUsers={adminUpdateUsers}
            onAddWorkout={addWorkout}
          />
        ) : null;
      default:
        return <Dashboard state={state} user={currentUser} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={currentUser} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
