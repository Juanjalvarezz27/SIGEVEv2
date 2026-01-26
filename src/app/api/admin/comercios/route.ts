import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const comercios = await prisma.comercio.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          // AGREGAMOS 'productos: true' AQUÍ
          select: { usuarios: true, ventas: true, productos: true } 
        },
        usuarios: {
            take: 1, 
            // Ordenamos por fecha para intentar agarrar al creador
            select: { id: true, nombre: true, email: true, rol: true }
        }
      }
    });

    return NextResponse.json(comercios);
  } catch (error) {
    return NextResponse.json({ error: 'Error al cargar comercios' }, { status: 500 });
  }
}

// El POST se queda igual, no hace falta tocarlo...
export async function POST(request: Request) {
  // ... (Tu código POST existente)
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const body = await request.json();
    const { nombreComercio, slug, direccion, nombreContacto, telefono, emailUsuario, passwordUsuario } = body;

    if (!nombreComercio || !slug || !emailUsuario || !passwordUsuario) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const existeSlug = await prisma.comercio.findUnique({ where: { slug } });
    if (existeSlug) return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 });

    const existeEmail = await prisma.usuario.findUnique({ where: { email: emailUsuario } });
    if (existeEmail) return NextResponse.json({ error: 'El correo ya existe' }, { status: 400 });

    const rolAdmin = await prisma.rol.findUnique({ where: { nombre: 'ADMIN_COMERCIO' } });
    if (!rolAdmin) return NextResponse.json({ error: 'Falta rol ADMIN_COMERCIO' }, { status: 500 });

    const hashedPassword = await bcrypt.hash(passwordUsuario, 10);

    const nuevoComercio = await prisma.$transaction(async (tx) => {
      const comercio = await tx.comercio.create({
        data: {
          nombre: nombreComercio,
          slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
          direccion,
          nombreContacto,
          telefono,
          emailContacto: emailUsuario,
          estado: 'ACTIVO',
          fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 30))
        }
      });

      await tx.usuario.create({
        data: {
          nombre: nombreContacto || "Admin",
          email: emailUsuario,
          password: hashedPassword,
          rolId: rolAdmin.id,
          comercioId: comercio.id
        }
      });

      return comercio;
    });

    return NextResponse.json({ success: true, comercio: nuevoComercio });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}