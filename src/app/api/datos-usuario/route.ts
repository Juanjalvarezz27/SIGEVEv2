import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Verificar sesión
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener datos frescos
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: {
        nombre: true,
        email: true,
        rol: {
          select: { nombre: true } 
        },
        comercio: {
          select: {
            nombre: true,
            estado: true 
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 3. Mapear respuesta para el Frontend
    return NextResponse.json({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol?.nombre || "USUARIO",
      comercio: usuario.comercio ? {
        nombre: usuario.comercio.nombre,
        activo: usuario.comercio.estado === 'ACTIVO' 
      } : null
    });

  } catch (error) {
    console.error("Error API Datos Usuario:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}