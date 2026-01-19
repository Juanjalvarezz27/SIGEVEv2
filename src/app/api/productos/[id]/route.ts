import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Obtener un producto específico
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar producto
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { nombre, precio, porPeso } = body;

    // Validar datos
    if (!nombre || precio === undefined) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato decimal (hasta 3 decimales)
    const precioRegex = /^\d+(\.\d{1,3})?$/;
    if (!precioRegex.test(precio.toString())) {
      return NextResponse.json(
        { error: 'El precio debe tener hasta 3 decimales' },
        { status: 400 }
      );
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return NextResponse.json(
        { error: 'El precio debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    // Validar porPeso (simplificado)
    // Si porPeso es true → true, si es false/null → null
    const porPesoBoolean = porPeso === true ? true : null;

    // Verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro producto con el mismo nombre
    const productoConMismoNombre = await prisma.producto.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        },
        NOT: {
          id: productoId
        }
      }
    });

    if (productoConMismoNombre) {
      return NextResponse.json(
        { error: 'Ya existe otro producto con ese nombre' },
        { status: 400 }
      );
    }

    // Redondear a 3 decimales para almacenamiento consistente
    const precioRedondeado = Math.round(precioNum * 1000) / 1000;

    // Actualizar producto
    const productoActualizado = await prisma.producto.update({
      where: { id: productoId },
      data: {
        nombre: nombre.trim(),
        precio: precioRedondeado,
        porPeso: porPesoBoolean,
      },
    });

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar producto
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar si el producto existe
    const productoExistente = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!productoExistente) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el producto está en ventas
    const ventasProducto = await prisma.ventaProducto.findFirst({
      where: { productoId: productoId },
    });

    if (ventasProducto) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque está asociado a ventas' },
        { status: 400 }
      );
    }

    // Eliminar producto
    await prisma.producto.delete({
      where: { id: productoId },
    });

    return NextResponse.json(
      { message: 'Producto eliminado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}