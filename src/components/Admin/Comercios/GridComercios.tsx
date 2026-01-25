"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Calendar, User, Phone, 
  CheckCircle2, XCircle, Loader2, CreditCard, 
  Store, AlertTriangle
} from "lucide-react";
import ModalCrearComercio from "./ModalCrear";
import ModalEditarComercio from "./ModalEditar";

// ... (Interfaces y fetchComercios igual que antes) ...
interface Comercio {
    id: string;
    nombre: string;
    slug: string;
    nombreContacto: string | null;
    telefono: string | null;
    estado: "ACTIVO" | "SUSPENDIDO" | "CANCELADO";
    fechaVencimiento: string | null;
    _count: { usuarios: number; ventas: number; };
}

export default function GridComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showCrear, setShowCrear] = useState(false);
  const [comercioEditar, setComercioEditar] = useState<Comercio | null>(null);

  const fetchComercios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/comercios");
      if (res.ok) { const data = await res.json(); setComercios(data); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchComercios(); }, []);

  const filtrados = comercios.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.slug.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.nombreContacto && c.nombreContacto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getDiasRestantes = (dateString: string | null) => {
    if (!dateString) return null;
    const diff = new Date(dateString).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <>
      {/* BARRA DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar comercio por nombre, dueño o slug..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowCrear(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* GRID DE TARJETAS (MODIFICADO A 2 COLUMNAS) */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10"/>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No se encontraron comercios.</p>
        </div>
      ) : (
        // CAMBIO AQUI: lg:grid-cols-2 en vez de xl:grid-cols-3
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtrados.map((comercio) => {
             const dias = getDiasRestantes(comercio.fechaVencimiento);
             const vencido = dias !== null && dias < 0;
             const porVencer = dias !== null && dias >= 0 && dias <= 5;
             const inactivo = comercio.estado !== 'ACTIVO';
 
             let borderColor = "border-gray-200 hover:border-indigo-300";
             if (vencido) borderColor = "border-red-300 ring-1 ring-red-100 bg-red-50/30";
             else if (porVencer) borderColor = "border-orange-300 bg-orange-50/30";
             else if (inactivo) borderColor = "border-gray-300 opacity-75 bg-gray-100/50";

            return (
              <div 
                key={comercio.id} 
                className={`bg-white rounded-2xl border ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group relative`}
              >
                {/* Header Tarjeta */}
                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{comercio.nombre}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[150px]">
                                /{comercio.slug}
                            </span>
                        </div>
                    </div>
                    {/* Badge Estado */}
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border shadow-sm ${
                        inactivo ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        vencido ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                        {inactivo ? <XCircle size={12}/> : vencido ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>}
                        {vencido && !inactivo ? 'VENCIDO' : comercio.estado}
                    </div>
                </div>

                {/* Body Tarjeta */}
                <div className="p-5 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dueño */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                <User size={16}/>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dueño</p>
                                <p className="text-sm font-bold text-gray-700 truncate">{comercio.nombreContacto || "Sin registrar"}</p>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Phone size={16}/>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contacto</p>
                                <p className="text-sm font-bold text-gray-700 truncate">{comercio.telefono || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats mini */}
                    <div className="flex gap-3 pt-2">
                        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100 flex items-center justify-center gap-2">
                            <span className="text-lg font-black text-gray-800">{comercio._count.usuarios}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Usuarios</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100 flex items-center justify-center gap-2">
                            <span className="text-lg font-black text-gray-800">{comercio._count.ventas}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Ventas</span>
                        </div>
                    </div>
                </div>

                {/* Footer Tarjeta */}
                <div className={`p-4 border-t flex items-center justify-between ${vencido ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar size={14} className={vencido ? 'text-red-500' : ''}/>
                            <span className={`text-xs font-bold uppercase ${vencido ? 'text-red-500' : ''}`}>Vence:</span>
                        </div>
                        <p className={`text-sm font-black ${vencido ? 'text-red-600' : porVencer ? 'text-orange-500' : 'text-gray-800'}`}>
                            {dias !== null && dias < 0 
                                ? `Hace ${Math.abs(dias)} días` 
                                : dias !== null 
                                    ? `${dias} días restantes` 
                                    : "Indefinido"}
                        </p>
                    </div>

                    <button 
                        onClick={() => setComercioEditar(comercio)}
                        className="px-5 py-2.5 bg-white border-2 border-gray-200 shadow-sm rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md transition-all font-bold text-xs flex items-center gap-2 group-hover:border-indigo-300"
                    >
                        <CreditCard size={16}/> Gestionar Suscripción
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modales se mantienen igual */}
      <ModalCrearComercio isOpen={showCrear} onClose={() => setShowCrear(false)} onSuccess={fetchComercios} />
      <ModalEditarComercio isOpen={!!comercioEditar} onClose={() => setComercioEditar(null)} onSuccess={fetchComercios} comercio={comercioEditar} />
    </>
  );
}