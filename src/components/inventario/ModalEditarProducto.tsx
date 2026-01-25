"use client";

import { useState, useEffect } from 'react';
import { Package, DollarSign, X, Save, Weight, Boxes } from 'lucide-react';

interface ModalEditarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, nombre: string, precio: number, porPeso: boolean | null, stock: number) => Promise<void>;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    porPeso?: boolean | null;
    stock?: number;
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
  const [stock, setStock] = useState(''); // STOCK
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});

  const MAX_NOMBRE_LENGTH = 30;

  const validarPrecioFormato = (valor: string): boolean => {
    if (!valor) return true;
    const regex = /^\d+(\.\d{0,3})?$/;
    return regex.test(valor);
  };

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre);
      setPrecio(producto.precio.toString());
      setPorPeso(producto.porPeso === true);
      // CARGAR STOCK
      setStock(producto.stock !== undefined ? producto.stock.toString() : '0');
      setErrors({});
    }
  }, [producto]);

  const handlePrecioChange = (value: string) => {
    const cleanedValue = value.replace(/[^\d.]/g, '');
    const parts = cleanedValue.split('.');
    let finalValue = cleanedValue;
    if (parts.length > 2) finalValue = parts[0] + '.' + parts.slice(1).join('');
    if (parts.length === 2 && parts[1].length > 3) finalValue = parts[0] + '.' + parts[1].slice(0, 3);
    setPrecio(finalValue);
    if (errors.precio) setErrors({...errors, precio: undefined});
  };

  const validarFormulario = () => {
    const newErrors: {nombre?: string; precio?: string} = {};
    if (!nombre.trim()) newErrors.nombre = 'Requerido';
    else if (nombre.trim().length < 2) newErrors.nombre = 'Mínimo 2 caracteres';
    else if (nombre.trim().length > MAX_NOMBRE_LENGTH) newErrors.nombre = `Máximo ${MAX_NOMBRE_LENGTH} caracteres`;

    if (!precio) newErrors.precio = 'Requerido';
    else if (!validarPrecioFormato(precio)) newErrors.precio = 'Máximo 3 decimales';
    else {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum <= 0) newErrors.precio = 'Debe ser > 0';
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
        porPeso ? true : null,
        parseFloat(stock) || 0 // ENVIAR STOCK
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
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3"><Package className="h-5 w-5 text-blue-600" /></div>
              <div><h3 className="text-lg font-semibold text-gray-900">Editar Producto</h3><p className="text-xs text-gray-500 font-mono">ID: {producto.id.slice(0, 8)}...</p></div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" disabled={loading}><X className="h-5 w-5 text-gray-500" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" value={nombre} onChange={(e) => { setNombre(e.target.value); if (errors.nombre) setErrors({...errors, nombre: undefined}); }} className={`pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-300' : 'border-gray-300'}`} disabled={loading} maxLength={MAX_NOMBRE_LENGTH} />
                </div>
              </div>
              <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($) *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-gray-400" /></div>
                        <input type="text" inputMode="decimal" value={precio} onChange={(e) => handlePrecioChange(e.target.value)} className={`pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.precio ? 'border-red-300' : 'border-gray-300'}`} disabled={loading} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Boxes className="h-4 w-4 text-gray-400" /></div>
                        <input type="number" step="any" value={stock} onChange={(e) => setStock(e.target.value)} className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
                    </div>
                  </div>
              </div>
              <div className="pt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <input type="checkbox" id="porPesoEdit" checked={porPeso} onChange={(e) => setPorPeso(e.target.checked)} disabled={loading} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                  <label htmlFor="porPesoEdit" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer"><Weight className="h-4 w-4 mr-2 text-gray-500" /> Venta por Peso (Granel)</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200 flex items-center">
                {loading ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarProducto;