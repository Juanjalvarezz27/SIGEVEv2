"use client";

import { useEffect, useState } from "react";
import { Store, ShieldCheck, Activity, Loader2 } from "lucide-react";
import ProductosList from "@/src/components/inventario/ProductosList";
import type { UserData } from "@/src/types"; 

export default function HomePage() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ESTADO DE CARGA 
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  // Si no hay datos (por error), mostramos algo básico o null
  if (!data) return null;

  const nombreComercio = data.comercio?.nombre || "Sin Comercio";
  const esActivo = data.comercio?.activo || false;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER / INFO DEL COMERCIO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ¡Hola, {data.nombre}! <span className="text-2xl">👋</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Store size={18} />
            <span className="text-sm font-medium">
              Panel de: <span className="text-indigo-600 font-bold">{nombreComercio}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border ${
            esActivo 
              ? 'bg-green-50 text-green-700 border-green-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            <Activity size={14} />
            {esActivo ? 'ACTIVO' : 'INACTIVO'}
          </div>

          <div className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-2 text-xs font-bold uppercase">
            <ShieldCheck size={14} />
            {data.rol}
          </div>
        </div>
      </div>

      <div className="w-full">
         <ProductosList/>
      </div>

    </div>
  );
}