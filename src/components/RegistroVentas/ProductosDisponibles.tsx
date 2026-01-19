"use client";

import { Package, Search, X, AlertCircle, ChevronLeft, ChevronRight, Weight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

interface ProductoSeleccionado extends Producto {
  cantidad: number;
  peso?: number;
  subtotal: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductosDisponiblesProps {
  productos: Producto[];
  productosSeleccionados: ProductoSeleccionado[];
  busquedaProducto: string;
  setBusquedaProducto: (value: string) => void;
  limpiarBusqueda: () => void;
  agregarProducto: (producto: Producto) => void;
  pagination: PaginationData;
  cambiarPagina: (page: number) => void;
  cargandoProductos: boolean;
}

export default function ProductosDisponibles({
  productos,
  productosSeleccionados,
  busquedaProducto,
  setBusquedaProducto,
  limpiarBusqueda,
  agregarProducto,
  pagination,
  cambiarPagina,
  cargandoProductos
}: ProductosDisponiblesProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    else if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleCambiarPagina = (page: number) => {
    cambiarPagina(page);
    if (page !== 1) {
      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  };

  useEffect(() => {
    if (pagination.page > 1 && !cargandoProductos) {
      scrollToTop();
    }
  }, [pagination.page, cargandoProductos]);

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div ref={topRef} className="h-0 w-0" aria-hidden="true" />

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Productos Disponibles
          </h2>
          <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
            Mostrando {productos.length} de {pagination.total} productos
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
              {cargandoProductos && (
                <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
            />
            {busquedaProducto && (
              <button
                onClick={limpiarBusqueda}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {cargandoProductos && productos.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12">
            {busquedaProducto ? (
              <>
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No se encontraron productos
                </p>
                <p className="text-gray-400 mb-6">
                  No hay resultados para "{busquedaProducto}"
                </p>
                <button
                  onClick={limpiarBusqueda}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No hay productos disponibles
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map((producto) => {
                const yaEnCarrito = productosSeleccionados.find(p => p.id === producto.id);

                return (
                  <div
                    key={producto.id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      yaEnCarrito
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => agregarProducto(producto)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 truncate">
                            {producto.nombre}
                          </h3>
                          {producto.porPeso && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center flex-shrink-0">
                              <Weight className="h-3 w-3 mr-1" />
                              Por kg
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          ID: #{producto.id}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {producto.porPeso 
                            ? `$${producto.precio.toFixed(2)}/kg` 
                            : `$${producto.precio.toFixed(2)}/unidad`}
                        </p>
                        {yaEnCarrito && (
                          <div className="flex items-center mt-2 text-sm text-blue-600">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {producto.porPeso 
                              ? `${yaEnCarrito.peso?.toFixed(3)} kg (${((yaEnCarrito.peso || 0.001) * 1000).toFixed(0)}g) en carrito`
                              : `${yaEnCarrito.cantidad} en carrito`}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-blue-600 whitespace-nowrap">
                          {producto.porPeso 
                            ? `$${producto.precio.toFixed(2)}/kg`
                            : `$${producto.precio.toFixed(2)}`}
                        </div>
                        <button
                          className={`mt-2 px-3 py-1 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                            yaEnCarrito
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            agregarProducto(producto);
                          }}
                        >
                          {yaEnCarrito ? 'Agregar más' : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Página {pagination.page} de {pagination.totalPages} •
                  Mostrando {productos.length} productos
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCambiarPagina(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || cargandoProductos}
                    className={`px-3 py-2 rounded-lg flex items-center ${
                      !pagination.hasPrevPage || cargandoProductos
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleCambiarPagina(pageNum)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } ${cargandoProductos ? 'opacity-50' : ''}`}
                          disabled={cargandoProductos}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleCambiarPagina(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || cargandoProductos}
                    className={`px-3 py-2 rounded-lg flex items-center ${
                      !pagination.hasNextPage || cargandoProductos
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}