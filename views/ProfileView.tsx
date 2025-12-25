
import React, { useRef, useState } from 'react';
import { User } from '../types';
import { Camera, User as UserIcon, ChevronRight, Shield, Lock, Save, Check } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingPass, setIsEditingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdate({
        ...user,
        avatar: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 3) {
      alert("Contraseña demasiado corta");
      return;
    }
    onUpdate({
      ...user,
      password: newPassword
    });
    setNewPassword('');
    setIsEditingPass(false);
    setSuccessMsg('¡Contraseña actualizada!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Mi Perfil</h2>
        <p className="text-slate-500 text-sm">Personaliza tu cuenta de Guerrero</p>
      </div>

      <div className="glass rounded-[2.5rem] p-8 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center shadow-2xl">
            {user.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <UserIcon size={64} className="text-slate-600" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-900/40 border-4 border-slate-950 active:scale-90 transition-all"
          >
            <Camera size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">@{user.username}</p>
        
        {user.isAdmin && (
          <div className="flex items-center gap-1.5 bg-orange-600/10 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 border border-orange-500/20">
            <Shield size={12} />
            Administrador
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Profile Info */}
        <div className="glass rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre Público</p>
              <p className="font-bold text-slate-200">{user.name}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seguridad</p>
                <p className="font-bold text-slate-200">Gestionar Contraseña</p>
              </div>
            </div>
            {!isEditingPass && (
              <button 
                onClick={() => setIsEditingPass(true)}
                className="text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl hover:bg-orange-500/20 transition-all"
              >
                MODIFICAR
              </button>
            )}
          </div>

          {isEditingPass && (
            <div className="flex items-center gap-2 mt-2 animate-fadeIn">
              <input 
                type="text" 
                placeholder="Nueva contraseña" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-600 transition-all"
              />
              <button 
                onClick={handleUpdatePassword}
                className="bg-orange-600 p-2 rounded-xl text-white shadow-lg"
              >
                <Save size={20} />
              </button>
              <button 
                onClick={() => { setIsEditingPass(false); setNewPassword(''); }}
                className="text-slate-500 text-xs px-2"
              >
                Cancelar
              </button>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase animate-bounce">
              <Check size={14} /> {successMsg}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 glass rounded-3xl bg-slate-900/50 border-slate-800">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-relaxed text-center">
          Tu foto y contraseña se guardan localmente en este dispositivo.
        </p>
      </div>
    </div>
  );
};

export default ProfileView;
