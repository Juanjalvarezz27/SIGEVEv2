"use client";

import { useState, useMemo } from 'react';
import { X, Calculator, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

export default function ModalCierreCaja({ isOpen, onClose, resumenData, onSuccess }: any) {
  const [paso, setPaso] = useState(1);
  const [conteo, setConteo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState('');

  // Reiniciar estado al abrir
  if (!isOpen && paso !== 1) setPaso(1);

  const metodosDisponibles = resumenData ? Object.keys(resumenData.desgloseVentas) : [];
  
  const totalContado = Object.values(conteo).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);
  
  // En paso 2: Calcular diferencia
  const diferencia = resumenData ? totalContado - resumenData.resumen.totalEnCaja : 0;
  const esCuadrePerfecto = Math.abs(diferencia) < 0.01;

  const handleCerrarCaja = async () => {
    setLoading(true);
    try {
        const payload = {
            totalVentas: resumenData.resumen.totalVentas,
            totalGastos: resumenData.resumen.totalGastos,
            totalSistema: resumenData.resumen.totalEnCaja,
            totalReal: totalContado,
            detalles: conteo,
            notas
        };

        const res = await fetch('/api/caja/cerrar', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) onSuccess();
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Lock className="text-indigo-400"/> Cierre de Turno
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                    {paso === 1 ? 'Paso 1: Conteo Físico' : 'Paso 2: Comparación y Cierre'}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            
            {paso === 1 ? (
                <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm flex items-start gap-3">
                        <Calculator className="flex-shrink-0 mt-0.5" size={18}/>
                        <p>Ingresa cuánto dinero tienes <strong>realmente</strong> en cada método de pago (Billetes, captures, punto...). No mires el sistema todavía.</p>
                    </div>

                    <div className="space-y-4">
                        {metodosDisponibles.map((metodo: any) => (
                            <div key={metodo}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{metodo}</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none font-bold text-lg"
                                    placeholder="0.00"
                                    onChange={(e) => setConteo({...conteo, [metodo]: parseFloat(e.target.value)})}
                                />
                            </div>
                        ))}
                         {/* Campo extra para efectivo si no hubo ventas en efectivo pero hay caja base */}
                         {!metodosDisponibles.includes("Efectivo") && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Efectivo en Caja</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none font-bold text-lg"
                                    placeholder="0.00"
                                    onChange={(e) => setConteo({...conteo, ["Efectivo"]: parseFloat(e.target.value)})}
                                />
                            </div>
                         )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* RESULTADO CUADRE */}
                    <div className={`p-6 rounded-2xl border-2 text-center ${esCuadrePerfecto ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                        {esCuadrePerfecto ? (
                            <div className="flex flex-col items-center text-green-700">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3"><CheckCircle2 size={32}/></div>
                                <h4 className="text-xl font-black">¡Cuadre Perfecto!</h4>
                                <p className="text-sm opacity-80 mt-1">El dinero físico coincide con el sistema.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-red-700">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3"><AlertTriangle size={32}/></div>
                                <h4 className="text-xl font-black">Descuadre: {diferencia > 0 ? 'Sobra' : 'Falta'} ${Math.abs(diferencia).toFixed(2)}</h4>
                                <p className="text-sm opacity-80 mt-1">
                                    Sistema: ${resumenData.resumen.totalEnCaja.toFixed(2)} | Real: ${totalContado.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* NOTAS */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas del Cierre (Opcional)</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none text-sm resize-none h-24"
                            placeholder="Ej: Faltaron $2 porque se perdió una moneda..."
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            {paso === 1 ? (
                <button 
                    onClick={() => setPaso(2)}
                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2"
                >
                    Verificar Cuadre <ArrowRight size={18}/>
                </button>
            ) : (
                <>
                    <button onClick={() => setPaso(1)} className="px-4 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">Volver</button>
                    <button 
                        onClick={handleCerrarCaja}
                        disabled={loading}
                        className={`px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${esCuadrePerfecto ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {loading ? 'Cerrando...' : <><Lock size={18}/> Confirmar Cierre</>}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}