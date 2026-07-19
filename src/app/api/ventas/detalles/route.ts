import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  subDays
} from 'date-fns';
import { gzipSync } from 'zlib';

const prisma = new PrismaClient();

// Función para ajustar fecha a hora de Venezuela
function ajustarFechaAVenezuela(fecha: Date): Date {
  return new Date(fecha.toLocaleString('en-US', {
    timeZone: 'America/Caracas'
  }));
}

// Función para obtener fechas en diferentes períodos (hora de Venezuela)
function obtenerFechasPeriodo(periodo: string, fechaInicio?: string, fechaFin?: string) {
  const hoyVenezuela = ajustarFechaAVenezuela(new Date());
  let startDate: Date;
  let endDate: Date;

  switch (periodo) {
    case 'hoy': {
      startDate = startOfDay(hoyVenezuela);
      endDate = endOfDay(hoyVenezuela);
      break;
    }
    case 'ayer': {
      const ayerVenezuela = subDays(hoyVenezuela, 1);
      startDate = startOfDay(ayerVenezuela);
      endDate = endOfDay(ayerVenezuela);
      break;
    }
    case 'semana': {
      // Semana comienza el lunes (weekStartsOn: 1)
      startDate = startOfWeek(hoyVenezuela, { weekStartsOn: 1 });
      endDate = endOfDay(hoyVenezuela);
      break;
    }
    case 'mes': {
      startDate = startOfMonth(hoyVenezuela);
      endDate = endOfDay(hoyVenezuela);
      break;
    }
    case 'personalizado': {
      if (!fechaInicio || !fechaFin) {
        throw new Error('Para período personalizado se requieren fechaInicio y fechaFin');
      }
      
      // Ajustar fechas proporcionadas a hora de Venezuela
      startDate = ajustarFechaAVenezuela(new Date(fechaInicio));
      startDate.setHours(0, 0, 0, 0);
      
      endDate = ajustarFechaAVenezuela(new Date(fechaFin));
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    default: {
      startDate = startOfDay(hoyVenezuela);
      endDate = endOfDay(hoyVenezuela);
      break;
    }
  }

  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'hoy';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    // Obtener fechas del período en hora de Venezuela
    const { startDate, endDate } = obtenerFechasPeriodo(periodo, fechaInicio || undefined, fechaFin || undefined);

    // Obtener ventas detalladas en el rango de fechas
    const ventas = await prisma.venta.findMany({
      where: {
        fechaHora: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        total: true,
        totalBs: true,
        tasaBCV: true,
        fechaHora: true,
        metodoPagoId: true,
        metodoPago: {
          select: {
            id: true,
            nombre: true,
          }
        },
        productos: {
          select: {
            id: true,
            ventaId: true,
            productoId: true,
            cantidad: true,
            peso: true,
            precioUnitario: true,
            precioUnitarioBs: true,
            producto: {
              select: {
                id: true,
                nombre: true,
                precio: true,
                porPeso: true,
                unidad: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaHora: 'desc',
      },
    });

    // Calcular estadísticas del período
    const totalVentas = ventas.length;
    const totalIngresosUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const totalIngresosBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0);
    const totalProductosVendidos = ventas.reduce((sum, venta) => {
      return sum + venta.productos.reduce((prodSum, prod) => prodSum + prod.cantidad, 0);
    }, 0);

    const payload = JSON.stringify({
      periodo: {
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
        tipo: periodo,
      },
      estadisticas: {
        totalVentas,
        totalIngresosUSD,
        totalIngresosBs,
        totalProductosVendidos,
      },
      ventas: ventas,
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
    console.error('Error obteniendo ventas detalladas:', error);
    
    if (error.message.includes('personalizado')) {
      return NextResponse.json({ error: error.message || 'Para período personalizado se requieren fechaInicio y fechaFin' }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Error al obtener ventas detalladas' },
      { status: 500 }
    );
  }
}