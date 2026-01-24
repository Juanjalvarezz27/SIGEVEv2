"use client";

import { useState, useEffect } from "react";
import { Plus, UserMinus, Truck, CircleDollarSign, History, Filter } from "lucide-react";
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

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  const [deudaSeleccionada, setDeudaSeleccionada] = useState<any>(null);

  const cargarDeudas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deudas");
      if (res.ok) setDeudas(await res.json());
    } catch (error) { toast.error("Error cargando datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDeudas(); }, []);

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

  const deudasFiltradas = deudas
    .filter(d => d.tipo === tab)
    .filter(d => mostrarHistorial ? d.estado === "PAGADO" : d.estado === "PENDIENTE");

  const totalPendiente = deudas
    .filter(d => d.tipo === tab && d.estado === "PENDIENTE")
    .reduce((acc, curr) => acc + (curr.monto - curr.abonado), 0);

  const config = tab === "COBRAR"
    ? { color: "text-emerald-600", bg: "bg-emerald-50", icon: <UserMinus size={24}/> }
    : { color: "text-orange-600", bg: "bg-orange-50", icon: <Truck size={24}/> };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><CircleDollarSign size={28} /></div>
            Gestión de Deudas
          </h1>
        </div>
        <button
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors shadow-sm ${mostrarHistorial ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <History size={16}/> {mostrarHistorial ? "Viendo Historial" : "Ver Historial"}
        </button>
      </div>

      {/* TABS Y RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-1 rounded-2xl border border-gray-200 flex h-fit shadow-sm">
          <button onClick={() => setTab("COBRAR")} className={`flex-1 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${tab === "COBRAR" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            <UserMinus size={20}/> Por Cobrar
          </button>
          <button onClick={() => setTab("PAGAR")} className={`flex-1 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${tab === "PAGAR" ? "bg-orange-50 text-orange-700 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            <Truck size={20}/> Por Pagar
          </button>
        </div>

        <div className={`p-4 rounded-2xl border ${config.bg} flex justify-between items-center shadow-sm`}>
          <div>
            <p className="text-xs font-bold uppercase opacity-60">Total Pendiente</p>
            <h2 className={`text-3xl font-black ${config.color}`}>${totalPendiente.toFixed(2)}</h2>
          </div>
          {!mostrarHistorial && (
            <button
              onClick={() => { setDeudaSeleccionada(null); setModalFormOpen(true); }}
              className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${tab === "COBRAR" ? "bg-emerald-600" : "bg-orange-600"}`}
            >
              <Plus size={24}/>
            </button>
          )}
        </div>
      </div>

      {/* GRID DEUDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p className="text-center col-span-full py-10 text-gray-400">Cargando...</p> :
          deudasFiltradas.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <Filter className="mx-auto h-12 w-12 text-gray-300 mb-2"/>
              <p>{mostrarHistorial ? "No hay historial." : "¡Estás al día!"}</p>
            </div>
          ) : (
            deudasFiltradas.map((d) => (
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