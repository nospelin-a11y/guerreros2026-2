import React, { useState, useEffect } from 'react';
import { User, Workout, Activity, AppState } from './types';
import { loadState, saveState } from './services/storage';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Ranking from './views/Ranking';
import RegisterWorkout from './views/RegisterWorkout';
import HistoryView from './views/HistoryView';
import AdminPanel from './views/AdminPanel';
import Login from './views/Login';
import ProfileView from './views/ProfileView';
import { Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);

  // Cargar sesión persistida al iniciar
  useEffect(() => {
    const savedSession = localStorage.getItem('guerreros_session');
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        // Verificar que el usuario aún existe en el estado
        const userExists = state.users.find(u => u.id === parsedUser.id);
        if (userExists) {
          setCurrentUser(userExists);
        }
      } catch (e) {
        localStorage.removeItem('guerreros_session');
      }
    }
    setInitialized(true);
  }, [state.users]);

  // Guardar estado en localStorage cada vez que cambie
  useEffect(() => {
    if (initialized) {
      saveState(state);
    }
  }, [state, initialized]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('guerreros_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guerreros_session');
    setActiveTab('dashboard');
  };

  const addWorkout = (workout: any) => {
    const newWorkout: Workout = {
      ...workout,
      id: `w-${Date.now()}`
    };
    
    setState(prev => ({
      ...prev,
      workouts: [newWorkout, ...prev.workouts]
    }));
    setActiveTab('dashboard');
  };

  const deleteWorkout = (id: string) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id)
    }));
  };

  const updateProfile = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    setCurrentUser(updatedUser);
    localStorage.setItem('guerreros_session', JSON.stringify(updatedUser));
  };

  const updateActivities = (activities: Activity[]) => {
    setState(prev => ({ ...prev, activities }));
  };

  const updateUsers = (users: User[]) => {
    setState(prev => ({ ...prev, users }));
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Trophy className="text-orange-600 animate-pulse mb-4" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Iniciando Legión...</p>
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
          onAdd={async (w) => addWorkout(w)} 
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
          onUpdateActivities={updateActivities} 
          onUpdateUsers={updateUsers} 
          onAddWorkout={addWorkout} 
        />
      )}
    </Layout>
  );
};

export default App;