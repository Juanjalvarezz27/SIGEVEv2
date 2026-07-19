import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import { gzipSync } from 'zlib';


function obtenerInicioDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  // Venezuela es UTC-4. Para que sea las 00:00 VET, en UTC debe ser las 04:00
  return new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0));
}

function obtenerFinDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  // Fin del día VET (23:59:59) -> UTC es el día siguiente a las 03:59:59
  return new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));
}

function obtenerFechaActualVenezuela(): string {
  const ahora = new Date();
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return formato.format(ahora);
}

function generarEstructuraSemana(fechaReferencia: string) {
  const [y, m, d] = fechaReferencia.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const diaSemana = fecha.getDay() || 7;
  fecha.setDate(fecha.getDate() - diaSemana + 1);

  const estructura = new Map<string, number>();
  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  for (let i = 0; i < 7; i++) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    estructura.set(key, 0);
    fecha.setDate(fecha.getDate() + 1);
  }
  return { map: estructura, labels: nombresDias };
}

function obtenerFechasPeriodo(periodo: string, fechaEspecifica?: string) {
    let startDate: Date;
    let endDate: Date;
    const hoyVenezuela = obtenerFechaActualVenezuela();

    switch (periodo) {
        case 'ayer': {
            const hoy = new Date();
            hoy.setDate(hoy.getDate() - 1);
            const formato = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit' });
            const strAyer = formato.format(hoy);
            startDate = obtenerInicioDiaVenezuelaUTC(strAyer);
            endDate = obtenerFinDiaVenezuelaUTC(strAyer);
            break;
        }
        case 'semana': {
            const [y, m, d] = hoyVenezuela.split('-').map(Number);
            const curr = new Date(y, m - 1, d);
            const diaSemana = curr.getDay() || 7;
            curr.setDate(curr.getDate() - diaSemana + 1);
            const lunesStr = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}-${String(curr.getDate()).padStart(2,'0')}`;
            const domingo = new Date(curr);
            domingo.setDate(domingo.getDate() + 6);
            const domingoStr = `${domingo.getFullYear()}-${String(domingo.getMonth()+1).padStart(2,'0')}-${String(domingo.getDate()).padStart(2,'0')}`;
            startDate = obtenerInicioDiaVenezuelaUTC(lunesStr);
            endDate = obtenerFinDiaVenezuelaUTC(domingoStr);
            break;
        }
        case 'mes': {
            const [y, m] = hoyVenezuela.split('-').map(Number);
            const firstDay = `${y}-${String(m).padStart(2, '0')}-01`;
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
        default:
            startDate = obtenerInicioDiaVenezuelaUTC(hoyVenezuela);
            endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
            break;
    }
    return { startDate, endDate };
}


export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'hoy';
    const fecha = searchParams.get('fecha');
    const soloDetalles = searchParams.get('soloDetalles') === 'true';

    let startDate: Date;
    let endDate: Date;
    try {
      const fechas = obtenerFechasPeriodo(periodo, fecha || undefined);
      startDate = fechas.startDate;
      endDate = fechas.endDate;
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Error procesando fechas' }, { status: 400 });
    }

    const baseWhere = {
      comercioId: session.user.comercioId,
      fechaHora: { gte: startDate, lte: endDate },
    };

    if (soloDetalles) {
      const ventasDetalladas = await prisma.venta.findMany({
        where: baseWhere,
        take: 150,
        orderBy: { fechaHora: 'desc' },
        select: {
          id: true,
          fechaHora: true,
          total: true,
          totalBs: true,
          tasaBCV: true,
          referencia: true,
          metodoPago: { select: { nombre: true } },
          productos: {
            select: { 
               id: true,
               cantidad: true, 
               peso: true,
               precioUnitario: true,
               producto: { select: { porPeso: true, nombre: true } } 
            }
          },
          deuda: true
        }
      });
      const payload = JSON.stringify({ ventasDetalladas });
      const compressed = gzipSync(Buffer.from(payload, 'utf-8'));
      return new NextResponse(compressed, { status: 200, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } });
    }

    const statsTotales = await prisma.venta.aggregate({
      where: baseWhere,
      _count: { id: true },
      _sum: { total: true, totalBs: true }
    });

    const productosVendidosDb = await prisma.ventaProducto.findMany({
      where: { venta: baseWhere },
      select: { cantidad: true, producto: { select: { porPeso: true } } }
    });
    const totalProductosVendidos = productosVendidosDb.reduce((acc, p) => acc + (p.producto.porPeso ? 1 : p.cantidad), 0);

    // ventasGraficos eliminado a favor de agregaciones SQL crudas (Raw SQL)

    // Ventas detalladas se cargan bajo demanda con soloDetalles=true

    // --- PROCESAMIENTO GRÁFICOS ---
    let graficoTendencia = [];
    const esDiaUnico = periodo === 'hoy' || periodo === 'ayer' || periodo === 'fecha-especifica';

    if (esDiaUnico) {
      const horasMap = new Map<number, number>();
      
      const rawHoras = await prisma.$queryRaw<Array<{ hour: number, total: any }>>`
        SELECT 
          EXTRACT(HOUR FROM "fechaHora" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Caracas')::int as hour,
          SUM(total) as total
        FROM "Venta"
        WHERE "comercioId" = ${session.user.comercioId} 
          AND "fechaHora" >= ${startDate}::timestamp 
          AND "fechaHora" <= ${endDate}::timestamp
        GROUP BY 1
      `;
      rawHoras.forEach(r => horasMap.set(r.hour, Number(r.total)));

      const horaInicio = 8;
      const horaFin = 20;
      const horasConVentas = Array.from(horasMap.keys());
      const minHora = horasConVentas.length > 0 ? Math.min(...horasConVentas, horaInicio) : horaInicio;
      const maxHora = horasConVentas.length > 0 ? Math.max(...horasConVentas, horaFin) : horaFin;

      for (let h = minHora; h <= maxHora; h++) {
        if (!horasMap.has(h)) horasMap.set(h, 0);
      }

      graficoTendencia = Array.from(horasMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([hora, total]) => {
          const ampm = hora < 12 ? 'am' : 'pm';
          const hora12 = hora % 12 || 12; // 0 se convierte en 12
          const nombreHora = `${hora12} ${ampm}`;
          return { name: nombreHora, total };
        });

    } else if (periodo === 'semana') {
      const hoyVzla = obtenerFechaActualVenezuela();
      const { map: semanaMap, labels } = generarEstructuraSemana(hoyVzla);
      
      const rawDias = await prisma.$queryRaw<Array<{ date: string, total: any }>>`
        SELECT 
          TO_CHAR("fechaHora" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Caracas', 'YYYY-MM-DD') as date,
          SUM(total) as total
        FROM "Venta"
        WHERE "comercioId" = ${session.user.comercioId} 
          AND "fechaHora" >= ${startDate}::timestamp 
          AND "fechaHora" <= ${endDate}::timestamp
        GROUP BY 1
      `;
      rawDias.forEach(r => {
        if (semanaMap.has(r.date)) semanaMap.set(r.date, (semanaMap.get(r.date) || 0) + Number(r.total));
      });
      
      const valores = Array.from(semanaMap.values());
      graficoTendencia = labels.map((dia, index) => ({ name: dia, total: valores[index] }));
    } else {
        const rawMeses = await prisma.$queryRaw<Array<{ date: string, total: any }>>`
          SELECT 
            TO_CHAR("fechaHora" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Caracas', 'DD/MM') as date,
            SUM(total) as total
          FROM "Venta"
          WHERE "comercioId" = ${session.user.comercioId} 
            AND "fechaHora" >= ${startDate}::timestamp 
            AND "fechaHora" <= ${endDate}::timestamp
          GROUP BY 1
          ORDER BY MIN("fechaHora") ASC
        `;
        graficoTendencia = rawMeses.map(r => ({ name: r.date, total: Number(r.total) }));
    }

    const metodosGroup = await prisma.venta.groupBy({
      by: ['metodoPagoId'],
      where: baseWhere,
      _sum: { total: true }
    });
    const dbMetodos = await prisma.metodosPago.findMany();
    const graficoMetodos = metodosGroup
      .map(g => ({
        name: dbMetodos.find(m => m.id === g.metodoPagoId)?.nombre || 'Otro',
        total: g._sum.total || 0
      }))
      .sort((a, b) => b.total - a.total);

    const totalVentas = statsTotales._count.id;
    const totalIngresosUSD = statsTotales._sum.total || 0;
    const totalIngresosBs = statsTotales._sum.totalBs || 0;

    const payload = JSON.stringify({
      periodo: { tipo: periodo, fechaEspecifica: periodo === 'fecha-especifica' ? fecha : null },
      estadisticas: { totalVentas, totalIngresosUSD, totalIngresosBs, totalProductosVendidos },
      graficos: { tendencia: graficoTendencia, metodos: graficoMetodos }
    });

    const compressed = gzipSync(Buffer.from(payload, 'utf-8'));

    return new NextResponse(compressed, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}