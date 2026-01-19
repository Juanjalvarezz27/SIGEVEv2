import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// Función para obtener fechas en hora de Venezuela
function obtenerFechasVenezuela() {
  const ahora = new Date();
  
  // Convertir a hora de Venezuela
  const ahoraVenezuela = new Date(ahora.toLocaleString('en-US', {
    timeZone: 'America/Caracas'
  }));
  
  // Ajustar al día actual en Venezuela
  const inicioDia = new Date(ahoraVenezuela);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(ahoraVenezuela);
  finDia.setHours(23, 59, 59, 999);
  
  return { inicioDia, finDia, ahoraVenezuela };
}

export async function GET() {
  try {
    const { inicioDia, finDia, ahoraVenezuela } = obtenerFechasVenezuela();

    const ventas = await prisma.venta.findMany({
      where: {
        fechaHora: {
          gte: inicioDia,
          lt: finDia,
        },
      },
      include: {
        metodoPago: true,
        productos: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fechaHora: 'desc',
      },
    });

    return NextResponse.json({
      ventas,
      estadisticas: {
        totalVentas: ventas.length,
        totalIngresos: ventas.reduce((sum, venta) => sum + venta.total, 0),
        totalIngresosBs: ventas.reduce((sum, venta) => sum + venta.totalBs, 0),
        productosVendidos: ventas.reduce((sum, venta) => {
          return sum + venta.productos.reduce((prodSum, prod) => prodSum + prod.cantidad, 0);
        }, 0),
        fecha: ahoraVenezuela.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error al obtener ventas de hoy:', error);
    return NextResponse.json(
      { error: 'Error al obtener ventas de hoy' },
      { status: 500 }
    );
  }
}