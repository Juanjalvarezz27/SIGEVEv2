"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HistorialHeader from '@/src/components/historialVentas/HistorialHeader';
import TablaVentas from '@/src/components/historialVentas/TablaVentas';
import EstadisticasMetodosPago from '@/src/components/historialVentas/EstadisticasMetodosPago';
import { Calendar, TrendingUp, RefreshCw, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

export default function HistorialPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 1
  });

  const [estadisticas, setEstadisticas] = useState<any>({
    totalVentas: 0, totalIngresos: 0, totalIngresosBs: 0, productosVendidos: 0, fecha: new Date().toISOString(),
  });

  const { tasa, loading: loadingTasa, actualizar: actualizarTasa } = useTasaBCV();

  const cargarVentas = async (pageToLoad = 1) => {
    try {
      setCargando(true);
      const response = await fetch(`/api/ventas/historial?page=${pageToLoad}`);
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      setVentas(data.ventas);
      setEstadisticas(data.estadisticas);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando historial');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarVentas(1); }, []);

  const handleCambiarPagina = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      cargarVentas(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatearFechaHoy = () => {
    return new Date().toLocaleDateString('es-VE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center">
          <div className="p-3 bg-indigo-600 rounded-xl mr-4 shadow-lg shadow-indigo-200">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">RESUMEN DIARIO</h1>
            <p className="text-gray-500 font-medium capitalize mt-1">{formatearFechaHoy()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
           <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-0.5">Tasa BCV</p>
              <div className="flex items-center gap-2">
                 <TrendingUp size={16} className="text-blue-600"/>
                 <span className="text-lg font-bold text-gray-800">
                    {loadingTasa ? '...' : `Bs ${tasa?.toFixed(2)}`}
                 </span>
              </div>
           </div>
           <button 
             onClick={() => { cargarVentas(pagination.page); actualizarTasa(); }} 
             className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200"
           >
             <RefreshCw size={20} className={cargando ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      <HistorialHeader estadisticas={estadisticas} />

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-indigo-500"/>
          <h3 className="font-bold text-gray-800 text-lg">Desglose por Método de Pago</h3>
        </div>
        
        {!cargando && ventas.length > 0 ? (
          <EstadisticasMetodosPago ventas={ventas} /> 
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
             Esperando datos de ventas...
          </div>
        )}
      </div>

      <div className="space-y-6">
         <TablaVentas ventas={ventas} cargando={cargando} />
         
         {/* PAGINACIÓN */}
         {pagination.totalPages > 1 && (
           <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
              <button
                onClick={() => handleCambiarPagina(pagination.page - 1)}
                disabled={pagination.page === 1 || cargando}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 hover:border-indigo-200"
              >
                <ChevronLeft size={18} className="mr-1.5" /> Anterior
              </button>

              <div className="flex flex-col items-center">
                 <span className="text-sm font-medium text-gray-600">
                   Página <span className="text-indigo-600 font-bold">{pagination.page}</span> de {pagination.totalPages}
                 </span>
                 <span className="text-xs text-gray-400 mt-0.5">
                   Mostrando {ventas.length} registros
                 </span>
              </div>

              <button
                onClick={() => handleCambiarPagina(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || cargando}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 hover:border-indigo-200"
              >
                Siguiente <ChevronRight size={18} className="ml-1.5" />
              </button>
           </div>
         )}
      </div>
    </div>
  );
}