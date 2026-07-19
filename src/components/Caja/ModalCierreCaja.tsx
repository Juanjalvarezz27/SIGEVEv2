"use client";

import { useState } from 'react';
import { X, Lock, AlertTriangle, CheckCircle2, TrendingDown, DollarSign, Loader2, Calculator } from 'lucide-react';
import useTasaBCV from '../../app/hooks/useTasaBCV';

export default function ModalCierreCaja({ isOpen, onClose, resumenData, onSuccess }: any) {
  const [conteoUsd, setConteoUsd] = useState<any>({});
  const [conteoBs, setConteoBs] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState('');
  
  const { tasa } = useTasaBCV();
  const bcv = tasa || 0;

  if (!isOpen) return null;

  // Los métodos de pago que registraron ventas hoy
  const metodosDisponibles = resumenData ? Object.keys(resumenData.desgloseVentas) : [];

  const enforceTwoDecimals = (val: string) => {
      if (val.includes('.')) {
          const parts = val.split('.');
          if (parts[1].length > 2) {
              return parts[0] + '.' + parts[1].slice(0, 2);
          }
      }
      return val;
  };

  const handleUsdChange = (metodo: string, val: string, effectiveRate: number) => {
      setConteoUsd({...conteoUsd, [metodo]: val});
      if (effectiveRate > 0 && val !== '') {
          setConteoBs({...conteoBs, [metodo]: (parseFloat(val) * effectiveRate).toFixed(2)});
      } else if (val === '') {
          setConteoBs({...conteoBs, [metodo]: ''});
      }
  };

  const handleBsChange = (metodo: string, val: string, effectiveRate: number) => {
      setConteoBs({...conteoBs, [metodo]: val});
      if (effectiveRate > 0 && val !== '') {
          setConteoUsd({...conteoUsd, [metodo]: (parseFloat(val) / effectiveRate).toFixed(2)});
      } else if (val === '') {
          setConteoUsd({...conteoUsd, [metodo]: ''});
      }
  };

  // Cálculos en tiempo real
  const totalContado = metodosDisponibles.reduce((acc: number, metodo: string) => acc + (parseFloat(conteoUsd[metodo]) || 0), 0);
  const totalSistema = resumenData ? resumenData.resumen.totalEnCaja : 0;
  
  const diferencia = totalContado - totalSistema;
  const esCuadrePerfecto = Math.abs(diferencia) < 0.01;
  
  const totalContadoBs = totalContado * bcv;
  const totalSistemaBs = resumenData?.resumen.totalEnCajaBs || 0;
  const diferenciaBs = totalContadoBs - totalSistemaBs;

  const handleCerrarCaja = async () => {
    setLoading(true);
    try {
        const payload = {
            totalVentas: resumenData.resumen.totalVentas,
            totalGastos: resumenData.resumen.totalGastos,
            totalSistema: resumenData.resumen.totalEnCaja,
            totalReal: totalContado,
            detalles: conteoUsd,
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-gray-900 p-6 sm:p-8 text-white flex justify-between items-center relative overflow-hidden">
            {/* Elemento de diseño de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                    <Lock className="text-indigo-400"/> Cierre de Caja
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-2">
                    <p className="text-gray-400 text-sm">
                        Verifica que tu dinero físico cuadre perfectamente.
                    </p>
                    {bcv > 0 && (
                        <div className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full flex items-center gap-2 w-fit">
                            <span className="text-xs text-gray-400 font-bold uppercase">Tasa BCV:</span>
                            <span className="text-sm font-black text-indigo-400">Bs. {bcv.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 relative z-10">
                <X size={24}/>
            </button>
        </div>

        {/* BODY: DOS COLUMNAS */}
        <div className="flex flex-col lg:flex-row overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
            
            {/* COLUMNA IZQUIERDA: EXPECTATIVA DEL SISTEMA */}
            <div className="lg:w-1/2 p-6 md:p-8 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] z-10">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Calculator size={18} className="text-gray-300"/> El Sistema Espera
                </h4>
                
                <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Ventas */}
                        <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:border-gray-200 hover:bg-gray-100/50">
                            <span className="text-xs font-bold text-gray-400 uppercase mb-1">Ventas Brutas</span>
                            <span className="font-black text-2xl text-emerald-600">${resumenData?.resumen.totalVentas.toFixed(2)}</span>
                            {resumenData?.resumen.totalVentasBs > 0 && <span className="text-xs font-bold text-gray-400 mt-1">Bs. {(resumenData.resumen.totalVentasBs).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}
                        </div>

                        {/* Gastos */}
                        <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:border-gray-200 hover:bg-gray-100/50">
                            <span className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><TrendingDown size={14} className="text-red-400"/> Gastos</span>
                            <span className="font-black text-2xl text-red-500">-${resumenData?.resumen.totalGastos.toFixed(2)}</span>
                            {resumenData?.resumen.totalGastosBs > 0 && <span className="text-xs font-bold text-gray-400 mt-1">Bs. {(resumenData.resumen.totalGastosBs).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}
                        </div>
                    </div>

                    {/* Desglose por Método */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 px-1">Desglose de Ingresos</p>
                        <div className="flex flex-col gap-3">
                            {metodosDisponibles.map((metodo: string) => {
                                const montoEsperado = resumenData?.desgloseVentas[metodo] || 0;
                                const montoEsperadoBs = resumenData?.desgloseVentasBs?.[metodo] || 0;
                                return (
                                    <div key={metodo} className="flex flex-col px-4 py-3 border-l-4 border-indigo-500 bg-indigo-50/50 rounded-r-xl transition-all hover:bg-indigo-50">
                                        <span className="text-xs font-bold text-gray-500 uppercase truncate mb-1" title={metodo}>{metodo}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-indigo-700">${montoEsperado.toFixed(2)}</span>
                                            {montoEsperadoBs > 0 && <span className="text-xs font-bold text-indigo-400/80">Bs. {montoEsperadoBs.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* TOTAL SISTEMA */}
                <div className="mt-8 p-6 sm:p-8 bg-gray-900 rounded-3xl text-white shadow-xl shadow-gray-200 relative overflow-hidden group flex-shrink-0">
                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={150} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Neto Esperado</p>
                        <h2 className="text-5xl font-black">${totalSistema.toFixed(2)}</h2>
                        {resumenData?.resumen.totalEnCajaBs > 0 && (
                            <p className="text-lg font-medium text-gray-400 mt-2">
                                Bs. {(resumenData.resumen.totalEnCajaBs).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: CONTEO FÍSICO */}
            <div className="lg:w-1/2 p-6 md:p-8 flex flex-col">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Tu Conteo Físico Real</h4>
                
                <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            {metodosDisponibles.map((metodo: string) => {
                                const esperadoUsd = resumenData?.desgloseVentas[metodo] || 0;
                                const esperadoBs = resumenData?.desgloseVentasBs?.[metodo] || 0;
                                const effectiveRate = esperadoUsd > 0 ? (esperadoBs / esperadoUsd) : bcv;

                                const contadoUsd = parseFloat(conteoUsd[metodo]) || 0;
                                const diffUsd = contadoUsd - esperadoUsd;
                                const isMatchUsd = Math.abs(diffUsd) < 0.01;
                                
                                const contadoBs = parseFloat(conteoBs[metodo]) || 0;
                                const diffBs = contadoBs - esperadoBs;
                                const isMatchBs = Math.abs(diffBs) < 0.01;

                                const isMatch = isMatchUsd && isMatchBs;
                                const isEmpty = !conteoUsd[metodo] && !conteoBs[metodo];

                                let faltanteElement = null;
                                if (!isEmpty && !isMatch) {
                                    if (!isMatchBs && isMatchUsd) {
                                        faltanteElement = (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap ${diffBs > 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                                                <AlertTriangle size={12}/> {diffBs > 0 ? 'Sobra' : 'Falta'} Bs. {Math.abs(diffBs).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </span>
                                        );
                                    } else {
                                        faltanteElement = (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap ${diffUsd > 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                                                <AlertTriangle size={12}/> {diffUsd > 0 ? 'Sobra' : 'Falta'} ${Math.abs(diffUsd).toFixed(2)}
                                            </span>
                                        );
                                    }
                                }

                                return (
                                    <div key={metodo} className="flex flex-col p-4 bg-white border border-gray-200 shadow-sm rounded-2xl transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 gap-3">
                                        
                                        <div className="flex justify-between items-center">
                                            <label title={metodo} className="text-sm font-bold text-gray-500 uppercase truncate leading-tight">{metodo}</label>
                                            
                                            <div className="flex items-center gap-2">
                                                {!isEmpty && isMatch && (
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                        <CheckCircle2 size={12}/> Cuadrado
                                                    </span>
                                                )}
                                                {faltanteElement}
                                                <button 
                                                    onClick={() => {
                                                        setConteoUsd({...conteoUsd, [metodo]: esperadoUsd.toFixed(2)});
                                                        setConteoBs({...conteoBs, [metodo]: esperadoBs.toFixed(2)});
                                                    }}
                                                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-bold transition-colors"
                                                >
                                                    Autocompletar
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            {/* Input USD */}
                                            <div className="relative flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio ($)</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 font-bold">$</span>
                                                    </div>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full pl-8 pr-2 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-800 transition-colors"
                                                        placeholder="0.00"
                                                        value={conteoUsd[metodo] || ''}
                                                        onChange={(e) => handleUsdChange(metodo, enforceTwoDecimals(e.target.value), effectiveRate)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Input BS */}
                                            <div className="relative flex-1">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio (Bs)</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 font-bold text-xs">Bs</span>
                                                    </div>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full pl-9 pr-2 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none font-bold text-gray-800 transition-colors"
                                                        placeholder="0.00"
                                                        value={conteoBs[metodo] || ''}
                                                        onChange={(e) => handleBsChange(metodo, enforceTwoDecimals(e.target.value), effectiveRate)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="pt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notas del Cierre (Opcional)</label>
                            <textarea 
                                className="w-full p-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm resize-none h-24 transition-all font-medium text-gray-700"
                                placeholder="Ej: Faltaron $2 porque se perdió una moneda..."
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* RESULTADO Y BOTÓN EN TIEMPO REAL */}
                    <div className="mt-8 mb-8 flex flex-col items-stretch gap-4">
                        <div className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-colors ${
                            esCuadrePerfecto 
                                ? 'border-green-200 bg-green-50 text-green-800' 
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}>
                            <div className="bg-white p-2.5 rounded-full shadow-sm flex-shrink-0">
                                {esCuadrePerfecto ? <CheckCircle2 size={24} className="text-green-600"/> : <AlertTriangle size={24} className="text-red-600"/>}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase opacity-80 mb-1 tracking-wider">
                                    {esCuadrePerfecto ? '¡Cuadre Perfecto!' : 'Descuadre Detectado'}
                                </p>
                                <div className="flex items-baseline justify-between flex-wrap gap-2">
                                    <h4 className="text-2xl font-black leading-tight">
                                        {esCuadrePerfecto 
                                            ? `$${totalContado.toFixed(2)}` 
                                            : `${diferencia > 0 ? 'Sobra' : 'Falta'} $${Math.abs(diferencia).toFixed(2)}`
                                        }
                                    </h4>
                                    {bcv > 0 && !esCuadrePerfecto && (
                                        <span className="text-sm font-bold opacity-80">
                                            Bs. {Math.abs(diferenciaBs).toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </span>
                                    )}
                                    {bcv > 0 && esCuadrePerfecto && (
                                        <span className="text-sm font-bold opacity-80">
                                            Bs. {totalContadoBs.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleCerrarCaja}
                            disabled={loading}
                            className={`w-full py-4 px-4 text-white font-black rounded-2xl shadow-xl transition-all flex justify-center items-center gap-2 text-lg hover:-translate-y-1 ${
                                esCuadrePerfecto 
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200/50' 
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-200/50'
                            }`}
                        >
                            {loading ? <><Loader2 className="animate-spin" size={24}/> Procesando Cierre...</> : <><Lock size={24}/> Confirmar Cierre Definitivo</>}
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  );
}