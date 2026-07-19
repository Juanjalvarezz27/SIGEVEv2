"use client";

import { Edit, Trash2, CheckCircle2, MessageCircle, Receipt, ArrowRight, Clock, Calendar, ChevronRight } from "lucide-react";

interface DeudaCardProps {
  deuda: any;
  tipo: "COBRAR" | "PAGAR";
  onAbonar: (deuda: any) => void;
  onEditar: (deuda: any) => void;
  onEliminar: (id: string) => void;
}

export default function DeudaCard({ deuda, tipo, onAbonar, onEditar, onEliminar }: DeudaCardProps) {
  const restante = deuda.monto - deuda.abonado;
  const porcentaje = deuda.monto > 0 ? (deuda.abonado / deuda.monto) * 100 : 0;
  const esPagado = deuda.estado === "PAGADO";
  const fechaRegistro = new Date(deuda.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "??";
  };

  const formatWhatsappUrl = (telefono: string) => {
    let limpio = telefono.replace(/\D/g, '');
    if (limpio.startsWith('0')) limpio = '58' + limpio.substring(1);
    else if (!limpio.startsWith('58') && limpio.length === 10) limpio = '58' + limpio;
    return `https://wa.me/${limpio}`;
  };

  // --- RENDERIZADOR HÍBRIDO (JSON O TEXTO) ---
  const renderContenido = () => {
      // 1. SI HAY JSON (NUEVO SISTEMA)
      if (deuda.detalles && Array.isArray(deuda.detalles) && deuda.detalles.length > 0) {
          return (
            <div className="space-y-2.5 px-1 pb-2 mt-1">
                {deuda.detalles.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm group">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg uppercase min-w-[42px] text-center shadow-sm">
                                {item.cantidad} {item.porPeso ? 'kg' : 'un'}
                            </span>
                            <span className="text-gray-800 font-medium truncate max-w-[160px]">{item.nombre}</span>
                        </div>
                        <div className="font-bold text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</div>
                    </div>
                ))}
            </div>
          );
      }

      // 2. SI ES TEXTO (SISTEMA VIEJO)
      if (deuda.descripcion) {
          return (
             <div className="px-2 pb-2">
                 {deuda.descripcion.split('\n').map((linea: string, i: number) => {
                    const regex = /• ([\d\.]+) (kg|unid) x (.+) \(\$([\d\.]+)\) ➝ \$([\d\.]+)/;
                    const match = linea.match(regex);
                    if (match) {
                        return (
                            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 text-sm">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                    <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded-lg uppercase shadow-sm min-w-[42px] text-center">
                                        {match[1]} {match[2]}
                                    </span>
                                    <span className="text-gray-800 font-medium truncate max-w-[160px]">{match[3]}</span>
                                </div>
                                <span className="font-bold text-gray-900">${match[5]}</span>
                            </div>
                        );
                    }
                    if (linea.includes("---")) {
                        const fecha = linea.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)?.[0] || "Fecha"; 
                        return (
                            <div key={i} className="flex items-center gap-2 my-2">
                                <div className="h-[1px] bg-indigo-100 flex-1"></div>
                                <span className="text-[8px] font-bold text-indigo-400 uppercase bg-white px-2 py-0.5 border border-indigo-100 rounded-full flex items-center gap-1">
                                    <Calendar size={8} /> {fecha}
                                </span>
                                <div className="h-[1px] bg-indigo-100 flex-1"></div>
                            </div>
                        );
                    }
                    if(linea.trim()) return <p key={i} className="text-[10px] text-gray-500 py-0.5 pl-1">{linea}</p>;
                    return null;
                 })}
             </div>
          );
      }

      return (
         <div className="h-full flex flex-col items-center justify-center text-gray-300">
             <Receipt size={24} className="opacity-20 mb-1"/>
             <p className="text-[10px] italic">Sin detalle</p>
         </div>
      );
  };

  return (
    <div className={`rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col overflow-hidden bg-white ${esPagado ? 'border-green-200 shadow-green-100/50' : 'border-gray-200'}`}>
      
      {/* HEADER CARD */}
      <div className="p-5 pb-3 flex justify-between items-start">
        <div className="flex gap-3 items-center w-full">
            <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center text-lg font-black text-white shadow-inner ${esPagado ? 'bg-gradient-to-br from-green-400 to-green-500' : tipo === "COBRAR" ? "bg-gradient-to-br from-indigo-500 to-blue-600" : "bg-gradient-to-br from-orange-400 to-red-500"}`}>
                {getInitials(deuda.persona)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg truncate leading-tight" title={deuda.persona}>{deuda.persona}</h3>
                    {deuda.cedula && <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded" title="Cédula/RIF">{deuda.cedula}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                       <Clock size={12}/> {fechaRegistro}
                    </span>
                    {deuda.telefono && (
                        <a href={formatWhatsappUrl(deuda.telefono)} target="_blank" rel="noopener noreferrer" 
                           className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors">
                            <MessageCircle size={14}/> Contactar
                        </a>
                    )}
                </div>
            </div>
        </div>

        <div className="flex flex-row gap-1.5 ml-2">
            <button onClick={() => onEditar(deuda)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors" title="Editar Deuda"><Edit size={16} /></button>
            <button onClick={() => onEliminar(deuda.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar Deuda"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* BODY */}
      <div className="px-5 flex-1 min-h-[140px] mt-2 relative">
         <div className="h-full max-h-[220px] overflow-y-auto custom-scrollbar relative pr-2">
             {renderContenido()}
         </div>
         {/* Gradiente para disimular scroll si es muy largo */}
         <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>

      {/* FOOTER */}
      <div className="p-5 pt-4 bg-gray-50/50 mt-auto border-t border-gray-100/50">
         {!esPagado && (
             <div className="mb-4">
                 <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                     <span>Abonado: <span className="text-gray-900">${deuda.abonado.toFixed(2)}</span></span>
                     <span className={tipo === "COBRAR" ? "text-indigo-600" : "text-orange-600"}>{porcentaje.toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                     <div className={`h-full rounded-full transition-all duration-1000 ease-out ${tipo === "COBRAR" ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                 </div>
             </div>
         )}

         <div className="flex justify-between items-center">
             <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{esPagado ? "Total Pagado" : "Pendiente"}</p>
                 <div className="flex items-center gap-1.5">
                    <span className={`text-2xl font-black leading-none tracking-tight ${esPagado ? 'text-green-500' : 'text-gray-900'}`}>
                        ${esPagado ? deuda.monto.toFixed(2) : restante.toFixed(2)}
                    </span>
                    {esPagado && <CheckCircle2 size={20} strokeWidth={2.5} className="text-green-500 shadow-sm rounded-full"/>}
                 </div>
             </div>

             {!esPagado && (
                 <button 
                    onClick={() => onAbonar(deuda)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-lg transition-all active:scale-95 hover:-translate-y-0.5 ${tipo === "COBRAR" ? "bg-indigo-600 shadow-indigo-200 text-white hover:bg-indigo-700" : "bg-orange-600 shadow-orange-200 text-white hover:bg-orange-700"}`}
                 >
                    Abonar <ChevronRight size={16} strokeWidth={3}/>
                 </button>
             )}
         </div>
      </div>
    </div>
  );
}