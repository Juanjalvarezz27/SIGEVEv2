import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 30; // Paginación de 30 en 30
    const skip = (page - 1) * limit;

    const [cierres, total] = await Promise.all([
      prisma.cierreCaja.findMany({
        where: { comercioId: session.user.comercioId },
        orderBy: { fecha: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.cierreCaja.count({ where: { comercioId: session.user.comercioId } })
    ]);

    return NextResponse.json({
      data: cierres,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}