import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

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
        const nombreLimpio = p.nombre ? p.nombre.toString().trim() : "";
        const precio = parseFloat(p.precio);

        // 1. Falta Nombre
        if (!nombreLimpio) {
            errores.push({ nombre: "Fila sin nombre", motivo: "El nombre es obligatorio" });
            return;
        }

        // 2. Falta Precio o es 0
        if (isNaN(precio) || precio <= 0) {
            errores.push({ nombre: nombreLimpio, motivo: "No tiene precio válido" });
            return;
        }

        // 3. Duplicado
        if (nombresExistentes.has(nombreLimpio.toLowerCase())) {
            errores.push({ nombre: nombreLimpio, motivo: "Ya existe en tu inventario" });
            return;
        }

        validos.push({
            nombre: nombreLimpio,
            precio: precio,
            stock: parseFloat(p.stock) || 0,
            porPeso: p.porPeso, 
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

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}