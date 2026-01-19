"use client";

import { Search, X } from 'lucide-react';

interface BarraBusquedaProps {
  terminoBusqueda: string;
  onBuscarChange: (termino: string) => void;
  onLimpiarBusqueda: () => void;
  resultados: number;
  total: number;
  paginaActual?: number;
  totalPaginas?: number;
}

const BarraBusqueda = ({
  terminoBusqueda,
  onBuscarChange,
  onLimpiarBusqueda,
  resultados,
  total,
  paginaActual,
  totalPaginas
}: BarraBusquedaProps) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Búsqueda integrada */}
      <div className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${terminoBusqueda ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>

          <input
            type="search"
            value={terminoBusqueda}
            onChange={(e) => onBuscarChange(e.target.value)}
            placeholder="Buscar producto..."
            className="
              pl-10 pr-8 py-2.5
              w-64 lg:w-80
              border border-gray-300 rounded-lg
              bg-white text-sm text-gray-900
              placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              focus:outline-none transition-all
              hover:border-gray-400
              group-hover:border-gray-400
            "
          />

          {terminoBusqueda && (
            <button
              type="button"
              onClick={onLimpiarBusqueda}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          )}
        </div>

        {terminoBusqueda && (
          <div className="absolute left-0 right-0 mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Buscando: "{terminoBusqueda}"
          </div>
        )}
      </div>

      {/* Estadísticas de resultados (solo en desktop) */}
      {terminoBusqueda && (
        <div className="text-right hidden md:block">
          <div className="text-sm text-gray-500">
            Resultados {paginaActual && totalPaginas ? `(Página ${paginaActual}/${totalPaginas})` : ''}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {resultados}
            <span className="text-sm font-normal text-gray-500">/{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarraBusqueda;