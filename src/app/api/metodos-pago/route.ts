import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const metodosPago = await prisma.metodosPago.findMany({
      where: { comercioId: session.user.comercioId }, 
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(metodosPago);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}