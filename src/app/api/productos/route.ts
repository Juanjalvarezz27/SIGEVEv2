import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/src/auth'; 

export async function GET(request: Request) {
  try {
    // 1. SEGURIDAD: Verificar sesión
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30'); // Ajusté a 30 por defecto
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // 2. FILTRADO: Solo productos de ESTE comercio
    const where: Prisma.ProductoWhereInput = {
      comercioId: session.user.comercioId,
      ...(search ? {
        OR: [
          {
            nombre: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
        ],
      } : {})
    };

    // Obtener productos y total
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
        },
      }),
      prisma.producto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      productos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
