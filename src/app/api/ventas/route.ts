import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productos, metodoPagoId, total, tasaBCV } = await request.json();

    if (!productos?.length || !metodoPagoId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const totalBs = total * (tasaBCV || 0);

    const venta = await prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.venta.create({
        data: {
          total,
          totalBs,
          tasaBCV: tasaBCV || 0,
          metodoPagoId: metodoPagoId,
          comercioId: session.user.comercioId!,
          fechaHora: new Date(),
        },
      });

      // Procesar productos y restar stock
      for (const p of productos) {
        await tx.ventaProducto.create({
            data: {
                ventaId: nuevaVenta.id,
                productoId: p.id,
                cantidad: p.cantidad,
                peso: p.peso ? p.peso.toString() : null,
                precioUnitario: p.precioUnitario,
                precioUnitarioBs: p.precioUnitario * (tasaBCV || 0),
            }
        });

        // RESTAR STOCK
        const cantidadARestar = p.peso ? parseFloat(p.peso) : p.cantidad;
        await tx.producto.update({
            where: { id: p.id },
            data: { stock: { decrement: cantidadARestar } }
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({ success: true, ventaId: venta.id });

  } catch (error) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}