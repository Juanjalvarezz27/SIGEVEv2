"use client";

import { TrendingUp, RefreshCw, DollarSign, AlertCircle, Calendar } from 'lucide-react';
import useTasaBCV from '../../app/hooks/useTasaBCV';

const TasaDolarBCV = () => {
  const { tasa, loading, error, actualizar, ultimaActualizacion } = useTasaBCV();

  // Formatear número
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(num);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg overflow-hidden w-6/12">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">TASA BCV HOY</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-blue-200" />
                <span className="text-xs text-blue-200">
                  {new Date().toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={actualizar}
            disabled={loading}
            className="flex items-center px-3 py-1.5 bg-white/[0.2] hover:bg-white/[0.1] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar tasa"
          >
            <RefreshCw size={12} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '' : 'Actualizar'}
          </button>
        </div>

        {/* Valor principal */}
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-200 font-medium">PRECIO OFICIAL</div>
              <div className="text-xl font-bold text-white mt-1">
                {tasa ? `Bs ${formatNumber(tasa)}` : '---'}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white uppercase">
                <TrendingUp size={10} className="mr-1" />
                Oficial
              </div>
              {ultimaActualizacion && (
                <div className="text-[9px] text-blue-200 mt-1">
                  {new Date(ultimaActualizacion).toLocaleTimeString('es-VE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-2 p-2 bg-amber-500/20 rounded-lg flex items-start">
            <AlertCircle size={10} className="text-amber-300 mr-1.5 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-amber-100 leading-tight">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasaDolarBCV;