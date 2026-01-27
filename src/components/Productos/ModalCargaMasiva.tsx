"use client";

import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Download, CheckCircle, Loader2, AlertTriangle, RefreshCw, Eye, AlertCircle } from 'lucide-react';
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
  fila: number; // Para ayudar al usuario a encontrarlo en Excel
  valido: boolean;
  error?: string;
}

export default function ModalCargaMasiva({ isOpen, onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'RESULT'>('UPLOAD');
  
  // Datos procesados
  const [productosValidos, setProductosValidos] = useState<ProductoPrevia[]>([]);
  const [productosInvalidos, setProductosInvalidos] = useState<ProductoPrevia[]>([]);
  const [fileName, setFileName] = useState("");

  // Resultado final del servidor (por si hay duplicados)
  const [resultadoFinal, setResultadoFinal] = useState<{ importados: number, fallidos: number, detalles: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Descargar Plantilla
  const descargarPlantilla = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Nombre: "Harina Pan", Precio: 1.20, Stock: 50, Pesado: "NO" },
      { Nombre: "Queso Duro", Precio: 5.50, Stock: 10.5, Pesado: "SI" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "Plantilla_Productos.xlsx");
  };

  // 2. Leer y Analizar (Pre-Validación Local)
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
        
        const validos: ProductoPrevia[] = [];
        const invalidos: ProductoPrevia[] = [];

        data.forEach((row: any, index: number) => {
            const filaReal = index + 2; // +2 porque index es 0 y hay header
            const nombre = row['Nombre'] || row['nombre'];
            const precioRaw = row['Precio'] || row['precio'];
            const stockRaw = row['Stock'] || row['stock'];
            const pesadoRaw = row['Pesado'] || row['pesado'];

            const precio = parseFloat(precioRaw);
            const stock = parseFloat(stockRaw) || 0;
            const porPeso = pesadoRaw && pesadoRaw.toString().trim().toUpperCase() === 'SI';

            // VALIDACIONES
            let errorMsg = "";
            if (!nombre) errorMsg = "Falta el Nombre";
            else if (isNaN(precio) || precio <= 0) errorMsg = "Precio inválido o 0";

            const item: ProductoPrevia = {
                nombre: nombre ? nombre.toString().trim() : "(Sin Nombre)",
                precio: isNaN(precio) ? 0 : precio,
                stock,
                porPeso,
                fila: filaReal,
                valido: !errorMsg,
                error: errorMsg
            };

            if (item.valido) validos.push(item);
            else invalidos.push(item);
        });

        setProductosValidos(validos);
        setProductosInvalidos(invalidos);
        setStep('PREVIEW'); // Pasamos a vista previa

      } catch (error) {
        toast.error("Error al leer el archivo. Verifica el formato.");
        setFileName("");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 3. Subir SOLO los válidos
  const handleConfirmarCarga = async () => {
    if (productosValidos.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/productos/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: productosValidos }),
      });

      const data = await res.json();

      if (res.ok) {
        setResultadoFinal(data);
        setStep('RESULT');
        if (data.importados > 0) onSuccess(); // Refrescar lista de fondo
      } else {
        toast.error(data.error || "Error en el servidor");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFileName("");
    setProductosValidos([]);
    setProductosInvalidos([]);
    setResultadoFinal(null);
    setStep('UPLOAD');
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // --- RENDERIZADO POR PASOS ---

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header Dinámico */}
        <div className={`p-6 flex justify-between items-center text-white transition-colors ${step === 'UPLOAD' ? 'bg-emerald-600' : 'bg-gray-800'}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
                {step === 'UPLOAD' && <><FileSpreadsheet /> Importar Inventario</>}
                {step === 'PREVIEW' && <><Eye /> Vista Previa de Carga</>}
                {step === 'RESULT' && <><CheckCircle /> Resultado Final</>}
            </h3>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {/* ---------------- PASO 1: SUBIR ARCHIVO ---------------- */}
            {step === 'UPLOAD' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-600">
                            <p className="font-bold text-gray-800">Instrucciones</p>
                            <p className="text-xs">Usa la plantilla para evitar errores de formato.</p>
                        </div>
                        <button onClick={descargarPlantilla} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 hover:underline">
                            <Download size={16}/> Plantilla
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

            {/* ---------------- PASO 2: VISTA PREVIA (ANÁLISIS) ---------------- */}
            {step === 'PREVIEW' && (
                <div className="space-y-6">
                    
                    {/* Resumen */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CheckCircle size={24}/></div>
                            <div>
                                <p className="text-2xl font-black text-emerald-700">{productosValidos.length}</p>
                                <p className="text-xs font-bold text-emerald-600 uppercase">Listos para subir</p>
                            </div>
                        </div>
                        <div className={`flex-1 rounded-xl p-4 border flex items-center gap-3 ${productosInvalidos.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                            <div className={`p-2 rounded-lg ${productosInvalidos.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}>
                                <AlertTriangle size={24}/>
                            </div>
                            <div>
                                <p className={`text-2xl font-black ${productosInvalidos.length > 0 ? 'text-red-700' : 'text-gray-500'}`}>{productosInvalidos.length}</p>
                                <p className={`text-xs font-bold uppercase ${productosInvalidos.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>Con Errores</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Errores (Si hay) */}
                    {productosInvalidos.length > 0 ? (
                        <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600"/>
                                <span className="text-sm font-bold text-red-800">Detalle de Errores (No se subirán)</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Fila Excel</th>
                                            <th className="px-4 py-2">Producto</th>
                                            <th className="px-4 py-2">Error Detectado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productosInvalidos.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-red-50/30">
                                                <td className="px-4 py-2 text-gray-400 font-mono text-xs">#{p.fila}</td>
                                                <td className="px-4 py-2 font-bold text-gray-700">{p.nombre}</td>
                                                <td className="px-4 py-2 text-red-600 text-xs font-bold">{p.error}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-red-50 p-3 text-xs text-red-700 text-center font-medium">
                                * Corrige estos errores en tu Excel y vuelve a cargarlo, o continúa para subir solo los {productosValidos.length} válidos.
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 p-6 rounded-xl text-center border border-emerald-100">
                            <p className="text-emerald-800 font-bold text-lg">¡Todo se ve perfecto!</p>
                            <p className="text-emerald-600 text-sm">No se encontraron errores de formato en el archivo.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ---------------- PASO 3: RESULTADO FINAL (POST-SUBIDA) ---------------- */}
            {step === 'RESULT' && resultadoFinal && (
                 <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32}/>
                        </div>
                        <h4 className="text-2xl font-black text-emerald-800">{resultadoFinal.importados} Productos Creados</h4>
                        <p className="text-emerald-600 font-medium">El inventario se ha actualizado correctamente.</p>
                    </div>

                    {/* Si hubo duplicados en el servidor */}
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            {step === 'UPLOAD' && (
                <button onClick={handleClose} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">
                    Cancelar
                </button>
            )}

            {step === 'PREVIEW' && (
                <>
                    <button onClick={resetState} className="flex-1 py-3 text-gray-600 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                        Subir otro archivo
                    </button>
                    <button 
                        onClick={handleConfirmarCarga} 
                        disabled={loading || productosValidos.length === 0}
                        className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : `Subir ${productosValidos.length} Productos`}
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