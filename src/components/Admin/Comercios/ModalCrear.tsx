"use client";

import { useState } from "react";
import { X, Store, User, Mail, Lock, Phone, MapPin, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCrearComercio({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreComercio: "",
    slug: "",
    direccion: "",
    nombreContacto: "",
    telefono: "",
    emailUsuario: "",
    passwordUsuario: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generar Slug automático al escribir nombre
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
        ...prev, 
        nombreComercio: val,
        // Slug simple: minúsculas y guiones
        slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/comercios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("¡Comercio creado exitosamente!");
        setFormData({ nombreComercio: "", slug: "", direccion: "", nombreContacto: "", telefono: "", emailUsuario: "", passwordUsuario: "" });
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Error al crear");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg"><Store size={20}/></div>
            <div>
                <h3 className="font-bold text-lg">Registrar Nuevo Comercio</h3>
                <p className="text-indigo-200 text-xs">Crea el negocio y su usuario administrador</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SECCIÓN 1: DATOS DEL NEGOCIO */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-2">Datos del Negocio</h4>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Comercial</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input required name="nombreComercio" value={formData.nombreComercio} onChange={handleNombreChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej: Bodega Don Jose"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Identificador (Slug)</label>
                        <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 text-gray-600 font-mono" placeholder="bodega-don-jose"/>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Av. Principal..."/>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: DATOS DEL DUEÑO */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-2">Datos del Dueño (Admin)</h4>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input required name="nombreContacto" value={formData.nombreContacto} onChange={handleChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Juan Perez"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0412-1234567"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo (Login)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input required type="email" name="emailUsuario" value={formData.emailUsuario} onChange={handleChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="juan@bodega.com"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input required type="text" name="passwordUsuario" value={formData.passwordUsuario} onChange={handleChange} className="w-full pl-9 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Mínimo 6 caracteres"/>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
            <button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2 transition-all">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Registrar Comercio</>}
            </button>
        </div>

      </div>
    </div>
  );
}