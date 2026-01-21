"use client";

import { Clock, ChevronDown, ChevronUp, Receipt, Weight, ChevronLeft, ChevronRight, ListFilter, SearchX } from 'lucide-react';
import React, { useState } from 'react';

interface Venta {
  id: string | number;
  total: number;
  totalBs: number;
  tasaBCV: number;
  fechaHora: string;
  metodoPago: { nombre: string };
  productos: any[];
}

interface Props {
  ventas: Venta[];
  periodo: any;
}

export default function TablaVentasDetalladas({ ventas, periodo }: Props) {
  // Estado para desplegar la SECCIÓN completa
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  
  // Estado para expandir FILAS individuales
  const [ventaExpandida, setVentaExpandida] = useState<string | number | null>(null);
  
  // Estado para PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  // Lógica de Paginación
  const totalPaginas = Math.ceil(ventas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const ventasPaginadas = ventas.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      setVentaExpandida(null); 
    }
  };

  const toggleExpandirFila = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setVentaExpandida(ventaExpandida === id ? null : id);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getMetodoStyle = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('pago movil')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (n.includes('efectivo')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      
      {/* HEADER DE LA SECCIÓN */}
      <button 
        onClick={() => setSeccionAbierta(!seccionAbierta)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg ${seccionAbierta ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
              <ListFilter size={20} />
           </div>
           <div>
              <h3 className="text-lg font-bold text-gray-800">Desglose de Operaciones</h3>
              <p className="text-sm text-gray-500">
                 {ventas.length} registros encontrados {periodo.tipo !== 'fecha-especifica' ? `(${periodo.tipo})` : ''}
              </p>
           </div>
        </div>
        <div>
           {seccionAbierta ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
        </div>
      </button>

      {/* CONTENIDO DESPLEGABLE */}
      {seccionAbierta && (
        <div className="border-t border-gray-200">
          {ventas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
               <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Receipt className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">No hay ventas en este período</h3>
               <p className="text-gray-500 mt-1 text-sm text-center max-w-xs">
                  No se encontraron registros para el rango de fechas seleccionado.
               </p>
            </div>
          ) : (
            <>
              {/* TABLA */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Fecha</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Método</th>
                      <th className="px-6 py-4 text-left">Items</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ventasPaginadas.map((venta) => {
                      const isExpanded = ventaExpandida === venta.id;
                      
                      return (
                        <React.Fragment key={venta.id}>
                          {/* FILA PRINCIPAL */}
                          <tr 
                            onClick={(e) => toggleExpandirFila(venta.id, e)}
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">{formatearFecha(venta.fechaHora)}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                   <Clock size={10}/> {formatearHora(venta.fechaHora)}
                                </div>
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
                              {venta.productos.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className={`p-1.5 rounded-full inline-block ${isExpanded ? 'bg-indigo-200 text-indigo-700' : 'text-gray-400'}`}>
                                 {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </td>
                          </tr>

                          {/* DETALLE EXPANDIDO */}
                          {isExpanded && (
                            <tr className="bg-indigo-50/50">
                              <td colSpan={5} className="px-6 py-4 border-b border-indigo-100">
                                <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-blue-500"></div>
                                  <div className="p-6">
                                    <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                      <div>
                                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                          <Receipt size={16} className="text-indigo-500"/> Comprobante
                                        </h4>
                                        <span className="text-[10px] font-mono text-gray-400 mt-1 block">ID: {venta.id}</span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                          Tasa: {venta.tasaBCV.toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-6">
                                      {venta.productos.map((prod: any) => (
                                        <div key={prod.id} className="flex justify-between items-center text-sm">
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
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="relative pt-4">
                                      <div className="absolute top-0 left-0 w-full border-t-2 border-dashed border-gray-200"></div>
                                      <div className="flex justify-between items-end mt-2">
                                         <div className="text-sm text-gray-500">
                                            Total Bs
                                            <p className="text-lg font-bold text-gray-600 mt-0.5">Bs {venta.totalBs.toFixed(2)}</p>
                                         </div>
                                         <div className="text-right">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Pagado</div>
                                            <p className="text-3xl font-black text-indigo-600 leading-none tracking-tight">${venta.total.toFixed(2)}</p>
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

              {totalPaginas > 1 && (
                <div className="bg-white px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="text-sm text-gray-500">
                      Mostrando {indiceInicio + 1} a {Math.min(indiceInicio + itemsPorPagina, ventas.length)} de {ventas.length} operaciones
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      
                      <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-100">
                         {paginaActual} / {totalPaginas}
                      </div>

                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                      >
                        <ChevronRight size={18} />
                      </button>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}