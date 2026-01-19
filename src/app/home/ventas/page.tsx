"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HistorialHeader from '../../../components/historialVentas/HistorialHeader';
import TablaVentas from '../../../components/historialVentas/TablaVentas';
import EstadisticasMetodosPago from '../../../components/historialVentas/EstadisticasMetodosPago';
import { Calendar, RefreshCw, TrendingUp } from 'lucide-react';
import useTasaBCV from '../../hooks/useTasaBCV';

// Types actualizados
interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
}

interface VentaProducto {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  precioUnitarioBs: number;
  producto: ProductoVenta;
}

interface MetodoPago {
  id: number;
  nombre: string;
}

interface Venta {
  id: number;
  total: number;
  totalBs: number;           // ← Nuevo campo
  tasaBCV: number;           // ← Nuevo campo
  fechaHora: string;
  metodoPagoId: number;
  metodoPago: MetodoPago;
  productos: VentaProducto[];
}

interface Estadisticas {
  totalVentas: number;
  totalIngresos: number;
  totalIngresosBs: number;   // ← Nuevo campo
  productosVendidos: number;
  fecha: string;
}

export default function HistorialPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalVentas: 0,
    totalIngresos: 0,
    totalIngresosBs: 0,
    productosVendidos: 0,
    fecha: new Date().toISOString(),
  });

  // Usar el hook de tasa BCV (solo para mostrar la tasa actual, no para cálculos)
  const { tasa, loading: loadingTasa, actualizar: actualizarTasa } = useTasaBCV();

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/ventas/historial');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setVentas(data.ventas);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error cargando ventas de hoy:', error);
      toast.error('Error al cargar las ventas de hoy', {
        className: "border border-red-200 bg-red-50 text-red-800 rounded-lg shadow-sm",
      });
    } finally {
      setCargando(false);
    }
  };

  // Función para actualizar todo
  const actualizarTodo = async () => {
    await Promise.all([
      cargarVentas(),
      actualizarTasa()
    ]);
  };

  // Cargar ventas al inicio
  useEffect(() => {
    cargarVentas();
  }, []);

  const formatearFechaHoy = () => {
    const fecha = new Date(estadisticas.fecha);
    return fecha.toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header con fecha y botón de recargar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                VENTAS DE HOY
              </h1>
              <p className="text-gray-600 mt-1">{formatearFechaHoy()}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cuadro de Tasa BCV */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 min-w-[180px]">
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tasa BCV</p>
                  {loadingTasa ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      <span className="text-sm font-medium text-gray-700">Cargando...</span>
                    </div>
                  ) : tasa ? (
                    <p className="text-base font-bold text-blue-700">
                      Bs {tasa.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-700">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <HistorialHeader estadisticas={estadisticas} />
      </div>

      {/* Estadísticas por método de pago */}
      {!cargando && ventas.length > 0 && (
        <EstadisticasMetodosPago
          ventas={ventas}
          tasaBCV={tasa} // Solo para referencia, no para cálculos
          loadingTasa={loadingTasa}
        />
      )}

      {/* Tabla de ventas */}
      <div className="mt-8">
        <TablaVentas
          ventas={ventas}
          cargando={cargando}
          cargarVentas={cargarVentas}
          tasaBCV={tasa}
          loadingTasa={loadingTasa}
        />
      </div>
    </div>
  );
}