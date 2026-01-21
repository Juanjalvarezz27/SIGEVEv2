"use client";

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import FiltrosPeriodo from '@/src/components/Estadisticas/FiltrosPeriodo';
import TarjetasResumen from '@/src/components/Estadisticas/TarjetasResumen';
import TablaVentasDetalladas from '@/src/components/Estadisticas/TablaVentasDetalladas';
import GraficosVentas from '@/src/components/Estadisticas/GraficosVentas';

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [graficos, setGraficos] = useState<any>(null);
  const [ventasDetalladas, setVentasDetalladas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // CAMBIO: Default 'semana' para ver gráfico por días al inicio
  const [periodo, setPeriodo] = useState('semana'); 
  const [fecha, setFecha] = useState('');

  const obtenerFechaActual = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const cargarEstadisticas = useCallback(async (nuevoPeriodo?: string, nuevaFecha?: string) => {
    try {
      setCargando(true);
      const p = nuevoPeriodo || periodo;
      const f = nuevaFecha || fecha;
      
      const params = new URLSearchParams({ periodo: p });
      if (p === 'fecha-especifica') {
        params.append('fecha', f || obtenerFechaActual());
        if (!f) setFecha(obtenerFechaActual());
      }

      const res = await fetch(`/api/estadisticas?${params}`);
      
      if (!res.ok) {
         console.error("Error fetching stats");
         return;
      }
      
      const data = await res.json();
      setEstadisticas(data);
      setVentasDetalladas(data.ventasDetalladas || []);
      setGraficos(data.graficos);

      if (nuevoPeriodo && nuevoPeriodo !== periodo) setPeriodo(nuevoPeriodo);
      if (nuevaFecha) setFecha(nuevaFecha);

    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  }, [periodo, fecha, obtenerFechaActual]);

  useEffect(() => { cargarEstadisticas(); }, [cargarEstadisticas]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
               <BarChart3 size={28} />
            </div>
            Analíticas
          </h1>
          <p className="text-gray-500 mt-1 ml-1">Rendimiento detallado de tu negocio</p>
        </div>
      </div>

      {/* Controles */}
      <FiltrosPeriodo
        periodo={periodo}
        setPeriodo={setPeriodo}
        fecha={fecha}
        setFecha={setFecha}
        cargando={cargando}
        cargarEstadisticas={cargarEstadisticas}
      />

      {/* Contenido */}
      {cargando && !estadisticas ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
           <p>Calculando métricas...</p>
        </div>
      ) : estadisticas ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           {/* Fecha Seleccionada */}
           {periodo === 'fecha-especifica' && fecha && (
             <div className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 w-fit">
                <Calendar size={16} />
                Analizando el día: <span className="font-bold">{fecha}</span>
             </div>
           )}

           {/* 1. Tarjetas Superiores */}
           <TarjetasResumen 
             estadisticas={estadisticas.estadisticas} 
             periodo={estadisticas.periodo} 
           />

           {/* 2. GRÁFICOS */}
           {graficos && (
             <GraficosVentas 
               dataTendencia={graficos.tendencia} 
               dataMetodos={graficos.metodos}
               periodo={periodo}
             />
           )}

           {/* 3. Tabla Detallada */}
           <TablaVentasDetalladas 
             ventas={ventasDetalladas} 
             periodo={estadisticas.periodo} 
           />
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
           <p className="text-gray-500">No hay datos disponibles.</p>
        </div>
      )}
    </div>
  );
}