"use client";

import { useEffect, useState } from "react";
import { Store, ShieldCheck, Activity, Loader2, Coins, RefreshCw } from "lucide-react";
import ProductosList from "@/src/components/inventario/ProductosList";
import type { UserData } from "@/src/types";
import useTasaBCV from "@/src/app/hooks/useTasaBCV";

export default function HomePage() {
  const [data, setData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const { tasa, loading: loadingTasa, actualizar: actualizarTasa } = useTasaBCV();
  const [rotarIcono, setRotarIcono] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/datos-usuario");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error cargando perfil", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchData();
  }, []);

  const handleRecargarTasa = async () => {
    setRotarIcono(true);
    await actualizarTasa();
    setTimeout(() => setRotarIcono(false), 1000);
  };

  if (loadingUser) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  if (!data) return null;

  const nombreComercio = data.comercio?.nombre || "Sin Comercio";
  const esActivo = data.comercio?.activo || false;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"> 
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ¡Hola, {data.nombre}! <span className="text-2xl animate-pulse">👋</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Store size={18} />
            <span className="text-sm font-medium">
              Panel de: <span className="text-indigo-600 font-bold">{nombreComercio}</span>
            </span>
          </div>
        </div>

        {/* Contenedor que agrupa Badges y Tasa a la derecha */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full lg:w-auto">
            
            {/* GRUPO 1: BADGES (Activo y Rol) */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Badge Estado */}
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border ${
                    esActivo 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                    <Activity size={14} />
                    {esActivo ? 'ACTIVO' : 'INACTIVO'}
                </div>

                {/* Badge Rol */}
                <div className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-2 text-xs font-bold uppercase whitespace-nowrap">
                    <ShieldCheck size={14} />
                    {data.rol}
                </div>
            </div>

            {/* GRUPO 2: WIDGET TASA BCV */}
            <div className="flex items-center bg-blue-50 border border-blue-100 rounded-xl p-3 gap-4 shadow-sm w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg shadow-blue-200 shadow-md">
                    <Coins size={20} />
                    </div>
                    <div>
                    <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        Tasa BCV Oficial
                    </p>
                    <div className="flex items-baseline gap-1">
                        {loadingTasa ? (
                        <span className="text-sm text-gray-500 font-medium">Cargando...</span>
                        ) : (
                        <>
                            <span className="text-lg font-extrabold text-gray-800">
                            Bs {tasa?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </span>
                        </>
                        )}
                    </div>
                    </div>
                </div>

                {/* Botón Recarga */}
                <button 
                    onClick={handleRecargarTasa}
                    disabled={loadingTasa}
                    className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all"
                    title="Actualizar Tasa"
                >
                    <RefreshCw size={16} className={rotarIcono || loadingTasa ? "animate-spin" : ""} />
                </button>
            </div>

        </div>
      </div>

      <div className="w-full">
         <ProductosList/>
      </div>

    </div>
  );
}