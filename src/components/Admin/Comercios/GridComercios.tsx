"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Calendar, User, Phone, 
  CheckCircle2, XCircle, Loader2, CreditCard, 
  Store, AlertTriangle, Trash2, KeyRound, RefreshCw
} from "lucide-react";
import ModalCrearComercio from "./ModalCrear";
import ModalEditarComercio from "./ModalEditar";
import ModalUsuario from "./ModalUsuario"; 
import ModalEliminar from "./ModalEliminar"; // <--- IMPORTAMOS EL NUEVO MODAL
import { toast } from "react-toastify";

interface UsuarioOwner {
    id: string;
    nombre: string;
    email: string;
}

interface Comercio {
  id: string;
  nombre: string;
  slug: string;
  nombreContacto: string | null;
  telefono: string | null;
  estado: "ACTIVO" | "SUSPENDIDO" | "CANCELADO";
  fechaVencimiento: string | null;
  _count: { usuarios: number; ventas: number; };
  usuarios: UsuarioOwner[];
}

export default function GridComercios() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false); // Estado de carga para eliminar
  const [busqueda, setBusqueda] = useState("");
  
  // Modales
  const [showCrear, setShowCrear] = useState(false);
  const [comercioEditar, setComercioEditar] = useState<Comercio | null>(null);
  const [usuarioEditar, setUsuarioEditar] = useState<UsuarioOwner | null>(null);
  const [comercioAEliminar, setComercioAEliminar] = useState<Comercio | null>(null); // <--- Estado para el modal eliminar

  const fetchComercios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/comercios", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setComercios(data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComercios(); }, []);

  // 1. ABRIR MODAL
  const handleClickEliminar = (comercio: Comercio) => {
    setComercioAEliminar(comercio);
  };

  // 2. CONFIRMAR BORRADO (Llamada a API)
  const confirmarEliminacion = async () => {
    if (!comercioAEliminar) return;

    setLoadingDelete(true);
    try {
        const res = await fetch(`/api/admin/comercios/${comercioAEliminar.id}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success("Cliente eliminado por completo");
            fetchComercios();
            setComercioAEliminar(null); // Cerrar modal
        } else {
            const err = await res.json();
            toast.error(err.error || "Error al eliminar");
        }
    } catch (error) { 
        toast.error("Error de conexión"); 
    } finally {
        setLoadingDelete(false);
    }
  };

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
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, dueño, slug..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button onClick={fetchComercios} className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-indigo-600 shadow-sm" title="Refrescar">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
        </button>
        <button onClick={() => setShowCrear(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap">
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10"/></div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">No se encontraron clientes.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtrados.map((comercio) => {
            const dias = getDiasRestantes(comercio.fechaVencimiento);
            const vencido = dias !== null && dias < 0;
            const inactivo = comercio.estado !== 'ACTIVO';
            const usuarioOwner = comercio.usuarios?.[0] || null;

            let borderColor = "border-gray-200 hover:border-indigo-300";
            if (vencido) borderColor = "border-red-300 bg-red-50/20";
            else if (inactivo) borderColor = "border-gray-300 opacity-75 bg-gray-100/50";

            return (
              <div key={comercio.id} className={`bg-white rounded-2xl border ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group relative`}>
                
                {/* Header */}
                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{comercio.nombre}</h3>
                        <span className="text-xs font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200 mt-1 inline-block">/{comercio.slug}</span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border shadow-sm ${
                        inactivo ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        vencido ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                        {inactivo ? <XCircle size={12}/> : vencido ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>}
                        {vencido && !inactivo ? 'VENCIDO' : comercio.estado}
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100"><User size={16}/></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dueño / Acceso</p>
                            <p className="text-sm font-bold text-gray-700 truncate">{comercio.nombreContacto || "Sin registrar"}</p>
                            <p className="text-xs text-gray-500 truncate">{usuarioOwner?.email || "Sin usuario"}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                         <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <span className="block text-lg font-black text-gray-800">{comercio._count.usuarios}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Usuarios</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <span className="block text-lg font-black text-gray-800">{comercio._count.ventas}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Ventas</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={`p-4 border-t flex items-center gap-2 ${vencido ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/50 border-gray-100'}`}>
                    
                    {/* Botón Eliminar (AHORA ABRE MODAL) */}
                    <button onClick={() => handleClickEliminar(comercio)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shadow-sm" title="Eliminar Cliente">
                         <Trash2 size={18}/>
                    </button>

                    {/* Botón Credenciales */}
                    {usuarioOwner && (
                        <button onClick={() => setUsuarioEditar(usuarioOwner as any)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-colors shadow-sm" title="Cambiar Contraseña">
                             <KeyRound size={18}/>
                        </button>
                    )}

                    {/* Botón Suscripción */}
                    <button onClick={() => setComercioEditar(comercio)} className="flex-1 px-3 py-2.5 bg-white border-2 border-gray-200 shadow-sm rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-bold text-xs flex items-center justify-center gap-2">
                        <CreditCard size={16}/> {vencido ? 'Renovar' : 'Suscripción'}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALES */}
      <ModalCrearComercio isOpen={showCrear} onClose={() => setShowCrear(false)} onSuccess={fetchComercios} />
      <ModalEditarComercio isOpen={!!comercioEditar} onClose={() => setComercioEditar(null)} onSuccess={fetchComercios} comercio={comercioEditar} />
      <ModalUsuario isOpen={!!usuarioEditar} onClose={() => setUsuarioEditar(null)} onSuccess={fetchComercios} usuario={usuarioEditar} />
      
      {/* NUEVO MODAL ELIMINAR */}
      <ModalEliminar 
        isOpen={!!comercioAEliminar} 
        onClose={() => setComercioAEliminar(null)} 
        onConfirm={confirmarEliminacion} 
        nombreItem={comercioAEliminar?.nombre}
        loading={loadingDelete}
      />
    </>
  );
}