"use client";

import { Calendar, Filter, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (periodo === 'fecha-especifica') {
      setMostrarCalendario(true);
      if (fecha) setFechaLocal(fecha);
    } else {
      setMostrarCalendario(false);
    }
  }, [periodo, fecha]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="bg-white rounded-2xl md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-2 flex flex-col md:flex-row gap-2 items-center justify-between">
      
      {/* Dropdown Custom Mobile */}
      <div className="md:hidden w-full relative p-1" ref={dropdownRef}>
        <button 
           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
           className="w-full flex items-center justify-between bg-gray-50/80 hover:bg-gray-100 transition-colors border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 font-bold shadow-sm active:scale-95"
        >
           <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              {periodos.find(p => p.value === periodo)?.label || 'Filtrar...'}
           </div>
           <ChevronDown size={18} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
           <div className="absolute top-full left-1 right-1 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {periodos.map(p => (
                 <button
                    key={p.value}
                    onClick={() => {
                       handlePeriodoChange(p.value);
                       setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center justify-between ${periodo === p.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                 >
                    <span className="flex items-center gap-2">
                       {p.icon && <Calendar size={14} className={periodo === p.value ? 'text-indigo-600' : 'text-gray-400'}/>}
                       {p.label}
                    </span>
                    {periodo === p.value && <Check size={16} className="text-indigo-600" />}
                 </button>
              ))}
           </div>
        )}
      </div>

      {/* Botones de Periodo Desktop */}
      <div className="hidden md:flex gap-1 w-auto p-1">
        {periodos.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodoChange(p.value)}
            disabled={cargando}
            className={`
              flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
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
        <div className="flex items-center gap-2 bg-gray-50 p-2 md:p-1.5 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-right-2 w-full md:w-auto">
           <input 
             type="date" 
             value={fechaLocal}
             max={obtenerFechaActual()}
             onChange={(e) => setFechaLocal(e.target.value)}
             className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-2.5 md:py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
           />
           <button 
             onClick={aplicarFecha}
             disabled={cargando}
             className="p-2.5 md:p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
           >
             <Check size={20} className="md:w-4 md:h-4" />
           </button>
        </div>
      )}
    </div>
  );
}