"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard,
  AlertCircle, Loader2, Check, Wallet, BadgeDollarSign,
  Smartphone, Building, Weight
} from 'lucide-react';

interface ProductoSeleccionado {
  id: string; // ID string
  nombre: string;
  precio: number;
  cantidad: number;
  peso?: number;
  porPeso?: boolean | null;
  subtotal: number;
}

interface MetodoPago {
  id: string; // ID string
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
  loadingTasa: boolean;
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
  loadingTasa
}: CarritoVentaProps) {
  const total = calcularTotal();
  const [pesoInputs, setPesoInputs] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  
  // Sincronizar inputs al cambiar productos
  useEffect(() => {
    const nextInputs: { [key: string]: string } = {};
    productosSeleccionados.forEach(p => {
      if (p.porPeso && p.peso !== undefined) {
        // Mantenemos el valor actual si se está editando, sino actualizamos
        if (!isEditing[p.id]) {
            nextInputs[p.id] = p.peso.toString();
        } else {
            nextInputs[p.id] = pesoInputs[p.id] || p.peso.toString();
        }
      }
    });
    setPesoInputs(nextInputs);
  }, [productosSeleccionados, isEditing]); // Dependencias corregidas

  const handlePesoChange = (id: string, value: string) => {
    setPesoInputs(prev => ({ ...prev, [id]: value }));
  };

  const handlePesoBlur = (id: string, value: string) => {
    setIsEditing(prev => ({ ...prev, [id]: false }));
    
    let numValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) numValue = 0.001;
    if (numValue > 100) numValue = 100; // Límite razonable

    const finalVal = parseFloat(numValue.toFixed(3));
    setPesoInputs(prev => ({ ...prev, [id]: finalVal.toString() }));
    actualizarPeso(id, finalVal);
  };

  const handlePesoFocus = (id: string) => {
    setIsEditing(prev => ({ ...prev, [id]: true }));
  };

  const getDisplayValue = (id: string) => {
      return pesoInputs[id] || '';
  };

  const metodoSeleccionado = metodosPago.find(m => m.id === metodoPagoId);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Carrito</h2>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
          {productosSeleccionados.length} Items
        </span>
      </div>

      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-1">
        {productosSeleccionados.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          productosSeleccionados.map((p) => (
            <div key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <button
                onClick={() => eliminarProducto(p.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-semibold text-gray-800 text-sm">{p.nombre}</h3>
                   {p.porPeso && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Weight size={10}/> Kg</span>}
                </div>
                
                <div className="flex justify-between items-end">
                  {p.porPeso ? (
                    <div className="flex items-center gap-2">
                       <input
                        type="text"
                        inputMode="decimal"
                        value={getDisplayValue(p.id)}
                        onChange={(e) => handlePesoChange(p.id, e.target.value)}
                        onBlur={(e) => handlePesoBlur(p.id, e.target.value)}
                        onFocus={() => handlePesoFocus(p.id)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono"
                        placeholder="0.000"
                       />
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

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Método de Pago</label>
        <div className="grid grid-cols-2 gap-2">
           {metodosPago.map(m => (
             <button
               key={m.id}
               onClick={() => setMetodoPagoId(m.id)}
               className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition-all ${
                 metodoPagoId === m.id 
                 ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                 : 'border-gray-200 hover:border-blue-300 text-gray-600'
               }`}
             >
                {getMetodoPagoIcon(m.nombre)}
                {m.nombre}
             </button>
           ))}
        </div>
      </div>

      <button
        onClick={registrarVenta}
        disabled={cargando || productosSeleccionados.length === 0 || !metodoPagoId}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {cargando ? <Loader2 className="animate-spin" /> : <CreditCard size={20}/>}
        <span>Procesar Venta</span>
      </button>
    </div>
  );
}