import { ShieldCheck, Briefcase } from "lucide-react";
import prisma from "@/src/lib/prisma";
import AdminStats from "@/src/components/Admin/AdminStats";
import GridComercios from "@/src/components/Admin/Comercios/GridComercios";

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  
  // 1. CONSULTAS DE DATOS (Server Side)
  const totalComercios = await prisma.comercio.count();
  const totalUsuarios = await prisma.usuario.count();
  
  const vencidos = await prisma.comercio.count({
    where: {
      fechaVencimiento: { lt: new Date() },
      estado: { not: 'CANCELADO' }
    }
  });

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            Panel Maestro <ShieldCheck className="text-indigo-600" size={28}/>
          </h1>
          <p className="text-slate-500 font-medium">Bienvenido, Super Admin. Aquí tienes el control total.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStats 
        totalComercios={totalComercios} 
        totalUsuarios={totalUsuarios} 
        vencidos={vencidos} 
      />

      {/* Sección de Gestión */}
      <div className="space-y-6 pt-4">
        {/* CAMBIO AQUI: Título estilo "Panel Maestro" */}
        <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            Gestión de Clientes <Briefcase className="text-indigo-600" size={28}/>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Administra las suscripciones y accesos de tus comercios.</p>
        </div>
        
        {/* Grid de Tarjetas */}
        <GridComercios />
      </div>

    </div>
  );
}