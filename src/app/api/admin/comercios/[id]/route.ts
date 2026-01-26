import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT: Renovación y Edición (Se mantiene lógica simple)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    
    // RENOVAR
    if (body.accion === 'RENOVAR') {
       const { meses } = body; 
       const mesesSumar = parseInt(meses) || 1;
       const comercio = await prisma.comercio.findUnique({ where: { id } });
       if (!comercio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

       const baseDate = (comercio.fechaVencimiento && comercio.fechaVencimiento > new Date()) 
            ? comercio.fechaVencimiento : new Date();
       const nuevaFecha = new Date(baseDate);
       nuevaFecha.setMonth(nuevaFecha.getMonth() + mesesSumar);

       const actualizado = await prisma.comercio.update({
             where: { id },
             data: { fechaVencimiento: nuevaFecha, estado: 'ACTIVO' }
       });
       return NextResponse.json({ success: true, comercio: actualizado });
    }

    // CAMBIAR ESTADO
    if (body.estado) {
        const actualizado = await prisma.comercio.update({
            where: { id }, data: { estado: body.estado }
        });
        return NextResponse.json({ success: true, comercio: actualizado });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: ELIMINACIÓN TOTAL (CASCADA MANUAL)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

        const { id } = await params;

        // EJECUTAMOS EN TRANSACCIÓN PARA QUE SE BORRE TODO O NADA
        await prisma.$transaction(async (tx) => {
            // 1. Borrar Usuarios del comercio (incluido el dueño)
            await tx.usuario.deleteMany({ where: { comercioId: id } });
            
            // 2. Borrar Ventas, Productos, Clientes, etc. (Opcional si tienes onCascade en schema, pero mejor asegurar)

            // 3. Finalmente borrar el Comercio
            await tx.comercio.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error eliminando comercio:", error);
        // Si falla por Foreign Key constraints y no tienes Cascade en schema:
        return NextResponse.json({ error: 'No se puede eliminar: Tiene datos asociados (Ventas/Productos).' }, { status: 500 });
    }
}