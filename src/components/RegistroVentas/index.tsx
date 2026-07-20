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
  unidad?: string | null;
  cantidadBase?: number | null;
  stock: number;
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

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VentasPage() {
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [metodoPagoId, setMetodoPagoId] = useState<string>('');
  
  const [referencia, setReferencia] = useState('');
  
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const { tasa, loading: loadingTasa } = useTasaBCV();

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBusqueda(busquedaProducto);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [busquedaProducto]);

  // SWR para productos (auto revalidación)
  const { data: respProd, mutate: recargarProductos, isLoading: cargandoProductos } = useSWR(
    `/api/productos?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedBusqueda)}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const productos: Producto[] = respProd?.productos || [];
  const pagination: PaginationData = respProd?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  // --- CARGAR MÉTODOS DE PAGO (Una sola vez) ---
  useEffect(() => {
    fetch('/api/metodos-pago')
      .then((res) => res.json())
      .then((data) => setMetodosPago(data))
      .catch((err) => console.error(err));
  }, []);

  // CORRECCIÓN REACT: Validación separada de la actualización
  const agregarProducto = (producto: Producto) => {
    const existe = productosSeleccionados.find(p => p.id === producto.id);
    
    // Si ya existe, comprobamos si añadir 1 excede stock
    if (existe && !producto.porPeso) {
        if (existe.cantidad + 1 > producto.stock) {
            toast.warning(`No puedes agregar más de ${producto.stock}`);
            return;
        }
    }

    // Si es nuevo y stock < 1, validamos
    if (!existe && !producto.porPeso) {
        if (producto.stock < 1) {
            toast.warning('No hay stock disponible');
            return;
        }
    }

    if (existe) {
      const pSeleccionado = productosSeleccionados.find(p => p.id === producto.id);
      if (pSeleccionado && !producto.porPeso && pSeleccionado.cantidad + 1 > producto.stock) {
          toast.warning(`Solo tienes ${producto.stock} ${producto.unidad || 'unidades'} disponibles`);
          return;
      }
      setProductosSeleccionados(prev => prev.map(p => p.id === producto.id ? {
        ...p,
        cantidad: producto.porPeso ? p.cantidad : p.cantidad + 1,
        subtotal: producto.porPeso ? ((p.peso || 0.001) / (producto.cantidadBase || 1)) * p.precio : (p.cantidad + 1) * p.precio
      } : p));
    } else {
      setProductosSeleccionados(prev => [...prev, {
        ...producto,
        cantidad: 1,
        peso: producto.porPeso ? 1.00 : undefined,
        subtotal: producto.porPeso ? (1.00 / (producto.cantidadBase || 1)) * producto.precio : producto.precio
      }]);
    }
    toast.success(`${producto.nombre} agregado`, { position: "top-center", autoClose: 1000 });
  };

  // CORRECCIÓN REACT: Validación fuera del setState
  const incrementarCantidad = (id: string) => {
    // 1. Buscamos el producto en el estado actual
    const producto = productosSeleccionados.find(p => p.id === id);
    if (!producto) return;

    // 2. Validamos
    if (!producto.porPeso) {
        if (producto.cantidad + 1 > producto.stock) {
            toast.warning(`Solo tienes ${producto.stock} ${producto.unidad || 'unidades'} disponibles`);
            return; // Detenemos aquí, no actualizamos estado
        }
    }

    // 3. Actualizamos estado (seguro)
    setProductosSeleccionados(prev => prev.map(p => 
        p.id === id 
        ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * p.precio } 
        : p
    ));
  };

  // CORRECCIÓN REACT: Validación fuera del setState
  const actualizarPeso = (id: string, nuevoPeso: number) => {
    const producto = productosSeleccionados.find(p => p.id === id);
    if (!producto) return;

    if (nuevoPeso > producto.stock) {
        toast.warning(`Solo tienes ${producto.stock} ${producto.unidad || (producto.porPeso ? 'kg' : 'unidades')} disponibles`);
        // Opcional: Podrías revertir el input si quieres, pero en CarritoVenta ya tienes un input suelto, así que solo validamos al setear.
        // return; 
    }

    setProductosSeleccionados(prev => prev.map(p => 
        p.id === id 
        ? { ...p, peso: nuevoPeso, subtotal: (nuevoPeso / (p.cantidadBase || 1)) * p.precio } 
        : p
    ));
  };

  const decrementarCantidad = (id: string) => {
    setProductosSeleccionados(prev => prev.map(p => p.id === id && p.cantidad > 1 && !p.porPeso ? { ...p, cantidad: p.cantidad - 1, subtotal: (p.cantidad - 1) * p.precio } : p));
  };

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotal = () => productosSeleccionados.reduce((acc, p) => acc + p.subtotal, 0);

  const cambiarPagina = (pag: number) => {
    if (pag >= 1 && pag <= pagination.totalPages) setPage(pag);
  };

  const limpiarBusqueda = () => setBusquedaProducto('');

  const limpiarCarrito = () => {
    setProductosSeleccionados([]);
    setMetodoPagoId('');
    setReferencia('');
    setBusquedaProducto('');
  };

  // --- REGISTRAR VENTA NORMAL (COBRAR) ---
  const registrarVenta = async () => {
    if (productosSeleccionados.length === 0) return toast.error('Carrito vacío');
    if (!metodoPagoId) return toast.error('Selecciona método de pago');

    // Validación final de seguridad
    for (const p of productosSeleccionados) {
        const cantidadLlevada = p.porPeso && p.peso ? p.peso : p.cantidad;
        if (cantidadLlevada > p.stock) {
            toast.error(`Stock insuficiente para ${p.nombre}. Disponible: ${p.stock}`);
            return;
        }
    }

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
        referencia: referencia || null,
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
        setMobileCartOpen(false); // <--- CERRAMOS EL CARRITO MÓVIL AL TERMINAR
        // Recargar productos para actualizar stock visualmente usando SWR
        recargarProductos();
      } else {
        toast.error(data.error || 'Error');
      }
    } catch (e) { toast.error('Error de conexión'); }
    finally { setCargando(false); }
  };

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-24 md:pb-6">
      <HeaderVentas total={calcularTotal()} productosCount={productosSeleccionados.length} tasaBCV={tasa} loadingTasa={loadingTasa} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
            decrementarCantidad={decrementarCantidad}
            eliminarProducto={eliminarProducto}
          />
        </div>

        {/* EN DESKTOP SIEMPRE VISIBLE. EN MOBILE OCULTO A MENOS QUE ESTÉ ABIERTO */}
        <div className={`lg:col-span-1 fixed inset-0 z-50 bg-gray-50 lg:bg-transparent lg:relative lg:z-auto transition-transform transform ${mobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} lg:block overflow-y-auto`}>
          <div className="w-full min-h-full lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] flex flex-col pt-0 lg:pt-0">
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
              referencia={referencia}
              setReferencia={setReferencia}
              registrarVenta={registrarVenta}
              cargando={cargando}
              tasaBCV={tasa}
              loadingTasa={loadingTasa}
              limpiarCarrito={limpiarCarrito}
              onCloseMobile={() => setMobileCartOpen(false)} // Pasamos prop para cerrar
            />
          </div>
        </div>
      </div>

      {/* FAB / Botón Flotante para Móvil */}
      {!mobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
           <button onClick={() => setMobileCartOpen(true)} className="w-full bg-blue-600 text-white rounded-2xl shadow-xl p-4 font-bold flex justify-between items-center active:scale-95 transition-transform border-2 border-blue-500">
              <span className="flex items-center gap-2">🛒 Ver Carrito <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">{productosSeleccionados.length}</span></span>
              <span>${calcularTotal().toFixed(2)}</span>
           </button>
        </div>
      )}
    </div>
  );
}