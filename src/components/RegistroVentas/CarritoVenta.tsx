"use client";

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard,
  Loader2, Wallet, BadgeDollarSign, Smartphone, Building, Weight,
  UserMinus, X, User, FileText, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';

// Interfaces simplificadas
interface ProductoSeleccionado {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  peso?: number;
  porPeso?: boolean | null;
  subtotal: number;
}

interface MetodoPago {
  id: string;
  nombre: string;
}

interface CarritoVentaProps {
  productosSeleccionados: ProductoSeleccionado[];
  incrementarCantidad: (id: string) => void;
  decrementarCantidad: (id: string) => void;
  actualizarPeso: (id: string, nuevoPeso: number) => void;
  eliminarProducto: (id: string) => void;
  calcularTotal: () => number;
  metodosPago: MetodoPago[];
  metodoPagoId: string;
  setMetodoPagoId: (id: string) => void;
  registrarVenta: () => void;
  cargando: boolean;
  tasaBCV: number | null;
  limpiarCarrito: () => void;
  loadingTasa?: boolean;
}

const getMetodoPagoIcon = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes('efectivo') || n.includes('cash')) return <BadgeDollarSign className="w-5 h-5" />;
  if (n.includes('débito') || n.includes('debito') || n.includes('crédito')) return <CreditCard className="w-5 h-5" />;
  if (n.includes('movil') || n.includes('móvil') || n.includes('zelle')) return <Smartphone className="w-5 h-5" />;
  if (n.includes('banco') || n.includes('depósito')) return <Building className="w-5 h-5" />;
  return <Wallet className="w-5 h-5" />;
};

