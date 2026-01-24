import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/src/auth';

export async function GET(request: Request) {
  try {
    // 1. SEGURIDAD
    const session = await auth();
    if (!session?.user?.comercioId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // 2. FILTRADO (Exactamente tu lógica probada)
    const where: Prisma.ProductoWhereInput = {
      comercioId: session.user.comercioId,
      ...(search ? {
        OR: [
          {
            nombre: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
        ],
      } : {})
    };

    // 3. CONSULTA (Limitamos a 100 para que la interfaz sea rápida)
    const productos = await prisma.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      take: 100, 
      select: {
        id: true,
        nombre: true,
        precio: true,
        // No necesitamos más datos para esta función
      }
    });

    // Devolvemos el array directo para facilitar el consumo en el frontend
    return NextResponse.json(productos);

  } catch (error) {
    console.error('Error al obtener productos masivos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { ids, tipoAccion, tipoValor, valor, redondear } = body; 
    
    // Validaciones básicas
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No seleccionaste productos" }, { status: 400 });
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum < 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // TRANSACCIÓN
    await prisma.$transaction(async (tx) => {
      // 1. Buscar los productos actuales para tener su precio base
      const productos = await tx.producto.findMany({
        where: { id: { in: ids }, comercioId: session.user.comercioId! }
      });

      for (const prod of productos) {
        let nuevoPrecio = prod.precio;

        // Cálculos
        if (tipoAccion === "FIJAR") {
          nuevoPrecio = valorNum;
        } else {
          let delta = 0;
          if (tipoValor === "PORCENTAJE") {
            delta = prod.precio * (valorNum / 100);
          } else {
            delta = valorNum;
          }

          if (tipoAccion === "AUMENTAR") nuevoPrecio += delta;
          if (tipoAccion === "DISMINUIR") nuevoPrecio -= delta;
        }

        // Evitar negativos
        if (nuevoPrecio < 0) nuevoPrecio = 0;

        // Redondeo
        if (redondear) {
          nuevoPrecio = Math.round(nuevoPrecio * 2) / 2; // Redondeo a .00 o .50
        } else {
          nuevoPrecio = Math.round(nuevoPrecio * 100) / 100; // 2 decimales estándar
        }

        // Actualizar
        await tx.producto.update({
          where: { id: prod.id },
          data: { precio: nuevoPrecio }
        });
      }
    });

    return NextResponse.json({ success: true, message: `Actualizados ${ids.length} productos` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en actualización" }, { status: 500 });
  }
}