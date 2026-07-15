import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    // Ignoramos totalVentas, totalGastos y totalSistema enviados por el frontend (Client-Side Trust Evadido)
    const { totalReal, detalles, notas } = body;
    const comercioId = session.user.comercioId;

    // 1. Buscar el último cierre para saber desde cuándo sumar
    const ultimoCierre = await prisma.cierreCaja.findFirst({
      where: { comercioId },
      orderBy: { fecha: 'desc' }
    });

    const fechaInicio = ultimoCierre ? ultimoCierre.fecha : new Date(0);

    // 2. Traer VENTAS genuinas desde la BD
    const ventas = await prisma.venta.findMany({
      where: { comercioId, fechaHora: { gt: fechaInicio } }
    });

    // 3. Traer GASTOS genuinos desde la BD
    const gastos = await prisma.gasto.findMany({
      where: { comercioId, fecha: { gt: fechaInicio } }
    });

    // 4. Calcular totales matemáticamente seguros
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalSistema = totalVentas - totalGastos;
    const diferencia = totalReal - totalSistema;

    const cierre = await prisma.cierreCaja.create({
      data: {
        totalVentas,
        totalGastos,
        totalSistema,
        totalReal,
        diferencia,
        detalles, 
        notas,
        comercioId
      }
    });

    return NextResponse.json({ success: true, cierreId: cierre.id });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error al cerrar caja' }, { status: 500 });
  }
}