import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth'; 
// Función para convertir fecha YYYY-MM-DD a inicio del día en Venezuela (UTC)
function obtenerInicioDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0));
}

// Función para convertir fecha YYYY-MM-DD a fin del día en Venezuela (UTC)
function obtenerFinDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));
}

function obtenerFechaActualVenezuela(): string {
  const ahora = new Date();
  const fechaVenezuela = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
  const year = fechaVenezuela.getFullYear();
  const month = String(fechaVenezuela.getMonth() + 1).padStart(2, '0');
  const day = String(fechaVenezuela.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function obtenerFechasPeriodo(periodo: string, fechaEspecifica?: string) {
  let startDate: Date;
  let endDate: Date;
  const hoyVenezuela = obtenerFechaActualVenezuela();

  switch (periodo) {
    case 'ayer': {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() - 1);
      const fechaAyer = new Date(hoy.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
      const y = fechaAyer.getFullYear();
      const m = String(fechaAyer.getMonth() + 1).padStart(2, '0');
      const d = String(fechaAyer.getDate()).padStart(2, '0');
      const strAyer = `${y}-${m}-${d}`;
      startDate = obtenerInicioDiaVenezuelaUTC(strAyer);
      endDate = obtenerFinDiaVenezuelaUTC(strAyer);
      break;
    }
    case 'semana': {
      // Lógica simplificada para inicio de semana
      const curr = new Date(); 
      const first = curr.getDate() - curr.getDay() + 1; 
      const firstday = new Date(curr.setDate(first)).toISOString().split('T')[0];
      startDate = obtenerInicioDiaVenezuelaUTC(firstday);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
    case 'mes': {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      startDate = obtenerInicioDiaVenezuelaUTC(firstDay);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
    case 'fecha-especifica': {
      const fecha = fechaEspecifica || hoyVenezuela;
      startDate = obtenerInicioDiaVenezuelaUTC(fecha);
      endDate = obtenerFinDiaVenezuelaUTC(fecha);
      break;
    }
    default: // 'hoy'
      startDate = obtenerInicioDiaVenezuelaUTC(hoyVenezuela);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
  }
  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    // 1. SEGURIDAD: Verificar sesión
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'hoy';
    const fecha = searchParams.get('fecha');

    let startDate: Date;
    let endDate: Date;

    try {
      const fechas = obtenerFechasPeriodo(periodo, fecha || undefined);
      startDate = fechas.startDate;
      endDate = fechas.endDate;
    } catch (error) {
      return NextResponse.json({ error: 'Error procesando fechas' }, { status: 400 });
    }

    // 2. CONSULTA: Filtrar por fecha Y comercioId
    const ventas = await prisma.venta.findMany({
      where: {
        comercioId: session.user.comercioId, 
        fechaHora: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        productos: {
          include: { producto: true }
        },
        metodoPago: true,
      },
      orderBy: { fechaHora: 'desc' },
    });

    // Calcular estadísticas
    const totalVentas = ventas.length;
    const totalIngresosUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalIngresosBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0);
    const totalProductosVendidos = ventas.reduce((sum, venta) => {
      return sum + venta.productos.reduce((prodSum, prod) => 
        prodSum + (prod.producto.porPeso ? 1 : prod.cantidad), 0);
    }, 0);

    return NextResponse.json({
      periodo: {
        tipo: periodo,
        fechaEspecifica: periodo === 'fecha-especifica' ? fecha : null,
      },
      estadisticas: {
        totalVentas,
        totalIngresosUSD,
        totalIngresosBs,
        totalProductosVendidos,
      },
      ventasDetalladas: ventas,
    });

  } catch (error) {
    console.error('Error API Estadísticas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}