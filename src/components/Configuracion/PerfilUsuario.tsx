"use client";

import { useState } from 'react';
import { Lock, Save, Loader2, User, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

interface CustomUser {
  nombre?: string | null;
  email?: string | null;
  rol?: string | null;
}

export default function PerfilUsuario() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const user = session?.user as CustomUser;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field: keyof typeof show) => {
    setShow({ ...show, [field]: !show[field] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('Las nuevas contraseñas no coinciden');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Contraseña actualizada correctamente');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Info Básica */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
           <User size={40} className="text-indigo-600" />
        </div>
        <div className="w-full">
           <h3 className="text-2xl font-bold text-gray-900">{user?.nombre || 'Usuario'}</h3>
           <p className="text-gray-500 mb-3">{user?.email}</p>
           
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
             <Shield size={12} className="mr-1.5" /> 
             {user?.rol?.replace(/_/g, ' ') || 'USUARIO'}
           </span>
        </div>
      </div>

      {/* Formulario Cambio Contraseña (Ancho completo ahora) */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lock size={22} className="text-indigo-600"/>
            Seguridad de la Cuenta
          </h3>
          <p className="text-gray-500 mt-1">Gestiona tu acceso y protege tu información.</p>
        </div>

        {/* CLASE MODIFICADA: Se quitó max-w-lg para que ocupe todo el ancho */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                name="current"
                value={passwords.current}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                onClick={() => toggleVisibility('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {show.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={show.new ? "text" : "password"}
                  name="new"
                  value={passwords.new}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {show.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Nueva</label>
              <div className="relative">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 outline-none transition-all bg-gray-50 focus:bg-white ${
                    passwords.confirm && passwords.new !== passwords.confirm 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {show.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              {loading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}