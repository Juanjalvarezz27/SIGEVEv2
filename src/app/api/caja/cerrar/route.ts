import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { totalVentas, totalGastos, totalSistema, totalReal, detalles, notas } = body;

    // Calculamos diferencia
    const diferencia = totalReal - totalSistema;

    const cierre = await prisma.cierreCaja.create({
      data: {
        totalVentas,
        totalGastos,
        totalSistema,
        totalReal,
        diferencia,
        detalles, 
        notas,
        comercioId: session.user.comercioId,
        fecha: new Date()
      }
    });

    return NextResponse.json({ success: true, cierreId: cierre.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al cerrar caja' }, { status: 500 });
  }
}