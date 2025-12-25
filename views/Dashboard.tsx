
import React, { useMemo } from 'react';
import { AppState, User, Workout } from '../types';
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Medal,
  Clock,
  User as UserIcon
} from 'lucide-react';
// Fix: Use new Date() instead of parseISO to avoid import resolution issues in some environments
import { format, isToday } from 'date-fns';
// Fix: Import locale from specific path to avoid missing member errors from the root locale index
import { es } from 'date-fns/locale/es';

interface DashboardProps {
  state: AppState;
  user: User;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, user, setActiveTab }) => {
  const { workouts, users } = state;

  const userWorkouts = useMemo(() => 
    workouts.filter(w => w.user_id === user.id), 
  [workouts, user.id]);

  const totalPoints = useMemo(() => 
    userWorkouts.reduce((sum, w) => sum + w.points, 0),
  [userWorkouts]);

  const ranking = useMemo(() => {
    const scores = users.map(u => ({
      id: u.id,
      name: u.name,
      total: workouts.filter(w => w.user_id === u.id).reduce((sum, w) => sum + w.points, 0)
    })).sort((a, b) => b.total - a.total);
    
    const rank = scores.findIndex(s => s.id === user.id) + 1;
    return rank > 0 ? rank : '-';
  }, [users, workouts, user.id]);

  const workoutsTodayCount = useMemo(() => 
    // Fix: replaced parseISO(w.date) with new Date(w.date)
    userWorkouts.filter(w => isToday(new Date(w.date))).length,
  [userWorkouts]);

  const lastWorkouts = userWorkouts.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" alt="Avatar" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <UserIcon size={24} />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Hola, {user.name}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">¡A por ello!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2rem] p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-orange-900/20">
            <Flame className="text-white" size={24} />
          </div>
          <span className="text-3xl font-black text-white">{totalPoints}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Puntos Totales</span>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-transparent border border-slate-700/50 rounded-[2rem] p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
            <Medal className="text-orange-500" size={24} />
          </div>
          <span className="text-3xl font-black text-white">#{ranking}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Posición Ranking</span>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-200">Progreso Diario</h3>
          <span className="text-xs font-bold px-3 py-1 bg-slate-800 rounded-full text-slate-400">
            {workoutsTodayCount}/2 ENTRENOS
          </span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-orange-600 transition-all duration-700 ease-out rounded-full"
            style={{ width: `${Math.min(100, (workoutsTodayCount / 2) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 uppercase font-bold text-center mt-2">
          {workoutsTodayCount === 0 ? 'Aún no has entrenado hoy' : 
           workoutsTodayCount === 1 ? '¡Solo queda uno!' : 
           '¡Objetivo cumplido!'}
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center px-2 mb-4">
          <h3 className="font-bold text-slate-200 uppercase text-sm tracking-widest">Actividad Reciente</h3>
          <button 
            onClick={() => setActiveTab('history')}
            className="text-[10px] font-black text-orange-500 flex items-center gap-1 uppercase tracking-widest"
          >
            Ver todo <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {lastWorkouts.length > 0 ? lastWorkouts.map(w => (
            <div key={w.id} className="glass rounded-3xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500 border border-slate-700">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm uppercase">{w.activity_name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                    <Clock size={12} />
                    {/* Fix: replaced parseISO(w.date) with new Date(w.date) */}
                    {format(new Date(w.date), "d MMM, HH:mm", { locale: es })}
                  </div>
                </div>
              </div>
              <div className="text-orange-500 font-black">+{w.points}</div>
            </div>
          )) : (
            <div className="glass rounded-3xl p-8 text-center border-dashed border-2 border-slate-800">
              <Calendar className="mx-auto text-slate-700 mb-2" size={32} />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sin registros recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
