
import React, { useState } from 'react';
import { User } from '../types';
import { ChevronRight, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-orange-600 mb-4 shadow-xl shadow-orange-900/20">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GUERREROS 2026</h1>
          <p className="text-slate-400">Entrena como un guerrero</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 ml-4 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-slate-800 rounded-3xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                required
              >
                <option value="">Selecciona tu perfil...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 ml-4 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-slate-800 rounded-3xl text-white focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center px-4">{error}</p>}

          <button
            type="submit"
            className="w-full h-14 bg-orange-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 active:scale-[0.98] transition-all shadow-lg shadow-orange-900/20"
          >
            ENTRAR
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Temporal replacement for missing Lucide imports in this scope
import { Trophy } from 'lucide-react';

export default Login;
