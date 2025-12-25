
import React, { useState, useEffect, useMemo } from 'react';
import { User, Workout, Activity, AppState } from './types';
import { loadState, saveState } from './services/storage';
import { DAILY_WORKOUT_LIMIT } from './constants';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import Ranking from './views/Ranking';
import RegisterWorkout from './views/RegisterWorkout';
import HistoryView from './views/HistoryView';
import AdminPanel from './views/AdminPanel';
import Login from './views/Login';
import ProfileView from './views/ProfileView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Handle Login session
  useEffect(() => {
    const savedUser = localStorage.getItem('guerreros_session');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Sync with latest state
      const actualUser = state.users.find(u => u.id === parsed.id);
      if (actualUser) setCurrentUser(actualUser);
    }
    setIsInitialized(true);
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

  const addWorkout = (workout: Workout) => {
    setState(prev => ({
      ...prev,
      workouts: [workout, ...prev.workouts]
    }));
    setActiveTab('dashboard');
  };

  const addAdminWorkout = (workout: Workout) => {
    setState(prev => ({
      ...prev,
      workouts: [workout, ...prev.workouts]
    }));
  };

  const deleteWorkout = (id: string) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id)
    }));
  };

  const updateActivities = (activities: Activity[]) => {
    setState(prev => ({ ...prev, activities }));
  };

  const updateUsers = (users: User[]) => {
    setState(prev => ({ ...prev, users }));
  };

  const updateProfile = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    setCurrentUser(updatedUser);
    localStorage.setItem('guerreros_session', JSON.stringify(updatedUser));
  };

  if (!isInitialized) return <div className="min-h-screen bg-slate-950"></div>;

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
            onUpdateActivities={updateActivities} 
            onUpdateUsers={updateUsers}
            onAddWorkout={addAdminWorkout}
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
