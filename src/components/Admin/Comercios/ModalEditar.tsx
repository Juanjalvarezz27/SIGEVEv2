"use client";

import { useState } from "react";
import { X, Calendar, Power, RefreshCw, Loader2, ShieldCheck, AlertTriangle, Check, Undo2 } from "lucide-react";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  comercio: any; 
}

export default function ModalEditarComercio({ isOpen, onClose, onSuccess, comercio }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'RENOVAR' | 'ESTADO'>('RENOVAR');
  
  // Solo manejamos tiempo, nada de dinero
  const [mesesSeleccionados, setMesesSeleccionados] = useState(1);

  if (!isOpen || !comercio) return null;

  const handleRenovar = async () => {
    setLoading(true);
    const esResta = mesesSeleccionados < 0;
    try {
      const res = await fetch(`/api/admin/comercios/${comercio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            accion: 'RENOVAR', 
            meses: mesesSeleccionados
        })
      });
      
      if (res.ok) {
        toast.success(esResta ? `Corrección aplicada.` : `¡Suscripción renovada!`);
        onSuccess();
        onClose();
      } else {
        toast.error("Error al procesar");
      }
    } catch(e) { toast.error("Error de conexión"); }
    finally { setLoading(false); }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
      setLoading(true);
      try {
          await fetch(`/api/admin/comercios/${comercio.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: nuevoEstado })
          });
          toast.success("Estado actualizado");
          onSuccess();
          onClose();
      } catch(e) { toast.error("Error"); }
      finally { setLoading(false); }
    };

  const opcionesRenovacion = [
    { label: "+1 Mes", valor: 1, tipo: "suma" },
    { label: "+3 Meses", valor: 3, tipo: "suma" },
    { label: "+6 Meses", valor: 6, tipo: "suma" },
    { label: "+1 Año", valor: 12, tipo: "suma" },
    { label: "-1 Mes", valor: -1, tipo: "resta" }, 
  ];

  const esRestaSeleccionada = mesesSeleccionados < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white border-b p-4 pb-0 relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-lg font-black text-gray-900 text-center">{comercio.nombre}</h3>
            
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-4 mt-2">
                <button onClick={() => setTab('RENOVAR')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'RENOVAR' ? 'bg-white shadow text-indigo-600 ring-1 ring-gray-100' : 'text-gray-400'}`}>
                    <Calendar size={14}/> Suscripción
                </button>
                <button onClick={() => setTab('ESTADO')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'ESTADO' ? 'bg-white shadow text-indigo-600 ring-1 ring-gray-100' : 'text-gray-400'}`}>
                    <Power size={14}/> Estado
                </button>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
            {tab === 'RENOVAR' && (
                <div className="space-y-5">
                    
                    {/* Selector de Tiempo */}
                    <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Tiempo a Sumar</p>
                        <div className="grid grid-cols-2 gap-2">
                            {opcionesRenovacion.map((opcion) => {
                                const isSelected = mesesSeleccionados === opcion.valor;
                                const isResta = opcion.tipo === 'resta';
                                return (
                                <button key={opcion.valor} onClick={() => setMesesSeleccionados(opcion.valor)}
                                    className={`px-3 py-3 rounded-lg text-xs font-bold border transition-all ${
                                        isSelected 
                                        ? (isResta ? 'bg-red-50 border-red-500 text-red-600' : 'bg-indigo-50 border-indigo-500 text-indigo-600') 
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                                    }`}
                                >
                                    {opcion.label}
                                </button>
                            )})}
                        </div>
                    </div>

                    <button 
                        onClick={handleRenovar}
                        disabled={loading}
                        className={`w-full py-3.5 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                            esRestaSeleccionada 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin"/> : esRestaSeleccionada ? <><Undo2 size={18}/> Corregir Tiempo</> : <><RefreshCw size={18}/> Aplicar Cambios</>}
                    </button>
                </div>
            )}

            {/* TAB ESTADO */}
            {tab === 'ESTADO' && (
                <div className="space-y-4">
                     <p className="text-center text-sm text-gray-500">Estado Actual: <span className="font-bold">{comercio.estado}</span></p>
                    {comercio.estado !== 'ACTIVO' && (
                        <button onClick={() => handleCambiarEstado('ACTIVO')} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">Reactivar</button>
                    )}
                    {comercio.estado !== 'SUSPENDIDO' && (
                        <button onClick={() => handleCambiarEstado('SUSPENDIDO')} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl">Suspender</button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}