"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  AlertCircle,
  Loader2,
  Check,
  Wallet,
  BadgeDollarSign,
  Smartphone,
  Building,
  Weight
} from 'lucide-react';

interface ProductoSeleccionado {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  peso?: number;
  porPeso?: boolean | null;
  subtotal: number;
}

interface MetodoPago {
  id: number;
  nombre: string;
}

interface CarritoVentaProps {
  productosSeleccionados: ProductoSeleccionado[];
  incrementarCantidad: (id: number) => void;
  decrementarCantidad: (id: number) => void;
  actualizarPeso: (id: number, nuevoPeso: number) => void;
  eliminarProducto: (id: number) => void;
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
  const nombreLower = nombre.toLowerCase();

  if (nombreLower.includes('efectivo') || nombreLower.includes('cash')) {
    return <BadgeDollarSign className="w-5 h-5" />;
  } else if (nombreLower.includes('débito') || nombreLower.includes('debito')) {
    return <CreditCard className="w-5 h-5" />;
  } else if (nombreLower.includes('crédito') || nombreLower.includes('credito')) {
    return <CreditCard className="w-5 h-5" />;
  } else if (nombreLower.includes('transferencia') || nombreLower.includes('pago móvil')) {
    return <Smartphone className="w-5 h-5" />;
  } else if (nombreLower.includes('banco') || nombreLower.includes('depósito')) {
    return <Building className="w-5 h-5" />;
  } else {
    return <Wallet className="w-5 h-5" />;
  }
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
  const [pesoInputs, setPesoInputs] = useState<{ [key: number]: string }>({});
  const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Sincronizar los valores iniciales
  useEffect(() => {
    const initialValues: { [key: number]: string } = {};
    productosSeleccionados.forEach(producto => {
      if (producto.porPeso && producto.peso !== undefined) {
        initialValues[producto.id] = producto.peso.toString();
      }
    });
    setPesoInputs(initialValues);
  }, [productosSeleccionados]);

  const handleSelectMetodo = (id: number) => {
    if (!cargando) {
      setMetodoPagoId(id.toString());
    }
  };

  const getMetodoSeleccionado = () => {
    if (!metodoPagoId) return null;
    return metodosPago.find(metodo => metodo.id === parseInt(metodoPagoId));
  };

