"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';

export default function HistorialGastos({ recargarTrigger }: { recargarTrigger: number }) {
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [seccionAbierta, setSeccionAbierta] = useState(false);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/caja/gastos/historial?page=${page}`);
      const data = await res.json();
      if (data.data) {
        setGastos(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seccionAbierta) {
      cargarHistorial();
    }
  }, [page, recargarTrigger, seccionAbierta]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
      <div 
        onClick={() => setSeccionAbierta(!seccionAbierta)}
        className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <TrendingDown className="text-red-500" size={22}/> Historial de Gastos
          </h3>
        </div>
        <div className="flex items-center gap-2">
            {seccionAbierta && (
                <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 hidden sm:block">
                Página {page} de {totalPages || 1}
                </span>
            )}
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full uppercase flex items-center gap-1 transition-colors hover:bg-red-100">
            {seccionAbierta ? 'Ocultar' : 'Ver'}
            {seccionAbierta ? <ChevronUp size={14} className="text-red-600"/> : <ChevronDown size={14} className="text-red-600"/>}
            </span>
        </div>
      </div>

      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${seccionAbierta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100 hidden md:table-header-group">
                <tr>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              
              <tbody className="block md:table-row-group p-4 md:p-0">
                {loading ? (
                   <tr className="block md:table-row"><td colSpan={3} className="block md:table-cell px-6 py-12"><div className="flex justify-center"><Loader2 className="animate-spin text-red-500 w-8 h-8"/></div></td></tr>
                ) : gastos.length === 0 ? (
                   <tr className="block md:table-row"><td colSpan={3} className="block md:table-cell px-6 py-8 text-center text-gray-400">No hay gastos registrados.</td></tr>
                ) : (
                  gastos.map((gasto, index) => (
                    <tr key={gasto.id} className={`transition-colors group block md:table-row border border-gray-200 md:border-b md:border-x-0 md:border-t-0 md:border-gray-100 rounded-xl md:rounded-none mb-3 md:mb-0 p-3 md:p-0 ${index % 2 === 0 ? 'bg-white' : 'bg-red-50/20'}`}>
                      {/* MOBILE CARD VIEW */}
                      <td className="block md:hidden">
                          <div className="flex justify-between items-start mb-2 gap-2">
                             <span className="font-bold text-gray-800 text-sm leading-tight">{gasto.descripcion}</span>
                             <span className="font-black text-red-600 text-sm whitespace-nowrap">- ${gasto.monto.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-end mt-1">
                             <div className="flex flex-col">
                                <span className="font-medium text-gray-600 text-xs">{new Date(gasto.fecha).toLocaleDateString('es-VE')}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Calendar size={10}/> {new Date(gasto.fecha).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit', hour12:true})}</span>
                             </div>
                             {gasto.montoBs && (
                                <span className="text-xs text-gray-500 font-medium">(Bs. {gasto.montoBs.toFixed(2)})</span>
                             )}
                          </div>
                      </td>

                      {/* DESKTOP TABLE VIEW */}
                      <td className="hidden md:table-cell px-6 py-4 font-medium text-gray-700">{gasto.descripcion}</td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">
                            {new Date(gasto.fecha).toLocaleDateString('es-VE')}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10}/> {new Date(gasto.fecha).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit', hour12:true})}
                            </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-red-600 text-sm">
                                - ${gasto.monto.toFixed(2)}
                            </span>
                            {gasto.montoBs && (
                                <span className="text-xs text-gray-500 font-medium" title={`Tasa usada: Bs. ${gasto.tasaBCV}`}>
                                    (Bs. {gasto.montoBs.toFixed(2)})
                                </span>
                            )}
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
               <button 
                 onClick={() => setPage(p => Math.max(1, p - 1))} 
                 disabled={page === 1}
                 className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100"
               >
                 <ChevronLeft size={16}/>
               </button>
               <button 
                 onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                 disabled={page === totalPages}
                 className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100"
               >
                 <ChevronRight size={16}/>
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
