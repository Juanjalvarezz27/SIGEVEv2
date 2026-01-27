import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import TablaPagos from "../../../components/Admin/Pagos/TablaPagos"; 

export const dynamic = 'force-dynamic';

export default async function HistorialPagosPage() {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.rol !== 'SUPER_ADMIN') redirect("/home");

  const pagos = await prisma.pagoSuscripcion.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      comercio: { select: { nombre: true, slug: true } }
    }
  });

  const totalHistorico = pagos.reduce((acc, p) => acc + p.monto, 0);
  const now = new Date();
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalMes = pagos
    .filter(p => new Date(p.fecha) >= primerDiaMes)
    .reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-black text-gray-900">Auditoría de Pagos</h1>
            <p className="text-gray-500">Historial financiero de suscripciones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <DollarSign size={28} strokeWidth={2.5}/>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales (SaaS)</p>
                  <p className="text-3xl font-black text-gray-900">${totalHistorico.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <TrendingUp size={28} strokeWidth={2.5}/>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Este Mes</p>
                  <p className="text-3xl font-black text-gray-900">${totalMes.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>
          </div>
      </div>

      <div>
          <div className="p-5 border-b border-gray-100 bg-white rounded-t-2xl border-x border-t">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18}/> Últimas Transacciones</h3>
          </div>
          <TablaPagos dataInicial={JSON.parse(JSON.stringify(pagos))} />
      </div>
    </div>
  );
}