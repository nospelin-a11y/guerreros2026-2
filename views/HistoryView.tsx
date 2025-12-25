
import React, { useState, useMemo } from 'react';
import { AppState, User, Workout } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Search, Filter, History } from 'lucide-react';

interface HistoryViewProps {
  state: AppState;
  user: User;
  onDelete?: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ state, user, onDelete }) => {
  const [filterUserId, setFilterUserId] = useState(user.isAdmin ? 'all' : user.id);

  const filteredWorkouts = useMemo(() => {
    let list = [...state.workouts];
    if (filterUserId !== 'all') {
      list = list.filter(w => w.userId === filterUserId);
    }
    return list;
  }, [state.workouts, filterUserId]);

  const getUserName = (id: string) => state.users.find(u => u.id === id)?.name || 'Desconocido';

  return (
    <div className="space-y-6 pb-4">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Historial</h2>
        <p className="text-slate-500 text-sm">Registro completo de esfuerzos</p>
      </div>

      {user.isAdmin && (
        <div className="glass rounded-3xl p-4 flex items-center gap-4">
          <Filter className="text-slate-500" size={20} />
          <select 
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none"
          >
            <option value="all" className="text-black">TODOS LOS GUERREROS</option>
            {state.users.map(u => (
              <option key={u.id} value={u.id} className="text-black">{u.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {filteredWorkouts.length > 0 ? filteredWorkouts.map(w => (
          <div key={w.id} className="glass rounded-3xl p-5 border-l-4 border-l-orange-600 transition-all hover:translate-x-1">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="font-black text-slate-100 uppercase tracking-wide">{w.activityName}</h4>
                <p className="text-xs text-slate-500 font-bold mb-2">
                  {format(parseISO(w.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-orange-500">+{w.points}</span>
                {user.isAdmin && onDelete && (
                  <button 
                    onClick={() => { if(confirm('¿Seguro?')) onDelete(w.id); }}
                    className="p-1.5 text-slate-600 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            {filterUserId === 'all' && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                  {getUserName(w.userId).charAt(0)}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  REALIZADO POR {getUserName(w.userId)}
                </span>
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-700">
            <History size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">No hay registros para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
