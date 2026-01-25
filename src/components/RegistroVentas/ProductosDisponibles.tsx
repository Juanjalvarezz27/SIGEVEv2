"use client";

import { Package, Search, X, AlertCircle, ChevronLeft, ChevronRight, Weight, Boxes, Plus, PackageOpen } from 'lucide-react';
import { useRef } from 'react';

// Interfaces (Mantenemos la lógica de tipos estricta)
interface Producto {
  id: string; 
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
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

  // Función para cambiar página y hacer scroll arriba suavemente
  const handleCambiarPagina = (page: number) => {
    cambiarPagina(page);
    if (containerRef.current) {
        // Hacemos scroll al inicio del contenedor de productos, no de toda la página
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        
        {/* --- HEADER: BUSCADOR --- */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <Package size={18} className="text-indigo-600"/> 
                    Catálogo
                </h2>
                <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full shadow-sm">
                    {pagination.total} Productos
                </span>
            </div>
            
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                <input 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700 placeholder:text-gray-400 text-sm shadow-sm" 
                    placeholder="Buscar por nombre..." 
                    value={busquedaProducto} 
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    autoFocus
                />
                {busquedaProducto && (
                    <button onClick={limpiarBusqueda} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={14}/>
                    </button>
                )}
            </div>
        </div>
        
        {/* --- BODY: GRID DE PRODUCTOS (SCROLLABLE) --- */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#F8FAFC]" ref={containerRef}>
            {cargandoProductos ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-sm font-medium animate-pulse">Cargando inventario...</p>
                </div>
            ) : productos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <PackageOpen size={64} className="mb-4 text-gray-200 stroke-1"/>
                    <p className="text-gray-400 font-medium">No se encontraron productos</p>
                    {busquedaProducto && <button onClick={limpiarBusqueda} className="mt-4 text-indigo-500 hover:underline text-sm">Limpiar búsqueda</button>}
                </div>
            ) : (
                // GRID RESPONSIVE: 1 col movil, 2 tablet, 3 desktop (lg)
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {productos.map((prod) => {
                        const enCarrito = productosSeleccionados.find(sel => sel.id === prod.id);
                        
                        return (
                            <button 
                                key={prod.id} 
                                onClick={() => agregarProducto(prod)}
                                className={`
                                    relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200 group overflow-hidden h-full min-h-[140px]
                                    ${enCarrito 
                                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300 shadow-inner' 
                                        : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1'
                                    }
                                `}
                            >
                                {/* Botón flotante (+) solo en hover */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
                                    <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-md">
                                        <Plus size={16} strokeWidth={3}/>
                                    </div>
                                </div>

                                <div className="flex-1 w-full">
                                    {/* Nombre Producto */}
                                    <h3 className={`font-bold text-sm leading-snug line-clamp-2 pr-6 mb-2 ${enCarrito ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                        {prod.nombre}
                                    </h3>
                                    
                                    {/* Badges / Etiquetas */}
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {/* Stock Pill */}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${
                                            prod.stock <= 5 
                                                ? 'bg-red-50 text-red-700 border-red-200' 
                                                : 'bg-white text-gray-600 border-gray-200'
                                        }`}>
                                            <Boxes size={12}/> 
                                            {prod.stock}
                                        </span>

                                        {/* Peso Pill */}
                                        {prod.porPeso && (
                                            <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Weight size={12}/> Kg
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Precio */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end w-full">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Precio</span>
                                    <span className={`text-lg font-black tracking-tight ${enCarrito ? 'text-indigo-700' : 'text-gray-800'}`}>
                                        ${prod.precio.toFixed(2)}
                                    </span>
                                </div>

                                {/* Overlay "En Carrito" */}
                                {enCarrito && (
                                    <div className="absolute inset-x-0 bottom-0 bg-indigo-600/90 text-white text-[10px] font-bold py-1 px-3 flex justify-center items-center gap-2 backdrop-blur-[2px]">
                                        <AlertCircle size={10} className="fill-current"/> 
                                        En carrito: {prod.porPeso ? `${enCarrito.peso} kg` : `${enCarrito.cantidad} un`}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        {/* --- FOOTER: PAGINACIÓN --- */}
        {pagination && pagination.totalPages > 1 && (
             <div className="p-3 border-t border-gray-200 bg-white z-10">
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                    <button 
                        disabled={!pagination.hasPrevPage} 
                        onClick={() => handleCambiarPagina(pagination.page - 1)} 
                        className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <ChevronLeft size={14}/> Anterior
                    </button>
                    
                    <span className="text-xs font-medium text-gray-500">
                        Página <b className="text-gray-900">{pagination.page}</b> de {pagination.totalPages}
                    </span>
                    
                    <button 
                        disabled={!pagination.hasNextPage} 
                        onClick={() => handleCambiarPagina(pagination.page + 1)} 
                        className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        Siguiente <ChevronRight size={14}/>
                    </button>
                </div>
             </div>
        )}
    </div>
  );
}