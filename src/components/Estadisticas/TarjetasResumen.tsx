"use client";

import { DollarSign, ShoppingBag, Package, Calendar, TrendingUp, Target } from 'lucide-react';

interface TarjetasResumenProps {
  estadisticas: {
    totalVentas: number;
    totalIngresosUSD: number;
    totalIngresosBs: number;
    totalProductosVendidos: number;
  };
  periodo: {
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
    fechaEspecifica?: string;
  };
}

export default function TarjetasResumen({ estadisticas, periodo }: TarjetasResumenProps) {
  const tarjetasSuperiores = [
    {
      titulo: 'Total Ventas',
      valor: estadisticas.totalVentas,
      icono: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
      descripcion: 'Transacciones realizadas',
      formato: 'numero',
      esGrande: true,
    },
    {
      titulo: 'Ingresos USD',
      valor: estadisticas.totalIngresosUSD,
      icono: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      descripcion: 'Ingresos totales en dólares',
      formato: 'dolares',
      esGrande: true,
    },
    {
      titulo: 'Ingresos Bs',
      valor: estadisticas.totalIngresosBs,
      icono: <TrendingUp className="w-6 h-6" />,
      color: 'bg-yellow-500',
      descripcion: 'Ingresos totales en bolívares',
      formato: 'bolivares',
      esGrande: true,
    },
  ];

  const tarjetasInferiores = [
    {
      titulo: 'Productos Vendidos',
      valor: estadisticas.totalProductosVendidos,
      icono: <Package className="w-6 h-6" />,
      color: 'bg-purple-500',
      descripcion: 'Unidades vendidas',
      formato: 'numero',
      esGrande: false,
    },
    {
      titulo: periodo.tipo === 'fecha-especifica' ? 'Fecha' : 'Período',
      valor: periodo.tipo === 'fecha-especifica' ? 'Fecha específica' : periodo.tipo,
      icono: periodo.tipo === 'fecha-especifica' ? <Target className="w-6 h-6" /> : <Calendar className="w-6 h-6" />,
      color: periodo.tipo === 'fecha-especifica' ? 'bg-red-500' : 'bg-pink-500',
      descripcion: periodo.tipo === 'fecha-especifica' ? 'Día seleccionado' : 'Rango analizado',
      formato: 'texto',
      esGrande: false,
    },
  ];

  const formatearValor = (valor: any, formato: string) => {
    switch (formato) {
      case 'dolares':
        return `$${Number(valor).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'bolivares':
        return `${Number(valor).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
      case 'numero':
        return Number(valor).toLocaleString('es-VE');
      default:
        return valor.charAt(0).toUpperCase() + valor.slice(1);
    }
  };

  // Función para formatear fecha específica SIN DESFASE
  const formatearFechaEspecifica = (fechaString?: string) => {
    if (!fechaString) return '';
    
    try {
      if (fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = fechaString.split('-').map(Number);
        const fecha = new Date(Date.UTC(year, month - 1, day));
        
        return fecha.toLocaleDateString('es-VE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        });
      }
      
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Error formateando fecha específica:', error, fechaString);
      return fechaString;
    }
  };

  // Función para formatear rango de fechas SIN DESFASE
  const formatearFechaRango = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Error formateando fecha rango:', error, fechaString);
      return fechaString;
    }
  };

  return (
    <div className="space-y-8">
      {/* 3 Tarjetas superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tarjetasSuperiores.map((tarjeta, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{tarjeta.titulo}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatearValor(tarjeta.valor, tarjeta.formato)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${tarjeta.color} text-white`}>
                {tarjeta.icono}
              </div>
            </div>
            <p className="text-sm text-gray-500">{tarjeta.descripcion}</p>

            {tarjeta.titulo === 'Total Ventas' && estadisticas.totalVentas > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Productos por venta:</span>
                  <span className="font-medium">
                    {Math.round(estadisticas.totalProductosVendidos / estadisticas.totalVentas)}
                  </span>
                </div>
              </div>
            )}

            {tarjeta.titulo === 'Ingresos USD' && estadisticas.totalIngresosUSD > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Promedio por venta:</span>
                  <span className="font-medium">
                    ${(estadisticas.totalIngresosUSD / estadisticas.totalVentas).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2 Tarjetas inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tarjetasInferiores.map((tarjeta, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{tarjeta.titulo}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tarjeta.titulo === 'Fecha' && periodo.fechaEspecifica
                    ? formatearFechaEspecifica(periodo.fechaEspecifica)
                    : formatearValor(tarjeta.valor, tarjeta.formato)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${tarjeta.color} text-white`}>
                {tarjeta.icono}
              </div>
            </div>
            <p className="text-sm text-gray-500">{tarjeta.descripcion}</p>

            {tarjeta.titulo === 'Productos Vendidos' && estadisticas.totalProductosVendidos > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Ventas activas:</span>
                  <span className="font-medium">{estadisticas.totalVentas}</span>
                </div>
              </div>
            )}

            {tarjeta.titulo === 'Período' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600">
                  {periodo.tipo === 'fecha-especifica' ? (
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between">
                        <span>Fecha seleccionada:</span>
                        <span className="font-medium">
                          {periodo.fechaEspecifica}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Día:</span>
                        <span className="font-medium">
                          {formatearFechaEspecifica(periodo.fechaEspecifica)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-1">
                        <span>Desde:</span>
                        <span className="font-medium">{formatearFechaRango(periodo.fechaInicio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hasta:</span>
                        <span className="font-medium">{formatearFechaRango(periodo.fechaFin)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}