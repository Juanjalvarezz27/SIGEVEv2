"use client";

import { useState } from 'react';
import { 
  Eye, ShoppingBag, X, CheckCircle2, AlertCircle, 
  Send, CreditCard, User
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
  }; 
}

interface Props {
  ventas: Venta[];
  periodo: string;
}

export default function TablaVentasDetalladas({ ventas }: Props) {
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

  // --- LÓGICA WHATSAPP (TEXTO PLANO + NUMERO 0412) ---
  const enviarPorWhatsApp = () => {
    if (!ventaSeleccionada || !telefonoReceptor) return;

    const fecha = new Date(ventaSeleccionada.fechaHora).toLocaleDateString('es-VE');
    
    // 1. Construir mensaje SIN EMOJIS
    let mensaje = `NOTA DE ENTREGA\n`;
    mensaje += `Fecha: ${fecha}\n`;
    mensaje += `Total: $${ventaSeleccionada.total.toFixed(2)}\n`;
    mensaje += `Bs: ${ventaSeleccionada.totalBs.toFixed(2)}\n\n`;
    
    mensaje += `DETALLE:\n`;
    
    if (ventaSeleccionada.deuda) {
       // Mensaje específico para deuda
       mensaje += `PAGO DE DEUDA\n`;
       mensaje += `Cliente: ${ventaSeleccionada.deuda.persona}\n`;
       mensaje += `Nota: ${ventaSeleccionada.deuda.descripcion || "Liquidacion de cuenta"}\n`;
    } else {
       // Mensaje para productos
       ventaSeleccionada.productos.forEach(p => {
          mensaje += `${p.cantidad}x ${p.producto.nombre}\n`;
       });
    }

    mensaje += `\nMetodo: ${ventaSeleccionada.metodoPago.nombre}`;
    
    let numeroFinal = telefonoReceptor.replace(/\D/g, ''); 
    if (numeroFinal.startsWith('0')) {
        numeroFinal = '58' + numeroFinal.substring(1);
    } else if (!numeroFinal.startsWith('58')) {
        numeroFinal = '58' + numeroFinal;
    }

    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Desglose de Operaciones</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {ventas.length} Transacciones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">Hora</th>
              <th className="px-6 py-4 font-semibold">Método</th>
              <th className="px-6 py-4 font-semibold text-right">Total Bs</th>
              <th className="px-6 py-4 font-semibold text-right">Total $</th>
              <th className="px-6 py-4 font-semibold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ventas.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No hay movimientos registrados.
                    </td>
                </tr>
            ) : (
                ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {formatFecha(venta.fechaHora)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {venta.metodoPago.nombre}
                      </span>
                    </td>
                    {/* COLOR AGREGADO: Azul para Bolívares */}
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      Bs. {venta.totalBs.toFixed(2)}
                    </td>
                    {/* COLOR AGREGADO: Verde para Dólares */}
                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                      ${venta.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => abrirRecibo(venta)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Ver Nota"
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

      {modalOpen && ventaSeleccionada && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">

            <div className="bg-indigo-600 p-6 text-white text-center relative flex-shrink-0">
                <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                    <X size={20} />
                </button>
                <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                    <CheckCircle2 size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">Nota de Entrega</h3>
                <p className="text-indigo-100 text-sm opacity-90">
                    {new Date(ventaSeleccionada.fechaHora).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* BODY SCROLLABLE */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                
                <div className="text-center mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Monto Total</p>
                    <div className="text-4xl font-black text-gray-900 tracking-tight">
                        ${ventaSeleccionada.total.toFixed(2)}
                    </div>
                    <p className="text-sm font-bold text-gray-500 bg-gray-50 inline-block px-3 py-1 rounded-full mt-1">
                        Bs. {ventaSeleccionada.totalBs.toFixed(2)}
                    </p>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4"></div>

                {/* DETALLE (CON SCROLL) */}
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-1">
                        <ShoppingBag size={14}/> Detalle
                    </p>
                    
                    <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto border border-gray-100">
                        {ventaSeleccionada.deuda ? (
                            <div className="flex items-start gap-3 p-2">
                                <div className="mt-0.5">
                                    <AlertCircle size={18} className="text-indigo-600"/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 uppercase">Pago de Deuda</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                        <User size={12}/> {ventaSeleccionada.deuda.persona}
                                    </div>
                                    <p className="text-xs text-gray-500 italic mt-1 pl-2 border-l-2 border-indigo-200">
                                        "{ventaSeleccionada.deuda.descripcion || "Sin descripción"}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ventaSeleccionada.productos.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200/50 last:border-0 pb-1 last:pb-0">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white h-5 w-5 flex items-center justify-center rounded text-xs font-bold text-gray-500 border border-gray-200 shadow-sm">
                                                {item.cantidad}
                                            </span>
                                            <span className="text-gray-700 font-medium truncate max-w-[140px]">
                                                {item.producto.nombre}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Metodo */}
                <div className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100 text-gray-600 mt-4 shadow-sm">
                    <span className="flex items-center gap-2 font-semibold">
                        <CreditCard size={16}/> Método
                    </span>
                    <span className="font-bold uppercase">{ventaSeleccionada.metodoPago.nombre}</span>
                </div>
            </div>

            {/* FOOTER (INPUT TELEFONO) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block ml-1">
                    Enviar Digitalmente
                </label>
                <div className="flex gap-2">
                    <input 
                        type="tel"
                        placeholder="04127777777" 
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        value={telefonoReceptor}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) setTelefonoReceptor(e.target.value);
                        }}
                    />
                    <button 
                        onClick={enviarPorWhatsApp}
                        disabled={telefonoReceptor.length < 10} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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