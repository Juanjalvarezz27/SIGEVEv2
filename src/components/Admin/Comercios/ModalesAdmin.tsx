"use client";

import { useState } from "react";
import { X, Calendar, Power, RefreshCw, Loader2, AlertTriangle, Undo2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface ModalEditarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  comercio: any; 
}

export function ModalEditarComercio({ isOpen, onClose, onSuccess, comercio }: ModalEditarProps) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'RENOVAR' | 'ESTADO'>('RENOVAR');
  
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

  // Opciones de Suma
  const opcionesSuma = [
    { label: "+1 Mes", valor: 1 },
    { label: "+3 Meses", valor: 3 },
    { label: "+6 Meses", valor: 6 },
    { label: "+1 Año", valor: 12 },
  ];

  // Opciones de Resta (Corrección)
  const opcionesResta = [
     { label: "-1 Mes", valor: -1 },
     { label: "-3 Meses", valor: -3 },
  ];

  const esRestaSeleccionada = mesesSeleccionados < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
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
                <div className="space-y-6">
                    
                    {/* Sumar Tiempo */}
                    <div>
                        <p className="text-xs text-gray-500 font-bold mb-2 uppercase">Añadir Tiempo</p>
                        <div className="grid grid-cols-2 gap-2">
                            {opcionesSuma.map((opcion) => (
                                <button key={opcion.valor} onClick={() => setMesesSeleccionados(opcion.valor)}
                                    className={`px-3 py-3 rounded-lg text-xs font-bold border transition-all ${
                                        mesesSeleccionados === opcion.valor 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 ring-1 ring-indigo-500' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                                    }`}
                                >
                                    {opcion.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Restar Tiempo (Separado) */}
                    <div>
                         <p className="text-xs text-gray-400 font-bold mb-2 uppercase flex items-center gap-1"><Undo2 size={12}/> Correcciones</p>
                         <div className="flex gap-2">
                            {opcionesResta.map((opcion) => (
                                <button key={opcion.valor} onClick={() => setMesesSeleccionados(opcion.valor)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                        mesesSeleccionados === opcion.valor 
                                        ? 'bg-red-50 border-red-500 text-red-600 ring-1 ring-red-500' 
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                                    }`}
                                >
                                    {opcion.label}
                                </button>
                            ))}
                         </div>
                    </div>

                    <button 
                        onClick={handleRenovar}
                        disabled={loading}
                        className={`w-full py-3.5 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                            esRestaSeleccionada 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin"/> : esRestaSeleccionada ? <><Undo2 size={18}/> Corregir Fecha (Restar)</> : <><RefreshCw size={18}/> Confirmar Renovación</>}
                    </button>
                </div>
            )}

            {/* TAB ESTADO */}
            {tab === 'ESTADO' && (
                <div className="space-y-4">
                     <p className="text-center text-sm text-gray-500">Estado Actual: <span className="font-bold">{comercio.estado}</span></p>
                    {comercio.estado !== 'ACTIVO' && (
                        <button onClick={() => handleCambiarEstado('ACTIVO')} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200">Reactivar</button>
                    )}
                    {comercio.estado !== 'SUSPENDIDO' && (
                        <button onClick={() => handleCambiarEstado('SUSPENDIDO')} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200">Suspender</button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

interface ModalEliminarProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreItem?: string;
  loading: boolean;
}

export function ModalEliminar({ isOpen, onClose, onConfirm, nombreItem, loading }: ModalEliminarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">¿Eliminar Cliente?</h3>
            {nombreItem && (
                <p className="text-sm font-bold text-red-600 mt-2 bg-red-100/50 px-3 py-1 rounded-lg">
                    {nombreItem}
                </p>
            )}
        </div>

        <div className="p-6 text-center space-y-3">
            <p className="text-gray-500 text-sm leading-relaxed">
                Estás a punto de borrar este comercio, su usuario dueño y <strong>todo su historial de ventas</strong>.
            </p>
            <div className="text-gray-800 font-bold text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2 justify-center">
                ⚠️ Esta acción es irreversible.
            </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button 
                onClick={onClose} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <><Trash2 size={16}/> Sí, Eliminar</>}
            </button>
        </div>

      </div>
    </div>
  );
}