"use client";

import { useState, useEffect, Fragment } from 'react';
import { History, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Calendar, ChevronDown, ChevronUp, StickyNote, MessageSquare, Loader2 } from 'lucide-react';

export default function HistorialCierres({ recargarTrigger }: { recargarTrigger: number }) {
  const [cierres, setCierres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/caja/historial?page=${page}`);
      const data = await res.json();
      if (data.data) {
        setCierres(data.data);
        setTotalPages(data.pagination.pages);
        setExpandedId(null);
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

  const toggleExpand = (id: string) => {
    setExpandedId(current => current === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
      <div 
        onClick={() => setSeccionAbierta(!seccionAbierta)}
        className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <History className="text-indigo-500" size={22}/> Historial de Cierres
          </h3>
        </div>
        <div className="flex items-center gap-2">
            {seccionAbierta && (
                <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 hidden sm:block">
                Página {page} de {totalPages || 1}
                </span>
            )}
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase flex items-center gap-1 transition-colors hover:bg-indigo-100">
            {seccionAbierta ? 'Ocultar' : 'Ver'}
            {seccionAbierta ? <ChevronUp size={14} className="text-indigo-600"/> : <ChevronDown size={14} className="text-indigo-600"/>}
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
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Sistema</th>
              <th className="px-6 py-4">Real (Contado)</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4">Diferencia</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          
          <tbody className="block md:table-row-group p-4 md:p-0">
            {loading ? (
               <tr className="block md:table-row"><td colSpan={6} className="block md:table-cell px-6 py-12"><div className="flex justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8"/></div></td></tr>
            ) : cierres.length === 0 ? (
               <tr className="block md:table-row"><td colSpan={6} className="block md:table-cell px-6 py-8 text-center text-gray-400">No hay cierres registrados aún.</td></tr>
            ) : (
              cierres.map((cierre, index) => {
                const esPerfecto = Math.abs(cierre.diferencia) < 0.01;
                const tieneNotas = cierre.notas && cierre.notas.trim().length > 0;
                const isExpanded = expandedId === cierre.id;

                // Usamos Fragment con KEY para evitar problemas de lista
                return (
                  <Fragment key={cierre.id}>
                    {/* FILA PRINCIPAL */}
                    <tr 
                        className={`transition-colors group block md:table-row border border-gray-200 md:border-b md:border-x-0 md:border-t-0 md:border-gray-100 rounded-xl md:rounded-none mb-3 md:mb-0 p-3 md:p-0 cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')} hover:bg-gray-50`}
                        onClick={() => tieneNotas && toggleExpand(cierre.id)}
                    >
                        {/* MOBILE CARD VIEW */}
                        <td className="block md:hidden">
                            <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                               <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-sm">{new Date(cierre.fecha).toLocaleDateString('es-VE')}</span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Calendar size={10}/> {new Date(cierre.fecha).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit', hour12:true})}</span>
                               </div>
                               <div>
                                  {esPerfecto ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 uppercase"><CheckCircle2 size={12}/> Cuadrado</span>
                                  ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 uppercase"><AlertTriangle size={12}/> Descuadre</span>
                                  )}
                               </div>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sistema</span>
                                  <span className="text-gray-500 font-medium text-sm">${cierre.totalSistema.toFixed(2)}</span>
                               </div>
                               <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contado</span>
                                  <span className="font-bold text-gray-800 text-sm">${cierre.totalReal.toFixed(2)}</span>
                               </div>
                            </div>
                            <div className="flex justify-between items-end">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Diferencia</span>
                                  <span className={`font-bold text-sm ${esPerfecto ? 'text-gray-300' : 'text-red-500'}`}>
                                      {esPerfecto ? '--' : `${cierre.diferencia > 0 ? '+' : ''}${cierre.diferencia.toFixed(2)}`}
                                  </span>
                               </div>
                               {tieneNotas && (
                                   <div className={`p-1.5 flex items-center justify-center rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 bg-gray-100'}`}>
                                       {isExpanded ? <ChevronUp size={16}/> : <MessageSquare size={16}/>}
                                   </div>
                               )}
                            </div>
                        </td>

                        {/* DESKTOP TABLE VIEW */}
                        <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">
                            {new Date(cierre.fecha).toLocaleDateString('es-VE')}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10}/> {new Date(cierre.fecha).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit', hour12:true})}
                            </span>
                        </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500 font-medium">
                        ${cierre.totalSistema.toFixed(2)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-sm font-bold text-gray-800">
                        ${cierre.totalReal.toFixed(2)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-center">
                            {esPerfecto ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 uppercase">
                                    <CheckCircle2 size={12}/> Cuadrado
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100 uppercase">
                                    <AlertTriangle size={12}/> Descuadre
                                </span>
                            )}
                        </td>
                        <td className={`hidden md:table-cell px-6 py-4 font-bold text-sm ${esPerfecto ? 'text-gray-300' : 'text-red-500'}`}>
                        {esPerfecto ? '--' : `${cierre.diferencia > 0 ? '+' : ''}${cierre.diferencia.toFixed(2)}`}
                        </td>
                        
                        {/* BOTÓN TOGGLE */}
                        <td className="hidden md:table-cell px-6 py-4 text-right">
                            {tieneNotas && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(cierre.id);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                    title="Ver notas del cierre"
                                >
                                    {isExpanded ? <ChevronUp size={16}/> : <MessageSquare size={16}/>}
                                </button>
                            )}
                        </td>
                    </tr>

                    {/* FILA EXPANDIBLE (NOTAS) */}
                    {isExpanded && tieneNotas && (
                        <tr className="block md:table-row bg-indigo-50/30 animate-in fade-in slide-in-from-top-1 border-b border-indigo-50 -mt-2 rounded-b-xl md:mt-0 md:rounded-none">
                            <td colSpan={6} className="block md:table-cell px-3 md:px-6 pb-4 md:pb-6 pt-0">
                                <div className="ml-0 md:ml-4 mt-2 bg-white border border-indigo-100 rounded-xl p-3 md:p-4 shadow-sm flex items-start gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500 mt-0.5">
                                        <StickyNote size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-0.5 md:mb-1">Nota del Encargado</p>
                                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed italic">
                                            "{cierre.notas}"
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                  </Fragment>
                );
              })
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