import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import { z } from 'zod';

const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío"),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().min(0).default(0).catch(0),
  porPeso: z.coerce.boolean().optional().default(false).catch(false)
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const comercioId = session?.user?.comercioId;

    if (!comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { productos } = body; 

    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: 'Lista vacía' }, { status: 400 });
    }

    const existentes = await prisma.producto.findMany({
      where: { comercioId: comercioId, activo: true },
      select: { nombre: true }
    });

    const nombresExistentes = new Set(existentes.map(p => p.nombre.toLowerCase().trim()));
    const validos: any[] = [];
    const errores: { nombre: string, motivo: string }[] = [];

    productos.forEach((p: any) => {
        const result = productoSchema.safeParse(p);

        if (!result.success) {
            const errMotivo = result.error.issues[0]?.message || "Datos inválidos";
            const nombreMostrar = p.nombre ? String(p.nombre).trim() : "Fila sin nombre";
            errores.push({ nombre: nombreMostrar, motivo: errMotivo });
            return;
        }

        const { nombre, precio, stock, porPeso } = result.data;
        const nombreLimpio = nombre.trim();

        // Duplicado manual check
        if (nombresExistentes.has(nombreLimpio.toLowerCase())) {
            errores.push({ nombre: nombreLimpio, motivo: "Ya existe en tu inventario" });
            return;
        }

        validos.push({
            nombre: nombreLimpio,
            precio,
            stock,
            porPeso, 
            comercioId: comercioId,
            activo: true
        });

        nombresExistentes.add(nombreLimpio.toLowerCase());
    });

    if (validos.length > 0) {
        await prisma.producto.createMany({ data: validos });
    }

    return NextResponse.json({ 
      message: 'Proceso terminado', 
      importados: validos.length,
      fallidos: errores.length,
      detalles: errores 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error al procesar el archivo' }, { status: 500 });
  }
}