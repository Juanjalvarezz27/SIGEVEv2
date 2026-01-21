"use client";

import { useState, useEffect } from "react";
import { X, Save, Phone } from "lucide-react";

interface DeudaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  tipo: "COBRAR" | "PAGAR";
}

export default function DeudaFormModal({ isOpen, onClose, onSubmit, initialData, tipo }: DeudaFormModalProps) {
  const [formData, setFormData] = useState({ persona: "", descripcion: "", monto: "", telefono: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        persona: initialData.persona,
        descripcion: initialData.descripcion || "",
        monto: initialData.monto,
        telefono: initialData.telefono || ""
      });
    } else {
      setFormData({ persona: "", descripcion: "", monto: "", telefono: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  // Función para permitir SOLO números
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex: Solo permite dígitos (0-9)
    if (/^\d*$/.test(val)) {
        setFormData({ ...formData, telefono: val });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {initialData ? "Editar Registro" : (tipo === "COBRAR" ? "Nuevo Fiado" : "Nueva Deuda")}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
            <input 
              required 
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={tipo === "COBRAR" ? "Nombre del Cliente" : "Nombre del Proveedor"}
              value={formData.persona}
              onChange={e => setFormData({...formData, persona: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp / Teléfono</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={16}/></span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="w-full border border-gray-300 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="584121234567" // Ejemplo sin guiones
                  value={formData.telefono}
                  onChange={handlePhoneChange} // <--- VALIDACIÓN AQUÍ
                />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">Ingresa solo números (Ej: 58412...)</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Ej: 2 Harinas, 1 Aceite..."
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto ($)</label>
            <input 
              required 
              type="number" 
              step="0.01"
              className="w-full border border-gray-300 rounded-xl p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.monto}
              onChange={e => setFormData({...formData, monto: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mt-2 flex justify-center items-center gap-2 hover:bg-indigo-700">
             <Save size={18} /> {loading ? "Guardando..." : "Guardar Registro"}
          </button>
        </form>
      </div>
    </div>
  );
}