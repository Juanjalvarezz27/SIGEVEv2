import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request: Request) {
  try {
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

    // Validar porPeso si viene (debe ser booleano)
    const porPesoBoolean = porPeso !== undefined ? Boolean(porPeso) : null;

    // Verificar si ya existe un producto con el mismo nombre
    const productoExistente = await prisma.producto.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (productoExistente) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese nombre' },
        { status: 400 }
      );
    }

    // Redondear a 3 decimales para almacenamiento consistente
    const precioRedondeado = Math.round(precioNum * 1000) / 1000;

    // Crear producto
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: nombre.trim(),
        precio: precioRedondeado,
        porPeso: porPesoBoolean,
      },
    });

    return NextResponse.json({
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}