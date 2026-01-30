"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
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

const ProductosList = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  
  // Modales de Creación
  const [mostrarAgregarModal, setMostrarAgregarModal] = useState(false);
  const [mostrarImportar, setMostrarImportar] = useState(false);

  const [creandoProducto, setCreandoProducto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);

  const { tasa } = useTasaBCV();
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // --- Filtrado y Ordenamiento en Cliente ---
  const productosProcesados = useMemo(() => {
    let resultado = [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (terminoBusqueda.trim()) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase().trim())
      );
    }
    return resultado;
  }, [productos, terminoBusqueda]);

  // --- Paginación en Cliente ---
  const totalItems = productosProcesados.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  useEffect(() => { setCurrentPage(1); }, [terminoBusqueda]);
  useEffect(() => { if (currentPage > totalPages && totalPages > 0) setCurrentPage(1); }, [totalPages, currentPage]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return productosProcesados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [productosProcesados, currentPage]);

  // --- Carga Inicial ---
  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const response = await fetch('/api/productos?limit=1000'); 
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      const lista = Array.isArray(data.productos) ? data.productos : [];
      setProductos(lista);
    } catch (err) {
      toast.error('Error cargando inventario');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      tableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Handlers de Acciones ---
  const handleProductoCreado = (nuevoProducto: Producto) => {
    setProductos(prev => [...prev, nuevoProducto]);
    setMostrarAgregarModal(false);
  };

  const handleImportacionExitosa = () => {
      fetchProductos();
      setMostrarImportar(false);
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
    } catch (e) { toast.error('Error de conexión'); } finally { setEliminando(false); }
  };

  const handleEditarProducto = async (id: string, nombre: string, precio: number, porPeso: boolean | null, stock: number) => {
    try {
      setEditando(true);
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, porPeso, stock }),
      });

      if (res.ok) {
        toast.success('Producto actualizado');
        setProductos(prev => prev.map(p => p.id === id ? { ...p, nombre, precio, porPeso, stock } : p));
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
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 sm:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
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
                resultados={currentProducts.length}
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
        <div className="overflow-x-auto min-h-[300px] w-full">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Producto</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Precio USD</th>
                <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Precio Bs</th>
                <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingProductos ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-500 mx-auto"/></td></tr>
              ) : currentProducts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No hay productos.</td></tr>
              ) : (
                currentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 min-w-[150px]">
                      <div className="font-medium text-gray-900 break-words">{p.nombre}</div>
                      {p.porPeso && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 rounded-full whitespace-nowrap">Por Peso</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                            <Boxes size={14}/>
                            {p.stock} {p.porPeso ? 'Kg' : 'Und'}
                        </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-gray-700 whitespace-nowrap">${p.precio.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4 text-green-700 font-bold whitespace-nowrap">Bs {formatBs(p.precio)}</td>
                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button onClick={() => setProductoAEditar(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                      <button onClick={() => setProductoAEliminar(p)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN: Centrada en móvil */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
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