import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const session = await auth();
        if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { nombre, precio, porPeso, stock } = body;

    // VALIDACIÓN IDOR: El producto debe existir y pertenecer al comercio de la sesión
    const productoExistente = await prisma.producto.findFirst({
        where: { id, comercioId: session.user.comercioId! }
    });
    if (!productoExistente) return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });

    // VALIDACIÓN NEGATIVOS
    const nuevoPrecio = parseFloat(precio);
    const nuevoStock = parseFloat(stock) || 0;
    if (nuevoPrecio < 0 || nuevoStock < 0) return NextResponse.json({ error: 'Valores negativos no permitidos' }, { status: 400 });

    const actualizado = await prisma.producto.update({
        where: { id },
        data: {
            nombre: nombre.trim(),
            precio: nuevoPrecio,
            porPeso: porPeso ? true : null,
            stock: nuevoStock,
        },
    });
    return NextResponse.json({ message: 'Actualizado', producto: actualizado });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}

// DELETE INTELIGENTE: Archivar o Borrar
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;

    // VALIDACIÓN IDOR: El producto debe existir y pertenecer al comercio de la sesión
    const productoExistente = await prisma.producto.findFirst({
        where: { id, comercioId: session.user.comercioId! }
    });
    if (!productoExistente) return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 403 });

    // 1. Verificar si tiene ventas asociadas
    const ventas = await prisma.ventaProducto.findFirst({
      where: { productoId: id }
    });

    if (ventas) {
      await prisma.producto.update({
        where: { id },
        data: { activo: false, nombre: `${id}_ARCHIVADO` } // Cambiamos nombre para liberar el original si quieren crearlo de nuevo
      });
      return NextResponse.json({ message: 'Producto archivado (tenía ventas)' });
    } else {
      // CASO B: ESTÁ LIMPIO -> BORRADO REAL
      await prisma.producto.delete({ where: { id } });
      return NextResponse.json({ message: 'Producto eliminado permanentemente' });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}