import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';

const prisma = new PrismaClient();

// Función para convertir fecha YYYY-MM-DD a inicio del día en Venezuela (UTC)
function obtenerInicioDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  // Venezuela UTC-4: 00:00 Venezuela = 04:00 UTC
  return new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0));
}

// Función para convertir fecha YYYY-MM-DD a fin del día en Venezuela (UTC)
function obtenerFinDiaVenezuelaUTC(fechaString: string): Date {
  const [year, month, day] = fechaString.split('-').map(Number);
  // Venezuela UTC-4: 23:59:59.999 Venezuela = 03:59:59.999 UTC del día siguiente
  return new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999));
}

// Función para obtener fecha actual en formato YYYY-MM-DD (hora Venezuela)
function obtenerFechaActualVenezuela(): string {
  const ahora = new Date();
  const fechaVenezuela = new Date(ahora.toLocaleString('en-US', {
    timeZone: 'America/Caracas'
  }));
  
  const year = fechaVenezuela.getFullYear();
  const month = String(fechaVenezuela.getMonth() + 1).padStart(2, '0');
  const day = String(fechaVenezuela.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Función principal para obtener fechas del período
function obtenerFechasPeriodo(periodo: string, fechaEspecifica?: string) {
  console.log('=== OBTENIENDO FECHAS PARA PERÍODO ===');
  console.log('Período:', periodo);
  console.log('Fecha específica recibida:', fechaEspecifica);

  let startDate: Date;
  let endDate: Date;

  const hoyVenezuela = obtenerFechaActualVenezuela();
  console.log('Hoy en Venezuela:', hoyVenezuela);

  switch (periodo) {
    case 'hoy': {
      startDate = obtenerInicioDiaVenezuelaUTC(hoyVenezuela);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
    
    case 'ayer': {
      const hoy = new Date();
      const ayer = subDays(hoy, 1);
      const fechaAyerVenezuela = new Date(ayer.toLocaleString('en-US', {
        timeZone: 'America/Caracas'
      }));
      
      const year = fechaAyerVenezuela.getFullYear();
      const month = String(fechaAyerVenezuela.getMonth() + 1).padStart(2, '0');
      const day = String(fechaAyerVenezuela.getDate()).padStart(2, '0');
      const fechaAyer = `${year}-${month}-${day}`;
      
      startDate = obtenerInicioDiaVenezuelaUTC(fechaAyer);
      endDate = obtenerFinDiaVenezuelaUTC(fechaAyer);
      break;
    }
    
    case 'semana': {
      const hoy = new Date();
      const hoyVenezuelaDate = new Date(hoy.toLocaleString('en-US', {
        timeZone: 'America/Caracas'
      }));
      
      const lunes = startOfWeek(hoyVenezuelaDate, { weekStartsOn: 1 });
      const yearInicio = lunes.getFullYear();
      const monthInicio = String(lunes.getMonth() + 1).padStart(2, '0');
      const dayInicio = String(lunes.getDate()).padStart(2, '0');
      const fechaInicio = `${yearInicio}-${monthInicio}-${dayInicio}`;
      
      startDate = obtenerInicioDiaVenezuelaUTC(fechaInicio);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
    
    case 'mes': {
      const hoy = new Date();
      const hoyVenezuelaDate = new Date(hoy.toLocaleString('en-US', {
        timeZone: 'America/Caracas'
      }));
      
      const primerDiaMes = startOfMonth(hoyVenezuelaDate);
      const yearInicio = primerDiaMes.getFullYear();
      const monthInicio = String(primerDiaMes.getMonth() + 1).padStart(2, '0');
      const dayInicio = String(primerDiaMes.getDate()).padStart(2, '0');
      const fechaInicio = `${yearInicio}-${monthInicio}-${dayInicio}`;
      
      startDate = obtenerInicioDiaVenezuelaUTC(fechaInicio);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
    
    case 'fecha-especifica': {
      if (!fechaEspecifica) {
        fechaEspecifica = hoyVenezuela;
      }
      
      console.log('Procesando fecha específica:', fechaEspecifica);
      startDate = obtenerInicioDiaVenezuelaUTC(fechaEspecifica);
      endDate = obtenerFinDiaVenezuelaUTC(fechaEspecifica);
      break;
    }
    
    default: {
      startDate = obtenerInicioDiaVenezuelaUTC(hoyVenezuela);
      endDate = obtenerFinDiaVenezuelaUTC(hoyVenezuela);
      break;
    }
  }

  console.log('Rango calculado (UTC):');
  console.log('Inicio:', startDate.toISOString());
  console.log('Fin:', endDate.toISOString());
  console.log('Inicio en Venezuela:', new Date(startDate).toLocaleString('es-VE', { timeZone: 'America/Caracas' }));
  console.log('Fin en Venezuela:', new Date(endDate).toLocaleString('es-VE', { timeZone: 'America/Caracas' }));

  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'hoy';
    const fecha = searchParams.get('fecha');

    console.log('\n=== SOLICITUD ESTADÍSTICAS ===');
    console.log('Parámetros recibidos:');
    console.log('- Periodo:', periodo);
    console.log('- Fecha:', fecha || 'No especificada');

    let startDate: Date;
    let endDate: Date;

    try {
      const fechas = obtenerFechasPeriodo(periodo, fecha || undefined);
      startDate = fechas.startDate;
      endDate = fechas.endDate;
      
      console.log('\nRango de búsqueda en base de datos:');
      console.log('Inicio:', startDate.toISOString());
      console.log('Fin:', endDate.toISOString());

    } catch (error: any) {
      console.error('Error obteniendo fechas del período:', error);
      return NextResponse.json(
        { error: 'Error al procesar las fechas' },
        { status: 400 }
      );
    }

    // Obtener ventas en el rango de fechas
    const ventas = await prisma.venta.findMany({
      where: {
        fechaHora: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        productos: {
          include: {
            producto: true,
          }
        },
        metodoPago: true,
      },
      orderBy: {
        fechaHora: 'desc',
      },
    });

    console.log('\n=== RESULTADOS DE CONSULTA ===');
    console.log('Total ventas encontradas:', ventas.length);
    
    if (ventas.length > 0) {
      ventas.forEach((venta, index) => {
        const fechaVenta = new Date(venta.fechaHora);
        console.log(`\nVenta ${index + 1} (ID: ${venta.id}):`);
        console.log('Fecha Venezuela:', fechaVenta.toLocaleString('es-VE', { timeZone: 'America/Caracas' }));
        console.log('Total USD:', venta.total);
        console.log('Productos:', venta.productos.length);
      });
    }

    // Calcular estadísticas
    const totalVentas = ventas.length;
    const totalIngresosUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalIngresosBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0);
    const totalProductosVendidos = ventas.reduce((sum, venta) => {
      return sum + venta.productos.reduce((prodSum, prod) => prodSum + prod.cantidad, 0);
    }, 0);

    return NextResponse.json({
      periodo: {
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
        tipo: periodo,
        fechaEspecifica: periodo === 'fecha-especifica' ? fecha : null,
        zonaHoraria: 'America/Caracas',
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
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}