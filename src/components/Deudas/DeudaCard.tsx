"use client";

import { Edit, Trash2, DollarSign, CheckCircle2, MessageCircle, CalendarDays, Receipt, ArrowRight, Clock, Plus, Calendar } from "lucide-react";

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
  const fechaRegistro = new Date(deuda.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });

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
            <div className="px-2 pb-2 space-y-1">
                {deuda.detalles.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 text-xs">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 uppercase w-12 text-center">
                                {item.cantidad} {item.porPeso ? 'kg' : 'und'}
                            </span>
                            <span className="text-gray-700 font-medium truncate max-w-[120px]">{item.nombre}</span>
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
                            <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0 text-xs">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 uppercase">
                                        {match[1]} {match[2]}
                                    </span>
                                    <span className="text-gray-700 font-medium truncate max-w-[120px]">{match[3]}</span>
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
    <div className={`rounded-2xl border transition-all hover:shadow-lg relative flex flex-col overflow-hidden group h-full ${esPagado ? 'bg-green-50/40 border-green-200' : 'bg-white border-gray-200'}`}>
      
      {/* HEADER CARD */}
      <div className="p-4 pb-2 flex justify-between items-start">
        <div className="w-[85%]">
            <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base truncate leading-none" title={deuda.persona}>{deuda.persona}</h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200">
                   <Clock size={10}/> {fechaRegistro}
                </span>
            </div>
            {deuda.telefono && (
                <a href={formatWhatsappUrl(deuda.telefono)} target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700 hover:underline decoration-green-300 transition-colors">
                    <MessageCircle size={12}/> {deuda.telefono}
                </a>
            )}
        </div>

        <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEditar(deuda)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14} /></button>
            <button onClick={() => onEliminar(deuda.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 flex-1 min-h-[80px]">
         <div className="bg-white rounded-lg p-1 border border-gray-100 h-full max-h-[150px] overflow-y-auto custom-scrollbar relative shadow-sm">
             {renderContenido()}
         </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 pt-3 mt-auto">
         {!esPagado && (
             <div className="mb-2">
                 <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                     <span>Abonado: ${deuda.abonado.toFixed(2)}</span>
                     <span>{porcentaje.toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-500 ${tipo === "COBRAR" ? 'bg-indigo-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(porcentaje, 100)}%` }}></div>
                 </div>
             </div>
         )}

         <div className="flex justify-between items-end">
             <div>
                 <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{esPagado ? "Total Pagado" : "Pendiente"}</p>
                 <div className="flex items-center gap-1">
                    <span className={`text-xl font-black leading-none ${esPagado ? 'text-green-600' : 'text-gray-900'}`}>
                        ${esPagado ? deuda.monto.toFixed(2) : restante.toFixed(2)}
                    </span>
                    {esPagado && <CheckCircle2 size={16} className="text-green-500"/>}
                 </div>
             </div>

             {!esPagado && (
                 <button 
                    onClick={() => onAbonar(deuda)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 hover:-translate-y-0.5 ${tipo === "COBRAR" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-orange-600 text-white hover:bg-orange-700"}`}
                 >
                    Abonar <ArrowRight size={14} strokeWidth={2.5}/>
                 </button>
             )}
         </div>
      </div>
    </div>
  );
}