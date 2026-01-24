"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import HeaderVentas from '@/src/components/RegistroVentas/HeaderVentas';
import ProductosDisponibles from '@/src/components/RegistroVentas/ProductosDisponibles';
import CarritoVenta from '@/src/components/RegistroVentas/CarritoVenta';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

// --- INTERFACES ---
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  porPeso?: boolean | null;
}

interface MetodoPago {
  id: string;
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

// --- UTILIDAD DEBOUNCE ---
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

  const [pagination, setPagination] = useState<PaginationData>({
    page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false,
  });

  const { tasa, loading: loadingTasa } = useTasaBCV();

  // --- CARGA DE PRODUCTOS (Debounce) ---
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
        console.error(error);
      } finally {
        setCargandoProductos(false);
      }
    }, 500)
  );

  useEffect(() => {
    cargarMetodosPago();
  }, []);

  useEffect(() => {
    cargarProductosRef.current(busquedaProducto, pagination.page);
  }, [busquedaProducto, pagination.page]);

  const cargarMetodosPago = async () => {
    try {
      const res = await fetch('/api/metodos-pago');
      const data = await res.json();
      setMetodosPago(data);
    } catch (e) { console.error(e); }
  };

  // --- MANEJO DEL CARRITO ---
  const agregarProducto = (producto: Producto) => {
    const existe = productosSeleccionados.find(p => p.id === producto.id);
    if (existe) {
      setProductosSeleccionados(prev => prev.map(p => p.id === producto.id ? {
        ...p,
        cantidad: producto.porPeso ? p.cantidad : p.cantidad + 1,
        subtotal: producto.porPeso ? (p.peso || 0.001) * p.precio : (p.cantidad + 1) * p.precio
      } : p));
    } else {
      setProductosSeleccionados(prev => [...prev, {
        ...producto,
        cantidad: 1,
        peso: producto.porPeso ? 1.000 : undefined,
        subtotal: producto.porPeso ? 1.000 * producto.precio : producto.precio
      }]);
    }
    toast.success(`${producto.nombre} agregado`, { position: "bottom-right", autoClose: 1000 });
  };

  const actualizarPeso = (id: string, nuevoPeso: number) => {
    setProductosSeleccionados(prev => prev.map(p => p.id === id ? { ...p, peso: nuevoPeso, subtotal: nuevoPeso * p.precio } : p));
  };

  const incrementarCantidad = (id: string) => {
    setProductosSeleccionados(prev => prev.map(p => p.id === id && !p.porPeso ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio } : p));
  };

  const decrementarCantidad = (id: string) => {
    setProductosSeleccionados(prev => prev.map(p => p.id === id && p.cantidad > 1 && !p.porPeso ? { ...p, cantidad: p.cantidad - 1, subtotal: (p.cantidad - 1) * p.precio } : p));
  };

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotal = () => productosSeleccionados.reduce((acc, p) => acc + p.subtotal, 0);

  const cambiarPagina = (pag: number) => {
    if (pag >= 1 && pag <= pagination.totalPages) setPagination(prev => ({ ...prev, page: pag }));
  };

  const limpiarBusqueda = () => setBusquedaProducto('');

  // --- FUNCIÓN CLAVE: LIMPIAR TODO ---
  const limpiarCarrito = () => {
    setProductosSeleccionados([]);
    setMetodoPagoId('');
    setBusquedaProducto('');
  };

  // --- REGISTRAR VENTA NORMAL (COBRAR) ---
  const registrarVenta = async () => {
    if (productosSeleccionados.length === 0) return toast.error('Carrito vacío');
    if (!metodoPagoId) return toast.error('Selecciona método de pago');

    try {
      setCargando(true);
      const payload = {
        productos: productosSeleccionados.map(p => ({
          id: p.id,
          cantidad: p.porPeso ? 1 : p.cantidad,
          peso: p.peso ? p.peso.toFixed(3) : null,
          precioUnitario: p.precio
        })),
        metodoPagoId,
        total: calcularTotal(),
        tasaBCV: tasa
      };

      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('¡Venta registrada!');
        limpiarCarrito();
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (e) { toast.error('Error de conexión'); }
    finally { setCargando(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <HeaderVentas total={calcularTotal()} productosCount={productosSeleccionados.length} tasaBCV={tasa} loadingTasa={loadingTasa} />
      
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
              limpiarCarrito={limpiarCarrito} // Pasamos la función
            />
          </div>
        </div>
      </div>
    </div>
  );
}