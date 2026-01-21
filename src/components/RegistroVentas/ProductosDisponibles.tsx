"use client";

import { Package, Search, X, AlertCircle, ChevronLeft, ChevronRight, Weight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Producto {
  id: string; // ID string
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCambiarPagina = (page: number) => {
    cambiarPagina(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <Package size={20} className="text-blue-600"/> Catálogo
           </h2>
           <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
             Total: {pagination.total}
           </span>
        </div>
        
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
           <input 
             type="text"
             placeholder="Buscar productos..."
             value={busquedaProducto}
             onChange={(e) => setBusquedaProducto(e.target.value)}
             className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
           />
           {busquedaProducto && (
             <button onClick={limpiarBusqueda} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
               <X size={14}/>
             </button>
           )}
        </div>
      </div>

      <div className="p-4 flex-1">
         {cargandoProductos ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
         ) : productos.length === 0 ? (
             <div className="text-center py-10 text-gray-500">
                No se encontraron productos.
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {productos.map(p => {
                   const enCarrito = productosSeleccionados.find(sel => sel.id === p.id);
                   return (
                     <div 
                       key={p.id} 
                       onClick={() => agregarProducto(p)}
                       className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                         enCarrito 
                         ? 'border-blue-400 bg-blue-50' 
                         : 'border-gray-200 hover:border-blue-300 bg-white'
                       }`}
                     >
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="font-semibold text-gray-800 text-sm">{p.nombre}</h3>
                              <p className="text-xs text-gray-500 mt-1">${p.precio.toFixed(2)} {p.porPeso ? '/kg' : ''}</p>
                           </div>
                           {p.porPeso && <Weight size={16} className="text-gray-400"/>}
                        </div>
                        {enCarrito && (
                           <div className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                              <AlertCircle size={12}/>
                              En carrito: {p.porPeso ? `${enCarrito.peso}kg` : enCarrito.cantidad}
                           </div>
                        )}
                     </div>
                   );
                })}
             </div>
         )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
           <button 
             onClick={() => handleCambiarPagina(pagination.page - 1)}
             disabled={!pagination.hasPrevPage}
             className="p-2 rounded hover:bg-white disabled:opacity-50"
           >
              <ChevronLeft size={18}/>
           </button>
           <span className="text-sm text-gray-600 font-medium">
             Pag {pagination.page} de {pagination.totalPages}
           </span>
           <button 
             onClick={() => handleCambiarPagina(pagination.page + 1)}
             disabled={!pagination.hasNextPage}
             className="p-2 rounded hover:bg-white disabled:opacity-50"
           >
              <ChevronRight size={18}/>
           </button>
        </div>
      )}
    </div>
  );
}