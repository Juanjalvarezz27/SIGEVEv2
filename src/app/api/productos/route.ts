import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '200');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda correctamente tipadas
    const where: Prisma.ProductoWhereInput = search ? {
      OR: [
        {
          nombre: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        },
      ],
    } : {};

    // Obtener productos con paginación - INCLUYENDO porPeso
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        orderBy: {
          nombre: 'asc',
        },
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

    // Calcular páginas
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      productos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
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