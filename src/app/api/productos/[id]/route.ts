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

        const actualizado = await prisma.producto.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                precio: parseFloat(precio),
                porPeso: porPeso ? true : null,
                stock: parseFloat(stock) || 0,
            },
        });
        return NextResponse.json({ message: 'Actualizado', producto: actualizado });
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// DELETE INTELIGENTE: Archivar o Borrar
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;

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

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}