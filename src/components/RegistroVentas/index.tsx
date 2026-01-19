"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import HeaderVentas from '../../components/RegistroVentas/HeaderVentas';
import ProductosDisponibles from '../../components/RegistroVentas/ProductosDisponibles';
import CarritoVenta from '../../components/RegistroVentas/CarritoVenta';
import useTasaBCV from '../../app/hooks/useTasaBCV';

// Types
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

interface MetodoPago {
  id: number;
  nombre: string;
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

// Función debounce personalizada
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [metodoPagoId, setMetodoPagoId] = useState<string>('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // Estados para paginación
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Usar el hook de tasa BCV
  const { tasa, loading: loadingTasa, actualizar: actualizarTasa } = useTasaBCV();

  // Usar useRef para mantener una referencia estable del debounce
  const cargarProductosRef = useRef(
    debounce(async (search: string, page: number) => {
      try {
        setCargandoProductos(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`/api/productos?${queryParams}`);
        const data = await response.json();

        if (response.ok) {
          setProductos(data.productos);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setCargandoProductos(false);
      }
    }, 500)
  );

  // Cargar métodos de pago al inicio
  useEffect(() => {
    cargarMetodosPago();
  }, []);

  // Efecto para cargar productos cuando cambia búsqueda o página
  useEffect(() => {
    cargarProductosRef.current(busquedaProducto, pagination.page);
  }, [busquedaProducto, pagination.page]);

  const cargarMetodosPago = async () => {
    try {
      const response = await fetch('/api/metodos-pago');
      const data = await response.json();
      setMetodosPago(data);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
    }
  };

  // Agregar producto a la venta
  const agregarProducto = (producto: Producto) => {
    const productoExistente = productosSeleccionados.find(p => p.id === producto.id);

    if (productoExistente) {
      // Si ya existe, incrementar cantidad o peso
      setProductosSeleccionados(prev =>
        prev.map(p =>
          p.id === producto.id
            ? {
                ...p,
                cantidad: producto.porPeso ? p.cantidad : p.cantidad + 1,
                subtotal: producto.porPeso 
                  ? (p.peso || 0.001) * p.precio
                  : (p.cantidad + 1) * p.precio
              }
            : p
        )
      );
    } else {
      // Si no existe, agregarlo
      setProductosSeleccionados(prev => [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          peso: producto.porPeso ? 0.001 : undefined,
          subtotal: producto.porPeso 
            ? 0.001 * producto.precio
            : producto.precio
        }
      ]);
    }

    toast.success(`${producto.nombre} agregado al carrito`, {
      icon: <span>➕</span>,
      position: "bottom-right",
    });
  };

  // Actualizar peso de un producto
  const actualizarPeso = (id: number, nuevoPeso: number) => {
    setProductosSeleccionados(prev =>
      prev.map(producto =>
        producto.id === id
          ? {
              ...producto,
              peso: nuevoPeso,
              subtotal: parseFloat((nuevoPeso * producto.precio).toFixed(2))
            }
          : producto
      )
    );
  };

  // Incrementar cantidad
  const incrementarCantidad = (id: number) => {
    setProductosSeleccionados(prev =>
      prev.map(producto =>
        producto.id === id && !producto.porPeso
          ? {
              ...producto,
              cantidad: producto.cantidad + 1,
              subtotal: (producto.cantidad + 1) * producto.precio
            }
          : producto
      )
    );
  };

  // Decrementar cantidad
  const decrementarCantidad = (id: number) => {
    setProductosSeleccionados(prev =>
      prev.map(producto =>
        producto.id === id && producto.cantidad > 1 && !producto.porPeso
          ? {
              ...producto,
              cantidad: producto.cantidad - 1,
              subtotal: (producto.cantidad - 1) * producto.precio
            }
          : producto
      )
    );
  };

  // Eliminar producto del carrito
  const eliminarProducto = (id: number) => {
    const producto = productosSeleccionados.find(p => p.id === id);
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));

    if (producto) {
      toast.info(`${producto.nombre} eliminado del carrito`, {
        icon: <span>🗑️</span>,
        position: "bottom-right",
      });
    }
  };

  // Calcular total
  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, producto) => total + producto.subtotal, 0);
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: nuevaPagina }));
    }
  };

  // Registrar venta
  const registrarVenta = async () => {
    if (productosSeleccionados.length === 0) {
      toast.error('Debe agregar al menos un producto', {
        position: "top-center",
      });
      return;
    }

    if (!metodoPagoId) {
      toast.error('Debe seleccionar un método de pago', {
        position: "top-center",
      });
      return;
    }

    const total = calcularTotal();

    try {
      setCargando(true);

      const productosParaVenta = productosSeleccionados.map(p => ({
        id: p.id,
        cantidad: p.porPeso ? 1 : p.cantidad,
        peso: p.peso ? p.peso.toFixed(3) : null, // Guardar como string
        precioUnitario: p.precio
      }));

      const ventaData = {
        productos: productosParaVenta,
        metodoPagoId: parseInt(metodoPagoId),
        total,
        tasaBCV: tasa
      };

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Venta registrada exitosamente!', {
          className: "border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg shadow-sm",
          position: "top-center",
        });

        setProductosSeleccionados([]);
        setMetodoPagoId('');
        setBusquedaProducto('');
      } else {
        toast.error(data.error || 'Error al registrar la venta', {
          className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
          position: "top-center",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión', {
        className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
        position: "top-center",
      });
    } finally {
      setCargando(false);
    }
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setBusquedaProducto('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <HeaderVentas
        total={calcularTotal()}
        productosCount={productosSeleccionados.length}
        tasaBCV={tasa}
        loadingTasa={loadingTasa}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductosDisponibles
            productos={productos}
            productosSeleccionados={productosSeleccionados}
            busquedaProducto={busquedaProducto}
            setBusquedaProducto={setBusquedaProducto}
            limpiarBusqueda={limpiarBusqueda}
            agregarProducto={agregarProducto}
            pagination={pagination}
            cambiarPagina={cambiarPagina}
            cargandoProductos={cargandoProductos}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <CarritoVenta
              productosSeleccionados={productosSeleccionados}
              incrementarCantidad={incrementarCantidad}
              decrementarCantidad={decrementarCantidad}
              actualizarPeso={actualizarPeso}
              eliminarProducto={eliminarProducto}
              calcularTotal={calcularTotal}
              metodosPago={metodosPago}
              metodoPagoId={metodoPagoId}
              setMetodoPagoId={setMetodoPagoId}
              registrarVenta={registrarVenta}
              cargando={cargando}
              tasaBCV={tasa}
              loadingTasa={loadingTasa}
            />
          </div>
        </div>
      </div>
    </div>
  );
}