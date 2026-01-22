"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Trash2, 
  RefreshCcw, 
  CheckCircle2, 
  ArrowRight,
  Package,
  Plus,
  Send,
  Calculator // Icono para el botón de registrar
} from "lucide-react";
import useTasaBCV from "../hooks/useTasaBCV";

// DATOS LIMPIOS
const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Harina P.A.N.", precio: 1.10, stock: 20 },
  { id: 2, nombre: "Coca-Cola 2L", precio: 2.50, stock: 15 },
  { id: 3, nombre: "Queso Duro (kg)", precio: 5.80, stock: 8 },
  { id: 4, nombre: "Café Fama (250g)", precio: 3.20, stock: 12 },
  { id: 5, nombre: "Aceite Mazeite", precio: 2.90, stock: 10 },
  { id: 6, nombre: "Mantequilla 500g", precio: 1.50, stock: 18 },
];

export default function DemoPage() {
  const { tasa } = useTasaBCV();
  const tasaActual = tasa || 60;

  const [inventario, setInventario] = useState(PRODUCTOS_INICIALES);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [telefono, setTelefono] = useState("");
  const [ventaExitosa, setVentaExitosa] = useState(false);

  // Cálculos
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const subtotalBs = subtotal * tasaActual;

  // Acciones
  const agregarAlCarrito = (producto: any) => {
    const existente = carrito.find(p => p.id === producto.id);
    const stockActual = inventario.find(p => p.id === producto.id)?.stock || 0;
    const cantidadEnCarrito = existente ? existente.cantidad : 0;

    if (stockActual - cantidadEnCarrito <= 0) return; 

    if (existente) {
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(p => p.id !== id));
  };

  const reiniciarDemo = () => {
    setInventario(PRODUCTOS_INICIALES);
    setCarrito([]);
    setTelefono("");
    setVentaExitosa(false);
  };

  // --- LÓGICA 1: REGISTRAR VENTA (SOLO BD INTERNA) ---
  const registrarVenta = () => {
    if (carrito.length === 0) return;

    // 1. Descontar Inventario
    const nuevoInventario = inventario.map(prod => {
      const enCarrito = carrito.find(c => c.id === prod.id);
      if (enCarrito) return { ...prod, stock: prod.stock - enCarrito.cantidad };
      return prod;
    });
    setInventario(nuevoInventario);
    
    // 2. Mostrar Confirmación
    setVentaExitosa(true);

    // 3. Limpiar tras 3 segundos
    setTimeout(() => {
        setCarrito([]);
        setVentaExitosa(false);
        setTelefono("");
    }, 3000);
  };

  // --- LÓGICA 2: ENVIAR WHATSAPP ---
  const enviarWhatsapp = () => {
    if (carrito.length === 0 || telefono.length < 10) return;

    // (Opcional) También registramos la venta al enviar
    registrarVenta();

    // Construir Mensaje
    const fecha = new Date().toLocaleDateString('es-VE');
    let mensaje = `*NOTA DE ENTREGA (DEMO)*\n`;
    mensaje += ` Fecha: ${fecha}\n`;
    mensaje += `------------------\n`;
    carrito.forEach(p => {
        mensaje += `${p.cantidad}x ${p.nombre} - $${(p.precio * p.cantidad).toFixed(2)}\n`;
    });
    mensaje += `------------------\n`;
    mensaje += `*TOTAL: $${subtotal.toFixed(2)}*\n`;
    mensaje += `*BS: ${subtotalBs.toFixed(2)}*\n`;
    
    let numeroFinal = telefono.replace(/\D/g, ''); 
    if (numeroFinal.startsWith('0')) {
        numeroFinal = '58' + numeroFinal.substring(1);
    } else if (!numeroFinal.startsWith('58')) {
        numeroFinal = '58' + numeroFinal;
    }

    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 pb-20">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white pt-12 pb-24 px-6 text-center relative overflow-hidden shadow-xl mb-10">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
         <div className="relative z-10 animate-in fade-in zoom-in duration-700">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4 text-indigo-100">
                Demo Interactiva v2.0
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                Experimenta el Control Total
            </h1>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
              Sin registros. Toca los productos, llena el carrito y mira cómo la magia sucede automáticamente.
            </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* === COLUMNA IZQUIERDA: PRODUCTOS === */}
        <div className="lg:col-span-7 space-y-6">
           <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-white">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-800">Productos Disponibles</h2>
                 <button onClick={reiniciarDemo} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-50" title="Reiniciar Stock">
                    <RefreshCcw size={18} />
                 </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {inventario.map((prod) => (
                    <button 
                       key={prod.id}
                       onClick={() => agregarAlCarrito(prod)}
                       disabled={prod.stock === 0}
                       className="group flex flex-col justify-between p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed min-h-[160px]"
                    >
                       <div className="mb-2">
                          <h3 className="font-medium text-gray-700 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                             {prod.nombre}
                          </h3>
                       </div>

                       <div className="mt-auto flex items-end justify-between">
                          <div>
                             <div className="text-lg font-bold text-gray-900 leading-none">${prod.precio.toFixed(2)}</div>
                             <div className="text-xs font-medium text-gray-400 mt-1">Bs {(prod.precio * tasaActual).toFixed(2)}</div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-white text-indigo-600 shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <Plus size={18} strokeWidth={2.5} />
                          </div>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* === COLUMNA DERECHA: TICKET / CARRITO === */}
        <div className="lg:col-span-5">
           <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white sticky top-6 overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Header Ticket */}
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                 <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Nota de Entrega</h2>
                        <p className="text-xs text-gray-400">Simulación de Venta</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tasa del Día</p>
                    <p className="text-sm font-bold text-gray-800">Bs {tasaActual.toFixed(2)}</p>
                 </div>
              </div>

              {/* Lista Items */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                 {carrito.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-12">
                       <Package size={48} strokeWidth={1} className="mb-3 opacity-20"/>
                       <p className="text-sm font-medium text-gray-400">Carrito vacío</p>
                    </div>
                 ) : (
                    carrito.map((item) => (
                       <div key={item.id} className="flex justify-between items-center group animate-in slide-in-from-right-2">
                          <div className="flex items-center gap-3">
                             <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">x{item.cantidad}</span>
                             <div>
                                <div className="text-sm font-medium text-gray-800">{item.nombre}</div>
                                <div className="text-xs text-gray-400">${item.precio.toFixed(2)} c/u</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="font-bold text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</span>
                             <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={14}/>
                             </button>
                          </div>
                       </div>
                    ))
                 )}
              </div>

              {/* Footer Totales & Acciones */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 
                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-500">Total USD</span>
                        <span className="text-2xl font-black text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-500">Total Bs</span>
                        <span className="text-sm font-bold text-gray-600">Bs {subtotalBs.toFixed(2)}</span>
                    </div>
                 </div>

                 {ventaExitosa ? (
                    <div className="bg-green-100 text-green-700 p-4 rounded-xl flex flex-col items-center justify-center gap-1 animate-in zoom-in font-bold mb-2 shadow-sm text-center">
                        <div className="flex items-center gap-2">
                           <CheckCircle2 size={24}/> ¡Venta Registrada!
                        </div>
                        <p className="text-xs font-normal opacity-80">Inventario descontado correctamente</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {/* 1. BOTÓN PRINCIPAL DE REGISTRAR */}
                        <button 
                            onClick={registrarVenta}
                            disabled={carrito.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 font-bold text-lg active:scale-95"
                        >
                            <Calculator size={22} /> Registrar Venta
                        </button>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 uppercase font-bold">O envía recibo digital</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* 2. OPCIÓN WHATSAPP (Input + Botón pequeño) */}
                        <div className="flex gap-2">
                            <input 
                                type="tel"
                                placeholder="WhatsApp (Ej: 0412...)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all bg-white"
                                value={telefono}
                                onChange={(e) => {
                                    if (/^\d*$/.test(e.target.value)) setTelefono(e.target.value);
                                }}
                            />
                            <button 
                                onClick={enviarWhatsapp}
                                disabled={carrito.length === 0 || telefono.length < 10}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-all shadow-md shadow-green-100 flex items-center justify-center active:scale-95"
                                title="Enviar Nota por WhatsApp"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="max-w-3xl mx-auto mt-12 text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
         <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">
            ¿Listo para organizar tu negocio?
         </h2>
         <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Esto fue solo una pequeña prueba. El sistema completo incluye control de deudas, usuarios, reportes mensuales y mucho más.
         </p>
         <Link 
            href="/contacto" 
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 shadow-xl hover:shadow-indigo-500/30"
         >
            Quiero este sistema en mi negocio
            <ArrowRight className="ml-2 w-5 h-5"/>
         </Link>
      </div>

    </div>
  );
}