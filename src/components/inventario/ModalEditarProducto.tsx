"use client";

import { useState, useEffect } from 'react';
import { Package, DollarSign, X, Save, Weight, Boxes, RefreshCcw, ChevronDown } from 'lucide-react';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

interface ModalEditarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, nombre: string, precio: number, porPeso: boolean | null, stock: number, unidad?: string | null, cantidadBase?: number | null) => Promise<void>;
  producto: {
    id: string;
    nombre: string;
    precio: number;
    porPeso?: boolean | null;
    unidad?: string | null;
    cantidadBase?: number | null;
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
  
  // ESTADOS DE PRECIO
  const [precioUSD, setPrecioUSD] = useState('');
  const [precioBs, setPrecioBs] = useState('');

  const [stock, setStock] = useState('');
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [unidad, setUnidad] = useState<string>('kg');
  const [cantidadBase, setCantidadBase] = useState<string>('1');
  const [isOpenSelect, setIsOpenSelect] = useState<boolean>(false);
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});

  const UNIDADES = [
    { value: 'kg', label: 'Kg (Kilogramos)' },
    { value: 'g', label: 'g (Gramos)' },
    { value: 'lb', label: 'Lb (Libras)' },
    { value: 'lt', label: 'Lt (Litros)' },
    { value: 'ml', label: 'ml (Mililitros)' },
    { value: 'gal', label: 'Galones' },
    { value: 'm', label: 'm (Metros)' },
    { value: 'cm', label: 'cm (Centímetros)' },
    { value: 'unid', label: 'Unidades' }
  ];

  const { tasa } = useTasaBCV();
  const MAX_NOMBRE_LENGTH = 30;

  useEffect(() => {
    if (producto && isOpen) {
      setNombre(producto.nombre);
      
      // Cargar precio USD directo (puede tener 6 decimales de la BD)
      const pUSD = producto.precio.toString();
      setPrecioUSD(pUSD);

      // Calcular precio Bs inicial si hay tasa (visualización 2 decimales)
      if (tasa && producto.precio) {
          setPrecioBs((producto.precio * tasa).toFixed(2));
      }

      setPorPeso(producto.porPeso === true);
      setUnidad(producto.unidad || 'kg');
      setCantidadBase(producto.cantidadBase ? producto.cantidadBase.toString() : '1');
      setStock(producto.stock !== undefined ? producto.stock.toString() : '0');
      setErrors({});
    }
  }, [producto, isOpen, tasa]);

  // --- LÓGICA DE CONVERSIÓN MEJORADA (6 DECIMALES) ---
  const handlePrecioUSDChange = (value: string) => {
    if (!/^\d*\.?\d{0,6}$/.test(value)) return;
    setPrecioUSD(value);
    
    if (tasa && value) {
       setPrecioBs((parseFloat(value) * tasa).toFixed(2));
    } else {
       setPrecioBs('');
    }
  };

  const handlePrecioBsChange = (value: string) => {
    if (!/^\d*\.?\d{0,2}$/.test(value)) return; // Bs solo 2 decimales
    setPrecioBs(value);

    if (tasa && value && tasa > 0) {
       // Cálculo inverso con 6 decimales de precisión
       const calcUsd = (parseFloat(value) / tasa).toFixed(6);
       // Limpiar ceros extra (toString hace un trabajo decente eliminando 0s innecesarios si usas parseFloat primero)
       const cleanUsd = parseFloat(calcUsd).toString();
       setPrecioUSD(cleanUsd === 'NaN' ? '' : cleanUsd);
    } else {
       setPrecioUSD('');
    }
  };
  // -----------------------------

  const validarFormulario = () => {
    const newErrors: {nombre?: string; precio?: string} = {};
    if (!nombre.trim()) newErrors.nombre = 'Requerido';
    
    if (!precioUSD || parseFloat(precioUSD) <= 0) newErrors.precio = 'Inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario() && producto) {
      await onSave(
        producto.id,
        nombre,
        parseFloat(precioUSD),
        porPeso ? true : null,
        parseFloat(stock) || 0,
        porPeso ? unidad : null,
        porPeso ? (parseFloat(cantidadBase) || 1) : null
      );
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsOpenSelect(false);
    onClose();
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-end md:items-center justify-center p-0 md:p-4">
        <div className="relative bg-white rounded-t-3xl md:rounded-xl shadow-xl max-w-2xl w-full animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3"><Package className="h-5 w-5 text-blue-600" /></div>
              <div>
                  <h3 className="text-lg font-semibold text-gray-900">Editar Producto</h3>
                  <p className="text-xs text-gray-500">Tasa: {tasa} Bs</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100" disabled={loading}><X className="h-5 w-5 text-gray-500" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* --- FILA 1: Nombre y Stock --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} maxLength={MAX_NOMBRE_LENGTH} />
                </div>
              </div>

               {/* Stock */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Inicial</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Boxes className="h-4 w-4 text-gray-400" /></div>
                      <input type="number" step="any" value={stock} onChange={(e) => setStock(e.target.value)} className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
                  </div>
               </div>
            </div>

            {/* --- FILA 2: Precios --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {/* Input USD */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Precio ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 text-gray-400" size={14}/>
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={precioUSD}
                            onChange={(e) => handlePrecioUSDChange(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0000"
                        />
                    </div>
                </div>

                {/* Input BS */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Precio (Bs)</label>
                    <div className="relative">
                        <RefreshCcw className="absolute left-2 top-2.5 text-gray-400" size={14}/>
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={precioBs}
                            onChange={(e) => handlePrecioBsChange(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* --- FILA 3: Configuración de Medida (A lo ancho) --- */}
            <div className="pt-2">
                <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                    <input type="checkbox" id="porPesoEdit" checked={porPeso} onChange={(e) => setPorPeso(e.target.checked)} disabled={loading} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                    <label htmlFor="porPesoEdit" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer"><Weight className="h-4 w-4 mr-2 text-gray-500" /> Venta por Medida (Peso, Volumen, etc.)</label>
                </div>

                {porPeso && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Configuración de Unidad de Venta</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Unidad de Medida</label>
                                <div className="relative">
                                    <div 
                                        onClick={() => !loading && setIsOpenSelect(!isOpenSelect)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition-colors"
                                    >
                                        <span className="text-gray-800">{UNIDADES.find(u => u.value === unidad)?.label || 'Seleccionar...'}</span>
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpenSelect ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    {isOpenSelect && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsOpenSelect(false)}></div>
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto top-full left-0">
                                                {UNIDADES.map(u => (
                                                    <div 
                                                        key={u.value}
                                                        onClick={() => {
                                                            setUnidad(u.value);
                                                            setIsOpenSelect(false);
                                                        }}
                                                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${unidad === u.value ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700 font-medium'}`}
                                                    >
                                                        {u.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Cantidad por Venta</label>
                                <input
                                    type="number" step="any" min="0.001"
                                    value={cantidadBase}
                                    onChange={(e) => setCantidadBase(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="ej: 1"
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-amber-600 font-medium">
                            El precio <span className="font-black">${precioUSD || '0'}</span> será por <span className="font-black">{cantidadBase || 1} {unidad}</span>. En el punto de venta el cajero ingresará cuántos <span className="font-black">{unidad}</span> vende.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-center space-x-3 mt-8 pt-6 border-t border-gray-200">
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