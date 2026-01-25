import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado o sin comercio' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, precio, porPeso, stock } = body; // <--- RECIBIMOS STOCK

    if (!nombre || precio === undefined) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const productoExistente = await prisma.producto.findFirst({
      where: {
        comercioId: session.user.comercioId,
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (productoExistente) {
      return NextResponse.json(
        { error: 'Ya tienes un producto con ese nombre' },
        { status: 400 }
      );
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        porPeso: porPeso ? true : null,
        stock: parseFloat(stock) || 0, // <--- GUARDAMOS STOCK
        comercioId: session.user.comercioId,
      },
    });

    return NextResponse.json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}