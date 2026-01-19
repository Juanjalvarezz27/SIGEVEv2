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
      include: {
        metodoPago: true,
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                precio: true,
                porPeso: true,
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

    return NextResponse.json({
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
      ventas: ventas.map(venta => ({
        id: venta.id,
        total: venta.total,
        totalBs: venta.totalBs,
        tasaBCV: venta.tasaBCV,
        fechaHora: venta.fechaHora.toISOString(),
        metodoPagoId: venta.metodoPagoId,
        metodoPago: {
          id: venta.metodoPago.id,
          nombre: venta.metodoPago.nombre,
        },
        productos: venta.productos.map(prod => ({
          id: prod.id,
          ventaId: prod.ventaId,
          productoId: prod.productoId,
          cantidad: prod.cantidad,
          peso: prod.peso,
          precioUnitario: prod.precioUnitario,
          precioUnitarioBs: prod.precioUnitarioBs,
          producto: {
            id: prod.producto.id,
            nombre: prod.producto.nombre,
            precio: prod.producto.precio,
            porPeso: prod.producto.porPeso,
          },
        })),
      })),
    });

  } catch (error: any) {
    console.error('Error obteniendo ventas detalladas:', error);
    
    if (error.message.includes('personalizado')) {
      return NextResponse.json(
        { error: 'Para período personalizado se requieren fechaInicio y fechaFin' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al obtener ventas detalladas' },
      { status: 500 }
    );
  }
}