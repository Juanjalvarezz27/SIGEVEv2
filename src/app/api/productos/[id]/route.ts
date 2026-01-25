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
    const { nombre, precio, porPeso, stock } = body; // <--- RECIBIMOS STOCK

    const productoExistente = await prisma.producto.findFirst({
      where: {
        id: id,
        comercioId: session.user.comercioId
      },
    });

    if (!productoExistente) {
      return NextResponse.json({ error: 'Producto no encontrado o acceso denegado' }, { status: 404 });
    }

    const duplicado = await prisma.producto.findFirst({
      where: {
        comercioId: session.user.comercioId,
        nombre: { equals: nombre.trim(), mode: 'insensitive' },
        NOT: { id: id }
      }
    });

    if (duplicado) {
      return NextResponse.json({ error: 'Ya existe otro producto con ese nombre' }, { status: 400 });
    }

    const actualizado = await prisma.producto.update({
      where: { id: id },
      data: {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        porPeso: porPeso ? true : null,
        stock: parseFloat(stock) || 0, // <--- ACTUALIZAMOS STOCK
      },
    });

    return NextResponse.json({ message: 'Actualizado', producto: actualizado });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;

    const producto = await prisma.producto.findFirst({
      where: { id: id, comercioId: session.user.comercioId }
    });

    if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const ventas = await prisma.ventaProducto.findFirst({
      where: { productoId: id }
    });

    if (ventas) {
      return NextResponse.json({ error: 'No se puede eliminar: tiene ventas asociadas' }, { status: 400 });
    }

    await prisma.producto.delete({ where: { id } });

    return NextResponse.json({ message: 'Eliminado' });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}