import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { descripcion, monto, montoBs, tasaBCV } = await req.json();

    if (!descripcion || !monto) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    const gasto = await prisma.gasto.create({
      data: {
        descripcion,
        monto: parseFloat(monto),
        montoBs: montoBs ? parseFloat(montoBs) : null,
        tasaBCV: tasaBCV ? parseFloat(tasaBCV) : null,
        comercioId: session.user.comercioId,
        fecha: new Date() // Hora UTC exacta
      }
    });

    return NextResponse.json(gasto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creando gasto' }, { status: 500 });
  }
}