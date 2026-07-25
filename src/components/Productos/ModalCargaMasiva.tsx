"use client";

import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Download, CheckCircle, Loader2, AlertTriangle, Eye, AlertCircle, Settings2, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductoPrevia {
  nombre: string;
  precio: number;
  stock: number;
  porPeso: boolean;
  unidad?: string;
  fila: number; 
  valido: boolean;
  error?: string;
}

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

const EXPECTED_FIELDS = [
  { key: 'nombre', label: 'Nombre', required: true, synonyms: ['nombre', 'producto', 'articulo', 'descripcion', 'item'] },
  { key: 'precio', label: 'Precio USD', required: true, synonyms: ['precio', 'pvp', 'valor', 'usd', 'monto'] },
  { key: 'stock', label: 'Stock', required: false, synonyms: ['stock', 'cantidad', 'cant', 'existencia'] },
  { key: 'porPeso', label: '¿Se Vende por Peso?', required: false, synonyms: ['pesado', 'peso', 'balanza', 'granel'] },
  { key: 'unidad', label: 'Unidad de Medida', required: false, synonyms: ['unidad', 'medida', 'um'] }
];

const CustomUnidadSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-transparent border hover:border-gray-200 rounded px-2 py-1 outline-none text-gray-700 text-xs transition-colors cursor-pointer flex justify-between items-center ${isOpen ? 'border-emerald-500' : 'border-transparent'}`}
            >
                <span className="truncate">{options.find(o => o.value === value)?.label || 'Sin unidad'}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-20 w-40 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto right-0 bottom-full">
                        <div 
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className={`px-3 py-2 text-xs cursor-pointer hover:bg-emerald-50 transition-colors border-b border-gray-50 ${!value ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-gray-700 font-medium'}`}
                        >
                            Sin unidad
                        </div>
                        {options.map(u => (
                            <div 
                                key={u.value}
                                onClick={() => { onChange(u.value); setIsOpen(false); }}
                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0 ${value === u.value ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-gray-700 font-medium'}`}
                            >
                                {u.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const CustomColumnSelect = ({ value, onChange, options, hasValue, upwards }: { value: string, onChange: (val: string) => void, options: string[], hasValue: boolean, upwards?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors cursor-pointer flex justify-between items-center ${hasValue ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-200'} ${isOpen ? 'border-indigo-400 ring-2 ring-indigo-100' : ''}`}
            >
                <span className={`truncate ${hasValue ? 'text-indigo-900 font-medium' : 'text-gray-500'}`}>{value || '-- Ignorar / No tiene --'}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className={`absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto left-0 ${upwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        <div 
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-50 ${!value ? 'bg-indigo-100 text-indigo-800 font-bold' : 'text-gray-500'}`}
                        >
                            -- Ignorar / No tiene --
                        </div>
                        {options.map(o => (
                            <div 
                                key={o}
                                onClick={() => { onChange(o); setIsOpen(false); }}
                                className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 ${value === o ? 'bg-indigo-100 text-indigo-800 font-bold' : 'text-gray-700 font-medium'}`}
                            >
                                {o}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function ModalCargaMasiva({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [step, setStep] = useState<'UPLOAD' | 'MAPPING' | 'PREVIEW' | 'RESULT'>('UPLOAD');
  
  // Datos del Excel Crudo
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Datos procesados
  const [productosValidos, setProductosValidos] = useState<ProductoPrevia[]>([]);
  const [productosInvalidos, setProductosInvalidos] = useState<ProductoPrevia[]>([]);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState<'validos' | 'invalidos'>('validos');

  // Resultado final del servidor 
  const [resultadoFinal, setResultadoFinal] = useState<{ importados: number, fallidos: number, detalles: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const descargarPlantilla = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Nombre: "Harina Pan", Precio: 1.20, Stock: 50, Pesado: "NO", Costo: 0.90, Proveedor: "Polar", Unidad: "Kg", Base: 1 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "Plantilla_Productos.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
            toast.error("El archivo está vacío");
            return;
        }

        const extractedHeaders = Object.keys(data[0] || {});
        setHeaders(extractedHeaders);
        setRawData(data);

        // Pre-emparejar
        const initialMapping: Record<string, string> = {};
        EXPECTED_FIELDS.forEach(field => {
            const matchedHeader = extractedHeaders.find(h => {
                const normalizedHeader = h.toLowerCase().trim();
                const words = normalizedHeader.split(/[\s_.-]+/);
                
                return field.synonyms.some(syn => 
                    normalizedHeader === syn || words.includes(syn) || normalizedHeader.startsWith(syn + ' ') || normalizedHeader.endsWith(' ' + syn)
                );
            });
            if (matchedHeader) {
                initialMapping[field.key] = matchedHeader;
            }
        });
        setColumnMapping(initialMapping);
        setStep('MAPPING');

      } catch (error) {
        toast.error("Error al leer el archivo. Verifica el formato.");
        setFileName("");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmarMapeo = () => {
    const validos: ProductoPrevia[] = [];
    const invalidos: ProductoPrevia[] = [];

    rawData.forEach((row: any, index: number) => {
        const filaReal = index + 2; 
        
        const hNombre = columnMapping['nombre'];
        const hPrecio = columnMapping['precio'];
        const hStock = columnMapping['stock'];
        const hPeso = columnMapping['porPeso'];
        const hUnidad = columnMapping['unidad'];

        const nombre = hNombre ? row[hNombre] : null;
        const precioRaw = hPrecio ? row[hPrecio] : null;
        const stockRaw = hStock ? row[hStock] : null;
        const pesadoRaw = hPeso ? row[hPeso] : null;
        const unidad = hUnidad ? row[hUnidad] : null;

        const precio = parseFloat(precioRaw);
        const stock = parseFloat(stockRaw) || 0;
        const porPeso = pesadoRaw && pesadoRaw.toString().trim().toUpperCase() === 'SI';

        let errorMsg = "";
        if (!nombre) errorMsg = "Falta el Nombre";
        else if (isNaN(precio) || precio <= 0) errorMsg = "Precio inválido o 0";
        else if (columnMapping['nombre'] && !hNombre) errorMsg = "Mapeo de Nombre faltante";

        const item: ProductoPrevia = {
            nombre: nombre ? nombre.toString().trim() : "(Sin Nombre)",
            precio: isNaN(precio) ? 0 : precio,
            stock,
            porPeso,
            unidad: unidad ? unidad.toString().trim() : undefined,
            fila: filaReal,
            valido: !errorMsg,
            error: errorMsg
        };

        if (item.valido) validos.push(item);
        else invalidos.push(item);
    });

    setProductosValidos(validos);
    setProductosInvalidos(invalidos);
    setActiveTab(validos.length > 0 || invalidos.length === 0 ? 'validos' : 'invalidos');
    setStep('PREVIEW');
  };

  const handleRemoveValidItem = (index: number) => {
      const updated = [...productosValidos];
      updated.splice(index, 1);
      setProductosValidos(updated);
  };

  const handleEditValidItem = (index: number, field: keyof ProductoPrevia, value: any) => {
      const updated = [...productosValidos];
      updated[index] = { ...updated[index], [field]: value };
      setProductosValidos(updated);
  };

  const handleRemoveInvalidItem = (index: number) => {
      const updated = [...productosInvalidos];
      updated.splice(index, 1);
      setProductosInvalidos(updated);
      if (updated.length === 0) setActiveTab('validos');
  };

  const handleEditInvalidItem = (index: number, field: keyof ProductoPrevia, value: any) => {
      const updated = [...productosInvalidos];
      updated[index] = { ...updated[index], [field]: value };
      setProductosInvalidos(updated);
  };

  const checkAndMoveIfValid = (index: number) => {
      const p = productosInvalidos[index];
      if (!p) return;
      
      let errorMsg = "";
      if (!p.nombre || p.nombre.toString().trim() === "") errorMsg = "Falta el Nombre";
      else if (isNaN(p.precio) || p.precio <= 0) errorMsg = "Precio inválido o 0";
      
      if (!errorMsg) {
          const updatedInvalid = [...productosInvalidos];
          const [fixedItem] = updatedInvalid.splice(index, 1);
          fixedItem.valido = true;
          fixedItem.error = undefined;
          setProductosInvalidos(updatedInvalid);
          
          const updatedValid = [...productosValidos, fixedItem].sort((a,b) => a.fila - b.fila);
          setProductosValidos(updatedValid);
          if (updatedInvalid.length === 0) setActiveTab('validos');
          toast.success(`Fila #${fixedItem.fila} corregida automáticamente.`);
      } else {
          if (p.error !== errorMsg) {
              const updatedInvalid = [...productosInvalidos];
              updatedInvalid[index].error = errorMsg;
              setProductosInvalidos(updatedInvalid);
          }
      }
  };

  const handleConfirmarCarga = async () => {
    if (productosValidos.length === 0) return;
    setLoading(true);

    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(productosValidos.length / BATCH_SIZE);
    setProgress({ current: 1, total: totalBatches });

    let totalImportados = 0;
    let totalFallidos = 0;
    let detallesErrores: any[] = [];

    try {
      for (let i = 0; i < totalBatches; i++) {
        setProgress({ current: i + 1, total: totalBatches });
        
        const lote = productosValidos.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        
        const res = await fetch('/api/admin/productos/masivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productos: lote }),
        });

        const data = await res.json();

        if (res.ok) {
          totalImportados += data.importados || 0;
          totalFallidos += data.fallidos || 0;
          if (data.detalles) detallesErrores = [...detallesErrores, ...data.detalles];
        } else {
          toast.error(data.error || `Error en el lote ${i + 1}`);
        }
      }

      setResultadoFinal({ 
        importados: totalImportados, 
        fallidos: totalFallidos, 
        detalles: detallesErrores 
      });
      setStep('RESULT');
      if (totalImportados > 0) onSuccess(); 
      
    } catch (error) {
      toast.error("Error de conexión durante la subida");
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const resetState = () => {
    setFileName("");
    setRawData([]);
    setHeaders([]);
    setColumnMapping({});
    setProductosValidos([]);
    setProductosInvalidos([]);
    setResultadoFinal(null);
    setProgress({ current: 0, total: 0 });
    setStep('UPLOAD');
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        <div className={`p-6 flex justify-between items-center text-white transition-colors ${step === 'UPLOAD' ? 'bg-emerald-600' : step === 'MAPPING' ? 'bg-indigo-600' : 'bg-gray-800'}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
                {step === 'UPLOAD' && <><FileSpreadsheet /> Importar Inventario</>}
                {step === 'MAPPING' && <><Settings2 /> Mapeo Inteligente</>}
                {step === 'PREVIEW' && <><Eye /> Vista Previa de Carga</>}
                {step === 'RESULT' && <><CheckCircle /> Resultado Final</>}
            </h3>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {step === 'UPLOAD' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-600">
                            <p className="font-bold text-gray-800">Sube cualquier Excel</p>
                            <p className="text-xs">El sistema detectará tus columnas automáticamente.</p>
                        </div>
                        <button onClick={descargarPlantilla} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 hover:underline">
                            <Download size={16}/> Plantilla Clásica
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative group cursor-pointer">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload size={48} className="text-gray-300 mb-4 group-hover:text-emerald-500 transition-colors"/>
                        <p className="text-gray-600 font-bold text-lg">Suelta tu archivo aquí</p>
                        <p className="text-sm text-gray-400 mt-1">Soporta Excel (.xlsx) y CSV</p>
                    </div>
                </div>
            )}

            {step === 'MAPPING' && (
                <div className="space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                        <AlertCircle className="text-indigo-600 shrink-0"/>
                        <p className="text-sm text-indigo-800">
                            <strong>¡Archivo cargado!</strong> Hemos intentado detectar tus columnas automáticamente. Por favor, verifica que los datos de tu Excel coincidan con lo que espera el sistema.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 rounded-t-xl border-b border-gray-200 block sm:table-header-group">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-700">Dato en el Sistema</th>
                                    <th className="px-4 py-3 font-bold text-gray-700">Tu Columna de Excel</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {EXPECTED_FIELDS.map((field, idx) => (
                                    <tr key={field.key} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{field.label}</span>
                                                {field.required && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Requerido</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CustomColumnSelect
                                                value={columnMapping[field.key] || ''}
                                                onChange={(val) => setColumnMapping({...columnMapping, [field.key]: val})}
                                                options={headers}
                                                hasValue={!!columnMapping[field.key]}
                                                upwards={idx >= 2}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {step === 'PREVIEW' && (
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div 
                            onClick={() => setActiveTab('validos')}
                            className={`flex-1 rounded-xl p-4 border flex items-center gap-3 cursor-pointer transition-all ${activeTab === 'validos' ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-100' : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'} ${productosValidos.length === 0 && 'opacity-50'}`}
                        >
                            <div className={`p-2 rounded-lg ${activeTab === 'validos' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}><CheckCircle size={24}/></div>
                            <div>
                                <p className={`text-2xl font-black ${activeTab === 'validos' ? 'text-emerald-700' : 'text-gray-700'}`}>{productosValidos.length}</p>
                                <p className={`text-xs font-bold uppercase ${activeTab === 'validos' ? 'text-emerald-600' : 'text-gray-500'}`}>Listos para subir</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => productosInvalidos.length > 0 && setActiveTab('invalidos')}
                            className={`flex-1 rounded-xl p-4 border flex items-center gap-3 transition-all ${productosInvalidos.length === 0 ? 'bg-gray-50 border-gray-100 opacity-50 cursor-default' : activeTab === 'invalidos' ? 'bg-red-50 border-red-400 shadow-sm ring-2 ring-red-100 cursor-pointer' : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50/50 cursor-pointer'}`}
                        >
                            <div className={`p-2 rounded-lg ${productosInvalidos.length > 0 ? (activeTab === 'invalidos' ? 'bg-red-100 text-red-600' : 'bg-red-50 text-red-500') : 'bg-gray-200 text-gray-400'}`}>
                                <AlertTriangle size={24}/>
                            </div>
                            <div>
                                <p className={`text-2xl font-black ${productosInvalidos.length > 0 ? (activeTab === 'invalidos' ? 'text-red-700' : 'text-red-600') : 'text-gray-500'}`}>{productosInvalidos.length}</p>
                                <p className={`text-xs font-bold uppercase ${productosInvalidos.length > 0 ? (activeTab === 'invalidos' ? 'text-red-600' : 'text-red-500') : 'text-gray-400'}`}>Con Errores</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* 1. Tabla de Productos Válidos (Editables) */}
                    {activeTab === 'validos' && productosValidos.length > 0 && (
                        <div className="bg-white border border-emerald-100 rounded-xl shadow-sm flex flex-col min-h-[300px]">
                            <div className="bg-emerald-50 rounded-t-xl px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600"/>
                                    <span className="text-sm font-bold text-emerald-800">Detalle de Productos a Subir</span>
                                </div>
                                <span className="text-xs text-emerald-600 font-medium">Puedes editar o quitar elementos</span>
                            </div>
                            <div className="border-t border-emerald-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2">Fila</th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Precio $</th>
                                            <th className="px-4 py-2">Stock</th>
                                            <th className="px-4 py-2 text-center">Peso</th>
                                            <th className="px-4 py-2">Unidad</th>
                                            <th className="px-4 py-2 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productosValidos.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-emerald-50/30 group">
                                                <td className="px-4 py-2 text-gray-400 font-mono text-xs">#{p.fila}</td>
                                                <td className="px-4 py-1">
                                                    <input 
                                                        type="text" 
                                                        value={p.nombre} 
                                                        onChange={(e) => handleEditValidItem(idx, 'nombre', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-emerald-500 rounded px-2 py-1 outline-none text-gray-700 font-medium transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 w-32">
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        value={p.precio} 
                                                        onChange={(e) => handleEditValidItem(idx, 'precio', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-emerald-500 rounded px-2 py-1 outline-none text-emerald-700 font-bold transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 w-32">
                                                    <input 
                                                        type="number" 
                                                        value={p.stock} 
                                                        onChange={(e) => handleEditValidItem(idx, 'stock', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-emerald-500 rounded px-2 py-1 outline-none text-gray-700 transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 text-center w-16">
                                                    <input 
                                                        type="checkbox"
                                                        checked={!!p.porPeso}
                                                        onChange={(e) => handleEditValidItem(idx, 'porPeso', e.target.checked)}
                                                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                                        title="¿Se vende por peso?"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 w-36">
                                                    <CustomUnidadSelect
                                                        value={p.unidad || ''}
                                                        onChange={(val) => handleEditValidItem(idx, 'unidad', val)}
                                                        options={UNIDADES}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <button onClick={() => handleRemoveValidItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Quitar de la subida">
                                                        <X size={16}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 2. Tabla de Errores (Si hay) */}
                    {activeTab === 'invalidos' && productosInvalidos.length > 0 && (
                        <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-60">
                            <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600"/>
                                <span className="text-sm font-bold text-red-800">Detalle de Errores (Se omitirán)</span>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2">Fila</th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Precio $</th>
                                            <th className="px-4 py-2">Stock</th>
                                            <th className="px-4 py-2">Error</th>
                                            <th className="px-4 py-2 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productosInvalidos.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-red-50/30 group">
                                                <td className="px-4 py-2 text-gray-400 font-mono text-xs">#{p.fila}</td>
                                                <td className="px-4 py-1">
                                                    <input 
                                                        type="text" 
                                                        value={p.nombre || ''} 
                                                        onChange={(e) => handleEditInvalidItem(idx, 'nombre', e.target.value)}
                                                        onBlur={() => checkAndMoveIfValid(idx)}
                                                        className="w-full bg-transparent border border-transparent hover:border-red-200 focus:border-red-500 rounded px-2 py-1 outline-none text-gray-700 font-medium transition-colors"
                                                        placeholder="Nombre"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 w-28">
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        value={p.precio || ''} 
                                                        onChange={(e) => handleEditInvalidItem(idx, 'precio', parseFloat(e.target.value) || 0)}
                                                        onBlur={() => checkAndMoveIfValid(idx)}
                                                        className="w-full bg-transparent border border-transparent hover:border-red-200 focus:border-red-500 rounded px-2 py-1 outline-none text-red-700 font-bold transition-colors"
                                                        placeholder="Precio"
                                                    />
                                                </td>
                                                <td className="px-4 py-1 w-24">
                                                    <input 
                                                        type="number" 
                                                        value={p.stock || ''} 
                                                        onChange={(e) => handleEditInvalidItem(idx, 'stock', parseFloat(e.target.value) || 0)}
                                                        onBlur={() => checkAndMoveIfValid(idx)}
                                                        className="w-full bg-transparent border border-transparent hover:border-red-200 focus:border-red-500 rounded px-2 py-1 outline-none text-gray-700 transition-colors"
                                                        placeholder="Stock"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-red-600 text-xs font-bold">{p.error}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleRemoveInvalidItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded shadow-sm border border-gray-100 hover:border-red-200" title="Descartar">
                                                            <X size={16}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {productosInvalidos.length === 0 && productosValidos.length === 0 && (
                        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
                            <p className="text-gray-500 font-bold">No hay productos para subir.</p>
                        </div>
                    )}
                </div>
            )}

            {step === 'RESULT' && resultadoFinal && (
                 <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32}/>
                        </div>
                        <h4 className="text-2xl font-black text-emerald-800">{resultadoFinal.importados} Productos Creados</h4>
                        <p className="text-emerald-600 font-medium">El inventario se ha actualizado correctamente.</p>
                    </div>

                    {resultadoFinal.fallidos > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl overflow-hidden">
                             <div className="px-4 py-3 bg-orange-100/50 border-b border-orange-100 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-orange-600"/>
                                <span className="font-bold text-orange-800 text-sm">Omitidos por el Servidor ({resultadoFinal.fallidos})</span>
                             </div>
                             <div className="max-h-40 overflow-y-auto p-0">
                                <table className="w-full text-xs text-left">
                                    <tbody className="divide-y divide-orange-100">
                                        {resultadoFinal.detalles.map((err: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 font-bold text-gray-700">{err.nombre}</td>
                                                <td className="px-4 py-2 text-orange-600">{err.motivo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                 </div>
            )}

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            {step === 'UPLOAD' && (
                <button onClick={handleClose} className="w-full py-3 bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 rounded-xl transition-colors">
                    Cancelar
                </button>
            )}

            {step === 'MAPPING' && (
                <>
                    <button onClick={resetState} className="flex-1 py-3 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                        Atrás
                    </button>
                    <button 
                        onClick={handleConfirmarMapeo} 
                        disabled={!columnMapping['nombre'] || !columnMapping['precio']}
                        className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        Confirmar y Analizar
                    </button>
                </>
            )}

            {step === 'PREVIEW' && (
                <>
                    <button onClick={() => setStep('MAPPING')} className="flex-1 py-3 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                        Revisar Mapeo
                    </button>
                    <button 
                        onClick={handleConfirmarCarga} 
                        disabled={loading || productosValidos.length === 0}
                        className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin"/> 
                            Subiendo lote {progress.current} de {progress.total}...
                          </>
                        ) : `Subir ${productosValidos.length} Productos`}
                    </button>
                </>
            )}

            {step === 'RESULT' && (
                <button onClick={handleClose} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                    Finalizar
                </button>
            )}
        </div>

      </div>
    </div>
  );
}