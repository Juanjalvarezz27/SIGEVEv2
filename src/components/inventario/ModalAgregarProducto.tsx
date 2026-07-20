"use client";

import { useState } from 'react';
import { Package, DollarSign, X, Plus, Save, Weight, Boxes, RefreshCcw, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

interface ModalAgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoCreado: (producto: { id: string; nombre: string; precio: number; porPeso: boolean | null; stock: number }) => void;
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
  
  const [stock, setStock] = useState('');
  const [porPeso, setPorPeso] = useState<boolean>(false);
  const [unidad, setUnidad] = useState<string>('kg');
  const [cantidadBase, setCantidadBase] = useState<string>('1');
  const [isOpenSelect, setIsOpenSelect] = useState<boolean>(false);

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
  const [errors, setErrors] = useState<{nombre?: string; precio?: string}>({});;
  const [localLoading, setLocalLoading] = useState(false);

  const { tasa } = useTasaBCV();
  const isLoading = loading || localLoading;
  const MAX_NOMBRE_LENGTH = 30;

  // --- LÓGICA DE CONVERSIÓN MEJORADA (6 DECIMALES) ---
  
  // Cambia USD -> Calcula Bs (Estándar 2 decimales para Bs visual)
  const handlePrecioUSDChange = (value: string) => {
    // Permitimos hasta 6 decimales para máxima precisión manual si el usuario quiere
    if (!/^\d*\.?\d{0,6}$/.test(value)) return; 
    
    setPrecioUSD(value);
    if (tasa && value) {
       const calcBs = (parseFloat(value) * tasa).toFixed(2);
       setPrecioBs(calcBs === 'NaN' ? '' : calcBs);
    } else {
       setPrecioBs('');
    }
    if (errors.precio) setErrors({...errors, precio: undefined});
  };

  // Cambia Bs -> Calcula USD (USAMOS 6 DECIMALES PARA PRECISIÓN)
  const handlePrecioBsChange = (value: string) => {
    if (!/^\d*\.?\d{0,2}$/.test(value)) return; // Bs solo necesita 2 decimales

    setPrecioBs(value);
    if (tasa && value && tasa > 0) {
       // AQUÍ ESTÁ EL CAMBIO: 6 decimales para que la reversa sea exacta
       const calcUsd = (parseFloat(value) / tasa).toFixed(6); 
       // Quitamos ceros no significativos al final para que no se vea feo (ej: 0.300000 -> 0.3)
       const cleanUsd = parseFloat(calcUsd).toString(); 
       setPrecioUSD(cleanUsd === 'NaN' ? '' : cleanUsd);
    } else {
       setPrecioUSD('');
    }
    if (errors.precio) setErrors({...errors, precio: undefined});
  };
  // -----------------------------

  const validarFormulario = () => {
    const newErrors: {nombre?: string; precio?: string} = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    else if (nombre.trim().length < 2) newErrors.nombre = 'Mínimo 2 caracteres';

    if (!precioUSD || parseFloat(precioUSD) <= 0) newErrors.precio = 'Precio inválido';
    
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
            precio: precioUSD,
            porPeso: porPeso || null,
            unidad: porPeso ? unidad : null,
            cantidadBase: porPeso ? cantidadBase : null,
            stock: stock
          }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('¡Producto creado exitosamente!');
          onProductoCreado(data.producto);
          resetForm();
          onClose();
        } else {
          toast.error(data.error || 'Error al crear');
        }
      } catch (error) { toast.error('Error de conexión'); } finally { setLocalLoading(false); }
    }
  };

  const resetForm = () => {
    setNombre('');
    setPrecioUSD('');
    setPrecioBs('');
    setStock('');
    setPorPeso(false);
    setUnidad('kg');
    setCantidadBase('1');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setIsOpenSelect(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                <p className="text-sm text-gray-500">
                   Tasa: <span className="font-bold text-emerald-600">{tasa ? `${tasa} Bs` : '...'}</span>
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* --- FILA 1: Nombre y Stock --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: Harina PAN" disabled={isLoading} maxLength={MAX_NOMBRE_LENGTH} />
                </div>
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
              </div>

               {/* Stock */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Inicial</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Boxes className="h-4 w-4 text-gray-400" /></div>
                    <input type="number" step="any" value={stock} onChange={(e) => setStock(e.target.value)} className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" disabled={isLoading} />
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
                            className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.precio ? 'border-red-300' : 'border-gray-300'}`}
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
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                {errors.precio && <p className="text-xs text-red-600 col-span-1 md:col-span-2 mt-[-10px]">Precio requerido</p>}
            </div>

            {/* --- FILA 3: Configuración de Medida (A lo ancho) --- */}
            <div className="pt-2">
                <div className="flex items-center mb-3">
                    <input type="checkbox" id="porPesoAdd" checked={porPeso} onChange={(e) => setPorPeso(e.target.checked)} disabled={isLoading} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer" />
                    <label htmlFor="porPesoAdd" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer"><Weight className="h-4 w-4 mr-2 text-gray-500" /> Venta por Medida (Peso, Volumen, etc.)</label>
                </div>

                {porPeso && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Configuración de Unidad de Venta</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Unidad de Medida</label>
                                <div className="relative">
                                    <div 
                                        onClick={() => !isLoading && setIsOpenSelect(!isOpenSelect)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white cursor-pointer flex justify-between items-center hover:border-emerald-400 transition-colors"
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
                                                        className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0 ${unidad === u.value ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-gray-700 font-medium'}`}
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
                                    type="number"
                                    step="any"
                                    min="0.001"
                                    value={cantidadBase}
                                    onChange={(e) => setCantidadBase(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
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

            <div className="flex justify-center space-x-4 pt-5 mt-6 border-t border-gray-200">
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