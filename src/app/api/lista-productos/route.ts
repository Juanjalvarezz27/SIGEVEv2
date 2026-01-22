import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Ejecutamos ambas consultas en paralelo para mayor velocidad
    const [productos, metodosPago] = await Promise.all([
      prisma.producto.findMany({
        where: { comercioId: session.user.comercioId },
        select: {
          id: true,
          nombre: true,
          precio: true,
          porPeso: true
        },
        orderBy: { nombre: 'asc' }
      }),
      prisma.metodosPago.findMany({
        where: { comercioId: session.user.comercioId },
        select: {
          id: true,
          nombre: true
        },
        orderBy: { nombre: 'asc' }
      })
    ]);

    // Retornamos ambos datos
    return NextResponse.json({ productos, metodos: metodosPago });

  } catch (error) {
    console.error("Error cargando datos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}