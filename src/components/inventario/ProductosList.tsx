"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Package,
  Edit2,
  Trash2,
  Plus,
  DollarSign,
  Coins,
  Calculator,
  Search,
  ChevronLeft,
  ChevronRight,
  Weight
} from 'lucide-react';
import useTasaBCV from '../../app/hooks/useTasaBCV';
import ModalConfirmacion from './ModalConfirmacion';
import ModalEditarProducto from './ModalEditarProducto';
import BarraBusqueda from './BarraBusqueda';
import ModalAgregarProducto from './ModalAgregarProducto';
import { toast } from 'react-toastify';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ProductosList = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [mostrarAgregarModal, setMostrarAgregarModal] = useState(false);
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);
  const { tasa, loading: loadingTasa } = useTasaBCV();

  // Estado para paginación
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Refs para el scroll
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Función para ordenar productos alfabéticamente
  const ordenarProductosAlfabeticamente = (productosArray: Producto[]) => {
    return [...productosArray].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  };

  // Memoized: Filtrar productos basado en búsqueda
  const productosFiltrados = useMemo(() => {
    if (terminoBusqueda.trim() === '') {
      return productos;
    } else {
      const termino = terminoBusqueda.toLowerCase().trim();
      return productos.filter(producto =>
        producto.nombre.toLowerCase().includes(termino)
      );
    }
  }, [productos, terminoBusqueda]);

  // Memoized: Calcular productos de la página actual
  const currentPageProducts = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return productosFiltrados.slice(startIndex, endIndex);
  }, [productosFiltrados, pagination.page, pagination.limit]);

  // Memoized: Calcular datos de paginación actualizados
  const paginationData = useMemo(() => {
    const total = productosFiltrados.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    return {
      ...pagination,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    };
  }, [productosFiltrados, pagination.page, pagination.limit]);

  // Cargar productos
  useEffect(() => {
    fetchProductos();
  }, []);

  // Efecto para hacer scroll hacia arriba cuando cambia la página
  useEffect(() => {
    if (pagination.page > 1) {
      scrollToTop();
    }
  }, [pagination.page]);

  // Actualizar paginación cuando cambian los productos filtrados
  useEffect(() => {
    const total = productosFiltrados.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    // Si la página actual es mayor que el total de páginas después de filtrar,
    // ajustar a la última página válida
    let nuevaPagina = pagination.page;
    if (nuevaPagina > totalPages && totalPages > 0) {
      nuevaPagina = totalPages;
    }
    
    // Si no hay productos filtrados y estábamos en una página > 1, volver a página 1
    if (productosFiltrados.length === 0 && pagination.page > 1) {
      nuevaPagina = 1;
    }
    
    setPagination(prev => ({
      ...prev,
      page: nuevaPagina,
      total,
      totalPages,
      hasNextPage: nuevaPagina < totalPages,
      hasPrevPage: nuevaPagina > 1
    }));
  }, [productosFiltrados]);

  // Función para hacer scroll hacia arriba
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const response = await fetch('/api/productos');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      let productosData: Producto[] = [];

      if (data && data.productos && Array.isArray(data.productos)) {
        productosData = data.productos;
      } else if (Array.isArray(data)) {
        productosData = data;
      } else {
        console.error('Estructura de respuesta inesperada:', data);
        throw new Error('Formato de respuesta inválido');
      }

      const productosOrdenados = ordenarProductosAlfabeticamente(productosData);
      setProductos(productosOrdenados);
    } catch (err) {
      console.error('Error cargando productos:', err);
      toast.error('Error al cargar los productos', {
        className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
      });
    } finally {
      setLoadingProductos(false);
    }
  };

  // Función para cambiar de página con validaciones
  const cambiarPagina = (page: number) => {
    if (page < 1 || page > paginationData.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      page,
      hasNextPage: page < paginationData.totalPages,
      hasPrevPage: page > 1
    }));
  };

  // Función para manejar cambio de búsqueda
  const handleBuscarChange = (termino: string) => {
    setTerminoBusqueda(termino);
    // Resetear a página 1 cuando se cambia el término de búsqueda
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  // Función para limpiar búsqueda
  const handleLimpiarBusqueda = () => {
    setTerminoBusqueda('');
    // Resetear a página 1
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  // Función para manejar producto creado
  const handleProductoCreado = (nuevoProducto: Producto) => {
    const nuevosProductos = [...productos, nuevoProducto];
    const productosOrdenados = ordenarProductosAlfabeticamente(nuevosProductos);
    
    setProductos(productosOrdenados);
    
    // Si hay búsqueda activa, verificar si el nuevo producto coincide
    if (terminoBusqueda) {
      const termino = terminoBusqueda.toLowerCase().trim();
      if (nuevoProducto.nombre.toLowerCase().includes(termino)) {
        // El nuevo producto coincide con la búsqueda, se mostrará automáticamente
        // ya que productosFiltrados se recalcula automáticamente
      }
    }
  };

  // Función para eliminar producto
  const handleEliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      setEliminando(true);
      const response = await fetch(`/api/productos/${productoAEliminar.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Producto eliminado exitosamente!', {
          className: "border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg shadow-sm",
        });

        const nuevosProductos = productos.filter(p => p.id !== productoAEliminar.id);
        const nuevosProductosOrdenados = ordenarProductosAlfabeticamente(nuevosProductos);
        
        setProductos(nuevosProductosOrdenados);
        setProductoAEliminar(null);
      } else {
        toast.error(data.error || 'Error al eliminar producto', {
          className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
      });
    } finally {
      setEliminando(false);
    }
  };

  // Función para editar producto
  const handleEditarProducto = async (id: number, nombre: string, precio: number, porPeso: boolean | null) => {
    try {
      setEditando(true);
      const response = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, precio, porPeso }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Producto actualizado exitosamente!', {
          className: "border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg shadow-sm",
        });

        const productosActualizados = productos.map(p =>
          p.id === id ? { ...p, nombre, precio, porPeso } : p
        );
        const productosOrdenados = ordenarProductosAlfabeticamente(productosActualizados);
        
        setProductos(productosOrdenados);
        setProductoAEditar(null);
      } else {
        toast.error(data.error || 'Error al actualizar producto', {
          className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
      });
    } finally {
      setEditando(false);
    }
  };

  // Calcular precio en Bs
  const calcularPrecioBs = (precioUsd: number) => {
    if (!tasa) return null;
    return precioUsd * tasa;
  };

  // Formatear número
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <>
      {/* Modales */}
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

      {/* Componente principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Elemento para hacer scroll (invisible) */}
        <div ref={topRef} className="h-0 w-0" aria-hidden="true" />

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Lado izquierdo: Título */}
            <div className="flex items-center">
              <Package className="h-6 w-6 text-gray-700 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Productos en Inventario</h2>
                <p className="text-sm text-gray-600">Gestión de productos del catálogo</p>
              </div>
            </div>

            {/* Lado derecho: Botón agregar */}
            <button
              onClick={() => setMostrarAgregarModal(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow hover:shadow-md active:scale-[0.98]"
            >
              <Plus size={18} className="mr-2" />
              Agregar Producto
            </button>
          </div>

          {/* Barra de búsqueda separada */}
          <div className="mt-4">
            <BarraBusqueda
              terminoBusqueda={terminoBusqueda}
              onBuscarChange={handleBuscarChange}
              onLimpiarBusqueda={handleLimpiarBusqueda}
              resultados={currentPageProducts.length}
              total={productosFiltrados.length}
              paginaActual={paginationData.page}
              totalPaginas={paginationData.totalPages}
            />
          </div>
        </div>

        {/* Tabla de productos */}
        <div ref={tableContainerRef} className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Precio USD
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Coins className="h-3 w-3 mr-1" />
                    Precio Bs
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingProductos ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Cargando productos...</p>
                    </div>
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {terminoBusqueda ? (
                        <>
                          <Search className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No se encontraron productos
                          </p>
                          <p className="text-gray-400 mb-6">
                            No hay resultados para "<span className="font-medium">{terminoBusqueda}</span>"
                          </p>
                          <button
                            onClick={handleLimpiarBusqueda}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Ver todos los productos
                          </button>
                        </>
                      ) : (
                        <>
                          <Package className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No hay productos registrados
                          </p>
                          <p className="text-gray-400 mb-6">
                            Comienza agregando productos a tu inventario
                          </p>
                          <button
                            onClick={() => setMostrarAgregarModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
                          >
                            Agregar primer producto
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : currentPageProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-gray-500 text-lg font-medium mb-2">
                        No hay productos en esta página
                      </p>
                      <p className="text-gray-400 mb-4">
                        La página {paginationData.page} no contiene productos
                      </p>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Volver a la primera página
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageProducts.map((producto) => {
                  const precioBs = calcularPrecioBs(producto.precio);

                  return (
                    <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{producto.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                              {producto.porPeso && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                                  <Weight className="h-3 w-3 mr-1" />
                                  Por peso
                                </span>
                              )}
                            </div>
                            {terminoBusqueda && producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                Coincidencia en nombre
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-base font-bold text-gray-900">
                            ${producto.precio.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {producto.porPeso ? "por kg" : "por unidad"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {loadingTasa ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-gray-500">Calculando...</span>
                            </div>
                          ) : precioBs ? (
                            <>
                              <div className="text-base font-bold text-gray-900 flex items-center">
                                <Calculator className="h-3 w-3 mr-1 text-green-600" />
                                Bs {formatNumber(precioBs)}
                              </div>
                              <div className="text-xs text-gray-500">
                                ${producto.precio.toFixed(2)} × {tasa?.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="text-base font-bold text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setProductoAEditar(producto)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Editar producto"
                            disabled={editando || eliminando || creandoProducto}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setProductoAEliminar(producto)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Eliminar producto"
                            disabled={editando || eliminando || creandoProducto}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginationData.totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Página {paginationData.page} de {paginationData.totalPages} •
                Mostrando {currentPageProducts.length} de {productosFiltrados.length} productos
                {terminoBusqueda && productosFiltrados.length < productos.length && (
                  <span className="ml-2 text-gray-500">
                    (filtrados de {productos.length} totales)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => cambiarPagina(paginationData.page - 1)}
                  disabled={!paginationData.hasPrevPage || loadingProductos}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    !paginationData.hasPrevPage || loadingProductos
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (paginationData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (paginationData.page <= 3) {
                      pageNum = i + 1;
                    } else if (paginationData.page >= paginationData.totalPages - 2) {
                      pageNum = paginationData.totalPages - 4 + i;
                    } else {
                      pageNum = paginationData.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => cambiarPagina(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          paginationData.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${loadingProductos ? 'opacity-50' : ''}`}
                        disabled={loadingProductos}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => cambiarPagina(paginationData.page + 1)}
                  disabled={!paginationData.hasNextPage || loadingProductos}
                  className={`px-3 py-2 rounded-lg flex items-center ${
                    !paginationData.hasNextPage || loadingProductos
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer adicional para tasa BCV si no hay paginación */}
        {paginationData.totalPages <= 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{productosFiltrados.length}</span> productos mostrados
                {terminoBusqueda && (
                  <span className="ml-2">
                    • Filtrado por: <span className="font-medium text-blue-600">"{terminoBusqueda}"</span>
                  </span>
                )}
                {productosFiltrados.length < productos.length && !terminoBusqueda && (
                  <span className="ml-2 text-gray-500">
                    (de {productos.length} en total)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {tasa && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tasa BCV:</span>{' '}
                    <span className="text-blue-600 font-bold">Bs {tasa.toFixed(2)}</span>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Actualizado: {new Date().toLocaleTimeString('es-VE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductosList;