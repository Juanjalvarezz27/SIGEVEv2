import { Calendar, CreditCard, Package, Eye, Clock, ChevronDown, ChevronUp, Weight, Receipt, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';

interface Venta {
  id: string;
  total: number;
  totalBs: number;
  tasaBCV: number;
  fechaHora: string;
  metodoPago: { nombre: string };
  productos: any[];
}

export default function TablaVentas({ ventas, cargando }: { ventas: Venta[], cargando: boolean }) {
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null);

  const toggleExpandir = (id: string) => {
    if (ventaExpandida === id) {
      setVentaExpandida(null);
    } else {
      setVentaExpandida(id);
    }
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getMetodoStyle = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('pago movil') || n.includes('móvil')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (n.includes('efectivo') || n.includes('cash')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (n.includes('zelle')) return 'bg-purple-50 text-purple-700 border-purple-100';
    if (n.includes('punto') || n.includes('tarjeta')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (cargando) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
       <p className="text-gray-400 animate-pulse">Cargando transacciones...</p>
    </div>
  );

  if (ventas.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
       <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="text-gray-400" size={32}/>
       </div>
       <h3 className="text-lg font-bold text-gray-800">No hay ventas registradas</h3>
       <p className="text-gray-500 mt-1">Las ventas de esta página aparecerán aquí.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      
      {/* Header de la Tabla */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Receipt size={18} className="text-indigo-500"/>
          Transacciones
        </h2>
        <span className="text-xs font-medium bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-500 shadow-sm">
          Vista actual: {ventas.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left text-gray-400">Hora</th>
              <th className="px-6 py-4 text-left text-gray-400">Total</th>
              <th className="px-6 py-4 text-left text-gray-400">Método</th>
              <th className="px-6 py-4 text-left text-gray-400">Items</th>
              <th className="px-6 py-4 text-right text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ventas.map((venta) => {
              const isExpanded = ventaExpandida === venta.id;
              
              return (
                <React.Fragment key={venta.id}>
                  {/* FILA PRINCIPAL */}
                  <tr 
                    onClick={() => toggleExpandir(venta.id)}
                    className={`cursor-pointer transition-colors duration-200 group ${
                      isExpanded ? 'bg-indigo-50/40' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium group-hover:text-indigo-600 transition-colors">
                        <Clock size={16} className="text-gray-400 group-hover:text-indigo-400"/>
                        {formatearHora(venta.fechaHora)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">${venta.total.toFixed(2)}</div>
                      <div className="text-[11px] font-medium text-gray-400">Bs {venta.totalBs.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm ${getMetodoStyle(venta.metodoPago.nombre)}`}>
                        {venta.metodoPago.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.productos.length} <span className="text-xs">prod.</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`p-1.5 rounded-full inline-block transition-all duration-300 ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-transparent text-gray-400 group-hover:bg-gray-100'}`}>
                         <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* DETALLE EXPANDIDO (TICKET) */}
                  {isExpanded && (
                    <tr className="bg-indigo-50/20">
                      <td colSpan={5} className="px-0 py-0 border-b border-indigo-50">
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 ease-out origin-top w-full">
                          
                          {/* EL TICKET */}
                          <div className="max-w-xl mx-auto my-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                          
                            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-blue-500"></div>

                            <div className="p-6">
                              {/* Header del Ticket */}
                              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div>
                                  <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Receipt size={16} className="text-indigo-500"/>
                                    Comprobante de Venta
                                  </h4>
                                  <span className="text-[10px] font-mono text-gray-400 mt-1 block">
                                    ID: {venta.id}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    Tasa: {venta.tasaBCV.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Lista de Productos */}
                              <div className="space-y-3 mb-6">
                                {venta.productos.map((prod: any) => (
                                  <div key={prod.id} className="flex justify-between items-center text-sm group/item">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-indigo-50 text-indigo-600 font-bold min-w-[36px] h-[36px] flex items-center justify-center rounded-lg text-xs border border-indigo-100">
                                        {prod.producto.porPeso ? 'Kg' : `x${prod.cantidad}`}
                                      </div>
                                      
                                      <div>
                                        <p className="font-medium text-gray-800">{prod.producto.nombre}</p>
                                        {prod.producto.porPeso && (
                                          <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Weight size={10}/> {prod.peso} kg
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <p className="font-bold text-gray-800">
                                        ${(prod.precioUnitario * (prod.producto.porPeso ? parseFloat(prod.peso) : prod.cantidad)).toFixed(2)}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        ${prod.precioUnitario}/u
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="relative pt-4">
                                <div className="absolute top-0 left-0 w-full border-t-2 border-dashed border-gray-200"></div>
                                
                                <div className="flex justify-between items-end mt-2">
                                   <div className="text-sm text-gray-500">
                                      Total en Bolívares
                                      <p className="text-lg font-bold text-gray-600 mt-0.5">Bs {venta.totalBs.toFixed(2)}</p>
                                   </div>
                                   <div className="text-right">
                                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total Pagado</div>
                                      <p className="text-3xl font-black text-indigo-600 leading-none tracking-tight">${venta.total.toFixed(2)}</p>
                                   </div>
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}