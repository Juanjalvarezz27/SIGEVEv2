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

  } catch (error: any) {
    console.error('Error al obtener productos masivos:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { ids, tipoAccion, tipoValor, valor, redondear, aplicarATodo } = body; 
    
    // Validaciones básicas
    if (!aplicarATodo && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ error: "No seleccionaste productos" }, { status: 400 });
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum < 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // TRANSACCIÓN O EJECUCIÓN DIRECTA
    if (aplicarATodo) {
        // VÍA RÁPIDA (Raw SQL) para TODO el inventario sin paginar ni saturar RAM
        const param1 = tipoValor === "PORCENTAJE" && tipoAccion !== "FIJAR" 
            ? (tipoAccion === "AUMENTAR" ? (1 + valorNum / 100) : (1 - valorNum / 100)) 
            : valorNum;

        let baseCalc = tipoAccion === "FIJAR" ? `$1::numeric` 
            : tipoValor === "PORCENTAJE" ? `"precio" * $1::numeric` 
            : tipoAccion === "AUMENTAR" ? `"precio" + $1::numeric` 
            : `"precio" - $1::numeric`;

        let finalPrecio = `GREATEST(${baseCalc}, 0)`;
        finalPrecio = redondear 
            ? `ROUND(CAST(${finalPrecio} * 2 AS numeric)) / 2` 
            : `ROUND(CAST(${finalPrecio} AS numeric), 2)`;

        await prisma.$executeRawUnsafe(`
            UPDATE "Producto" 
            SET "precio" = ${finalPrecio} 
            WHERE "comercioId" = $2
        `, param1, session.user.comercioId);

    } else {
        // VÍA JS para selección específica (máx 100 items, seguro para RAM)
        await prisma.$transaction(async (tx) => {
          const productos = await tx.producto.findMany({
            where: { id: { in: ids }, comercioId: session.user.comercioId! },
            select: { id: true, precio: true }
          });

          await Promise.all(productos.map(async (prod) => {
              let nuevoPrecio = prod.precio;

              if (tipoAccion === "FIJAR") {
                nuevoPrecio = valorNum;
              } else {
                let delta = tipoValor === "PORCENTAJE" ? prod.precio * (valorNum / 100) : valorNum;
                if (tipoAccion === "AUMENTAR") nuevoPrecio += delta;
                if (tipoAccion === "DISMINUIR") nuevoPrecio -= delta;
              }

              if (nuevoPrecio < 0) nuevoPrecio = 0;

              if (redondear) {
                nuevoPrecio = Math.round(nuevoPrecio * 2) / 2;
              } else {
                nuevoPrecio = Math.round(nuevoPrecio * 100) / 100;
              }

              return tx.producto.update({
                where: { id: prod.id },
                data: { precio: nuevoPrecio }
              });
          }));
        });
    }

    return NextResponse.json({ success: true, message: `Inventario actualizado correctamente` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error en actualización' }, { status: 500 });
  }
}