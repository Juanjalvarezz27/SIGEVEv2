"use client";

import { Package, Search, X, ChevronLeft, ChevronRight, Weight, Boxes, Plus, Minus, PackageOpen } from 'lucide-react';
import { useRef } from 'react';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
  unidad?: string | null;
  stock: number;
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
  decrementarCantidad: (id: string) => void;
  eliminarProducto: (id: string) => void;
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
  cargandoProductos,
  decrementarCantidad,
  eliminarProducto
}: ProductosDisponiblesProps) {

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCambiarPagina = (page: number) => {
    cambiarPagina(page);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 bg-white md:rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] overflow-hidden">

      {/* --- HEADER --- */}
      <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Package size={20} className="text-indigo-600"/>
            Catálogo
          </h2>
          <span className="text-xs font-bold bg-white text-indigo-600 px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
            {pagination.total} Items
          </span>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
          <input
            data-testid="pos-search-input"
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-300 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700 placeholder:text-gray-400 text-sm shadow-sm"
            placeholder="Buscar producto por nombre..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            autoFocus
          />
          {busquedaProducto && (
            <button onClick={limpiarBusqueda} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* --- BODY: GRID DE PRODUCTOS --- */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#F8FAFC]" ref={containerRef}>
        {cargandoProductos ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-100 border-t-indigo-600"></div>
            <p className="text-base font-medium animate-pulse">Cargando inventario...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <PackageOpen size={64} className="mb-4 text-gray-200"/>
            <p className="text-gray-400 font-medium text-base">Sin resultados</p>
            {busquedaProducto && <button onClick={limpiarBusqueda} className="mt-3 text-indigo-500 hover:underline text-sm">Limpiar búsqueda</button>}
          </div>
        ) : (
          // GRID: Aumenté el gap a 4 para separar más las tarjetas
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {productos.map((prod) => {
              const enCarrito = productosSeleccionados.find(sel => sel.id === prod.id);

              return (
                <div
                  data-testid="add-to-cart-btn"
                  key={prod.id}
                  onClick={() => agregarProducto(prod)}
                  role="button"
                  tabIndex={0}
                  className={`
                    cursor-pointer relative flex flex-col text-left p-3 md:p-5 rounded-2xl border transition-all duration-200 group overflow-hidden h-full min-h-[120px] md:min-h-[160px]
                    ${enCarrito
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100 shadow-md transform scale-[1.02]'
                      : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
                    }
                  `}
                >
                  {/* Controles de Cantidad Flotantes */}
                  <div className={`absolute top-3 right-3 transition-all duration-300 z-10 ${enCarrito ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}`}>
                    {enCarrito ? (
                      <div className="flex items-center bg-white border border-indigo-200 rounded-xl shadow-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(enCarrito.cantidad > 1 && !prod.porPeso) { decrementarCantidad(prod.id); } else { eliminarProducto(prod.id); } }}
                          className="p-1.5 md:p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Minus size={16} strokeWidth={3}/>
                        </button>
                        <span className="w-5 md:w-6 text-center text-xs md:text-sm font-bold text-indigo-800">
                          {prod.porPeso ? "1" : enCarrito.cantidad}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); agregarProducto(prod); }}
                          className="p-1.5 md:p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus size={16} strokeWidth={3}/>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl shadow-sm bg-indigo-600 text-white">
                        <Plus size={20} strokeWidth={3}/>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full pr-8">
                    {/* Nombre Producto */}
                    <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-2 mb-2 md:mb-3 ${enCarrito ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {prod.nombre}
                    </h3>

                    {/* Badges / Etiquetas MÁS GRANDES */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        prod.stock <= 5 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-white text-gray-500 border-gray-100'
                      }`}>
                        <Boxes size={14}/> {prod.stock}
                      </span>
                      {prod.porPeso && (
                        <span className="bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Weight size={14}/> {prod.unidad || 'kg'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Precio */}
                  <div className="mt-3 md:mt-5 pt-2 md:pt-3 border-t border-gray-100 flex justify-between items-end w-full">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Precio</span>
                    {/* PRECIO */}
                    <span className={`text-xl md:text-2xl font-black tracking-tight ${enCarrito ? 'text-indigo-700' : 'text-gray-800'}`}>
                      ${prod.precio.toFixed(2)}
                    </span>
                  </div>

                  {/* Overlay "En Carrito" */}
                  {enCarrito && (
                    <div className="absolute inset-x-0 bottom-0 bg-indigo-600 text-white text-xs font-bold py-1.5 px-3 flex justify-center items-center shadow-inner">
                       En carrito: {prod.porPeso ? `${enCarrito.peso} ${prod.unidad || 'kg'}` : `${enCarrito.cantidad} un`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- FOOTER PAGINACIÓN --- */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-row justify-between items-center bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => handleCambiarPagina(pagination.page - 1)}
              className="flex-shrink-0 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
            >
              <ChevronLeft size={18} className="sm:mr-1.5"/> <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs sm:text-sm font-bold text-gray-500">
                Página <span className="text-indigo-600 text-sm">{pagination.page}</span> de {pagination.totalPages}
              </span>
            </div>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => handleCambiarPagina(pagination.page + 1)}
              className="flex-shrink-0 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Siguiente</span> <ChevronRight size={18} className="sm:ml-1.5"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}