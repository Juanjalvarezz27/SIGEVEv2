"use client";

import { Calendar, Filter, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FiltrosPeriodoProps {
  periodo: string;
  setPeriodo: (periodo: string) => void;
  fecha: string;
  setFecha: (fecha: string) => void;
  cargando: boolean;
  cargarEstadisticas: (p?: string, f?: string) => void;
}

const periodos = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'semana', label: 'Semana Actual' },
  { value: 'mes', label: 'Mes Actual' },
  { value: 'fecha-especifica', label: 'Calendario', icon: true },
];

export default function FiltrosPeriodo({
  periodo,
  fecha,
  setFecha,
  cargando,
  cargarEstadisticas,
}: FiltrosPeriodoProps) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaLocal, setFechaLocal] = useState('');

  const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (periodo === 'fecha-especifica') {
      setMostrarCalendario(true);
      if (fecha) setFechaLocal(fecha);
    } else {
      setMostrarCalendario(false);
    }
  }, [periodo, fecha]);

  const handlePeriodoChange = (val: string) => {
    if (val === 'fecha-especifica') {
      setMostrarCalendario(true);
      if (!fechaLocal) {
         const today = obtenerFechaActual();
         setFechaLocal(today);
         setFecha(today);
         cargarEstadisticas('fecha-especifica', today);
      }
    } else {
      setMostrarCalendario(false);
      cargarEstadisticas(val);
    }
  };

  const aplicarFecha = () => {
    if(fechaLocal) {
        setFecha(fechaLocal);
        cargarEstadisticas('fecha-especifica', fechaLocal);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex flex-col md:flex-row gap-2 items-center justify-between">
      
      {/* Botones de Periodo */}
      <div className="flex flex-wrap gap-1 w-full md:w-auto p-1">
        {periodos.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodoChange(p.value)}
            disabled={cargando}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${periodo === p.value 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {p.icon && <Calendar size={14} />}
            {p.label}
          </button>
        ))}
      </div>

      {/* Selector de Fecha (Condicional) */}
      {mostrarCalendario && (
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-right-2">
           <input 
             type="date" 
             value={fechaLocal}
             max={obtenerFechaActual()}
             onChange={(e) => setFechaLocal(e.target.value)}
             className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
           />
           <button 
             onClick={aplicarFecha}
             disabled={cargando}
             className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
           >
             <Check size={16} />
           </button>
        </div>
      )}
    </div>
  );
}