"use client";

import { Edit, Trash2, DollarSign, CheckCircle2, MessageCircle, CalendarCheck } from "lucide-react";

interface DeudaCardProps {
  deuda: any;
  tipo: "COBRAR" | "PAGAR";
  onAbonar: (deuda: any) => void;
  onEditar: (deuda: any) => void;
  onEliminar: (id: string) => void;
}

export default function DeudaCard({ deuda, tipo, onAbonar, onEditar, onEliminar }: DeudaCardProps) {
  const restante = deuda.monto - deuda.abonado;
  const porcentaje = (deuda.abonado / deuda.monto) * 100;
  const esPagado = deuda.estado === "PAGADO";

  const fechaPagoFormateada = deuda.fechaPago 
    ? new Date(deuda.fechaPago).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  // --- LÓGICA PARA ARREGLAR EL NÚMERO ---
  const formatWhatsappUrl = (telefono: string) => {
    // 1. Quitar cualquier caracter que no sea número
    let limpio = telefono.replace(/\D/g, '');
    
    // 2. Si empieza por '0' (ej: 0412...), quitamos el 0 y ponemos 58
    if (limpio.startsWith('0')) {
        limpio = '58' + limpio.substring(1);
    } 
    // 3. Si por casualidad puso 412... sin el 0, le agregamos el 58
    else if (!limpio.startsWith('58') && limpio.length === 10) {
        limpio = '58' + limpio;
    }
    
    return `https://wa.me/${limpio}`;
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-lg relative group ${esPagado ? 'border-green-100 bg-green-50/30' : 'border-gray-200'}`}>
      
      {/* Botones de Acción */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
         <button onClick={() => onEditar(deuda)} className="p-1.5 bg-white text-gray-400 hover:text-indigo-600 border border-gray-100 rounded-lg shadow-sm" title="Editar">
            <Edit size={16} />
         </button>
         <button onClick={() => onEliminar(deuda.id)} className="p-1.5 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-lg shadow-sm" title="Eliminar">
            <Trash2 size={16} />
         </button>
      </div>

      {/* Header Card */}
      <div className="mb-3 pr-16">
         <div className="font-bold text-gray-800 text-lg truncate w-full" title={deuda.persona}>
            {deuda.persona}
         </div>
         
         {/* ENLACE DE WHATSAPP CORREGIDO */}
         {deuda.telefono && (
             <a 
               href={formatWhatsappUrl(deuda.telefono)} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 px-2 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 w-fit mt-1.5 transition-colors no-underline"
             >
                <MessageCircle size={14} className="flex-shrink-0"/> 
                <span>
                    Mandar mensaje: <span className="font-black text-green-700">{deuda.telefono}</span>
                </span>
             </a>
         )}
      </div>
      
      {/* Descripción */}
      <div className="text-sm text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100 min-h-[60px] shadow-sm">
        {deuda.descripcion ? (
            <p className="whitespace-pre-line leading-relaxed">{deuda.descripcion}</p>
        ) : <span className="text-gray-400 italic">Sin descripción</span>}
      </div>
      
      {/* Barra o Fecha Pago */}
      {esPagado ? (
         <div className="mb-4 bg-green-100/50 rounded-lg p-2 flex items-center justify-center gap-2 text-green-700 text-sm font-bold border border-green-200">
            <CalendarCheck size={16}/>
            Pagado el: {fechaPagoFormateada || "Fecha desconocida"}
         </div>
      ) : (
         <>
            <div className="flex justify-between text-xs text-gray-400 mb-1 font-medium">
                <span>Pagado: ${deuda.abonado.toFixed(2)}</span>
                <span>Total: ${deuda.monto.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full mb-4 overflow-hidden shadow-inner">
                <div 
                className={`h-full transition-all duration-500 ${tipo === "COBRAR" ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                ></div>
            </div>
         </>
      )}

      {/* Footer Card */}
      <div className="flex justify-between items-end border-t border-gray-100 pt-3">
         <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {esPagado ? "Monto Total" : "Restante"}
            </div>
            <div className={`font-black text-xl ${esPagado ? 'text-green-600 line-through decoration-2 opacity-60' : 'text-gray-800'}`}>
                ${esPagado ? deuda.monto.toFixed(2) : restante.toFixed(2)}
            </div>
         </div>
         
         {!esPagado ? (
            <button 
              onClick={() => onAbonar(deuda)}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border transition-colors shadow-sm ${tipo === "COBRAR" ? "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "text-orange-700 border-orange-200 bg-orange-50 hover:bg-orange-100"}`}
            >
              <DollarSign size={14} /> Abonar
            </button>
         ) : (
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold px-3 py-1 bg-white rounded-full border border-green-200 shadow-sm">
                <CheckCircle2 size={14}/> Completado
            </div>
         )}
      </div>
    </div>
  );
}