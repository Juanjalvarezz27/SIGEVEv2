"use client";

import { Store, Users, AlertTriangle, Coins, RefreshCw, Loader2 } from "lucide-react";
import useTasaBCV from "@/src/app/hooks/useTasaBCV";
import { useState } from "react";

interface AdminStatsProps {
  totalComercios: number;
  totalUsuarios: number;
  vencidos: number;
}

export default function AdminStats({ totalComercios, totalUsuarios, vencidos }: AdminStatsProps) {
  const { tasa, loading, actualizar } = useTasaBCV();
  const [rotar, setRotar] = useState(false);

  const handleRecargar = async () => {
    setRotar(true);
    await actualizar();
    setTimeout(() => setRotar(false), 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* CARD 1: TASA BCV (Dinámica) */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4"></div>
        <div className="p-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 z-10">
          <Coins size={24} />
        </div>
        <div className="z-10">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            Tasa BCV
            <button onClick={handleRecargar} disabled={loading} className="hover:text-blue-600 transition-colors">
               <RefreshCw size={12} className={rotar || loading ? "animate-spin" : ""}/>
            </button>
          </p>
          <p className="text-2xl font-black text-slate-800">
            {loading ? <Loader2 className="animate-spin h-6 w-6"/> : `Bs ${tasa?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      {/* CARD 2: SUSCRIPCIONES VENCIDAS (Alerta) */}
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
        <div className="p-4 rounded-xl bg-red-50 text-red-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Por Renovar</p>
          <p className="text-2xl font-black text-slate-800">{vencidos}</p>
        </div>
      </div>

      {/* CARD 3: COMERCIOS TOTALES */}
      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
        <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
          <Store size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Comercios</p>
          <p className="text-2xl font-black text-slate-800">{totalComercios}</p>
        </div>
      </div>

      {/* CARD 4: USUARIOS TOTALES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-4 rounded-xl bg-slate-100 text-slate-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Usuarios</p>
          <p className="text-2xl font-black text-slate-800">{totalUsuarios}</p>
        </div>
      </div>

    </div>
  );
}