import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

function obtenerRangoFechaVenezuela() {
  const ahora = new Date();
  const fechaVenezuela = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
  const inicioDia = new Date(fechaVenezuela);
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(fechaVenezuela);
  finDia.setHours(23, 59, 59, 999);
  return { inicioDia, finDia };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const { inicioDia, finDia } = obtenerRangoFechaVenezuela();
    const whereClause = {
      comercioId: session.user.comercioId,
      fechaHora: { gte: inicioDia, lte: finDia },
    };

    // 1. ESTADÍSTICAS GLOBALES
    const statsAgregados = await prisma.venta.aggregate({
      where: whereClause,
      _sum: { total: true, totalBs: true },
      _count: { id: true }
    });

    const ventasDelDia = await prisma.venta.findMany({
      where: whereClause,
      select: {
        productos: { select: { cantidad: true, producto: { select: { porPeso: true } } } }
      }
    });

    const productosVendidos = ventasDelDia.reduce((sum, venta) => {
      return sum + venta.productos.reduce((pSum, prod) =>
        pSum + (prod.producto.porPeso ? 1 : prod.cantidad), 0);
    }, 0);

    const estadisticas = {
      totalVentas: statsAgregados._count.id,
      totalIngresos: statsAgregados._sum.total || 0,
      totalIngresosBs: statsAgregados._sum.totalBs || 0,
      productosVendidos: productosVendidos,
      fecha: new Date().toISOString(),
    };

    // 2. VENTAS PAGINADAS (Incluyendo DEUDA)
    const ventas = await prisma.venta.findMany({
      where: whereClause,
      include: {
        metodoPago: true,
        productos: { include: { producto: true } },
        deuda: true // <--- ESTO ES LA CLAVE
      },
      orderBy: { fechaHora: 'desc' },
      skip: skip,
      take: limit,
    });

    const pagination = {
      page,
      limit,
      total: statsAgregados._count.id,
      totalPages: Math.ceil(statsAgregados._count.id / limit),
    };

    return NextResponse.json({ ventas, estadisticas, pagination });

  } catch (error) {
    console.error('Error historial:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}