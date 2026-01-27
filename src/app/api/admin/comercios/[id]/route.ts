import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    
    // --- LÓGICA DE RENOVACIÓN + PAGO ---
    if (body.accion === 'RENOVAR') {
       const { meses, monto, metodo, referencia, nota } = body; 
       
       const mesesSumar = parseInt(meses) || 1;
       const comercio = await prisma.comercio.findUnique({ where: { id } });
       if (!comercio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

       // 1. Calcular Nueva Fecha
       const baseDate = (comercio.fechaVencimiento && comercio.fechaVencimiento > new Date()) 
            ? comercio.fechaVencimiento : new Date();
       const nuevaFecha = new Date(baseDate);
       nuevaFecha.setMonth(nuevaFecha.getMonth() + mesesSumar);

       // 2. Transacción: Actualizar fecha + Guardar dinero
       await prisma.$transaction(async (tx) => {
          // A. Actualizar Comercio
          await tx.comercio.update({
             where: { id },
             data: { 
                fechaVencimiento: nuevaFecha, 
                estado: 'ACTIVO',
                ultimoPago: new Date()
             }
          });

          // B. Crear Registro Contable (Solo si es ingreso positivo y hay monto)
          if (mesesSumar > 0 && monto && parseFloat(monto) > 0) {
              await tx.pagoSuscripcion.create({
                  data: {
                      comercioId: id,
                      monto: parseFloat(monto),
                      metodo: metodo || 'OTRO',
                      referencia: referencia || 'N/A',
                      nota: nota || `Renovación por ${mesesSumar} mes(es)`,
                      meses: mesesSumar, // Guardamos cuántos meses se pagaron
                      fecha: new Date()
                  }
              });
          }
       });

       return NextResponse.json({ success: true, nuevaFecha });
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
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: Borrado total (Comercio + Pagos + Usuarios)
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

        const { id } = await params;

        await prisma.$transaction(async (tx) => {
            // Borrar Pagos Históricos primero para evitar error de FK
            await tx.pagoSuscripcion.deleteMany({ where: { comercioId: id } });
            
            await tx.usuario.deleteMany({ where: { comercioId: id } });
            await tx.comercio.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
}