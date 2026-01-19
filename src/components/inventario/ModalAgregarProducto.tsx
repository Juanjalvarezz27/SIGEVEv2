"use client";

import { useState, useEffect } from 'react';
import { Package, DollarSign, X, Plus, Save, Weight } from 'lucide-react';
import { toast } from 'react-toastify';

interface ModalAgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoCreado: (producto: { id: number; nombre: string; precio: number; porPeso: boolean | null }) => void;
  loading?: boolean;
}

const ModalAgregarProducto = ({
  isOpen,
  onClose,
  onProductoCreado,
  loading = false
}: ModalAgregarProductoProps) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});

  // Validar formato de precio (hasta 3 decimales)
  const validarPrecioFormato = (valor: string): boolean => {
    if (!valor) return true;
    
    // Validar que tenga hasta 3 decimales
    const regex = /^\d+(\.\d{0,3})?$/;
    return regex.test(valor);
  };

  const validarFormulario = () => {
    const newErrors: {nombre?: string; precio?: string} = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (!validarPrecioFormato(precio)) {
      newErrors.precio = 'El precio puede tener hasta 3 decimales';
    } else {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum <= 0) {
        newErrors.precio = 'El precio debe ser un número mayor a 0';
      } else if (precioNum > 1000000) {
        newErrors.precio = 'El precio no puede exceder 1,000,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrecioChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const cleanedValue = value.replace(/[^\d.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      // Si hay más de un punto, mantener solo el primero
      value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      value = cleanedValue;
    }
    
    // Limitar a 3 decimales
    if (parts.length === 2 && parts[1].length > 3) {
      value = parts[0] + '.' + parts[1].slice(0, 3);
    }
    
    setPrecio(value);
    if (errors.precio) setErrors({...errors, precio: undefined});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validarFormulario()) {
      try {
        const response = await fetch('/api/productos/nuevo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            precio: precio,
            porPeso: porPeso || null
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('¡Producto creado exitosamente!', {
            className: "border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-lg shadow-sm",
          });

          onProductoCreado(data.producto);
          resetForm();
          onClose();
        } else {
          if (data.error.includes('Ya existe')) {
            setErrors({ nombre: data.error });
            toast.error(data.error, {
              className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
            });
          } else {
            toast.error(data.error || 'Error al crear producto', {
              className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
            });
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error de conexión al servidor', {
          className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
        });
      }
    }
  };

  const resetForm = () => {
    setNombre('');
    setPrecio('');
    setPorPeso(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                <p className="text-sm text-gray-500">Agregar producto al inventario</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errors.nombre) setErrors({...errors, nombre: undefined});
                    }}
                    className={`
                      pl-10 pr-4 py-2.5 w-full
                      border rounded-lg text-sm
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                      ${errors.nombre ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="Ej: Leche Entera 1L"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Nombre descriptivo del producto
                </div>
              </div>

              {/* Campo Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio en USD *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text" // Cambiado de "number" a "text" para mejor control
                    inputMode="decimal" // Para teclado numérico en móviles
                    value={precio}
                    onChange={(e) => handlePrecioChange(e.target.value)}
                    className={`
                      pl-10 pr-4 py-2.5 w-full
                      border rounded-lg text-sm
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                      ${errors.precio ? 'border-red-300' : 'border-gray-300'}
                    `}
                    placeholder="0.000"
                    disabled={loading}
                  />
                </div>
                {errors.precio && (
                  <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {porPeso
                    ? "Precio por kilogramo (kg) - hasta 3 decimales"
                    : "Precio por unidad - hasta 3 decimales"}
                </div>
              </div>

              {/* Checkbox "Se vende por peso" */}
              <div className="pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="porPeso"
                    checked={porPeso}
                    onChange={(e) => setPorPeso(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="porPeso"
                    className="ml-3 flex items-center text-sm text-gray-700"
                  >
                    <Weight className="h-4 w-4 mr-2 text-gray-500" />
                    Este producto se vende por peso (kg)
                  </label>
                </div>
                <div className="mt-2 text-xs text-gray-500 ml-7">
                  {porPeso
                    ? "El precio ingresado es por kilogramo. Ej: Queso a $6.675/kg"
                    : "El precio ingresado es por unidad. Ej: Lata de refresco a $1.250"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarProducto;