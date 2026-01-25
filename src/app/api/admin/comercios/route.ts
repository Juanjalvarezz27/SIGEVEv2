import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import bcrypt from 'bcryptjs';

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
          select: { usuarios: true, ventas: true } 
        }
      }
    });

    return NextResponse.json(comercios);
  } catch (error) {
    return NextResponse.json({ error: 'Error al cargar comercios' }, { status: 500 });
  }
}

// POST: CREAR COMERCIO + USUARIO DUEÑO (TODO EN UNO)
export async function POST(request: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      nombreComercio, 
      slug, 
      direccion, 
      nombreContacto, 
      telefono, 
      emailUsuario, 
      passwordUsuario 
    } = body;

    // Validaciones básicas
    if (!nombreComercio || !slug || !emailUsuario || !passwordUsuario) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // Verificar slug único
    const existeSlug = await prisma.comercio.findUnique({ where: { slug } });
    if (existeSlug) return NextResponse.json({ error: 'El identificador (slug) ya existe' }, { status: 400 });

    // Verificar email único
    const existeEmail = await prisma.usuario.findUnique({ where: { email: emailUsuario } });
    if (existeEmail) return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });

    // Buscar Rol ADMIN_COMERCIO
    const rolAdminComercio = await prisma.rol.findUnique({ where: { nombre: 'ADMIN_COMERCIO' } });
    if (!rolAdminComercio) return NextResponse.json({ error: 'Rol ADMIN_COMERCIO no configurado en BD' }, { status: 500 });

    const hashedPassword = await bcrypt.hash(passwordUsuario, 10);

    // TRANSACCIÓN: Crear Comercio Y Usuario al mismo tiempo
    const nuevoComercio = await prisma.$transaction(async (tx) => {
      // 1. Crear Comercio
      const comercio = await tx.comercio.create({
        data: {
          nombre: nombreComercio,
          slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
          direccion,
          nombreContacto, // Dueño
          telefono,       // Tlf del dueño
          emailContacto: emailUsuario,
          estado: 'ACTIVO',
          // Por defecto le damos 30 días de prueba o activo
          fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 30)) 
        }
      });

      // 2. Crear Usuario Dueño vinculado al comercio
      await tx.usuario.create({
        data: {
          nombre: nombreContacto || "Administrador",
          email: emailUsuario,
          password: hashedPassword,
          rolId: rolAdminComercio.id,
          comercioId: comercio.id
        }
      });

      // 3. (Opcional) Crear métodos de pago por defecto para que no empiece vacío
      await tx.metodosPago.createMany({
        data: [
            { nombre: 'Efectivo Divisa', comercioId: comercio.id },
            { nombre: 'Efectivo Bolívares', comercioId: comercio.id },
            { nombre: 'Pago Móvil', comercioId: comercio.id },
            { nombre: 'Punto de Venta', comercioId: comercio.id },
        ]
      });

      return comercio;
    });

    return NextResponse.json({ success: true, comercio: nuevoComercio });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno al crear comercio' }, { status: 500 });
  }
}