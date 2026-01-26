"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Key, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  } | null;
}

export default function ModalUsuario({ isOpen, onClose, onSuccess, usuario }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    if (usuario) {
        setFormData({
            nombre: usuario.nombre || "",
            email: usuario.email || "",
            password: "" // La contraseña siempre inicia vacía por seguridad
        });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);

    try {
      // Usamos la API de usuarios individual para editar las credenciales
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Credenciales actualizadas correctamente");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-white border-b p-5 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-black text-gray-900">Editar Acceso</h3>
                <p className="text-xs text-gray-500">Credenciales del dueño</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={20}/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Nombre */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nombre del Encargado</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        required 
                        value={formData.nombre} 
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full pl-10 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 transition-all" 
                        placeholder="Ej. Juan Pérez"
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Correo (Login)</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        required 
                        type="email"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 transition-all" 
                        placeholder="correo@ejemplo.com"
                    />
                </div>
            </div>

            {/* Password - Sección Destacada */}
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100/50">
                <div className="flex items-center gap-2 mb-3 text-amber-700">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                        <Key size={16}/>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wide">Cambiar Contraseña</span>
                </div>
                
                <input 
                    type="text"
                    placeholder="Escribe nueva contraseña aquí..." 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full p-3 border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium placeholder:text-gray-400 shadow-sm" 
                />
                
                <div className="flex items-start gap-2 mt-3">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0"/>
                    <p className="text-[11px] text-amber-600/80 font-medium leading-tight">
                        Deja este campo <strong>vacío</strong> si no deseas cambiar la contraseña actual del usuario.
                    </p>
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Guardar Credenciales</>}
            </button>
        </form>
      </div>
    </div>
  );
}