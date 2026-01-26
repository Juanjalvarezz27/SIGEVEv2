import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import bcrypt from 'bcryptjs';

interface Params {
  params: Promise<{ id: string }>;
}

// PUT: ACTUALIZAR DATOS (NOMBRE, EMAIL, PASSWORD)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nombre, email, password } = body;

    // Construimos el objeto de actualización dinámicamente
    // Solo agregamos lo que realmente viene en el body para evitar 'undefined'
    const dataToUpdate: any = {};

    if (nombre) dataToUpdate.nombre = nombre;
    if (email) dataToUpdate.email = email;

    // LÓGICA DE CONTRASEÑA
    // Solo si viene y no está vacía, la encriptamos
    if (password && typeof password === 'string' && password.trim().length > 0) {
        console.log("Encriptando nueva contraseña...");
        dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // VALIDACIÓN DE EMAIL DUPLICADO
    // Si se está cambiando el email, verificamos que no pertenezca a otro
    if (email) {
        const existe = await prisma.usuario.findFirst({
            where: { 
                email: email, 
                NOT: { id: id } // Excluir al usuario actual de la búsqueda
            }
        });
        if (existe) {
            return NextResponse.json({ error: 'El correo ya está en uso por otro usuario' }, { status: 400 });
        }
    }

    // ACTUALIZAR EN BASE DE DATOS
    const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: dataToUpdate
    });

    return NextResponse.json({ success: true, usuario: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email
    }});

  } catch (error) {
    // ESTE LOG TE DIRÁ EXACTAMENTE QUÉ PASÓ EN LA CONSOLA DEL VSCODE
    console.error("❌ Error PUT Usuario:", error);
    return NextResponse.json({ error: 'Error interno al actualizar' }, { status: 500 });
  }
}

// DELETE: ELIMINAR USUARIO
export async function DELETE(request: Request, { params }: Params) {
    try {
        const session = await auth();
        // @ts-ignore
        if (session?.user?.rol !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const { id } = await params;

        // Evitar borrarse a uno mismo
        // @ts-ignore
        if (session.user?.id === id) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
        }

        await prisma.usuario.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Error DELETE Usuario:", error);
        return NextResponse.json({ error: 'Error eliminando usuario' }, { status: 500 });
    }
}