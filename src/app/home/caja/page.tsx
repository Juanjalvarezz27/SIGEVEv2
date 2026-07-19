"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, TrendingDown, TrendingUp, Lock, RefreshCw, Trash2, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import ModalNuevoGasto from '@/src/components/Caja/ModalNuevoGasto';
import ModalCierreCaja from '@/src/components/Caja/ModalCierreCaja';
import HistorialCierres from '@/src/components/Caja/HistorialCierres';
import HistorialGastos from '@/src/components/Caja/HistorialGastos';

export default function CajaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showGastoModal, setShowGastoModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);

  // Estado para avisar al historial que se actualice
  const [triggerHistorial, setTriggerHistorial] = useState(0); 

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/caja/resumen');
      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error cargando caja");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleGastoGuardado = () => {
    cargarDatos();
    setShowGastoModal(false);
    toast.success("Gasto registrado");
  };

  const handleCierreExitoso = () => {
    cargarDatos(); // Reinicia contadores del turno actual
    setShowCierreModal(false);
    toast.success("¡Caja cerrada correctamente!");
    setTriggerHistorial(prev => prev + 1); // Actualiza la tabla de Historial
  };

  if (loading && !data) return <div className="p-10 text-center text-gray-400">Cargando caja...</div>;

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-20">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
         <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl text-white shadow-inner flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200">
               <Wallet size={32} strokeWidth={2}/>
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Control de Caja</h1>
               <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Gestión de efectivo, gastos y cuadre diario</p>
            </div>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button 
            onClick={cargarDatos} 
            className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white" 
            title="Recargar datos"
          >
            <RefreshCw size={22}/>
          </button>
          <button 
            onClick={() => setShowCierreModal(true)}
            className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
          >
            <Lock size={18}/> Cerrar Caja
          </button>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* VENTAS */}
        <div className="bg-gradient-to-br from-white to-emerald-50/50 p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[170px] flex flex-col justify-center">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300">
                <TrendingUp size={100} className="text-emerald-500"/>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Ventas del Turno</p>
              <h3 className="text-4xl font-black text-emerald-600">${data?.resumen.totalVentas.toFixed(2)}</h3>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">Desde el último cierre</p>
            </div>
        </div>

        {/* GASTOS */}
        <div className="bg-gradient-to-br from-white to-red-50/50 p-8 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[170px] flex flex-col justify-center">
            <div className="absolute -bottom-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300">
                <TrendingDown size={100} className="text-red-500"/>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Gastos / Salidas</p>
              <h3 className="text-4xl font-black text-red-600">${data?.resumen.totalGastos.toFixed(2)}</h3>
              <button 
                  onClick={() => setShowGastoModal(true)}
                  className="mt-4 text-xs font-bold bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors flex items-center w-fit gap-1 shadow-sm"
              >
                  <Plus size={16}/> Registrar Gasto
              </button>
            </div>
        </div>

        {/* TOTAL CAJA */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 p-8 rounded-3xl shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden min-h-[170px] flex flex-col justify-center group">
            <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={140}/>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-2">Efectivo + Digital Esperado</p>
              <h3 className="text-5xl font-black tracking-tight">${data?.resumen.totalEnCaja.toFixed(2)}</h3>
              <p className="text-sm text-indigo-200 mt-2 opacity-90">Debería haber esto en total</p>
            </div>
        </div>
      </div>

      {/* 1. HISTORIAL DE GASTOS (CON LAZY LOADING) */}
      <HistorialGastos recargarTrigger={triggerHistorial} />

      {/* 2. HISTORIAL DE CIERRES PASADOS (AL FINAL) */}
      <HistorialCierres recargarTrigger={triggerHistorial} />

      {/* MODALES */}
      <ModalNuevoGasto 
        isOpen={showGastoModal} 
        onClose={() => setShowGastoModal(false)}
        onSuccess={handleGastoGuardado}
      />

      <ModalCierreCaja
        isOpen={showCierreModal}
        onClose={() => setShowCierreModal(false)}
        resumenData={data}
        onSuccess={handleCierreExitoso}
      />

    </div>
  );
}