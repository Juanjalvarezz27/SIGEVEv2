import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const gastos = await prisma.gasto.findMany({
      where: {
        comercioId: session.user.comercioId
      },
      orderBy: { fecha: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.gasto.count({
      where: { comercioId: session.user.comercioId }
    });

    return NextResponse.json({
      data: gastos,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching historial gastos:', error);
    return NextResponse.json({ error: 'Error cargando historial de gastos' }, { status: 500 });
  }
}
