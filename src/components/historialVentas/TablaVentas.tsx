"use client";

import { useState } from 'react';
import {
  Eye, ShoppingBag, X, CheckCircle2,
  Send, CreditCard, User, FileText, Calendar
} from 'lucide-react';

interface Venta {
  id: string;
  total: number;
  totalBs: number;
  fechaHora: string;
  metodoPago: { nombre: string };
  productos: any[];
  deuda?: {
    persona: string;
    descripcion: string;
    detalles?: any;
  };
}

interface Props {
  ventas: Venta[];
  cargando: boolean;
}

export default function TablaVentasDetalladas({ ventas, cargando }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [telefonoReceptor, setTelefonoReceptor] = useState("");

  const abrirRecibo = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setTelefonoReceptor("");
    setModalOpen(true);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-VE', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const enviarPorWhatsApp = () => {
    if (!ventaSeleccionada || !telefonoReceptor) return;

    // 1. Formatear Fecha y Hora
    const fechaObj = new Date(ventaSeleccionada.fechaHora);
    const fechaStr = fechaObj.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = fechaObj.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });

    // 2. Calcular Tasa Implícita (TotalBs / Total$)
    const tasaCalculada = ventaSeleccionada.total > 0 
        ? (ventaSeleccionada.totalBs / ventaSeleccionada.total).toFixed(2) 
        : "0.00";

    // --- CAMBIO 1: TÍTULO DEL MENSAJE DE WHATSAPP ---
    let mensaje = `*RESUMEN DE COMPRA (NO FISCAL)*\n`; 
    mensaje += `${fechaStr} - ${horaStr}\n`;
    mensaje += `--------------------------------\n`;

    // 4. Cuerpo (Productos o Deuda)
    if (ventaSeleccionada.deuda) {
      mensaje += `*Cliente:* ${ventaSeleccionada.deuda.persona}\n`;
      mensaje += `*Concepto:*\n`;
      
      if (ventaSeleccionada.deuda.detalles && Array.isArray(ventaSeleccionada.deuda.detalles)) {
         ventaSeleccionada.deuda.detalles.forEach((p: any) => {
            const unidad = p.porPeso ? 'kg' : 'und';
            mensaje += `• ${p.cantidad}${unidad} x ${p.nombre}\n`;
         });
      } else {
         mensaje += `${ventaSeleccionada.deuda.descripcion || "Pago de cuenta pendiente"}\n`;
      }
      
    } else {
      mensaje += `*Detalle:*\n`;
      ventaSeleccionada.productos.forEach(p => {
        const unidad = p.peso ? 'kg' : 'und'; 
        const cantidadStr = p.peso ? p.peso : p.cantidad;
        mensaje += `• ${cantidadStr} ${unidad} x ${p.producto.nombre}\n`;
      });
    }

    mensaje += `--------------------------------\n`;

    // 5. Totales y Método
    mensaje += `*TOTAL: $${ventaSeleccionada.total.toFixed(2)}*\n`;
    mensaje += `Bs: ${ventaSeleccionada.totalBs.toFixed(2)}\n`;
    mensaje += `Ref. Tasa: Bs ${tasaCalculada}\n\n`;
    mensaje += `Método: ${ventaSeleccionada.metodoPago.nombre}\n`;
    
    // --- CAMBIO 2: PIE DE PÁGINA LEGAL ---
    mensaje += `--------------------------------\n`;
    mensaje += `_Este es un resumen de operación interna y NO sustituye la Factura Fiscal._`;

    // 7. Enviar
    let numeroFinal = telefonoReceptor.replace(/\D/g, '');
    if (numeroFinal.startsWith('0')) numeroFinal = '58' + numeroFinal.substring(1);
    else if (!numeroFinal.startsWith('58')) numeroFinal = '58' + numeroFinal;

    window.open(`https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // --- RENDERIZADOR DE DEUDA ---
  const renderDetalleDeuda = (deuda: any) => {
    if (deuda.detalles && Array.isArray(deuda.detalles) && deuda.detalles.length > 0) {
        return (
            <div className="space-y-1">
                {deuda.detalles.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-white rounded px-1 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded h-8 w-8 shadow-sm flex-shrink-0">
                                <span className="text-xs font-bold text-gray-700">{item.cantidad}</span>
                                <span className="text-[7px] font-bold text-gray-400 uppercase leading-none">{item.porPeso ? 'kg' : 'und'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-700 truncate">{item.nombre}</p>
                                <p className="text-[10px] text-gray-400 font-medium">${item.precio} c/u</p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-gray-900">${(item.cantidad * item.precio).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const texto = deuda.descripcion || "";
    if (!texto) return <p className="text-sm text-gray-400 italic">Sin detalles.</p>;

    return texto.split('\n').map((linea: string, i: number) => {
        if (linea.includes("---") || linea.includes("Agregado el")) {
            const fechaMatch = linea.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            const fecha = fechaMatch ? fechaMatch[0] : "Fecha Anterior";
            return (
                <div key={i} className="flex items-center gap-3 my-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 uppercase flex items-center gap-1.5 tracking-wider">
                        <Calendar size={10}/> {fecha}
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
            );
        }
        const regexProducto = /• ([\d\.]+) (kg|unid) x (.+) \(\$([\d\.]+)\) ➝ \$([\d\.]+)/;
        const match = linea.match(regexProducto);

        if (match) {
            const [_, cantidad, unidad, nombre, precioUnit, total] = match;
            return (
                <div key={i} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 group hover:bg-white transition-colors rounded-lg px-1">
                    <div className="flex items-start gap-3 flex-1 min-w-0"> 
                        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg h-9 w-9 shadow-sm flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">{cantidad}</span>
                            <span className="text-[7px] font-bold text-gray-400 uppercase leading-none">{unidad}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{nombre}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                ${precioUnit} c/u
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-gray-900">${total}</p>
                    </div>
                </div>
            );
        }

        if (!linea.trim()) return null;
        return <p key={i} className="text-xs text-gray-600 py-1 pl-2 border-l-2 border-gray-200 ml-1">{linea}</p>;
    });
  };

  if (cargando) {
      return <div className="bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-100 animate-pulse">Cargando historial...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Movimientos del Día</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          {ventas.length} Transacciones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold w-24">Hora</th>
              <th className="px-6 py-4 font-semibold">Tipo y Método</th>
              <th className="px-6 py-4 font-semibold text-right">Total Bs</th>
              <th className="px-6 py-4 font-semibold text-right">Total $</th>
              <th className="px-6 py-4 font-semibold text-center w-20">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No hay ventas registradas hoy.
                </td>
              </tr>
            ) : (
              ventas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                    {formatFecha(venta.fechaHora)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        {venta.deuda ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap shadow-sm">
                                DEUDA
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap shadow-sm">
                                VENTA
                            </span>
                        )}
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[120px]" title={venta.metodoPago.nombre}>
                            {venta.metodoPago.nombre}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600 whitespace-nowrap">
                    Bs {venta.totalBs.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 whitespace-nowrap">
                    $ {venta.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => abrirRecibo(venta)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95"
                      title="Ver Nota de Entrega"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && ventaSeleccionada && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">

            <div className={`p-6 text-white text-center relative flex-shrink-0 ${ventaSeleccionada.deuda ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-600 to-blue-600'}`}>
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
                {ventaSeleccionada.deuda ? <FileText size={24}/> : <CheckCircle2 size={28} />}
              </div>
              <h3 className="text-xl font-bold tracking-tight">Nota de Entrega (NO FISCAL)</h3>
              <p className="text-white/90 text-xs font-medium opacity-90 mt-1 uppercase tracking-wide">
                {new Date(ventaSeleccionada.fechaHora).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-gray-50/30">

              <div className="text-center mb-6">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Monto Pagado</p>
                <div className="text-4xl font-black text-gray-900 tracking-tighter">
                  ${ventaSeleccionada.total.toFixed(2)}
                </div>
                <p className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full mt-2 border border-gray-200">
                  Bs. {ventaSeleccionada.totalBs.toFixed(2)}
                </p>
              </div>

              <div className="border-t border-dashed border-gray-200 my-5"></div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-3 flex items-center gap-1.5 tracking-wide">
                  <ShoppingBag size={14}/> {ventaSeleccionada.deuda ? 'Detalle de la Cuenta' : 'Productos'}
                </p>

                <div className="bg-gray-50 rounded-xl p-1 border border-gray-100">
                  {ventaSeleccionada.deuda ? (
                    <div className="space-y-4 p-3">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-200/50">
                            <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                                <User size={20}/>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Cliente</p>
                                <p className="text-base font-bold text-gray-800 leading-none">{ventaSeleccionada.deuda.persona}</p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            {renderDetalleDeuda(ventaSeleccionada.deuda)}
                        </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {ventaSeleccionada.productos.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-2 border-b border-gray-100 last:border-0 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-white h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-600 border border-gray-200 shadow-sm flex-shrink-0">
                              {item.cantidad}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-700 truncate">
                                    {item.producto.nombre}
                                </span>
                                <span className="text-[10px] text-gray-400">Unit: ${item.precioUnitario}</span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 flex-shrink-0 ml-2">
                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs bg-white p-4 rounded-xl border border-gray-100 text-gray-500 mt-5 shadow-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CreditCard size={14}/> Método de Pago
                </span>
                <span className="font-bold uppercase text-gray-800">{ventaSeleccionada.metodoPago.nombre}</span>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex-shrink-0">
              {/* --- CAMBIO 3: ETIQUETA DE LA UI CAMBIADA --- */}
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1 tracking-wide">
                Enviar Nota de Entrega
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">+58</span>
                    <input
                    type="tel"
                    placeholder="412..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 transition-all"
                    value={telefonoReceptor}
                    onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) setTelefonoReceptor(e.target.value);
                    }}
                    />
                </div>
                <button
                  onClick={enviarPorWhatsApp}
                  disabled={telefonoReceptor.length < 10}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-green-200 active:scale-95"
                  title="Enviar por WhatsApp"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}