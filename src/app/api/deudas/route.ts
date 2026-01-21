import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";

async function obtenerTasaServer(): Promise<number> {
  const TASA_POR_DEFECTO = 360; 

  try {
    // 1. Intentar API Principal
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.VES) return data.rates.VES;
    }

    // 2. Intentar API Respaldo
    const resBackup = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' });
    if (resBackup.ok) {
      const dataBackup = await resBackup.json();
      if (dataBackup?.promedio) return dataBackup.promedio;
    }
  } catch (error) {
    console.error("Error obteniendo tasa en servidor:", error);
  }

  return TASA_POR_DEFECTO;
}

// GET: Obtener deudas
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo"); 

    const whereClause: any = { comercioId: session.user.comercioId };
    if (tipo) whereClause.tipo = tipo;

    const deudas = await prisma.deuda.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
    });

    return NextResponse.json(deudas);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: Crear nueva deuda
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tipo, persona, descripcion, monto, telefono } = body;

    const deuda = await prisma.deuda.create({
      data: {
        tipo,
        persona,
        descripcion,
        telefono,
        monto: parseFloat(monto),
        comercioId: session.user.comercioId,
        fecha: new Date(),
        abonado: 0,
        estado: "PENDIENTE"
      },
    });

    return NextResponse.json(deuda);
  } catch (error) {
    return NextResponse.json({ error: "Error creando deuda" }, { status: 500 });
  }
}

// PUT: Abonar o Editar
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    
    // CASO 1: EDITAR
    if (body.accion === "EDITAR") {
        const { id, persona, descripcion, monto, telefono } = body;
        const deudaEditada = await prisma.deuda.update({
            where: { id },
            data: { persona, descripcion, monto: parseFloat(monto), telefono }
        });
        return NextResponse.json(deudaEditada);
    }

    // CASO 2: ABONAR
    const { id, abono } = body;
    const deudaActual = await prisma.deuda.findUnique({ where: { id } });
    if (!deudaActual) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const nuevoAbonado = deudaActual.abonado + parseFloat(abono);
    const deudaTotal = deudaActual.monto;
    // Tolerancia de centavos para evitar errores de flotantes
    const estaPagado = nuevoAbonado >= (deudaTotal - 0.01);

    const dataUpdate: any = {
        abonado: nuevoAbonado,
        estado: estaPagado ? "PAGADO" : "PENDIENTE",
    };

    if (estaPagado) {
        dataUpdate.fechaPago = new Date();
    }

    // Actualizamos la deuda
    const deudaActualizada = await prisma.deuda.update({
      where: { id },
      data: dataUpdate,
    });

    // LÓGICA DE VINCULACIÓN: Si se paga una deuda de cobro, crea una venta
    if (estaPagado && deudaActual.tipo === "COBRAR") {
        const metodoPago = await prisma.metodosPago.findFirst({
            where: { comercioId: session.user.comercioId },
        });

        if (metodoPago) {
            // 1. OBTENEMOS LA TASA REAL DEL SERVIDOR
            const tasaActual = await obtenerTasaServer();

            await prisma.venta.create({
                data: {
                    total: deudaTotal,
                    totalBs: deudaTotal * tasaActual, // USAMOS TASA REAL
                    tasaBCV: tasaActual,              // GUARDAMOS TASA REAL
                    fechaHora: new Date(),
                    metodoPagoId: metodoPago.id,
                    comercioId: session.user.comercioId,
                    deudaId: id, 
                }
            });
        }
    }

    return NextResponse.json(deudaActualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error actualizando" }, { status: 500 });
  }
}

// DELETE: Eliminar
export async function DELETE(req: Request) {
    try {
      const session = await auth();
      if (!session?.user?.comercioId) return NextResponse.json({ error: "401" }, { status: 401 });
  
      const { id } = await req.json();
  
      await prisma.deuda.delete({ where: { id } });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
    }
}