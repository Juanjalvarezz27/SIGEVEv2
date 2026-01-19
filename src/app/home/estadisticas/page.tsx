"use client";

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Receipt, Calendar } from 'lucide-react';
import FiltrosPeriodo from '../../../components/Estadisticas/FiltrosPeriodo';
import TarjetasResumen from '../../../components/Estadisticas/TarjetasResumen';
import TablaVentasDetalladas from '../../../components/Estadisticas/TablaVentasDetalladas';

interface EstadisticasData {
  periodo: {
    fechaInicio: string;
    fechaFin: string;
    tipo: string;
    fechaEspecifica?: string;
  };
  estadisticas: {
    totalVentas: number;
    totalIngresosUSD: number;
    totalIngresosBs: number;
    totalProductosVendidos: number;
  };
  ventasDetalladas: Array<{
    id: number;
    total: number;
    totalBs: number;
    tasaBCV: number;
    fechaHora: string;
    metodoPagoId: number;
    metodoPago: {
      id: number;
      nombre: string;
    };
    productos: Array<{
      id: number;
      ventaId: number;
      productoId: number;
      cantidad: number;
      precioUnitario: number;
      precioUnitarioBs: number;
      peso?: string | null;
      producto: {
        id: number;
        nombre: string;
        precio: number;
        porPeso?: boolean | null;
      };
    }>;
  }>;
}

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [ventasDetalladas, setVentasDetalladas] = useState<any[]>([]);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);
  const [periodo, setPeriodo] = useState('hoy');
  const [fecha, setFecha] = useState('');
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaActual = useCallback(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Función para cargar estadísticas
  const cargarEstadisticas = useCallback(async (
    nuevoPeriodo?: string,
    nuevaFecha?: string
  ) => {
    try {
      setCargandoEstadisticas(true);

      const periodoParaAPI = nuevoPeriodo || periodo;
      const fechaParaAPI = nuevaFecha || fecha;

      const params: Record<string, string> = {
        periodo: periodoParaAPI,
      };

      if (periodoParaAPI === 'fecha-especifica') {
        if (!fechaParaAPI) {
          params.fecha = obtenerFechaActual();
          setFecha(obtenerFechaActual());
        } else {
          params.fecha = fechaParaAPI;
        }
      }

      const queryParams = new URLSearchParams(params);
      console.log('Cargando estadísticas con params:', Object.fromEntries(queryParams));
      
      const response = await fetch(`/api/estadisticas?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error API estadísticas:', errorData.error || response.statusText);
        return;
      }

      const data = await response.json();
      setEstadisticas(data);
      setVentasDetalladas(data.ventasDetalladas || []);

      if (nuevoPeriodo && nuevoPeriodo !== periodo) {
        setPeriodo(nuevoPeriodo);
        if (nuevoPeriodo !== 'fecha-especifica') {
          setFecha('');
        }
      }

      if (nuevaFecha !== undefined) {
        setFecha(nuevaFecha);
      }

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  }, [periodo, fecha, obtenerFechaActual]);

  // Cargar estadísticas al inicio
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Función para mostrar/ocultar tabla
  const toggleTablaVentas = () => {
    setMostrarTabla(!mostrarTabla);
  };

  // Formatear fecha para mostrar (sin desfase)
  const formatearFechaMostrar = (fechaStr?: string) => {
    if (!fechaStr) return '';
    try {
      const [year, month, day] = fechaStr.split('-').map(Number);
      const fecha = new Date(Date.UTC(year, month - 1, day));
      
      return fecha.toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fechaStr;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
            Estadísticas de Ventas
          </h1>
          <p className="text-gray-600 mt-2">
            Analiza el rendimiento de tus ventas con métricas clave
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <FiltrosPeriodo
          periodo={periodo}
          setPeriodo={setPeriodo}
          fecha={fecha}
          setFecha={setFecha}
          cargando={cargandoEstadisticas}
          cargarEstadisticas={cargarEstadisticas}
        />
      </div>

      {cargandoEstadisticas && !estadisticas ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando estadísticas...</p>
            <p className="text-sm text-gray-400 mt-1">Por favor, espere un momento</p>
          </div>
        </div>
      ) : estadisticas ? (
        <>
          {/* Mostrar fecha específica si aplica */}
          {periodo === 'fecha-especifica' && fecha && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">
                  Mostrando estadísticas para: <span className="font-bold">{formatearFechaMostrar(fecha)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Tarjetas de resumen */}
          <div className="mb-8">
            <TarjetasResumen
              estadisticas={estadisticas.estadisticas}
              periodo={estadisticas.periodo}
            />
          </div>

          {/* Botón para mostrar/ocultar tabla de ventas */}
          <div className="mb-8">
            <button
              onClick={toggleTablaVentas}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center"
              disabled={cargandoEstadisticas}
            >
              <Receipt className="w-5 h-5 mr-2" />
              {mostrarTabla ? 'Ocultar' : 'Ver'} Ventas Detalladas
              {mostrarTabla && ventasDetalladas.length > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">
                  {ventasDetalladas.length} ventas
                </span>
              )}
            </button>
          </div>

          {/* Tabla de ventas detalladas */}
          {mostrarTabla && (
            <div className="mt-8">
              <TablaVentasDetalladas
                ventas={ventasDetalladas}
                cargando={cargandoEstadisticas}
                periodo={estadisticas.periodo}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500">No se encontraron estadísticas para mostrar</p>
            <button
              onClick={() => cargarEstadisticas()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cargar estadísticas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}