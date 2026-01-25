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
  
  // Valor por defecto 1 mes
  const [mesesSeleccionados, setMesesSeleccionados] = useState(1);

  if (!isOpen || !comercio) return null;

  const handleRenovar = async () => {
    setLoading(true);
    const esResta = mesesSeleccionados < 0;
    try {
      const res = await fetch(`/api/admin/comercios/${comercio.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'RENOVAR', meses: mesesSeleccionados })
      });
      
      if (res.ok) {
        toast.success(esResta ? `Se restaron ${Math.abs(mesesSeleccionados)} meses.` : `¡Suscripción renovada exitosamente!`);
        onSuccess();
        onClose();
      } else {
        toast.error("Error al procesar la solicitud");
      }
    } catch(e) { toast.error("Error de conexión"); }
    finally { setLoading(false); }
  };

  // ... (handleCambiarEstado sigue igual)
  const handleCambiarEstado = async (nuevoEstado: string) => {
      setLoading(true);
      try {
          const res = await fetch(`/api/admin/comercios/${comercio.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: nuevoEstado })
          });
          if (res.ok) {
              toast.success(`Estado actualizado a ${nuevoEstado}`);
              onSuccess();
              onClose();
          }
      } catch(e) { toast.error("Error"); }
      finally { setLoading(false); }
    };

  // OPCIONES DE RENOVACIÓN (Incluyendo Restas)
  const opcionesRenovacion = [
    { label: "+1 Mes", valor: 1, desc: "Sumar 30 días", tipo: "suma" },
    { label: "+3 Meses", valor: 3, desc: "Sumar 90 días", tipo: "suma" },
    { label: "+6 Meses", valor: 6, desc: "Sumar 180 días", tipo: "suma" },
    { label: "+1 Año", valor: 12, desc: "Sumar 365 días", tipo: "suma" },
    // Opciones de corrección
    { label: "-1 Mes", valor: -1, desc: "Restar 30 días", tipo: "resta" },
    { label: "-3 Meses", valor: -3, desc: "Restar 90 días", tipo: "resta" },
  ];

  const esRestaSeleccionada = mesesSeleccionados < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white border-b p-4 pb-0 relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h3 className="text-lg font-black text-gray-900 text-center">{comercio.nombre}</h3>
            <p className="text-center text-xs text-gray-400 mb-4 font-mono">@{comercio.slug}</p>
            
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-4">
                <button 
                    onClick={() => setTab('RENOVAR')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'RENOVAR' ? 'bg-white shadow text-indigo-600 ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Calendar size={14}/> Suscripción
                </button>
                <button 
                    onClick={() => setTab('ESTADO')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${tab === 'ESTADO' ? 'bg-white shadow text-indigo-600 ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Power size={14}/> Estado
                </button>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
            {/* TAB RENOVAR */}
            {tab === 'RENOVAR' && (
                <div className="space-y-6">
                    {/* Fecha Actual */}
                    <div className="text-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Vence el día</p>
                        <p className={`text-xl font-black ${new Date(comercio.fechaVencimiento) < new Date() ? 'text-red-500' : 'text-gray-800'}`}>
                            {new Date(comercio.fechaVencimiento).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Selector de Meses (GRID) */}
                    <div>
                        <p className="text-xs text-gray-700 font-bold mb-3 uppercase tracking-wider">Selecciona acción:</p>
                        <div className="grid grid-cols-2 gap-3">
                            {opcionesRenovacion.map((opcion) => {
                                const isSelected = mesesSeleccionados === opcion.valor;
                                const isResta = opcion.tipo === 'resta';
                                
                                let btnClass = 'bg-white border-gray-200 hover:border-indigo-200 hover:bg-gray-50 text-gray-700';
                                if (isSelected && !isResta) btnClass = 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-700';
                                if (isSelected && isResta) btnClass = 'bg-red-50 border-red-500 ring-1 ring-red-500 text-red-700';
                                if (!isSelected && isResta) btnClass = 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50 text-red-600';

                                return (
                                <button
                                    key={opcion.valor}
                                    onClick={() => setMesesSeleccionados(opcion.valor)}
                                    className={`p-3 rounded-xl border text-left transition-all relative ${btnClass}`}
                                >
                                    <span className="block font-black text-lg">
                                        {opcion.label}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase ${isSelected ? 'opacity-100' : 'opacity-60'}`}>{opcion.desc}</span>
                                    
                                    {isSelected && (
                                        <div className="absolute top-3 right-3">
                                            {isResta ? <Undo2 size={18} strokeWidth={3}/> : <Check size={18} strokeWidth={3}/>}
                                        </div>
                                    )}
                                </button>
                            )})}
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
                        {loading ? <Loader2 className="animate-spin"/> : esRestaSeleccionada ? <><Undo2 size={18}/> Corregir / Restar Tiempo</> : <><RefreshCw size={18}/> Confirmar Renovación</>}
                    </button>
                </div>
            )}

            {/* TAB ESTADO (Se mantiene igual) */}
            {tab === 'ESTADO' && (
                <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-gray-100 text-sm text-gray-600 mb-4 text-center shadow-sm">
                        <p>Estado actual: <span className={`font-black uppercase ${comercio.estado === 'ACTIVO' ? 'text-emerald-600' : 'text-red-600'}`}>{comercio.estado}</span></p>
                    </div>

                    {comercio.estado !== 'ACTIVO' && (
                        <button onClick={() => handleCambiarEstado('ACTIVO')} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-2 shadow-lg shadow-emerald-200 transition-transform active:scale-95">
                            <ShieldCheck size={20}/> Reactivar Servicio
                        </button>
                    )}

                    {comercio.estado !== 'SUSPENDIDO' && (
                        <button onClick={() => handleCambiarEstado('SUSPENDIDO')} className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 flex justify-center items-center gap-2 shadow-lg shadow-red-200 transition-transform active:scale-95">
                            <AlertTriangle size={20}/> Suspender (Falta de Pago)
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}