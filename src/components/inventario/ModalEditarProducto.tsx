"use client";

import { useState, useEffect } from 'react';
import { Package, DollarSign, X, Save, Weight } from 'lucide-react';

interface ModalEditarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, nombre: string, precio: number, porPeso: boolean | null) => Promise<void>;
  producto: {
    id: string; 
    nombre: string;
    precio: number;
    porPeso?: boolean | null;
  } | null;
  loading?: boolean;
}

const ModalEditarProducto = ({
  isOpen,
  onClose,
  onSave,
  producto,
  loading = false
}: ModalEditarProductoProps) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});

  // Validar formato de precio (hasta 3 decimales)
  const validarPrecioFormato = (valor: string): boolean => {
    if (!valor) return true;
    const regex = /^\d+(\.\d{0,3})?$/;
    return regex.test(valor);
  };

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre);
      setPrecio(producto.precio.toString());
      setPorPeso(producto.porPeso === true);
      setErrors({});
    }
  }, [producto]);

  const handlePrecioChange = (value: string) => {
    const cleanedValue = value.replace(/[^\d.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleanedValue.split('.');
    let finalValue = cleanedValue;

    if (parts.length > 2) {
      finalValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limitar a 3 decimales
    if (parts.length === 2 && parts[1].length > 3) {
      finalValue = parts[0] + '.' + parts[1].slice(0, 3);
    }

    setPrecio(finalValue);
    if (errors.precio) setErrors({...errors, precio: undefined});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validarFormulario() && producto) {
      await onSave(
        producto.id,
        nombre,
        parseFloat(precio),
        porPeso ? true : null
      );
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Contenido del modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Producto</h3>
                <p className="text-xs text-gray-500 font-mono">ID: {producto.id.slice(0, 8)}...</p>
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
                    className={`pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ej: Leche Entera 1L"
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
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
                    type="text"
                    inputMode="decimal"
                    value={precio}
                    onChange={(e) => handlePrecioChange(e.target.value)}
                    className={`pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.precio ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="0.000"
                    disabled={loading}
                  />
                </div>
                {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
              </div>

              {/* Checkbox "Se vende por peso" */}
              <div className="pt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="porPesoEdit"
                    checked={porPeso}
                    onChange={(e) => setPorPeso(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="porPesoEdit" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <Weight className="h-4 w-4 mr-2 text-gray-500" />
                    Venta por Peso (Granel)
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-7">
                  {porPeso 
                    ? "El precio se calculará por Kilogramo (Kg)." 
                    : "El precio se calculará por Unidad."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center shadow-md shadow-blue-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
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

export default ModalEditarProducto;