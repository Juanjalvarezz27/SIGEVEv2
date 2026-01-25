import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT: ACTUALIZAR DATOS O RENOVAR SUSCRIPCIÓN
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { accion, meses } = body; 

    // CASO 1: RENOVAR SUSCRIPCIÓN
    if (accion === 'RENOVAR') {
       const mesesSumar = parseInt(meses) || 1;
       const comercio = await prisma.comercio.findUnique({ where: { id } });
       if (!comercio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

       // Si ya venció, sumamos desde HOY. Si no ha vencido, sumamos a la fecha actual de vencimiento.
       const baseDate = (comercio.fechaVencimiento && comercio.fechaVencimiento > new Date()) 
            ? comercio.fechaVencimiento 
            : new Date();
       
       const nuevaFecha = new Date(baseDate);
       nuevaFecha.setMonth(nuevaFecha.getMonth() + mesesSumar);

       const actualizado = await prisma.comercio.update({
         where: { id },
         data: {
            fechaVencimiento: nuevaFecha,
            estado: 'ACTIVO' // Reactivamos si estaba suspendido
         }
       });

       // Aquí podrías registrar el pago en la tabla PagoSuscripcion si quisieras
       return NextResponse.json({ success: true, comercio: actualizado });
    }

    // CASO 2: CAMBIAR ESTADO (SUSPENDER/ACTIVAR MANUAL)
    if (body.estado) {
        const actualizado = await prisma.comercio.update({
            where: { id },
            data: { estado: body.estado }
        });
        return NextResponse.json({ success: true, comercio: actualizado });
    }

    // CASO 3: EDITAR INFO GENERAL
    const { nombre, telefono, direccion } = body;
    const actualizado = await prisma.comercio.update({
        where: { id },
        data: { nombre, telefono, direccion }
    });

    return NextResponse.json({ success: true, comercio: actualizado });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: ELIMINAR COMERCIO (PELIGROSO)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

        const { id } = await params;
        
        await prisma.usuario.deleteMany({ where: { comercioId: id } }); // Borrar usuarios
        await prisma.comercio.delete({ where: { id } }); // Borrar comercio

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error eliminando' }, { status: 500 });
    }
}