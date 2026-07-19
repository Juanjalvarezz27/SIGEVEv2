import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/src/auth';
import { gzipSync } from 'zlib';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const search = searchParams.get('search') || '';
    const soloDisponibles = searchParams.get('soloDisponibles') === 'true';

    const skip = (page - 1) * limit;

    const where: Prisma.ProductoWhereInput = {
      comercioId: session.user.comercioId,
      activo: true, 
      ...(soloDisponibles ? { stock: { gt: 0 } } : {}),
      ...(search ? {
        OR: [
          { nombre: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      } : {})
    };

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          precio: true,
          porPeso: true,
          unidad: true,
          cantidadBase: true,
          stock: true,
        },
      }),
      prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const payload = JSON.stringify({
      productos,
      pagination: {
        page, limit, total, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

    const compressed = gzipSync(Buffer.from(payload, 'utf-8'));

    return new NextResponse(compressed, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      }
    });

  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const { nombre, precio, porPeso, stock } = body;

        if (!nombre || precio === undefined) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

        // Verificamos si existe uno ACTIVO con ese nombre
        const existente = await prisma.producto.findFirst({
            where: {
                comercioId: session.user.comercioId,
                nombre: { equals: nombre.trim(), mode: 'insensitive' },
                activo: true // Solo nos importa si ya existe uno activo
            }
        });

        if (existente) return NextResponse.json({ error: 'Ya existe un producto activo con ese nombre' }, { status: 400 });

        const producto = await prisma.producto.create({
            data: {
                nombre: nombre.trim(),
                precio: parseFloat(precio),
                porPeso: porPeso ? true : null,
                stock: parseFloat(stock) || 0,
                comercioId: session.user.comercioId,
                activo: true
            }
        });

        return NextResponse.json({ message: 'Creado', producto }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 });
    }
}