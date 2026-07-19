import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import { gzipSync } from 'zlib';

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
    const soloEstadisticas = searchParams.get('soloEstadisticas') === 'true';
    const soloVentas = searchParams.get('soloVentas') === 'true';
    const limit = 20;
    const skip = (page - 1) * limit;

    const { inicioDia, finDia } = obtenerRangoFechaVenezuela();
    const whereClause = {
      comercioId: session.user.comercioId,
      fechaHora: { gte: inicioDia, lte: finDia },
    };

    // 1. ESTADÍSTICAS GLOBALES Y POR MÉTODO DE PAGO
    const statsAgregados = await prisma.venta.aggregate({
      where: whereClause,
      _sum: { total: true, totalBs: true },
      _count: { id: true }
    });

    let estadisticas = null;
    
    if (!soloVentas) {
      const productosVendidosDb = await prisma.ventaProducto.findMany({
        where: { venta: whereClause },
        select: { cantidad: true, producto: { select: { porPeso: true } } }
      });
      const productosVendidos = productosVendidosDb.reduce((acc, p) => acc + (p.producto.porPeso ? 1 : p.cantidad), 0);

      const ventasPorMetodo = await prisma.venta.groupBy({
        by: ['metodoPagoId'],
        where: whereClause,
        _sum: { total: true, totalBs: true },
        _count: { id: true }
      });

      const metodosData = await prisma.metodosPago.findMany({ select: { id: true, nombre: true } });
      const metodosMap = new Map(metodosData.map(m => [m.id, m.nombre]));

      const desgloseMetodos = ventasPorMetodo.map(grupo => ({
        metodo: metodosMap.get(grupo.metodoPagoId || '') || 'Desconocido',
        usd: grupo._sum.total || 0,
        bs: grupo._sum.totalBs || 0,
        count: grupo._count.id
      }));

      estadisticas = {
        totalVentas: statsAgregados._count.id,
        totalIngresos: statsAgregados._sum.total || 0,
        totalIngresosBs: statsAgregados._sum.totalBs || 0,
        productosVendidos: productosVendidos,
        fecha: new Date().toISOString(),
        metodos: desgloseMetodos
      };
    }

    // 2. VENTAS PAGINADAS (Incluyendo DEUDA)
    let ventas: any[] = [];
    if (!soloEstadisticas) {
      ventas = await prisma.venta.findMany({
      where: whereClause,
      select: {
        id: true,
        fechaHora: true,
        total: true,
        totalBs: true,
        referencia: true,
        metodoPago: { select: { nombre: true, id: true } },
        deuda: true,
        productos: {
          select: {
            cantidad: true,
            precioUnitario: true,
            producto: {
              select: {
                id: true,
                nombre: true,
                porPeso: true,
                unidad: true,
              }
            }
          }
        }
      },
      orderBy: { fechaHora: 'desc' },
      skip: skip,
      take: limit,
      });
    }

    const pagination = {
      page,
      limit,
      total: statsAgregados._count.id,
      totalPages: Math.ceil(statsAgregados._count.id / limit),
    };

    const payload = JSON.stringify({ ventas, estadisticas, pagination });
    const compressed = gzipSync(Buffer.from(payload, 'utf-8'));

    return new NextResponse(compressed, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      }
    });

  } catch (error: any) {
    console.error('Error historial:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}