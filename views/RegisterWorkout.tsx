
import React, { useState, useMemo } from 'react';
import { Activity, User, Workout } from '../types';
import { DAILY_WORKOUT_LIMIT } from '../constants';
import { isToday, parseISO } from 'date-fns';
import { Check, AlertCircle, Dumbbell } from 'lucide-react';

interface RegisterWorkoutProps {
  activities: Activity[];
  user: User;
  workouts: Workout[];
  onAdd: (workout: any) => Promise<void>;
}

const RegisterWorkout: React.FC<RegisterWorkoutProps> = ({ activities, user, workouts, onAdd }) => {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workoutsTodayCount = useMemo(() => 
    workouts.filter(w => (w.userId === user.id || (w as any).user_id === user.id) && isToday(parseISO(w.date))).length,
  [workouts, user.id]);

  const canAddMore = workoutsTodayCount < DAILY_WORKOUT_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddMore) return;

    const activity = activities.find(a => a.id === selectedActivityId);
    if (!activity) return;

    setIsSubmitting(true);
    
    const newWorkout = {
      user_id: user.id,
      activity_id: activity.id,
      activity_name: activity.name,
      points: activity.points,
      date: new Date().toISOString()
    };
    
    await onAdd(newWorkout);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Nuevo Entrenamiento</h2>
        <p className="text-slate-500 text-sm">Registra tu esfuerzo hoy</p>
      </div>

      <div className="glass rounded-[2rem] p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-slate-200">Disponibilidad hoy</h3>
           <div className="flex gap-1">
             {[...Array(DAILY_WORKOUT_LIMIT)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-10 h-2 rounded-full transition-all ${i < workoutsTodayCount ? 'bg-orange-600' : 'bg-slate-800'}`} 
               />
             ))}
           </div>
        </div>

        {!canAddMore ? (
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl flex items-center gap-4 text-orange-500">
            <AlertCircle size={24} />
            <p className="text-xs font-bold leading-tight uppercase">
              Has alcanzado el límite diario de {DAILY_WORKOUT_LIMIT} entrenamientos. ¡Mañana más!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Selecciona actividad</p>
              <div className="grid grid-cols-2 gap-3">
                {activities.map(act => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-2 group ${
                      selectedActivityId === act.id 
                      ? 'border-orange-600 bg-orange-600/10 text-orange-500' 
                      : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <Dumbbell className={`group-hover:scale-110 transition-transform ${selectedActivityId === act.id ? 'text-orange-500' : 'text-slate-600'}`} />
                    <span className="font-bold text-xs uppercase">{act.name}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                      {act.points} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedActivityId || isSubmitting}
              className={`w-full h-16 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                !selectedActivityId || isSubmitting 
                ? 'bg-slate-800 text-slate-600' 
                : 'bg-orange-600 text-white shadow-xl shadow-orange-900/20 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={24} />
                  REGISTRAR
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterWorkout;
