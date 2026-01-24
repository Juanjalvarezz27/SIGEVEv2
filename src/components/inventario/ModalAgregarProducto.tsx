"use client";

import { useState } from 'react';
import { Package, DollarSign, X, Plus, Save, Weight } from 'lucide-react';
import { toast } from 'react-toastify';
import useTasaBCV from '@/src/app/hooks/useTasaBCV'; 

interface ModalAgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoCreado: (producto: { id: string; nombre: string; precio: number; porPeso: boolean | null }) => void;
  loading?: boolean;
}

const ModalAgregarProducto = ({
  isOpen,
  onClose,
  onProductoCreado,
  loading = false
}: ModalAgregarProductoProps) => {
  const [nombre, setNombre] = useState('');
  
  // ESTADOS DE PRECIO
  const [precioUSD, setPrecioUSD] = useState('');
  const [precioBs, setPrecioBs] = useState('');
  
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});
  const [localLoading, setLocalLoading] = useState(false);

  const { tasa } = useTasaBCV();
  const isLoading = loading || localLoading;
  const MAX_NOMBRE_LENGTH = 30;

  // CAMBIO: Permitimos hasta 6 decimales para soportar la precisión al convertir Bs -> $
  const validarPrecioFormato = (valor: string): boolean => {
    if (!valor) return true;
    const regex = /^\d+(\.\d{0,6})?$/; 
    return regex.test(valor);
  };

  // 1. Escribiendo en Dólares -> Calcula Bs (Estándar)
  const handlePrecioUSDChange = (value: string) => {
    const val = value.replace(/[^0-9.]/g, '');
    if ((val.match(/\./g) || []).length > 1) return;

    setPrecioUSD(val);
    if (errors.precio) setErrors({...errors, precio: undefined});

    if (val && tasa && !isNaN(parseFloat(val))) {
        // De USD a Bs -> 2 decimales es suficiente visualmente
        const calculoBs = parseFloat(val) * tasa;
        setPrecioBs(calculoBs.toFixed(2));
    } else {
        setPrecioBs('');
    }
  };

  // 2. Escribiendo en Bolívares -> Calcula Dólares (ALTA PRECISIÓN)
  const handlePrecioBsChange = (value: string) => {
    const val = value.replace(/[^0-9.]/g, '');
    if ((val.match(/\./g) || []).length > 1) return;

    setPrecioBs(val);
    
    if (val && tasa && !isNaN(parseFloat(val)) && tasa > 0) {
        const calculoUSD = parseFloat(val) / tasa;
        // CAMBIO CLAVE: Usamos 6 decimales. 
        // Ejemplo: 500 / 355 = 1.408450 (Con esto, al multiplicar por 355 da 499.999... -> 500)
        setPrecioUSD(calculoUSD.toFixed(6)); 
        
        if (errors.precio) setErrors({...errors, precio: undefined});
    } else {
        setPrecioUSD('');
    }
  };

  const validarFormulario = () => {
    const newErrors: {nombre?: string; precio?: string} = {};

    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (nombre.trim().length < 2) newErrors.nombre = 'Mínimo 2 caracteres';
    else if (nombre.trim().length > MAX_NOMBRE_LENGTH) newErrors.nombre = `Máximo ${MAX_NOMBRE_LENGTH} caracteres`;
    
    if (!precioUSD) {
      newErrors.precio = 'El precio es requerido';
    } else if (!validarPrecioFormato(precioUSD)) {
      newErrors.precio = 'Formato inválido';
    } else {
      const precioNum = parseFloat(precioUSD);
      if (isNaN(precioNum) || precioNum <= 0) newErrors.precio = 'Debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validarFormulario()) {
      setLocalLoading(true);
      try {
        const response = await fetch('/api/productos/nuevo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombre.trim(),
            precio: precioUSD, // Se envía el valor con alta precisión
            porPeso: porPeso || null
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('¡Producto creado exitosamente!');
          onProductoCreado(data.producto);
          resetForm();
          onClose();
        } else {
          if (data.error?.includes('Ya existe')) setErrors({ nombre: 'Nombre ya registrado.' });
          else toast.error(data.error || 'Error al crear');
        }
      } catch (error) {
        toast.error('Error de conexión');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const resetForm = () => {
    setNombre('');
    setPrecioUSD('');
    setPrecioBs('');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">

          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                <p className="text-sm text-gray-500">
                    Tasa: <span className="font-bold text-emerald-600">{tasa ? `${tasa} Bs` : '...'}</span>
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" disabled={isLoading}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">

              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
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
                    className={`pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ej: Harina PAN"
                    disabled={isLoading}
                    maxLength={MAX_NOMBRE_LENGTH}
                  />
                </div>
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
              </div>

              {/* PRECIOS (GRID 2 COLUMNAS) */}
              <div className="grid grid-cols-2 gap-4">
                  {/* INPUT DÓLARES */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={precioUSD}
                            onChange={(e) => handlePrecioUSDChange(e.target.value)}
                            className={`pl-9 pr-4 py-2.5 w-full border rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.precio ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="0.00"
                            disabled={isLoading}
                        />
                    </div>
                  </div>

                  {/* INPUT BOLÍVARES */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio (Bs)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-xs font-bold text-gray-500">Bs</span>
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={precioBs}
                            onChange={(e) => handlePrecioBsChange(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors"
                            placeholder="0.00"
                            disabled={isLoading || !tasa}
                        />
                    </div>
                  </div>
              </div>
              
              {/* ERROR PRECIO */}
              {errors.precio && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{errors.precio}</p>}

              {/* TIPO VENTA */}
              <div className="pt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="porPesoAdd"
                    checked={porPeso}
                    onChange={(e) => setPorPeso(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="porPesoAdd" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <Weight className="h-4 w-4 mr-2 text-gray-500" />
                    Venta por Peso (Granel)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={handleClose} disabled={isLoading} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-200 flex items-center">
                {isLoading ? "Creando..." : <><Save className="h-4 w-4 mr-2" /> Crear</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarProducto;