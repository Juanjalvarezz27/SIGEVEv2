 "use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HistorialHeader from '@/src/components/historialVentas/HistorialHeader';
import TablaVentas from '@/src/components/historialVentas/TablaVentas';
import EstadisticasMetodosPago from '@/src/components/historialVentas/EstadisticasMetodosPago';
import { Calendar, TrendingUp, RefreshCw, ChevronLeft, ChevronRight, BarChart3, ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

export default function HistorialPage() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, total: 0, totalPages: 1
  });

  const [estadisticas, setEstadisticas] = useState<any>({
    totalVentas: 0, totalIngresos: 0, totalIngresosBs: 0, productosVendidos: 0, fecha: new Date().toISOString(),
  });

  const { tasa, loading: loadingTasa, actualizar: actualizarTasa } = useTasaBCV();
  const [rotando, setRotando] = useState(false);

  const handleRecargarTasa = async () => {
    setRotando(true);
    await actualizarTasa();
    setTimeout(() => setRotando(false), 1000);
  };

  const cargarResumen = async () => {
    try {
      setCargando(true);
      const response = await fetch(`/api/ventas/historial?soloEstadisticas=true`);
      if (!response.ok) throw new Error('Error al cargar resumen');
      const data = await response.json();
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando el resumen del día');
    } finally {
      setCargando(false);
    }
  };

  const cargarVentas = async (pageToLoad = 1) => {
    try {
      setCargandoVentas(true);
      const response = await fetch(`/api/ventas/historial?page=${pageToLoad}&soloVentas=true`);
      if (!response.ok) throw new Error('Error al cargar ventas');
      const data = await response.json();
      setVentas(data.ventas);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando movimientos');
    } finally {
      setCargandoVentas(false);
    }
  };

  useEffect(() => { cargarResumen(); }, []);

  useEffect(() => { 
    if (seccionAbierta && ventas.length === 0) {
      cargarVentas(1); 
    }
  }, [seccionAbierta]);

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
    <div className="w-full max-w-full mx-auto min-h-screen space-y-8 pb-20">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
         <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl text-white shadow-inner flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200">
               <Calendar size={32} strokeWidth={2}/>
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">Resumen Diario</h1>
               <p className="text-xs sm:text-sm text-gray-500 font-medium capitalize mt-1">{formatearFechaHoy()}</p>
            </div>
         </div>
         <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
           <div className="px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-100/50">
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-0.5">Tasa BCV</p>
              <div className="flex items-center gap-2">
                 <TrendingUp size={16} className="text-blue-600"/>
                 <span className="text-lg font-black text-gray-800 tracking-tight">
                    {loadingTasa ? '...' : `Bs ${tasa?.toFixed(2)}`}
                 </span>
              </div>
           </div>
           <button onClick={handleRecargarTasa} className="p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 rounded-xl transition-colors shadow-sm">
              <RefreshCw className={`${rotando ? 'animate-spin' : ''}`} size={20}/>
           </button>
           <button 
             onClick={() => { cargarResumen(); if(seccionAbierta) cargarVentas(pagination.page); actualizarTasa(); }} 
             className="p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all border border-indigo-100/50 shadow-sm"
           >
             <RefreshCw size={20} className={cargando || cargandoVentas ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      <HistorialHeader estadisticas={estadisticas} />

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-indigo-500"/>
          <h3 className="font-bold text-gray-800 text-lg">Desglose por Método de Pago</h3>
        </div>
        
        {!cargando && estadisticas.metodos && estadisticas.metodos.length > 0 ? (
          <EstadisticasMetodosPago metodosStats={estadisticas.metodos} /> 
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
             Esperando datos de ventas...
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setSeccionAbierta(!seccionAbierta)}
          className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Movimientos del Día</h3>
              <p className="text-xs text-gray-500 mt-0.5">Desglose detallado de las operaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {seccionAbierta && pagination.total > 0 && (
              <span className="hidden sm:inline-block text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                {pagination.total} Transacciones
              </span>
            )}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400">
              {seccionAbierta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {/* CONTENIDO DESPLEGABLE */}
        <div className={`grid transition-all duration-300 ease-in-out ${seccionAbierta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden border-t border-gray-100 bg-gray-50/30 relative">
            <div className="p-6">
            {cargandoVentas && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-b-2xl">
                   <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-indigo-100 border-t-indigo-600"></div>
               </div>
            )}
            <div className="space-y-6">
              <TablaVentas ventas={ventas} cargando={cargandoVentas} />
              
              {/* PAGINACIÓN */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                  <button
                    onClick={() => handleCambiarPagina(pagination.page - 1)}
                    disabled={pagination.page === 1 || cargandoVentas}
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
                    disabled={pagination.page === pagination.totalPages || cargandoVentas}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 hover:border-indigo-200"
                  >
                    Siguiente <ChevronRight size={18} className="ml-1.5" />
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}