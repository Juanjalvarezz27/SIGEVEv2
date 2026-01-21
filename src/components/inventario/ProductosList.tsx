"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { Package, Edit2, Trash2, Plus, Loader2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import useTasaBCV from '../../app/hooks/useTasaBCV'; 
import ModalConfirmacion from './ModalConfirmacion';
import ModalEditarProducto from './ModalEditarProducto';
import BarraBusqueda from './BarraBusqueda';
import ModalAgregarProducto from './ModalAgregarProducto';
import { toast } from 'react-toastify';

interface Producto {
  id: string; 
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

const ITEMS_PER_PAGE = 30; // Constante clara para el límite

const ProductosList = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  // Modales
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [mostrarAgregarModal, setMostrarAgregarModal] = useState(false);
  
  // Estados de carga
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);
  
  const { tasa } = useTasaBCV();

  // Paginación: Solo necesitamos saber en qué página estamos
  const [currentPage, setCurrentPage] = useState(1);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 1. Filtrado y Ordenamiento
  const productosProcesados = useMemo(() => {
    let resultado = [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    if (terminoBusqueda.trim()) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase().trim())
      );
    }
    return resultado;
  }, [productos, terminoBusqueda]);

  // 2. Cálculos de Paginación (Derivados, no useEffect)
  const totalItems = productosProcesados.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Resetear a página 1 si la búsqueda cambia
  useEffect(() => {
    setCurrentPage(1);
  }, [terminoBusqueda]);

  // Resetear a página 1 si el total de páginas baja (ej: al borrar productos)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // 3. Productos de la página actual
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return productosProcesados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [productosProcesados, currentPage]);

  // Carga inicial
  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      // Traemos todos (limit=500) para paginar en cliente
      const response = await fetch('/api/productos?limit=500'); 
      if (!response.ok) throw new Error('Error al cargar');
      
      const data = await response.json();
      const lista = Array.isArray(data.productos) ? data.productos : [];
      setProductos(lista);
    } catch (err) {
      console.error(err);
      toast.error('Error cargando inventario');
    } finally {
      setLoadingProductos(false);
    }
  };

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll suave arriba al cambiar página
      tableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleProductoCreado = (nuevoProducto: Producto) => {
    setProductos(prev => [...prev, nuevoProducto]);
    setMostrarAgregarModal(false);
  };

  const handleEliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      setEliminando(true);
      const res = await fetch(`/api/productos/${productoAEliminar.id}`, { method: 'DELETE' });
      
      if (res.ok) {
        toast.success('Producto eliminado');
        setProductos(prev => prev.filter(p => p.id !== productoAEliminar.id));
        setProductoAEliminar(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setEliminando(false);
    }
  };

  const handleEditarProducto = async (id: string, nombre: string, precio: number, porPeso: boolean | null) => {
    try {
      setEditando(true);
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, porPeso }),
      });
      
      if (res.ok) {
        toast.success('Producto actualizado');
        setProductos(prev => prev.map(p => p.id === id ? { ...p, nombre, precio, porPeso } : p));
        setProductoAEditar(null);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Error al editar');
    } finally {
      setEditando(false);
    }
  };

  const formatBs = (precioUsd: number) => tasa ? (precioUsd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

  return (
    <>
      <ModalConfirmacion
        isOpen={!!productoAEliminar}
        onClose={() => setProductoAEliminar(null)}
        onConfirm={handleEliminarProducto}
        productoNombre={productoAEliminar?.nombre || ''}
        loading={eliminando}
      />

      <ModalEditarProducto
        isOpen={!!productoAEditar}
        onClose={() => setProductoAEditar(null)}
        onSave={handleEditarProducto}
        producto={productoAEditar}
        loading={editando}
      />

      <ModalAgregarProducto
        isOpen={mostrarAgregarModal}
        onClose={() => setMostrarAgregarModal(false)}
        onProductoCreado={handleProductoCreado}
        loading={creandoProducto}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm" ref={tableContainerRef}>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-gray-700 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inventario</h2>
              <p className="text-sm text-gray-600">Total: {totalItems} productos</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <BarraBusqueda 
                terminoBusqueda={terminoBusqueda}
                onBuscarChange={setTerminoBusqueda}
                onLimpiarBusqueda={() => setTerminoBusqueda('')}
                resultados={currentProducts.length}
                total={totalItems}
                paginaActual={currentPage}
                totalPaginas={totalPages}
             />
             <button
              onClick={() => setMostrarAgregarModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
             >
               <Plus size={18} className="mr-2" /> Agregar
             </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Producto</th>
                <th className="px-6 py-3 text-left">Precio USD</th>
                <th className="px-6 py-3 text-left">Precio Bs</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingProductos ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto"/></td></tr>
              ) : currentProducts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">No hay productos.</td></tr>
              ) : (
                currentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.nombre}</div>
                      {p.porPeso && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 rounded-full">Por Peso</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">${p.precio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-700 font-bold">Bs {formatBs(p.precio)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setProductoAEditar(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                      <button onClick={() => setProductoAEliminar(p)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación CORREGIDA */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
             <button 
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={!hasPrevPage}
               className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors"
             >
               <ChevronLeft size={16} /> Anterior
             </button>
             
             <span className="text-sm text-gray-600 font-medium">
                Página {currentPage} de {totalPages}
             </span>
             
             <button 
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={!hasNextPage}
               className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors"
             >
               Siguiente <ChevronRight size={16} />
             </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductosList;