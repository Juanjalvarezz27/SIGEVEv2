import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      // CORRECCIÓN 1: Cambiamos 'createdAt' por 'nombre'
      // Tu modelo Usuario no tiene fecha de creación, así que ordenamos alfabéticamente.
      orderBy: { nombre: 'asc' }, 
      include: {
        comercio: {
          select: { nombre: true, slug: true, estado: true }
        },
        rol: {
            select: { nombre: true }
        }
      }
    });

    // CORRECCIÓN 2: Al arreglar el orderBy, TypeScript ahora sí reconocerá 'rol' y 'comercio'
    const usuariosSafe = usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol?.nombre || "SIN ROL", // El '?' protege si por alguna razón viniera null
        comercio: u.comercio ? {
            nombre: u.comercio.nombre,
            slug: u.comercio.slug,
            estado: u.comercio.estado
        } : null,
    }));

    return NextResponse.json(usuariosSafe);
  } catch (error) {
    console.error("Error API Usuarios:", error);
    return NextResponse.json({ error: 'Error cargando usuarios' }, { status: 500 });
  }
}