  const handlePesoFocus = (id: number) => {
    // Cuando el usuario hace focus, marcamos que está editando
    setIsEditing(prev => ({
      ...prev,
      [id]: true
    }));
    
    // Si el valor actual es 0.001, lo limpiamos para que pueda escribir fácilmente
    const currentValue = pesoInputs[id];
    if (currentValue === '0.001') {
      setPesoInputs(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const handlePesoChange = (id: number, value: string) => {
    // Permitir al usuario escribir libremente mientras edita
    setPesoInputs(prev => ({
      ...prev,
      [id]: value
    }));
    
    // No llamamos a actualizarPeso aquí para no interrumpir la escritura
  };

  const handlePesoBlur = (id: number, value: string) => {
    // Al perder el foco, terminamos de editar
    setIsEditing(prev => ({
      ...prev,
      [id]: false
    }));
    
    // Validar y actualizar el peso
    const trimmedValue = value.trim();
    
    if (trimmedValue === '' || trimmedValue === '0' || trimmedValue === '.') {
      // Si está vacío, 0, o solo un punto, poner 0.001
      const finalValue = 0.001;
      setPesoInputs(prev => ({
        ...prev,
        [id]: finalValue.toFixed(3)
      }));
      actualizarPeso(id, finalValue);
      return;
    }
    
    // Reemplazar comas por puntos para aceptar ambos formatos
    const normalizedValue = trimmedValue.replace(',', '.');
    
    // Verificar si es un número válido
    const numValue = parseFloat(normalizedValue);
    
    if (isNaN(numValue)) {
      // Si no es número, poner 0.001
      const finalValue = 0.001;
      setPesoInputs(prev => ({
        ...prev,
        [id]: finalValue.toFixed(3)
      }));
      actualizarPeso(id, finalValue);
    } else if (numValue < 0.001) {
      // Si es menor que mínimo, poner mínimo
      const minValue = 0.001;
      setPesoInputs(prev => ({
        ...prev,
        [id]: minValue.toFixed(3)
      }));
      actualizarPeso(id, minValue);
    } else if (numValue > 20) {
      // Si es mayor que máximo, poner máximo
      const maxValue = 20;
      setPesoInputs(prev => ({
        ...prev,
        [id]: maxValue.toFixed(3)
      }));
      actualizarPeso(id, maxValue);
    } else {
      // Si es válido, ajustar a máximo 3 decimales
      const finalValue = parseFloat(numValue.toFixed(3));
      setPesoInputs(prev => ({
        ...prev,
        [id]: finalValue.toString()
      }));
      actualizarPeso(id, finalValue);
    }
  };

  const handlePesoKeyDown = (id: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir Enter para aplicar el valor
    if (e.key === 'Enter') {
      const input = inputRefs.current[id];
      if (input) {
        input.blur();
      }
    }
    
    // Permitir Escape para cancelar y restaurar el valor anterior
    if (e.key === 'Escape') {
      const producto = productosSeleccionados.find(p => p.id === id);
      if (producto && producto.peso !== undefined) {
        setPesoInputs(prev => ({
          ...prev,
          [id]: producto.peso!.toString()
        }));
        setIsEditing(prev => ({
          ...prev,
          [id]: false
        }));
        const input = inputRefs.current[id];
        if (input) {
          input.blur();
        }
      }
    }
  };

  // Función para manejar la ref corregida
  const setInputRef = (id: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[id] = el;
  };

  // Obtener el valor a mostrar en el input
  const getDisplayValue = (id: number) => {
    // Si está editando, mostrar el valor actual del input
    if (isEditing[id]) {
      return pesoInputs[id] || '';
    }
    
    // Si no está editando, mostrar el valor formateado
    const value = pesoInputs[id];
    if (!value) {
      const producto = productosSeleccionados.find(p => p.id === id);
      return producto?.peso ? producto.peso.toFixed(3) : '0.001';
    }
    
    return value;
  };

  const metodoSeleccionado = getMetodoSeleccionado();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Carrito de Venta</h2>
        </div>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
          {productosSeleccionados.length} {productosSeleccionados.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
        {productosSeleccionados.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Carrito vacío</p>
            <p className="text-sm text-gray-400 mt-1">Agrega productos desde la lista</p>
          </div>
        ) : (
          productosSeleccionados.map((producto) => (
            <div
              key={producto.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 mr-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                    {producto.porPeso && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                        <Weight className="h-3 w-3 mr-1" />
                        Por peso
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {producto.porPeso ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Peso (kg):</span>
                        <input
                          ref={setInputRef(producto.id)}
                          type="text"
                          inputMode="decimal"
                          value={getDisplayValue(producto.id)}
                          onChange={(e) => handlePesoChange(producto.id, e.target.value)}
                          onFocus={() => handlePesoFocus(producto.id)}
                          onBlur={(e) => handlePesoBlur(producto.id, e.target.value)}
                          onKeyDown={(e) => handlePesoKeyDown(producto.id, e)}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.000"
                        />

                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decrementarCantidad(producto.id)}
                          disabled={producto.cantidad <= 1}
                          className={`p-1.5 rounded-lg ${
                            producto.cantidad <= 1
                              ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                              : 'text-gray-600 hover:bg-gray-200 bg-gray-100'
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 min-w-[24px] text-center">
                          {producto.cantidad}
                        </span>
                        <button
                          onClick={() => incrementarCantidad(producto.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      × ${producto.precio.toFixed(2)}
                      {producto.porPeso ? '/kg' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800 text-lg">
                      ${producto.subtotal.toFixed(2)}
                    </span>
                    {producto.porPeso && producto.peso && (
                      <div className="text-xs text-gray-500 mt-1">
                        {producto.peso.toFixed(3)} g × ${producto.precio.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-700">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
        {tasaBCV && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total en Bs:</span>
            <span>{(total * tasaBCV).toFixed(2)} Bs</span>
          </div>
        )}
        {loadingTasa && (
          <div className="text-sm text-gray-500 mt-1">
            <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
            Actualizando tasa BCV...
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
            Método de Pago
          </div>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metodosPago.map((metodo) => {
            const isSelected = metodoPagoId === metodo.id.toString();
            return (
              <button
                key={metodo.id}
                type="button"
                onClick={() => handleSelectMetodo(metodo.id)}
                disabled={cargando}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center
                  ${cargando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:shadow-sm'}
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                <div className={`mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>
                  {getMetodoPagoIcon(metodo.nombre)}
                </div>

                <span className="text-sm font-medium text-center">
                  {metodo.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {!metodoPagoId && productosSeleccionados.length > 0 && (
          <div className="mt-3 flex items-center text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Seleccione un método de pago para continuar
          </div>
        )}

        {metodoSeleccionado && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  {getMetodoPagoIcon(metodoSeleccionado.nombre)}
                </div>
                <div>
                  <p className="font-medium text-blue-800">{metodoSeleccionado.nombre}</p>
                  <p className="text-xs text-blue-600">Método de pago seleccionado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMetodoPagoId('')}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                disabled={cargando}
              >
                Cambiar
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={registrarVenta}
        disabled={cargando || productosSeleccionados.length === 0 || !metodoPagoId}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors
          flex items-center justify-center
          ${cargando || productosSeleccionados.length === 0 || !metodoPagoId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {cargando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Registrar Venta (${total.toFixed(2)})
          </>
        )}
      </button>

      {productosSeleccionados.length === 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Agregue productos al carrito</span>
          </div>
        </div>
      )}
    </div>
  );
}