import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // PROTECCIÓN: Verificar sesión
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // OBTENER DATOS FRESCOS DE LA DB
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: {
        nombre: true,
        email: true,
        // Traemos la relación del rol
        rol: {
          select: { nombre: true }
        },
        // Traemos los datos del comercio si tiene uno
        comercio: {
          select: {
            nombre: true,
            activo: true
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol?.nombre || "USUARIO",
      comercio: usuario.comercio ? {
        nombre: usuario.comercio.nombre,
        activo: usuario.comercio.activo
      } : null
    });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}