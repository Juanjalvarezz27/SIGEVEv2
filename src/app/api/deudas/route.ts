import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";

// Función auxiliar para obtener tasa
async function obtenerTasaServer(): Promise<number> {
  const TASA_POR_DEFECTO = 360; 
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.VES) return data.rates.VES;
    }
    const resBackup = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' });
    if (resBackup.ok) {
      const dataBackup = await resBackup.json();
      if (dataBackup?.promedio) return dataBackup.promedio;
    }
  } catch (error) {
    console.error("Error obteniendo tasa:", error);
  }
  return TASA_POR_DEFECTO;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json([], { status: 401 });

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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tipo, persona, descripcion, monto, telefono, productos } = body;
    const montoFloat = parseFloat(monto);

    // FUSIONAR DEUDA (Solo COBRAR)
    if (tipo === "COBRAR") {
      const deudaExistente = await prisma.deuda.findFirst({
        where: {
          comercioId: session.user.comercioId,
          persona: { equals: persona, mode: "insensitive" },
          tipo: "COBRAR",
          estado: "PENDIENTE"
        }
      });

      if (deudaExistente) {
        const detallesViejos = (deudaExistente.detalles as any[]) || [];
        const nuevosConFecha = productos ? productos.map((p: any) => ({ ...p, fechaAgregado: new Date() })) : [];
        const detallesFusionados = [...detallesViejos, ...nuevosConFecha];
        const fechaHoy = new Date().toLocaleDateString('es-VE');
        const nuevaDescripcion = `${deudaExistente.descripcion || ''}\n\n--- Agregado el ${fechaHoy} ---\n${descripcion}`;
        
        return NextResponse.json(await prisma.deuda.update({
          where: { id: deudaExistente.id },
          data: {
            monto: { increment: montoFloat },
            descripcion: nuevaDescripcion,
            detalles: detallesFusionados,
            telefono: telefono || deudaExistente.telefono,
            fecha: new Date()
          }
        }));
      }
    }

    // CREAR NUEVA
    const nuevosConFecha = productos ? productos.map((p: any) => ({ ...p, fechaAgregado: new Date() })) : [];
    return NextResponse.json(await prisma.deuda.create({
      data: {
        tipo, persona, descripcion, telefono,
        monto: montoFloat,
        detalles: nuevosConFecha,
        comercioId: session.user.comercioId,
        fecha: new Date(),
        abonado: 0,
        estado: "PENDIENTE"
      },
    }));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error procesando" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();

    // 1. EDITAR DATOS
    if (body.accion === "EDITAR") {
      const { id, persona, descripcion, monto, telefono, productos } = body;
      return NextResponse.json(await prisma.deuda.update({
        where: { id },
        data: { persona, descripcion, monto: parseFloat(monto), telefono, detalles: productos }
      }));
    }

    // 2. ABONAR
    // Recibimos "crearGasto" desde el frontend
    const { id, abono, metodoPagoId, crearGasto } = body;
    const deuda = await prisma.deuda.findUnique({ where: { id } });
    if (!deuda) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const nuevoAbonado = deuda.abonado + parseFloat(abono);
    const pagado = nuevoAbonado >= (deuda.monto - 0.01);

    const resultado = await prisma.$transaction(async (tx) => {
        // A. Actualizar Deuda
        const updatedDeuda = await tx.deuda.update({
            where: { id },
            data: {
                abonado: nuevoAbonado,
                estado: pagado ? "PAGADO" : "PENDIENTE",
                fechaPago: pagado ? new Date() : null
            }
        });

        // B. Si es COBRAR y pagó completo -> Crear Venta (Ingreso)
        if (pagado && deuda.tipo === "COBRAR") {
            let metodoIdFinal = metodoPagoId;
            if (!metodoIdFinal) {
                const metodoDefault = await tx.metodosPago.findFirst({ where: { comercioId: session.user.comercioId! } });
                metodoIdFinal = metodoDefault?.id;
            }
            if (metodoIdFinal) {
                const tasa = await obtenerTasaServer();
                await tx.venta.create({
                    data: {
                        total: deuda.monto,
                        totalBs: deuda.monto * tasa,
                        tasaBCV: tasa,
                        fechaHora: new Date(),
                        metodoPagoId: metodoIdFinal,
                        comercioId: session.user.comercioId!,
                        deudaId: id
                    }
                });
            }
        }

        // C. LOGICA NUEVA: Si es PAGAR y marcamos el checkbox -> Crear Gasto
        if (deuda.tipo === "PAGAR" && crearGasto) {
             await tx.gasto.create({
                data: {
                    descripcion: `Pago Deuda: ${deuda.persona}`,
                    monto: parseFloat(abono),
                    fecha: new Date(),
                    comercioId: session.user.comercioId!
                }
             });
        }

        return updatedDeuda;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.deuda.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}