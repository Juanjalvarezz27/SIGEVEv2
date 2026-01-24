"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, TrendingDown, TrendingUp, Lock, RefreshCw, Trash2, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import ModalNuevoGasto from '@/src/components/Caja/ModalNuevoGasto';
import ModalCierreCaja from '@/src/components/Caja/ModalCierreCaja';
import HistorialCierres from '@/src/components/Caja/HistorialCierres';

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
    <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
             <Wallet className="text-indigo-600"/> Control de Caja
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de efectivo, gastos y cuadre diario.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={cargarDatos} 
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white" 
            title="Recargar datos"
          >
            <RefreshCw size={20}/>
          </button>
          <button 
            onClick={() => setShowCierreModal(true)}
            className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
          >
            <Lock size={18}/> Cerrar Caja
          </button>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* VENTAS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={48} className="text-emerald-500"/>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Ventas del Turno</p>
            <h3 className="text-3xl font-black text-emerald-600">${data?.resumen.totalVentas.toFixed(2)}</h3>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">Desde el último cierre</p>
        </div>

        {/* GASTOS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown size={48} className="text-red-500"/>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Gastos / Salidas</p>
            <h3 className="text-3xl font-black text-red-600">${data?.resumen.totalGastos.toFixed(2)}</h3>
            <button 
                onClick={() => setShowGastoModal(true)}
                className="mt-3 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center w-fit gap-1"
            >
                <Plus size={14}/> Registrar Gasto
            </button>
        </div>

        {/* TOTAL CAJA */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-20">
                <Wallet size={100}/>
            </div>
            <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-1">Efectivo + Digital Esperado</p>
            <h3 className="text-4xl font-black">${data?.resumen.totalEnCaja.toFixed(2)}</h3>
            <p className="text-xs text-indigo-200 mt-2 opacity-80">Debería haber esto en total</p>
        </div>
      </div>

      {/* 1. LISTA DE MOVIMIENTOS (ACTIVO - GASTOS DEL TURNO) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                 <TrendingDown className="text-gray-400" size={20}/> Movimientos de Salida (Gastos del Turno)
              </h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold">
                 {data?.gastosRecientes.length || 0} Registros
              </span>
          </div>
          
          <div className="overflow-x-auto">
              {data?.gastosRecientes.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                      No hay gastos registrados en este turno.
                  </div>
              ) : (
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                          <tr>
                              <th className="px-6 py-4">Descripción</th>
                              <th className="px-6 py-4">Hora</th>
                              <th className="px-6 py-4 text-right">Monto</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {data?.gastosRecientes.map((gasto: any) => (
                              <tr key={gasto.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-gray-700">{gasto.descripcion}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                      {new Date(gasto.fecha).toLocaleTimeString('es-VE', {hour: '2-digit', minute:'2-digit', hour12: true})}
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-red-600">
                                      - ${gasto.monto.toFixed(2)}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </div>
      </div>

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