"use client";

import { useState, useRef, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { Package, Edit2, Trash2, Plus, Loader2, ChevronLeft, ChevronRight, Boxes, FileSpreadsheet } from 'lucide-react';
import useTasaBCV from '../../app/hooks/useTasaBCV';
import ModalConfirmacion from './ModalConfirmacion';
import ModalEditarProducto from './ModalEditarProducto';
import BarraBusqueda from './BarraBusqueda';
import ModalAgregarProducto from './ModalAgregarProducto';
import ModalCargaMasiva from '../Productos/ModalCargaMasiva'; 
import { toast } from 'react-toastify';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
  stock: number;
}

const ITEMS_PER_PAGE = 30;

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ProductosList = () => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBusqueda(terminoBusqueda);
      setCurrentPage(1); // Reiniciar a la primera página al buscar
    }, 500);
    return () => clearTimeout(handler);
  }, [terminoBusqueda]);

  // Hook SWR dinámico
  const { data, isLoading: loadingProductos, mutate } = useSWR(
    `/api/productos?limit=${ITEMS_PER_PAGE}&page=${currentPage}&search=${encodeURIComponent(debouncedBusqueda)}`, 
    fetcher
  );

  const productos: Producto[] = data?.productos || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;
  const hasNextPage = pagination.hasNextPage;
  const hasPrevPage = pagination.hasPrevPage;

  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  
  // Modales de Creación
  const [mostrarAgregarModal, setMostrarAgregarModal] = useState(false);
  const [mostrarImportar, setMostrarImportar] = useState(false);

  const [creandoProducto, setCreandoProducto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);

  const { tasa } = useTasaBCV();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      tableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Handlers de Acciones ---
  const handleProductoCreado = (nuevoProducto: Producto) => {
    mutate(); // SWR se encarga de revalidar el caché
    setMostrarAgregarModal(false);
  };

  const handleImportacionExitosa = () => {
      mutate();
      setMostrarImportar(false);
  };

  const handleEliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      setEliminando(true);
      const res = await fetch(`/api/productos/${productoAEliminar.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Producto eliminado');
        mutate();
        setProductoAEliminar(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (e) { toast.error('Error de conexión'); } finally { setEliminando(false); }
  };

  const handleEditarProducto = async (id: string, nombre: string, precio: number, porPeso: boolean | null, stock: number, unidad?: string | null, cantidadBase?: number | null) => {
    try {
      setEditando(true);
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, porPeso, stock, unidad, cantidadBase }),
      });

      if (res.ok) {
        toast.success('Producto actualizado');
        mutate();
        setProductoAEditar(null);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (e) { toast.error('Error al editar'); } finally { setEditando(false); }
  };

  const formatBs = (precioUsd: number) => tasa ? (precioUsd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

  return (
    <>
      {/* --- MODALES --- */}
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

      <ModalCargaMasiva 
        isOpen={mostrarImportar} 
        onClose={() => setMostrarImportar(false)} 
        onSuccess={handleImportacionExitosa} 
      />

      {/* --- TABLA --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" ref={tableContainerRef}>
        
        {/* HEADER RESPONSIVE CENTRADO */}
        {/* Usamos 'items-center' en flex-col para centrar todo en móvil */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          
          {/* Título: Centrado en móvil */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
            <Package className="h-8 w-8 sm:h-6 sm:w-6 text-gray-700 mb-2 sm:mb-0 sm:mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inventario</h2>
              <p className="text-sm text-gray-600">Total: {totalItems} productos</p>
            </div>
          </div>

          {/* Controles: Centrados y Full Width en móvil */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {/* Buscador: Full width en móvil */}
            <div className="w-full sm:w-auto">
                <BarraBusqueda
                terminoBusqueda={terminoBusqueda}
                onBuscarChange={setTerminoBusqueda}
                onLimpiarBusqueda={() => setTerminoBusqueda('')}
                resultados={productos.length}
                total={totalItems}
                paginaActual={currentPage}
                totalPaginas={totalPages}
                />
            </div>
            
            {/* Botones: Divididos 50/50 en móvil para simetría */}
            <div className="flex gap-2 w-full sm:w-auto">
                <button
                onClick={() => setMostrarImportar(true)}
                className="w-1/2 sm:w-auto flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm shadow-emerald-200 font-bold text-sm"
                title="Carga Masiva"
                >
                <FileSpreadsheet size={18} className="mr-2" /> Importar
                </button>

                <button
                onClick={() => setMostrarAgregarModal(true)}
                className="w-1/2 sm:w-auto flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm font-bold text-sm"
                >
                <Plus size={18} className="mr-2" /> Agregar
                </button>
            </div>
          </div>
        </div>

        {/* CONTENEDOR TABLA */}
        <div className="overflow-x-auto min-h-[300px] w-full p-4 md:p-0">
          <table className="w-full min-w-full md:divide-y md:divide-gray-200 block md:table">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase hidden md:table-header-group">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Producto</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Precio USD</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Precio Bs</th>
                <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 md:divide-y divide-gray-200 block md:table-row-group">
              {loadingProductos ? (
                <tr><td colSpan={5} className="text-center py-10 block md:table-cell"><Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto"/></td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500 block md:table-cell">No hay productos.</td></tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 block md:table-row border border-gray-200 md:border-0 rounded-xl md:rounded-none mb-4 md:mb-0 p-4 md:p-0 bg-white">
                    <td className="px-0 md:px-6 py-2 md:py-4 flex flex-col md:table-cell border-b md:border-0 border-gray-100 pb-3 md:pb-4 min-w-[150px]">
                      <span className="md:hidden font-bold text-gray-400 text-xs uppercase mb-1">Producto</span>
                      <div>
                        <span className="font-medium text-gray-900 break-words">{p.nombre}</span>
                        {p.porPeso && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 rounded-full whitespace-nowrap ml-2">Por Peso</span>}
                      </div>
                    </td>
                    <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100 whitespace-nowrap">
                        <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Stock</span>
                        <div className={`flex items-center gap-1 font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                            <Boxes size={14}/>
                            {p.stock} {p.porPeso ? 'Kg' : 'Und'}
                        </div>
                    </td>
                    <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100 font-bold text-gray-700 whitespace-nowrap">
                        <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Precio USD</span>
                        <span>${p.precio.toFixed(2)}</span>
                    </td>
                    <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between items-center md:table-cell border-b md:border-0 border-gray-100 text-green-700 font-bold whitespace-nowrap">
                        <span className="md:hidden font-bold text-gray-400 text-xs uppercase">Precio Bs</span>
                        <span>Bs {formatBs(p.precio)}</span>
                    </td>
                    <td className="px-0 md:px-6 py-3 md:py-4 flex justify-end gap-2 md:table-cell whitespace-nowrap pt-3 md:pt-4">
                      <button onClick={() => setProductoAEditar(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-transparent md:border-0 hover:border-blue-200 transition-colors bg-blue-50 md:bg-transparent"><Edit2 size={18}/></button>
                      <button onClick={() => setProductoAEliminar(p)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-transparent md:border-0 hover:border-red-200 transition-colors bg-red-50 md:bg-transparent"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN: Centrada en móvil */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 md:py-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2 text-sm font-medium text-gray-700 transition-colors shadow-sm"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            
            <span className="text-sm text-gray-600 font-bold bg-white px-3 py-1 rounded border border-gray-200">
               Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2 text-sm font-medium text-gray-700 transition-colors shadow-sm"
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