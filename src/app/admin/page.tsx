import { Store, Users, DollarSign, Activity } from "lucide-react";
import prisma from "@/src/lib/prisma";

export default async function SuperAdminDashboard() {
  // Consultas rápidas para llenar los datos (Dashboard real)
  const totalComercios = await prisma.comercio.count();
  const totalUsuarios = await prisma.usuario.count();
  
  // Stats "falsas" o calculadas simples para la demo
  const stats = [
    { label: "Comercios Activos", value: totalComercios, icon: <Store className="text-indigo-600" />, color: "bg-indigo-50" },
    { label: "Usuarios Totales", value: totalUsuarios, icon: <Users className="text-blue-600" />, color: "bg-blue-50" },
    { label: "Ingresos Recurrentes", value: "$0.00", icon: <DollarSign className="text-green-600" />, color: "bg-green-50" }, // Futuro SAAS
    { label: "Estado del Sistema", value: "Óptimo", icon: <Activity className="text-orange-600" />, color: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Panel de Control Maestro</h1>
        <p className="text-slate-500">Bienvenido, Super Admin. Aquí tienes el pulso de toda la plataforma.</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Acciones Rápidas (Placeholder) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
           <Store size={40} className="text-slate-300"/>
        </div>
        <h3 className="text-lg font-bold text-slate-700">Gestión de Comercios</h3>
        <p className="text-slate-500 max-w-md mb-6">
          Próximamente aquí verás la tabla de todos los clientes registrados, podrás activarlos, desactivarlos o editar sus planes.
        </p>
        <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
          Crear Nuevo Comercio
        </button>
      </div>

    </div>
  );
}