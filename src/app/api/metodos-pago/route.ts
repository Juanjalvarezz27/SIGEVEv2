import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const metodosPago = await prisma.metodosPago.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(metodosPago);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    return NextResponse.json(
      { error: 'Error al obtener métodos de pago' },
      { status: 500 }
    );
  }
}