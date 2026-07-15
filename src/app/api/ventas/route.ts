import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { productos, metodoPagoId, total: totalFrontend, tasaBCV } = await request.json();

    if (!productos?.length || !metodoPagoId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 1. RECALCULAR TOTAL DESDE BACKEND PARA EVITAR MANIPULACIÓN DEL CLIENTE (Client-Side Trust)
    let totalRealCalculado = 0;
    
    // Obtener precios genuinos desde la BD validando el comercio
    const dbProductos = await prisma.producto.findMany({
      where: {
        id: { in: productos.map((p: any) => p.id) },
        comercioId: session.user.comercioId! 
      }
    });

    if (dbProductos.length !== productos.length) {
      return NextResponse.json({ error: 'Uno o más productos no existen o no le pertenecen' }, { status: 403 });
    }

    // Mapeo rápido para calcular
    const preciosReales = new Map(dbProductos.map(p => [p.id, p.precio]));

    for (const p of productos) {
        const cantidad = p.peso ? parseFloat(p.peso) : p.cantidad;
        if (cantidad <= 0) return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
        const precioGenuino = preciosReales.get(p.id) || 0;
        totalRealCalculado += precioGenuino * cantidad;
    }

    const totalBs = totalRealCalculado * (tasaBCV || 0);

    const venta = await prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.venta.create({
        data: {
          total: totalRealCalculado,
          totalBs,
          tasaBCV: tasaBCV || 0,
          metodoPagoId: metodoPagoId,
          comercioId: session.user.comercioId!,
        },
      });

      // Procesar productos y restar stock
      for (const p of productos) {
        const cantidadDescontar = p.peso ? parseFloat(p.peso) : p.cantidad;
        const precioGenuino = preciosReales.get(p.id) || 0;

        await tx.ventaProducto.create({
          data: {
            ventaId: nuevaVenta.id,
            productoId: p.id,
            cantidad: p.cantidad,
            peso: p.peso ? p.peso.toString() : null,
            precioUnitario: precioGenuino,
            precioUnitarioBs: precioGenuino * (tasaBCV || 0),
          }
        });

        // RESTAR STOCK
        await tx.producto.update({
          where: { id: p.id },
          data: { stock: { decrement: cantidadDescontar } }
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({ success: true, ventaId: venta.id });

  } catch (error: any) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}