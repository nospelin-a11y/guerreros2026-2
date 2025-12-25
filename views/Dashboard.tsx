
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
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardProps {
  state: AppState;
  user: User;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, user, setActiveTab }) => {
  const { workouts, users } = state;

  const userWorkouts = useMemo(() => 
    workouts.filter(w => w.userId === user.id), 
  [workouts, user.id]);

  const totalPoints = useMemo(() => 
    userWorkouts.reduce((sum, w) => sum + w.points, 0),
  [userWorkouts]);

  const ranking = useMemo(() => {
    const scores = users.map(u => ({
      id: u.id,
      name: u.name,
      total: workouts.filter(w => w.userId === u.id).reduce((sum, w) => sum + w.points, 0)
    })).sort((a, b) => b.total - a.total);
    
    return scores.findIndex(s => s.id === user.id) + 1;
  }, [users, workouts, user.id]);

  const workoutsTodayCount = useMemo(() => 
    userWorkouts.filter(w => isToday(parseISO(w.date))).length,
  [userWorkouts]);

  const lastWorkouts = userWorkouts.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2rem] p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center mb-3 shadow-lg shadow-orange-900/20">
            <Flame className="text-white" size={24} />
          </div>
          <span className="text-3xl font-black text-white">{totalPoints}</span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Puntos Totales</span>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-transparent border border-slate-700/50 rounded-[2rem] p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
            <Medal className="text-orange-500" size={24} />
          </div>
          <span className="text-3xl font-black text-white">#{ranking}</span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Posición Ranking</span>
        </div>
      </div>

      {/* Progress Today */}
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
        <p className="text-xs text-slate-500">
          {workoutsTodayCount === 0 ? 'Aún no has entrenado hoy. ¡Dale duro!' : 
           workoutsTodayCount === 1 ? '¡Solo te queda uno para completar el día!' : 
           '¡Objetivo diario cumplido! Guerrero.'}
        </p>
      </div>

      {/* Last Activities */}
      <div>
        <div className="flex justify-between items-center px-2 mb-4">
          <h3 className="font-bold text-slate-200">Actividad Reciente</h3>
          <button 
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-orange-500 flex items-center gap-1"
          >
            Ver todo <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {lastWorkouts.length > 0 ? lastWorkouts.map(w => (
            <div key={w.id} className="glass rounded-3xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{w.activityName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    {format(parseISO(w.date), "d MMM, HH:mm", { locale: es })}
                  </div>
                </div>
              </div>
              <div className="text-orange-500 font-black">+{w.points}</div>
            </div>
          )) : (
            <div className="glass rounded-3xl p-8 text-center border-dashed">
              <Calendar className="mx-auto text-slate-700 mb-2" size={32} />
              <p className="text-slate-500 text-sm">No hay registros recientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
