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

    // Transacción para asegurar consistencia
    const venta = await prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.venta.create({
        data: {
          total,
          totalBs,
          tasaBCV: tasaBCV || 0,
          metodoPagoId: metodoPagoId, // ID string
          comercioId: session.user.comercioId!,
          fechaHora: new Date(), 
        },
      });

      const itemsVenta = productos.map((p: any) => ({
        ventaId: nuevaVenta.id,
        productoId: p.id,
        cantidad: p.cantidad,
        peso: p.peso ? p.peso.toString() : null,
        
        // --- CORRECCIÓN AQUÍ ---
        precioUnitario: p.precioUnitario, 
        
        // Esto estaba bien, por eso sí calculaba los Bs
        precioUnitarioBs: p.precioUnitario * (tasaBCV || 0),
      }));

      await tx.ventaProducto.createMany({ data: itemsVenta });

      return nuevaVenta;
    });

    return NextResponse.json({ success: true, ventaId: venta.id });

  } catch (error) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}