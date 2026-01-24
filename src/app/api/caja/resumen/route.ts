import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const comercioId = session.user.comercioId;

    // 1. Buscar el ÚLTIMO cierre para saber desde cuándo sumar
    const ultimoCierre = await prisma.cierreCaja.findFirst({
      where: { comercioId },
      orderBy: { fecha: 'desc' }
    });

    // Si nunca ha cerrado, sumamos desde el principio de los tiempos (o una fecha muy vieja)
    const fechaInicio = ultimoCierre ? ultimoCierre.fecha : new Date(0);

    // 2. Traer VENTAS desde esa fecha
    const ventas = await prisma.venta.findMany({
      where: {
        comercioId,
        fechaHora: { gt: fechaInicio } // gt = greater than (mayor que)
      },
      include: { metodoPago: true }
    });

    // 3. Traer GASTOS desde esa fecha
    const gastos = await prisma.gasto.findMany({
      where: {
        comercioId,
        fecha: { gt: fechaInicio }
      },
      orderBy: { fecha: 'desc' }
    });

    // 4. Calcular Totales
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalEnCaja = totalVentas - totalGastos;

    // Desglose por método (útil para el cuadre)
    const porMetodo: any = {};
    ventas.forEach(v => {
        const metodo = v.metodoPago.nombre;
        if (!porMetodo[metodo]) porMetodo[metodo] = 0;
        porMetodo[metodo] += v.total;
    });

    return NextResponse.json({
      resumen: {
        totalVentas,
        totalGastos,
        totalEnCaja,
        inicioPeriodo: fechaInicio
      },
      desgloseVentas: porMetodo,
      gastosRecientes: gastos
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}