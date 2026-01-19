import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

async function obtenerTasaBCV(): Promise<number> {
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.promedio === 'number') {
        return data.promedio;
      }
    }

    const backupResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (backupResponse.ok) {
      const backupData = await backupResponse.json();
      if (backupData?.rates?.VES) {
        return backupData.rates.VES;
      }
    }

    return 300;
  } catch (error) {
    console.error('Error obteniendo tasa BCV:', error);
    return 300;
  }
}

export async function POST(request: Request) {
  try {
    const { productos, metodoPagoId, total, tasaBCV } = await request.json();

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'Debe agregar al menos un producto' },
        { status: 400 }
      );
    }

    if (!metodoPagoId) {
      return NextResponse.json(
        { error: 'Debe seleccionar un método de pago' },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'El total debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const tasaActual = tasaBCV || await obtenerTasaBCV();
    const totalBs = total * tasaActual;

    const venta = await prisma.$transaction(async (tx) => {
      // NOTA: No enviamos fechaHora, se genera automáticamente en la DB con hora de Venezuela
      const nuevaVenta = await tx.venta.create({
        data: {
          total,
          totalBs,
          tasaBCV: tasaActual,
          metodoPagoId: parseInt(metodoPagoId),
          // fechaHora se genera automáticamente con hora de Venezuela desde el schema
        },
      });

      const ventaProductosData = productos.map((producto: any) => {
        let pesoString = null;

        if (producto.peso) {
          const pesoNum = typeof producto.peso === 'string'
            ? parseFloat(producto.peso)
            : Number(producto.peso);

          if (!isNaN(pesoNum)) {
            pesoString = pesoNum.toFixed(3);
          }
        }

        return {
          ventaId: nuevaVenta.id,
          productoId: producto.id,
          cantidad: producto.peso ? 1 : producto.cantidad,
          peso: pesoString,
          precioUnitario: producto.precioUnitario,
          precioUnitarioBs: producto.precioUnitario * tasaActual,
        };
      });

      await tx.ventaProducto.createMany({
        data: ventaProductosData,
      });

      return nuevaVenta;
    });

    return NextResponse.json({
      success: true,
      message: 'Venta registrada exitosamente',
      ventaId: venta.id,
      tasaBCV: tasaActual,
      totalBs,
    });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json(
      { error: 'Error al registrar la venta' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
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

    return NextResponse.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    );
  }
}