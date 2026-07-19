"use client";

import { useState, useEffect } from "react";
import { Plus, UserMinus, Truck, CircleDollarSign, History, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "react-toastify";
import DeudaCard from "@/src/components/Deudas/DeudaCard";
import DeudaFormModal from "@/src/components/Deudas/DeudaFormModal";
import AbonoModal from "@/src/components/Deudas/AbonoModal";
import ConfirmModal from "@/src/components/Deudas/ConfirmModal";

export default function DeudasPage() {
  const [deudas, setDeudas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"COBRAR" | "PAGAR">("COBRAR");
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalPendiente, setTotalPendiente] = useState(0);
  
  // Buscador
  const [busquedaInput, setBusquedaInput] = useState("");
  const [busquedaActual, setBusquedaActual] = useState("");

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  const [deudaSeleccionada, setDeudaSeleccionada] = useState<any>(null);

  const cargarDeudas = async () => {
    setLoading(true);
    try {
      const estado = mostrarHistorial ? "PAGADO" : "PENDIENTE";
      const res = await fetch(`/api/deudas?tipo=${tab}&estado=${estado}&page=${paginaActual}&limit=10&q=${encodeURIComponent(busquedaActual)}`);
      if (res.ok) {
        const data = await res.json();
        setDeudas(data.deudas || []);
        setTotalPaginas(data.totalPaginas || 1);
        setTotalPendiente(data.resumen?.totalPendiente || 0);
      }
    } catch (error) { toast.error("Error cargando datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => setBusquedaActual(busquedaInput), 500);
    return () => clearTimeout(timer);
  }, [busquedaInput]);

  useEffect(() => { cargarDeudas(); }, [paginaActual, tab, mostrarHistorial, busquedaActual]);

  // Reiniciar página al cambiar de tab o filtro
  useEffect(() => { setPaginaActual(1); }, [tab, mostrarHistorial, busquedaActual]);

  const clickEliminar = (deuda: any) => {
    setDeudaSeleccionada(deuda);
    setModalConfirmOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!deudaSeleccionada) return;
    try {
      await fetch("/api/deudas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deudaSeleccionada.id })
      });
      toast.success("Eliminado correctamente");
      cargarDeudas();
    } catch (e) { toast.error("Error eliminando"); }
    setDeudaSeleccionada(null);
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (deudaSeleccionada && !data.id) {
        // EDICIÓN
        const res = await fetch("/api/deudas", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, id: deudaSeleccionada.id, accion: "EDITAR" })
        });
        if (res.ok) toast.success("Actualizado");
      } else {
        // CREACIÓN
        const res = await fetch("/api/deudas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, tipo: tab })
        });
        if (res.ok) toast.success("Creado");
      }
      cargarDeudas();
      setDeudaSeleccionada(null);
    } catch (e) { toast.error("Error al guardar"); }
  };

  // --- AQUI ESTA EL CAMBIO PRINCIPAL ---
  // Ahora recibimos 'crearGasto' desde el Modal y lo pasamos al API
  const handleAbonarConfirm = async (monto: number, metodoId: string, crearGasto: boolean) => { 
    try {
      const res = await fetch("/api/deudas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            id: deudaSeleccionada.id, 
            abono: monto,
            metodoPagoId: metodoId,
            crearGasto: crearGasto // <--- ENVIAMOS LA SEÑAL AL BACKEND
        })
      });
      if (res.ok) toast.success("Abono registrado");
      cargarDeudas();
    } catch (e) { toast.error("Error en abono"); }
  };

  const config = tab === "COBRAR"
    ? { color: "text-indigo-600", bg: "bg-indigo-50", icon: <UserMinus size={24}/> }
    : { color: "text-orange-600", bg: "bg-orange-50", icon: <Truck size={24}/> };

  return (
    <div className="w-full max-w-full mx-auto min-h-screen space-y-8 pb-20 pt-4">
      
      {/* HEADER Y METRICAS PREMIUM */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
         <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl text-white shadow-inner flex flex-shrink-0 items-center justify-center ${tab === "COBRAR" ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-200" : "bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-200"}`}>
               <CircleDollarSign size={32} strokeWidth={2}/>
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Gestión de Deudas</h1>
               <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Controla las cuentas por {tab === "COBRAR" ? "cobrar" : "pagar"} de tu negocio</p>
            </div>
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             <div className="flex flex-col items-end border-r border-gray-100 pr-5">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pendiente</span>
                 <span className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter ${tab === "COBRAR" ? "text-indigo-600" : "text-orange-600"}`}>
                     ${totalPendiente.toFixed(2)}
                 </span>
             </div>
             
             {!mostrarHistorial && (
                 <button
                    onClick={() => { setDeudaSeleccionada(null); setModalFormOpen(true); }}
                    className={`h-12 sm:h-14 px-4 sm:px-5 rounded-2xl flex items-center gap-2 text-white font-bold shadow-lg transition-all active:scale-95 hover:-translate-y-0.5 ${tab === "COBRAR" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"}`}
                 >
                    <Plus size={22} strokeWidth={3}/> <span className="hidden sm:inline">Nueva Deuda</span>
                 </button>
             )}
         </div>
      </div>

      {/* TABS Y FILTROS TIPO PILDORA */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="bg-gray-100/80 p-1.5 rounded-2xl flex w-full sm:w-auto relative">
            <button 
                onClick={() => setTab("COBRAR")} 
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative z-10 ${tab === "COBRAR" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
                <UserMinus size={18} strokeWidth={2.5}/> Por Cobrar
            </button>
            <button 
                onClick={() => setTab("PAGAR")} 
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative z-10 ${tab === "PAGAR" ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
                <Truck size={18} strokeWidth={2.5}/> Por Pagar
            </button>
         </div>

         <button
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border w-full sm:w-auto justify-center shadow-sm ${mostrarHistorial ? 'bg-gray-900 text-white border-gray-900 ring-2 ring-gray-200 ring-offset-2' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
         >
            <History size={18} strokeWidth={2.5}/> {mostrarHistorial ? "Viendo Historial" : "Ver Historial"}
         </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
              type="text"
              placeholder="Buscar por nombre o cédula/RIF..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-gray-700 transition-all placeholder:text-gray-400"
          />
      </div>

      {/* GRID DEUDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p className="text-center col-span-full py-10 text-gray-400">Cargando...</p> :
          deudas.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <Filter className="mx-auto h-12 w-12 text-gray-300 mb-2"/>
              <p>{mostrarHistorial ? "No hay historial." : "¡Estás al día!"}</p>
            </div>
          ) : (
            deudas.map((d) => (
              <DeudaCard
                key={d.id}
                deuda={d}
                tipo={tab}
                onAbonar={(deuda) => { setDeudaSeleccionada(deuda); setModalAbonoOpen(true); }}
                onEditar={(deuda) => { setDeudaSeleccionada(deuda); setModalFormOpen(true); }}
                onEliminar={() => clickEliminar(d)}
              />
            ))
          )}
      </div>

      {!loading && totalPaginas > 1 && (
        <div className="flex justify-between items-center py-4 px-2 border-t border-gray-100 mt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Página {paginaActual} de {totalPaginas}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 shadow-sm transition-all active:scale-95">
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-100 shadow-inner">
              {paginaActual}
            </div>
            <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 shadow-sm transition-all active:scale-95">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <DeudaFormModal
        isOpen={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={deudaSeleccionada}
        tipo={tab}
      />

      {deudaSeleccionada && (
        <AbonoModal
          isOpen={modalAbonoOpen}
          onClose={() => setModalAbonoOpen(false)}
          onConfirm={handleAbonarConfirm}
          deudaTotal={deudaSeleccionada.monto}
          abonado={deudaSeleccionada.abonado}
          tipo={deudaSeleccionada.tipo} // <--- PASAMOS EL TIPO AQUI
        />
      )}

      <ConfirmModal
        isOpen={modalConfirmOpen}
        onClose={() => setModalConfirmOpen(false)}
        onConfirm={confirmarEliminacion}
        titulo="¿Eliminar Registro?"
        mensaje="Esta acción borrará la deuda permanentemente."
      />
    </div>
  );
}