import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { id } = await params;

    const pago = await prisma.pagoSuscripcion.findUnique({
      where: { id },
      include: { comercio: true }
    });

    if (!pago) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
        // Si el pago añadió tiempo, lo restamos ahora
        if (pago.meses && pago.meses > 0 && pago.comercio.fechaVencimiento) {
            const fechaActual = new Date(pago.comercio.fechaVencimiento);
            fechaActual.setMonth(fechaActual.getMonth() - pago.meses);
            
            await tx.comercio.update({
                where: { id: pago.comercioId },
                data: { fechaVencimiento: fechaActual }
            });
        }

        // Borramos el registro
        await tx.pagoSuscripcion.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "Pago eliminado y tiempo revertido" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar pago' }, { status: 500 });
  }
}