export default function CarritoVenta({
  productosSeleccionados,
  incrementarCantidad,
  decrementarCantidad,
  actualizarPeso,
  eliminarProducto,
  calcularTotal,
  metodosPago,
  metodoPagoId,
  setMetodoPagoId,
  registrarVenta,
  cargando,
  tasaBCV,
  limpiarCarrito
}: CarritoVentaProps) {
 
  const total = calcularTotal();
 
  // --- ESTADOS LOCALES ---
  const [pesoInputs, setPesoInputs] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});

  // --- ESTADOS MODAL FIADO ---
  const [modalFiadoOpen, setModalFiadoOpen] = useState(false);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteNota, setClienteNota] = useState("");
  const [guardandoFiado, setGuardandoFiado] = useState(false);

  // --- AUTOCOMPLETADO ---
  const [deudoresExistentes, setDeudoresExistentes] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    if (modalFiadoOpen) {
      fetch('/api/deudas?tipo=COBRAR')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const unicos = new Map();
            data.forEach((d: any) => {
              if (!unicos.has(d.persona.toLowerCase())) {
                unicos.set(d.persona.toLowerCase(), {
                  persona: d.persona,
                  telefono: d.telefono
                });
              }
            });
            setDeudoresExistentes(Array.from(unicos.values()));
          }
        })
        .catch(err => console.error("Error cargando deudores", err));
    }
  }, [modalFiadoOpen]);

  const handleNombreChange = (val: string) => {
    setClienteNombre(val);
    if (val.length > 1) {
      const filtrados = deudoresExistentes.filter(d =>
        d.persona.toLowerCase().includes(val.toLowerCase())
      );
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarCliente = (cliente: any) => {
    setClienteNombre(cliente.persona);
    setClienteTelefono(cliente.telefono || "");
    setMostrarSugerencias(false);
  };

  // --- PESOS ---
  useEffect(() => {
    const nextInputs: { [key: string]: string } = {};
    productosSeleccionados.forEach(p => {
      if (p.porPeso && p.peso !== undefined) {
        if (!isEditing[p.id]) nextInputs[p.id] = p.peso.toString();
        else nextInputs[p.id] = pesoInputs[p.id] || p.peso.toString();
      }
    });
    setPesoInputs(nextInputs);
  }, [productosSeleccionados, isEditing]);

  const handlePesoChange = (id: string, value: string) => setPesoInputs(prev => ({ ...prev, [id]: value }));
 
  const handlePesoBlur = (id: string, value: string) => {
    setIsEditing(prev => ({ ...prev, [id]: false }));
    let num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num <= 0) num = 0.001;
    if (num > 100) num = 100;
    const final = parseFloat(num.toFixed(3));
    setPesoInputs(prev => ({ ...prev, [id]: final.toString() }));
    actualizarPeso(id, final);
  };

  const getDisplayValue = (id: string) => pesoInputs[id] || '';

  // --- GUARDAR FIADO ---
  const handleFiar = async () => {
    if (!clienteNombre.trim()) return toast.warning("Escribe el nombre del cliente");
   
    setGuardandoFiado(true);
    try {
      const itemsString = productosSeleccionados.map(p => {
         const unid = p.porPeso ? "kg" : "unid";
         const cant = p.porPeso ? p.peso : p.cantidad;
         return `• ${cant} ${unid} x ${p.nombre} ($${p.precio})`;
      }).join("\n");
     
      const descripcionFinal = clienteNota ? `${clienteNota}\n${itemsString}` : itemsString;

      const payload = {
        tipo: "COBRAR",        
        persona: clienteNombre,
        telefono: clienteTelefono,
        descripcion: descripcionFinal,
        monto: total,
        productos: productosSeleccionados
      };

      const res = await fetch("/api/deudas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Cuenta actualizada para ${clienteNombre}`);
        setModalFiadoOpen(false);
        setClienteNombre("");
        setClienteTelefono("");
        setClienteNota("");
        limpiarCarrito();
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al fiar");
      }
    } catch (e) { toast.error("Error de conexión"); }
    finally { setGuardandoFiado(false); }
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col h-full relative">
     
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Carrito</h2>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
          {productosSeleccionados.length} Items
        </span>
      </div>

      {/* ITEMS */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {productosSeleccionados.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200 h-full flex flex-col justify-center items-center">
            <ShoppingCart className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          productosSeleccionados.map((p) => (
            <div key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <button onClick={() => eliminarProducto(p.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{p.nombre}</h3>
                  {p.porPeso && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Weight size={10}/> Kg</span>}
                </div>
                <div className="flex justify-between items-end">
                  {p.porPeso ? (
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="decimal" value={getDisplayValue(p.id)} onChange={(e) => handlePesoChange(p.id, e.target.value)} onBlur={(e) => handlePesoBlur(p.id, e.target.value)} onFocus={() => setIsEditing(prev => ({ ...prev, [p.id]: true }))} className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono" placeholder="0.000" />
                      <span className="text-xs text-gray-500">kg</span>
                    </div>
                  ) : (
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                      <button onClick={() => decrementarCantidad(p.id)} disabled={p.cantidad<=1} className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"><Minus size={14}/></button>
                      <span className="px-2 text-sm font-bold w-8 text-center">{p.cantidad}</span>
                      <button onClick={() => incrementarCantidad(p.id)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><Plus size={14}/></button>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="font-bold text-gray-800">${p.subtotal.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500">${p.precio.toFixed(2)} unit</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTALES */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600 font-medium">Total USD</span>
          <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
        {tasaBCV && (
          <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-500">Total Bs (Tasa: {tasaBCV.toFixed(2)})</span>
            <span className="font-bold text-gray-700">Bs {(total * tasaBCV).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* PAGOS */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Método de Pago</label>
        <div className="grid grid-cols-2 gap-2">
          {metodosPago.map(m => (
            <button key={m.id} onClick={() => setMetodoPagoId(m.id)} className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${metodoPagoId === m.id ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}>
              {getMetodoPagoIcon(m.nombre)} {m.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* BOTONES */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button onClick={() => setModalFiadoOpen(true)} disabled={cargando || productosSeleccionados.length === 0} className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl font-bold text-gray-700 bg-white border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all disabled:opacity-50 active:scale-95">
          <UserMinus size={20}/>
          <span className="text-xs">Fiar / Crédito</span>
        </button>
        <button onClick={registrarVenta} disabled={cargando || productosSeleccionados.length === 0 || !metodoPagoId} className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
          {cargando ? <Loader2 className="animate-spin w-5 h-5" /> : <CreditCard size={20}/>}
          <span className="text-xs">Cobrar Ahora</span>
        </button>
      </div>
    </div>

    {/* --- MODAL FIAR PEDIDO (DISEÑO MEJORADO) --- */}
    {modalFiadoOpen && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
         
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                   Fiar Pedido <UserMinus className="text-orange-500" size={24}/>
                </h3>
             </div>
             <button onClick={() => setModalFiadoOpen(false)} className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18}/>
             </button>
          </div>

          <div className="p-6 space-y-5">
             {/* CLIENTE */}
             <div className="relative z-20">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nombre del Cliente *</label>
                <div className="relative group">
                   <User className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                   <input
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-bold text-gray-800 transition-all"
                      placeholder="Buscar nombre..."
                      value={clienteNombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                   />
                </div>
               
                {mostrarSugerencias && sugerencias.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">Sugerencias</div>
                      {sugerencias.map((s, idx) => (
                         <button
                            key={idx}
                            onClick={() => seleccionarCliente(s)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 text-sm text-gray-700 font-bold flex justify-between items-center border-b border-gray-50"
                         >
                            {s.persona}
                            {s.telefono && <span className="text-xs text-gray-400 font-normal">{s.telefono}</span>}
                         </button>
                      ))}
                   </div>
                )}
             </div>

             {/* TELEFONO */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Teléfono</label>
                <div className="relative">
                   <Phone className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                   <input
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium text-gray-700"
                       placeholder="0412..."
                       value={clienteTelefono}
                       onChange={e => setClienteTelefono(e.target.value)}
                   />
                </div>
             </div>

             {/* NOTA */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nota</label>
                <div className="relative">
                   <FileText className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                   <textarea 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-sm font-medium text-gray-700 resize-none h-20" 
                        placeholder="Detalles..." 
                        value={clienteNota} 
                        onChange={e => setClienteNota(e.target.value)} 
                   />
                </div>
             </div>
          </div>

          <div className="p-6 pt-2 border-t border-gray-100 flex gap-3">
             <button onClick={() => setModalFiadoOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
             <button onClick={handleFiar} disabled={guardandoFiado || !clienteNombre} className="flex-[1.5] py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2">
                {guardandoFiado ? <Loader2 className="animate-spin"/> : "Confirmar Deuda"}
             </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
}