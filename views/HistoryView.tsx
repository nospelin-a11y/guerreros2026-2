
import React, { useState, useMemo } from 'react';
import { AppState, User, Workout } from '../types';
// Fix: Use new Date() instead of parseISO to ensure compatibility
import { format } from 'date-fns';
// Fix: Import locale from specific path to avoid missing member errors
import { es } from 'date-fns/locale/es';
import { Trash2, Filter, History as HistoryIcon } from 'lucide-react';

interface HistoryViewProps {
  state: AppState;
  user: User;
  onDelete?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ state, user, onDelete }) => {
  const [filterUserId, setFilterUserId] = useState(user.is_admin ? 'all' : user.id);

  const filteredWorkouts = useMemo(() => {
    let list = [...state.workouts];
    if (filterUserId !== 'all') {
      list = list.filter(w => w.user_id === filterUserId);
    }
    return list;
  }, [state.workouts, filterUserId]);

  const getUserName = (id: string) => state.users.find(u => u.id === id)?.name || 'Desconocido';

  return (
    <div className="space-y-6 pb-4">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Bitácora</h2>
        <p className="text-slate-500 text-sm">Registro de toda la actividad</p>
      </div>

      {user.is_admin && (
        <div className="glass rounded-3xl p-4 flex items-center gap-4">
          <Filter className="text-slate-500" size={20} />
          <select 
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none appearance-none"
          >
            <option value="all" className="bg-slate-900">TODOS LOS GUERREROS</option>
            {state.users.map(u => (
              <option key={u.id} value={u.id} className="bg-slate-900">{u.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {filteredWorkouts.length > 0 ? filteredWorkouts.map(w => (
          <div key={w.id} className="glass rounded-3xl p-5 border-l-4 border-l-orange-600 transition-all active:scale-[0.99]">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="font-black text-slate-100 uppercase tracking-wide text-sm">{w.activity_name}</h4>
                <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">
                  {/* Fix: replaced parseISO(w.date) with new Date(w.date) */}
                  {format(new Date(w.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-orange-500">+{w.points}</span>
                {user.is_admin && onDelete && (
                  <button 
                    onClick={() => { if(confirm('¿Seguro que deseas eliminar este registro?')) onDelete(w.id); }}
                    className="p-1.5 text-slate-600 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            {filterUserId === 'all' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  {getUserName(w.user_id).charAt(0)}
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  POR {getUserName(w.user_id)}
                </span>
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-800">
            <HistoryIcon size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">Sin registros disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
