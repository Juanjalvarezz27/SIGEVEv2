"use client";

import { Clock, ChevronDown, ChevronUp, Receipt, Weight, ChevronLeft, ChevronRight, ListFilter, User, Calendar, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface Venta {
  id: string | number;
  total: number;
  totalBs: number;
  tasaBCV: number;
  fechaHora: string;
  referencia?: string | null;
  metodoPago: { nombre: string };
  productos: any[];
  deuda?: {
    persona: string;
    descripcion: string;
    detalles: any;
  };
}

interface Props {
  periodo: string;
  fecha: string;
}

export default function TablaVentasDetalladas({ periodo, fecha }: Props) {
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  const [ventaExpandida, setVentaExpandida] = useState<string | number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(false);
  const itemsPorPagina = 20;

  useEffect(() => {
    if (seccionAbierta) {
      cargarVentas();
    }
  }, [seccionAbierta, periodo, fecha]);

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ periodo, soloDetalles: 'true' });
      if (fecha) params.append('fecha', fecha);
      const res = await fetch(`/api/estadisticas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVentas(data.ventasDetalladas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

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

  // --- RENDERIZADOR DE DEUDA (LÓGICA COMPARTIDA) ---
  const renderDetalleDeuda = (texto: string) => {
    if (!texto) return <p className="text-sm text-gray-400 italic">Sin detalles registrados.</p>;

    return texto.split('\n').map((linea, i) => {
        if (linea.includes("---") || linea.includes("Agregado el")) {
            const fechaMatch = linea.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            const fecha = fechaMatch ? fechaMatch[0] : "Fecha Anterior";
            return (
                <div key={i} className="flex items-center gap-3 my-3">
                    <div className="h-px bg-indigo-100 flex-1"></div>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200 uppercase flex items-center gap-1">
                        <Calendar size={10}/> {fecha}
                    </span>
                    <div className="h-px bg-indigo-100 flex-1"></div>
                </div>
            );
        }

        const regexProducto = /• ([\d\.]+) (kg|unid) x (.+) \(\$([\d\.]+)\) ➝ \$([\d\.]+)/;
        const match = linea.match(regexProducto);

        if (match) {
            const [_, cantidad, unidad, nombre, precioUnit, total] = match;
            return (
                <div key={i} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0 hover:bg-white rounded px-1 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded h-8 w-8 shadow-sm flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">{cantidad}</span>
                            <span className="text-[7px] font-bold text-gray-400 uppercase leading-none">{unidad}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">{nombre}</p>
                            <p className="text-[10px] text-gray-400 font-medium">${precioUnit} c/u</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-gray-900">${total}</p>
                    </div>
                </div>
            );
        }

        if (!linea.trim()) return null;
        return <p key={i} className="text-xs text-gray-600 py-1 pl-2 border-l-2 border-indigo-100 ml-1">{linea}</p>;
    });
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
            <p className="text-xs text-gray-500 mt-0.5">Consulta detallada de todas las ventas del período</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {seccionAbierta && ventas.length > 0 && (
            <span className="hidden sm:inline-block text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              {ventas.length} Transacciones
            </span>
          )}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400">
            {seccionAbierta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* CONTENIDO DESPLEGABLE */}
      <div className={`grid transition-all duration-300 ease-in-out ${seccionAbierta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden bg-gray-50/50 relative">
          {cargando && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-indigo-100 border-t-indigo-600"></div>
             </div>
          )}
          {ventas.length === 0 && !cargando ? (
            <div className="p-8 text-center text-gray-500 border-t border-gray-100">
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Receipt className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No hay ventas en este período</h3>
                <p className="text-gray-500 mt-1 text-sm text-center max-w-xs">
                  No se encontraron registros para el rango de fechas seleccionado.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TABLA */}
              {/* TABLA */}
              <div className="overflow-x-auto">
                <table className="w-full block md:table">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold tracking-wider hidden md:table-header-group">
                    <tr>
                      <th className="px-6 py-4 text-left">Fecha</th>
                      <th className="px-6 py-4 text-left">Total</th>
                      <th className="px-6 py-4 text-left">Tipo / Método</th>
                      <th className="px-6 py-4 text-left">Items</th>
                      <th className="px-6 py-4 text-right w-24">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0 md:divide-y divide-gray-100 block md:table-row-group">
                    {ventasPaginadas.map((venta) => {
                      const isExpanded = ventaExpandida === venta.id;

                      return (
                        <React.Fragment key={venta.id}>
                          {/* FILA PRINCIPAL */}
                          <tr
                            onClick={(e) => toggleExpandirFila(venta.id, e)}
                            className={`cursor-pointer transition-colors block md:table-row border border-gray-200 md:border-0 rounded-xl md:rounded-none mb-4 md:mb-0 p-4 md:p-0 bg-white md:bg-transparent ${isExpanded ? 'md:bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100">
                              <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Fecha</span>
                              <div className="flex flex-col text-right md:text-left">
                                <span className="text-sm font-bold text-gray-800">{formatearFecha(venta.fechaHora)}</span>
                                <div className="flex items-center justify-end md:justify-start gap-1 text-xs text-gray-500">
                                  <Clock size={10}/> {formatearHora(venta.fechaHora)}
                                </div>
                              </div>
                            </td>
                            <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100">
                              <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Total</span>
                              <div className="text-right md:text-left">
                                <div className="font-bold text-gray-900">${venta.total.toFixed(2)}</div>
                                <div className="text-[11px] font-medium text-gray-400">Bs {venta.totalBs.toFixed(2)}</div>
                              </div>
                            </td>
                            <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100">
                                <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Tipo</span>
                                <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-start justify-end md:justify-start">
                                    {venta.deuda ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            DEUDA
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            VENTA
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-600 font-medium ml-0.5">{venta.metodoPago.nombre}</span>
                                </div>
                            </td>
                            <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100 text-sm text-gray-500">
                              <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Items</span>
                              <span>{venta.deuda ? '1 (Abono)' : venta.productos.length}</span>
                            </td>
                            <td className="px-0 md:px-6 py-3 md:py-4 flex justify-center md:justify-end md:table-cell text-center md:text-right pt-4 md:pt-4">
                              <div className={`p-1.5 rounded-full inline-block flex items-center justify-center w-full md:w-auto ${isExpanded ? 'bg-indigo-200 text-indigo-700' : 'text-gray-400 bg-gray-100 md:bg-transparent'}`}>
                                <span className="text-sm font-semibold mr-2">{isExpanded ? 'Ocultar' : 'Ver'}</span>
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </td>
                          </tr>

                          {/* DETALLE EXPANDIDO */}
                          {isExpanded && (
                            <tr className="bg-indigo-50/50 block md:table-row -mt-4 mb-4 md:m-0 rounded-b-xl border-x border-b border-indigo-200 md:border-0">
                              <td colSpan={5} className="p-0 border-b border-indigo-100 block md:table-cell">
                                <div className="bg-white m-3 md:m-4 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row relative">
                                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${venta.deuda ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                  
                                  {/* Columna Izquierda: Resumen */}
                                  <div className={`md:w-1/3 p-5 md:p-6 flex flex-col justify-between ${venta.deuda ? 'bg-amber-50/30' : 'bg-emerald-50/30'} border-b md:border-b-0 md:border-r border-gray-100 pl-6 md:pl-8`}>
                                    <div>
                                      <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                        <Receipt size={16} className={venta.deuda ? 'text-amber-600' : 'text-emerald-600'}/> 
                                        {venta.deuda ? 'Abono de Deuda' : 'Detalle de Venta'}
                                      </h4>
                                      {venta.referencia ? (
                                        <p className="text-[10px] md:text-[11px] font-mono text-gray-500 break-all mb-4">
                                          Ref Pago: <span className="font-bold text-gray-700">{venta.referencia}</span>
                                        </p>
                                      ) : (
                                        <div className="h-4 mb-4"></div>
                                      )}
                                      
                                      <div className="inline-block text-[11px] font-medium text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm mb-6">
                                        Tasa BCV: <span className="font-bold">Bs {venta.tasaBCV.toFixed(2)}</span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div className="text-xs text-gray-500 mb-0.5">Monto en Bolívares</div>
                                      <div className="text-base md:text-lg font-bold text-gray-700 mb-4">Bs {venta.totalBs.toFixed(2)}</div>
                                      
                                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Pagado</div>
                                      <div className={`text-3xl md:text-4xl font-black leading-none tracking-tight ${venta.deuda ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        ${venta.total.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Columna Derecha: Items */}
                                  <div className="md:w-2/3 p-5 md:p-6 bg-white flex flex-col">
                                    <h4 className="font-bold text-gray-800 text-sm mb-4">
                                      {venta.deuda ? 'Información del Cliente' : 'Artículos de la Operación'}
                                    </h4>
                                    
                                    <div className="flex-1 overflow-y-auto max-h-[200px] md:max-h-[250px] pr-2 custom-scrollbar">
                                      {venta.deuda ? (
                                          <div>
                                              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                  <User size={16} className="text-gray-400"/>
                                                  <span className="text-xs font-bold text-gray-500 uppercase">Cliente:</span>
                                                  <span className="text-sm font-bold text-gray-800 truncate">{venta.deuda.persona}</span>
                                              </div>
                                              <div className="space-y-1">
                                                  {renderDetalleDeuda(venta.deuda.descripcion)}
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="space-y-3">
                                              {venta.productos.map((prod: any) => (
                                                  <div key={prod.id} className="flex justify-between items-center text-sm p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-xl border border-gray-100">
                                                      <div className="flex items-center gap-3">
                                                          <div className="bg-white text-gray-600 font-bold min-w-[36px] h-[36px] flex items-center justify-center rounded-lg text-xs border border-gray-200 shadow-sm">
                                                              {prod.producto.porPeso ? 'Kg' : `x${prod.cantidad}`}
                                                          </div>
                                                          <div>
                                                              <p className="font-semibold text-gray-800 truncate max-w-[150px] md:max-w-[250px]">{prod.producto.nombre}</p>
                                                              {prod.producto.porPeso ? (
                                                                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                                      <Weight size={12}/> {prod.peso} kg &bull; ${prod.precioUnitario} c/u
                                                                  </p>
                                                              ) : (
                                                                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                                      ${prod.precioUnitario} c/u
                                                                  </p>
                                                              )}
                                                          </div>
                                                      </div>
                                                      <div className="text-right pl-2">
                                                          <p className="font-bold text-gray-900">
                                                              ${(prod.precioUnitario * (prod.producto.porPeso ? parseFloat(prod.peso) : prod.cantidad)).toFixed(2)}
                                                          </p>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
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
      </div>
    </div>
  );
}