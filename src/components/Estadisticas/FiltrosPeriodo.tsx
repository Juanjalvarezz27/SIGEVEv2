"use client";

import { Filter, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FiltrosPeriodoProps {
  periodo: string;
  setPeriodo: (periodo: string) => void;
  fecha: string;
  setFecha: (fecha: string) => void;
  cargando: boolean;
  cargarEstadisticas: (nuevoPeriodo?: string, nuevaFecha?: string) => void;
}

const periodos = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'fecha-especifica', label: 'Fecha específica', icon: <Calendar className="w-4 h-4" /> },
];

export default function FiltrosPeriodo({
  periodo,
  setPeriodo,
  fecha,
  setFecha,
  cargando,
  cargarEstadisticas,
}: FiltrosPeriodoProps) {
  const [mostrarFechaEspecifica, setMostrarFechaEspecifica] = useState(false);
  const [fechaLocal, setFechaLocal] = useState('');

  // Inicializar fecha actual
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Inicializar fecha para fecha-especifica
  useEffect(() => {
    if (periodo === 'fecha-especifica') {
      if (!fecha) {
        const fechaDefault = obtenerFechaActual();
        setFechaLocal(fechaDefault);
        setFecha(fechaDefault);
        cargarEstadisticas('fecha-especifica', fechaDefault);
      } else {
        setFechaLocal(fecha);
      }
      setMostrarFechaEspecifica(true);
    } else {
      setMostrarFechaEspecifica(false);
    }
  }, [periodo, fecha, setFecha, cargarEstadisticas]);

  const handlePeriodoChange = (nuevoPeriodo: string) => {
    setPeriodo(nuevoPeriodo);

    if (nuevoPeriodo !== 'fecha-especifica') {
      setFecha('');
      setFechaLocal('');
      setMostrarFechaEspecifica(false);
      cargarEstadisticas(nuevoPeriodo);
    } else {
      setMostrarFechaEspecifica(true);
      if (fechaLocal) {
        cargarEstadisticas('fecha-especifica', fechaLocal);
      }
    }
  };

  const handleAplicarFechaEspecifica = () => {
    if (!fechaLocal) {
      alert('Por favor seleccione una fecha');
      return;
    }

    const fechaSeleccionada = new Date(fechaLocal);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > hoy) {
      alert('No se pueden consultar estadísticas de fechas futuras');
      return;
    }

    setFecha(fechaLocal);
    cargarEstadisticas('fecha-especifica', fechaLocal);
  };

  const handleFechaChange = (value: string) => {
    setFechaLocal(value);
    if (value) {
      setTimeout(() => {
        handleAplicarFechaEspecifica();
      }, 300);
    }
  };

  // Formatear fecha para mostrar (sin desfase)
  const formatearFechaMostrar = (fechaStr: string) => {
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
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Filter className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Filtrar Período</h2>
      </div>

      <div className="space-y-4">
        {/* Selector de período */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {periodos.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodoChange(p.value)}
              className={`px-4 py-3 rounded-lg border transition-colors flex flex-col items-center ${
                periodo === p.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={cargando}
            >
              {p.icon && <span className="mb-1">{p.icon}</span>}
              <span className="text-sm">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Selector de fecha específica */}
        {mostrarFechaEspecifica && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">
              Seleccionar fecha específica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaLocal}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  max={obtenerFechaActual()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={cargando}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAplicarFechaEspecifica}
                  className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    cargando ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={cargando || !fechaLocal}
                >
                  {cargando ? 'Cargando...' : 'Aplicar'}
                </button>
              </div>
            </div>
            {fechaLocal && (
              <div className="mt-3 p-2 bg-white border border-blue-100 rounded">
                <p className="text-sm text-blue-600 font-medium">
                  {formatearFechaMostrar(fechaLocal)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mostrando estadísticas exactamente para esta fecha
                </p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Las estadísticas se actualizarán automáticamente al seleccionar una fecha
            </p>
          </div>
        )}

        {/* Información del período seleccionado */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800">
              Período seleccionado:{' '}
              <span className="font-bold">
                {periodos.find(p => p.value === periodo)?.label}
              </span>
            </span>
            {periodo === 'fecha-especifica' && fechaLocal && (
              <span className="text-sm text-blue-600">
                {formatearFechaMostrar(fechaLocal)}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-blue-600">
            {cargando ? 'Cargando...' : 'Listo'}
          </div>
        </div>
      </div>
    </div>
  );
}