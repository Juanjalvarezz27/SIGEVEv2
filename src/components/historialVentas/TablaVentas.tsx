import { Calendar, CreditCard, Package, Eye, Receipt, Clock, TrendingUp, Weight } from 'lucide-react';
import React, { useState } from 'react';

interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

interface VentaProducto {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  peso?: string | null;
  precioUnitario: number;
  precioUnitarioBs: number;
  producto: ProductoVenta;
}

interface MetodoPago {
  id: number;
  nombre: string;
}

interface Venta {
  id: number;
  total: number;
  totalBs: number;
  tasaBCV: number;
  fechaHora: string;
  metodoPagoId: number;
  metodoPago: MetodoPago;
  productos: VentaProducto[];
}

interface TablaVentasProps {
  ventas: Venta[];
  cargando: boolean;
  cargarVentas: () => void;
  tasaBCV?: number | null;
  loadingTasa?: boolean;
}

export default function TablaVentas({
  ventas,
  cargando,
  cargarVentas,
  tasaBCV,
  loadingTasa
}: TablaVentasProps) {
  const [ventaExpandida, setVentaExpandida] = useState<number | null>(null);

  const toggleExpandirVenta = (ventaId: number) => {
    if (ventaExpandida === ventaId) {
      setVentaExpandida(null);
    } else {
      setVentaExpandida(ventaId);
    }
  };

  const formatearFechaCorta = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMetodoPagoIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo')) return '💵';
    if (nombreLower.includes('tarjeta')) return '💳';
    if (nombreLower.includes('transferencia')) return '🏦';
    if (nombreLower.includes('móvil') || nombreLower.includes('movil')) return '📱';
    return '💳';
  };

  const getMetodoPagoColor = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo')) return 'bg-green-100 text-green-800';
    if (nombreLower.includes('tarjeta')) return 'bg-blue-100 text-blue-800';
    if (nombreLower.includes('transferencia')) return 'bg-purple-100 text-purple-800';
    if (nombreLower.includes('móvil') || nombreLower.includes('movil')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSubtotal = (prod: VentaProducto, tasaBCV: number) => {
    if (prod.peso && prod.producto.porPeso) {
      const pesoNum = parseFloat(prod.peso);
      const subtotalUSD = pesoNum * prod.precioUnitario;
      return {
        usd: subtotalUSD,
        bs: subtotalUSD * tasaBCV
      };
    }
    const subtotalUSD = prod.cantidad * prod.precioUnitario;
    return {
      usd: subtotalUSD,
      bs: subtotalUSD * tasaBCV
    };
  };

  const getCantidadDisplay = (prod: VentaProducto) => {
    if (prod.peso && prod.producto.porPeso) {
      const pesoNum = parseFloat(prod.peso);
      return (
        <span className="inline-flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="font-semibold">{pesoNum.toFixed(3)} kg</span>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
            <Weight className="h-3 w-3 inline mr-1" />
            {(pesoNum * 1000).toFixed(0)}g
          </span>
        </span>
      );
    }
    return (
      <span className="font-semibold">
        {prod.cantidad} unidad{prod.cantidad > 1 ? 'es' : ''}
      </span>
    );
  };

  const getTipoProducto = (prod: VentaProducto) => {
    return prod.producto.porPeso ? "por peso" : "por unidad";
  };

  const getPrecioDisplay = (prod: VentaProducto) => {
    const esPorPeso = prod.producto.porPeso && prod.peso;
    return `$${prod.precioUnitario.toFixed(2)}${esPorPeso ? '/kg' : '/unidad'}`;
  };

  if (cargando && ventas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Cargando ventas de hoy...</p>
        </div>
      </div>
    );
  }

  if (!cargando && ventas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-16 text-center">
          <Receipt className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay ventas hoy
          </h3>
          <p className="text-gray-500 mb-8">
            Aún no se han realizado ventas hoy
          </p>
          <button
            onClick={cargarVentas}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  const totalGeneralUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const totalGeneralBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Registro de Ventas del Día
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
              {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'} registradas
            </div>
            {tasaBCV && (
              <div className="hidden md:flex items-center text-sm bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium">BCV hoy: Bs {tasaBCV.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Fecha
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Hora
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  Productos
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Pago
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total USD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ventas.map((venta) => {
              const totalProductos = venta.productos.reduce((sum, prod) => 
                prod.producto.porPeso ? sum + 1 : sum + prod.cantidad, 0
              );

              return (
                <React.Fragment key={venta.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-bold text-gray-900">
                        #{venta.id.toString().padStart(4, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatearFechaCorta(venta.fechaHora)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatearHora(venta.fechaHora)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {totalProductos} items
                          </div>
                          <div className="text-xs text-gray-500">
                            {venta.productos.length} {venta.productos.length === 1 ? 'producto' : 'productos'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMetodoPagoColor(venta.metodoPago.nombre)}`}>
                        <span className="mr-1">{getMetodoPagoIcon(venta.metodoPago.nombre)}</span>
                        {venta.metodoPago.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-emerald-600">
                        ${venta.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-amber-700">
                          Bs {venta.totalBs.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tasa: {venta.tasaBCV.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpandirVenta(venta.id)}
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {ventaExpandida === venta.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>

                  {ventaExpandida === venta.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-blue-50">
                        <div className="bg-white rounded-lg border border-blue-200 p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                              Detalles Venta #{venta.id.toString().padStart(4, '0')}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {formatearFechaCorta(venta.fechaHora)} {formatearHora(venta.fechaHora)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Método de Pago:</p>
                              <p className="font-medium">{venta.metodoPago.nombre}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Total USD:</p>
                              <p className="text-lg font-bold text-emerald-600">${venta.total.toFixed(2)}</p>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Total Bs:</p>
                              <p className="text-lg font-bold text-amber-700">Bs {venta.totalBs.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Tasa: {venta.tasaBCV.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Package className="h-4 w-4 mr-2" />
                              Productos ({venta.productos.length})
                            </h5>
                            
                            {/* PRODUCTOS EN COLUMNAS DE DOS */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {venta.productos.map((prod) => {
                                  const subtotal = getSubtotal(prod, venta.tasaBCV);
                                  const esPorPeso = prod.producto.porPeso && prod.peso;

                                  return (
                                    <div key={prod.id} className="group bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                                      {/* Fila Superior: Info Principal y Precio Total */}
                                      <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1.5 max-w-[65%]">
                                          <span className="font-bold text-gray-900 text-lg leading-tight truncate">
                                            {prod.producto.nombre}
                                          </span>
                                          <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                              {getTipoProducto(prod)}
                                            </span>
                                            {esPorPeso && (
                                              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-yellow-100 text-yellow-700 rounded-full flex items-center">
                                                <Weight className="h-3 w-3 mr-1" />
                                                Peso
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-right">
                                          <div className="text-xl font-black text-emerald-600 leading-none">
                                            ${subtotal.usd.toFixed(2)}
                                          </div>
                                          <div className="text-xs font-medium text-amber-700 mt-1">
                                            Bs {subtotal.bs.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Fila Inferior: Detalles de la transacción */}
                                      <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                            Precio Unitario
                                          </span>
                                          <span className="text-sm font-medium text-gray-700">
                                            {getPrecioDisplay(prod)}
                                          </span>
                                        </div>

                                        <div className="flex flex-col items-end">
                                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                            Cantidad / Peso
                                          </span>
                                          <span className="text-base font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                                            {getCantidadDisplay(prod)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                            <div className="mt-6 pt-4 border-t border-gray-300">
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Productos Totales</p>
                                  <p className="text-xl font-bold text-gray-800">
                                    {venta.productos.length}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Total USD</p>
                                  <p className="text-2xl font-bold text-emerald-600">
                                    ${venta.total.toFixed(2)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-gray-600">Total Bs</p>
                                  <p className="text-2xl font-bold text-amber-700">
                                    Bs {venta.totalBs.toFixed(2)}
                                  </p>
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

      {ventas.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-sm text-gray-600 mb-3 md:mb-0">
              <span className="font-medium">{ventas.length}</span> ventas mostradas
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total General USD</p>
                <p className="text-lg font-bold text-emerald-600">
                  ${totalGeneralUSD.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total General Bs</p>
                <p className="text-lg font-bold text-amber-700">
                  Bs {totalGeneralBs.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}