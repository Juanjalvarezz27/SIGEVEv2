"use client";

import { useState } from "react";
import { Calendar, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Pago {
  id: string;
  fecha: Date | string;
  monto: number;
  metodo: string;
  referencia: string | null;
  nota: string | null;
  meses: number | null;
  comercio: { nombre: string; slug: string };
}

export default function TablaPagos({ dataInicial }: { dataInicial: Pago[] }) {
  const [pagos, setPagos] = useState(dataInicial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Estado para el Modal
  const [pagoAEliminar, setPagoAEliminar] = useState<{id: string, meses: number | null} | null>(null);
  
  const router = useRouter();

  // 1. Abrir Modal
  const handleClickEliminar = (id: string, meses: number | null) => {
    setPagoAEliminar({ id, meses });
  };

  // 2. Ejecutar Borrado
  const confirmarEliminacion = async () => {
    if (!pagoAEliminar) return;

    setLoadingId(pagoAEliminar.id);
    try {
      const res = await fetch(`/api/admin/pagos/${pagoAEliminar.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Pago eliminado y tiempo revertido");
        setPagos(prev => prev.filter(p => p.id !== pagoAEliminar.id));
        router.refresh(); 
        setPagoAEliminar(null); // Cerrar modal
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Comercio</th>
                <th className="px-6 py-4 font-bold">Método</th>
                <th className="px-6 py-4 font-bold">Detalle</th>
                <th className="px-6 py-4 font-bold text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">No hay pagos registrados aún.</td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400"/>
                        {new Date(pago.fecha).toLocaleDateString()} 
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {pago.comercio.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 shadow-sm">
                        {pago.metodo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-indigo-500">{pago.referencia || "---"}</span>
                        <span className="text-[11px] text-gray-400">{pago.nota}</span>
                        {pago.meses ? <span className="text-[10px] text-emerald-600 font-bold">+{pago.meses} Meses</span> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-600 font-black bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        +${pago.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                          onClick={() => handleClickEliminar(pago.id, pago.meses)} 
                          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                          title="Eliminar registro"
                      >
                          <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN DE BORRADO --- */}
      {pagoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Rojo */}
            <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100 text-center relative">
                <button 
                  onClick={() => setPagoAEliminar(null)}
                  className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors"
                >
                  <X size={20}/>
                </button>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-200">
                    <AlertTriangle size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">¿Eliminar Pago?</h3>
            </div>

            {/* Body */}
            <div className="p-6 text-center space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                    Se eliminará este registro financiero del historial permanentemente.
                </p>
                
                {/* Advertencia Condicional de Tiempo */}
                {pagoAEliminar.meses && pagoAEliminar.meses > 0 ? (
                   <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-left">
                      <p className="text-[11px] font-bold text-orange-800 uppercase mb-1 flex items-center gap-1">
                        <AlertTriangle size={12}/> Consecuencia Automática:
                      </p>
                      <p className="text-xs text-orange-700 leading-snug">
                        Al borrar este pago, el sistema <strong>restará {pagoAEliminar.meses} mes(es)</strong> a la fecha de vencimiento del comercio automáticamente.
                      </p>
                   </div>
                ) : (
                   <div className="text-gray-400 text-xs italic">
                      Este pago no tiene tiempo asociado, solo se borrará el dinero.
                   </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                    onClick={() => setPagoAEliminar(null)} 
                    disabled={loadingId === pagoAEliminar.id}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm"
                >
                    Cancelar
                </button>
                <button 
                    onClick={confirmarEliminacion} 
                    disabled={loadingId === pagoAEliminar.id}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                    {loadingId === pagoAEliminar.id ? <Loader2 className="animate-spin" size={16}/> : <><Trash2 size={16}/> Eliminar</>}
                </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}