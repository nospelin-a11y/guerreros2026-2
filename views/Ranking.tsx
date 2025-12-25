
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { Trophy, User as UserIcon } from 'lucide-react';

interface RankingProps {
  state: AppState;
}

const Ranking: React.FC<RankingProps> = ({ state }) => {
  const sortedRanking = useMemo(() => {
    return state.users.map(u => ({
      ...u,
      totalPoints: state.workouts
        .filter(w => w.user_id === u.id)
        .reduce((sum, w) => sum + w.points, 0)
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [state.users, state.workouts]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6 pt-4">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Salón de la Fama</h2>
        <p className="text-slate-500 text-sm uppercase font-bold tracking-widest">Guerreros 2026</p>
      </div>

      <div className="space-y-3 px-2">
        {sortedRanking.map((u, idx) => {
          const isTop3 = idx < 3;
          return (
            <div 
              key={u.id} 
              className={`glass rounded-3xl p-4 flex items-center justify-between transition-all ${
                idx === 0 ? 'border-orange-500/50 bg-orange-500/5 shadow-lg shadow-orange-900/10 scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm ${
                  idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {idx + 1}º
                </div>
                
                <div className="relative">
                  {u.avatar ? (
                    <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" alt={u.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  {idx === 0 && <Trophy className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-md" size={16} />}
                </div>

                <div>
                  <h4 className={`font-bold uppercase text-sm ${idx === 0 ? 'text-white' : 'text-slate-200'}`}>
                    {u.name}
                  </h4>
                  {idx === 0 && <span className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Líder Supremo</span>}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className={`font-black text-lg ${idx === 0 ? 'text-orange-500' : 'text-slate-200'}`}>
                  {u.totalPoints}
                </span>
                <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Puntos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ranking;
