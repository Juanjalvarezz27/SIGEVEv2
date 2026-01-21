import { DollarSign, ShoppingBag, Package, TrendingUp, Coins } from 'lucide-react';

interface Props {
  estadisticas: {
    totalVentas: number;
    totalIngresosUSD: number;
    totalIngresosBs: number;
    totalProductosVendidos: number;
  };
  periodo: any;
}

export default function TarjetasResumen({ estadisticas }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* 1. VENTAS (Indigo) */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 transition-transform hover:-translate-y-1">
         <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
         <div className="relative z-10 flex justify-between items-start">
            <div>
               <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">Ventas</p>
               <h3 className="text-4xl font-bold tracking-tight">{estadisticas.totalVentas}</h3>
               <p className="text-indigo-200 text-xs mt-2 font-medium">Transacciones cerradas</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
               <ShoppingBag size={24} className="text-white"/>
            </div>
         </div>
      </div>

      {/* 2. INGRESOS USD (Emerald) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ring-1 ring-gray-100/50 hover:shadow-md transition-all group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
               <DollarSign size={24}/>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">USD</span>
         </div>
         <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ingreso Divisas</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
               ${estadisticas.totalIngresosUSD.toFixed(2)}
            </h3>
         </div>
      </div>

      {/* 3. INGRESOS BS (Amber) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/50 shadow-sm hover:shadow-md transition-all group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-white text-amber-600 rounded-xl shadow-sm ring-1 ring-amber-100">
               <Coins size={24}/>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-white/60 px-2 py-1 rounded-full border border-amber-100">VES</span>
         </div>
         <div>
            <p className="text-amber-800/70 text-xs font-bold uppercase tracking-wider">Ingreso Bolívares</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1 truncate" title={`Bs ${estadisticas.totalIngresosBs}`}>
               Bs {estadisticas.totalIngresosBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </h3>
         </div>
      </div>

      {/* 4. PRODUCTOS (Gray) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ring-1 ring-gray-100/50 hover:shadow-md transition-all group">
         <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-gray-100 transition-colors">
               <Package size={24}/>
            </div>
         </div>
         <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Volumen</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
               {estadisticas.totalProductosVendidos}
            </h3>
            <p className="text-gray-400 text-xs mt-1">Unidades despachadas</p>
         </div>
      </div>

    </div>
  );
}