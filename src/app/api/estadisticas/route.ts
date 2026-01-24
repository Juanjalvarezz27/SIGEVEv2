import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';


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

    let startDate: Date;
    let endDate: Date;
    try {
      const fechas = obtenerFechasPeriodo(periodo, fecha || undefined);
      startDate = fechas.startDate;
      endDate = fechas.endDate;
    } catch (error) {
      return NextResponse.json({ error: 'Error procesando fechas' }, { status: 400 });
    }

    const ventas = await prisma.venta.findMany({
      where: {
        comercioId: session.user.comercioId,
        fechaHora: { gte: startDate, lte: endDate },
      },
      include: {
        productos: { include: { producto: true } },
        metodoPago: true,
        deuda: true,
      },
      orderBy: { fechaHora: 'asc' },
    });

    // --- PROCESAMIENTO GRÁFICOS ---
    let graficoTendencia = [];
    const esDiaUnico = periodo === 'hoy' || periodo === 'ayer' || periodo === 'fecha-especifica';

    if (esDiaUnico) {
      const horasMap = new Map<number, number>();
      
      ventas.forEach(v => {
        const fechaObj = new Date(v.fechaHora);

        // Convertimos la hora UTC a Hora Venezuela (-4 horas) manualmente
        // O usamos Intl para extraer la hora exacta en la zona horaria correcta
        
        const horaString = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: 'America/Caracas'
        }).format(fechaObj);

        // horaString puede ser "09", "13", "24" (si es medianoche 24h, ojo con formato)
        // Parseamos a entero
        const horaVzla = parseInt(horaString, 10);
        
        // Ajuste por si acaso Intl devuelve 24
        const horaFinal = horaVzla === 24 ? 0 : horaVzla;

        horasMap.set(horaFinal, (horasMap.get(horaFinal) || 0) + v.total);
      });

      const horaInicio = 8;
      const horaFin = 20;
      // Ajustamos para incluir las horas reales encontradas
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
      
      ventas.forEach(v => {
        // También aseguramos usar la fecha en zona horaria Vzla para la semana
        const formato = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            timeZone: 'America/Caracas'
        });
        const [y, m, d] = formato.format(new Date(v.fechaHora)).split('-');
        const key = `${y}-${m}-${d}`;
        
        if (semanaMap.has(key)) semanaMap.set(key, (semanaMap.get(key) || 0) + v.total);
      });
      
      const valores = Array.from(semanaMap.values());
      graficoTendencia = labels.map((dia, index) => ({ name: dia, total: valores[index] }));
    } else {
        // MES (También ajustar zona horaria)
        const ventasMap = new Map<string, number>();
        ventas.forEach(v => {
            const formato = new Intl.DateTimeFormat('en-CA', {
                month: '2-digit', day: '2-digit',
                timeZone: 'America/Caracas'
            });
            // formato devuelve "MM-DD" o "YYYY-MM-DD" dependiendo de config, en en-CA suele ser YYYY-MM-DD
            // Aseguramos formato manual con partes
            const fechaVzla = new Date(v.fechaHora).toLocaleDateString('es-VE', {timeZone: 'America/Caracas', day: '2-digit', month:'2-digit'});
            // fechaVzla es "DD/MM"
            const key = fechaVzla; 
            
            ventasMap.set(key, (ventasMap.get(key) || 0) + v.total);
        });
        graficoTendencia = Array.from(ventasMap.entries()).map(([name, total]) => ({ name, total }));
    }

    const metodosMap = new Map<string, number>();
    ventas.forEach(venta => {
      const metodo = venta.metodoPago.nombre;
      metodosMap.set(metodo, (metodosMap.get(metodo) || 0) + venta.total);
    });
    const graficoMetodos = Array.from(metodosMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const totalVentas = ventas.length;
    const totalIngresosUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalIngresosBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0);
    const totalProductosVendidos = ventas.reduce((sum, venta) =>
      sum + venta.productos.reduce((prodSum, prod) => prodSum + (prod.producto.porPeso ? 1 : prod.cantidad), 0), 0);

    return NextResponse.json({
      periodo: { tipo: periodo, fechaEspecifica: periodo === 'fecha-especifica' ? fecha : null },
      estadisticas: { totalVentas, totalIngresosUSD, totalIngresosBs, totalProductosVendidos },
      graficos: { tendencia: graficoTendencia, metodos: graficoMetodos },
      ventasDetalladas: ventas.reverse(),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}