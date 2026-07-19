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

    // 2. Calcular total de VENTAS en BD
    const ventasAgregadas = await prisma.venta.aggregate({
      where: {
        comercioId,
        fechaHora: { gt: fechaInicio }
      },
      _sum: { total: true, totalBs: true }
    });
    const totalVentas = ventasAgregadas._sum.total || 0;
    const totalVentasBs = ventasAgregadas._sum.totalBs || 0;

    // 3. Calcular desglose de ventas por método de pago usando groupBy
    const desgloseAgrupado = await prisma.venta.groupBy({
      by: ['metodoPagoId'],
      where: {
        comercioId,
        fechaHora: { gt: fechaInicio }
      },
      _sum: { total: true, totalBs: true }
    });

    // Traer los nombres de los métodos de pago usados
    const metodosPago = await prisma.metodosPago.findMany({
      where: {
         id: { in: desgloseAgrupado.map(g => g.metodoPagoId).filter(Boolean) as string[] }
      }
    });

    const porMetodo: any = {};
    const porMetodoBs: any = {};
    desgloseAgrupado.forEach(g => {
        const metodo = metodosPago.find(m => m.id === g.metodoPagoId)?.nombre || 'Desconocido';
        porMetodo[metodo] = g._sum.total || 0;
        porMetodoBs[metodo] = g._sum.totalBs || 0;
    });

    // 4. Calcular total de GASTOS en BD
    const gastosAgregados = await prisma.gasto.aggregate({
      where: {
        comercioId,
        fecha: { gt: fechaInicio }
      },
      _sum: { monto: true, montoBs: true }
    });
    const totalGastos = gastosAgregados._sum.monto || 0;
    const totalGastosBs = gastosAgregados._sum.montoBs || 0;

    // 5. Los gastos ahora se cargan por lazy loading en su propia vista (HistorialGastos)

    const totalEnCaja = totalVentas - totalGastos;
    const totalEnCajaBs = totalVentasBs - totalGastosBs;

    return NextResponse.json({
      resumen: {
        totalVentas,
        totalVentasBs,
        totalGastos,
        totalGastosBs,
        totalEnCaja,
        totalEnCajaBs,
        inicioPeriodo: fechaInicio
      },
      desgloseVentas: porMetodo,
      desgloseVentasBs: porMetodoBs
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}