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
export async function GET(req: NextRequest) {
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
    // AHORA RECIBIMOS "productos" (el array del carrito)
    const { tipo, persona, descripcion, monto, telefono, productos } = body;
    const montoFloat = parseFloat(monto);

    // --- LOGICA DE FUSION DE DEUDA (Solo Fiados) ---
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
        // 1. FUSIONAR JSON
        const detallesViejos = (deudaExistente.detalles as any[]) || [];
        // Agregamos una marca de fecha a los nuevos productos para saber cuándo se agregaron
        const nuevosConFecha = productos.map((p: any) => ({ ...p, fechaAgregado: new Date() }));
        const detallesFusionados = [...detallesViejos, ...nuevosConFecha];

        // 2. ACTUALIZAR DESCRIPCION (Visual legacy)
        const fechaHoy = new Date().toLocaleDateString('es-VE');
        const nuevaDescripcion = `${deudaExistente.descripcion || ''}\n\n--- Agregado el ${fechaHoy} ---\n${descripcion}`;
        
        const deudaActualizada = await prisma.deuda.update({
          where: { id: deudaExistente.id },
          data: {
            monto: { increment: montoFloat },
            descripcion: nuevaDescripcion,
            detalles: detallesFusionados, // <--- GUARDAMOS JSON
            telefono: telefono || deudaExistente.telefono,
            fecha: new Date()
          }
        });

        return NextResponse.json(deudaActualizada);
      }
    }

    // CREAR NUEVA
    const nuevosConFecha = productos ? productos.map((p: any) => ({ ...p, fechaAgregado: new Date() })) : [];

    const nuevaDeuda = await prisma.deuda.create({
      data: {
        tipo, persona, descripcion, telefono,
        monto: montoFloat,
        detalles: nuevosConFecha, // <--- GUARDAMOS JSON
        comercioId: session.user.comercioId,
        fecha: new Date(),
        abonado: 0,
        estado: "PENDIENTE"
      },
    });

    return NextResponse.json(nuevaDeuda);
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

    // EDITAR DATOS
    if (body.accion === "EDITAR") {
      const { id, persona, descripcion, monto, telefono, productos } = body; // Recibimos productos editados
      return NextResponse.json(await prisma.deuda.update({
        where: { id },
        data: { 
            persona, 
            descripcion, 
            monto: parseFloat(monto), 
            telefono,
            detalles: productos // <--- Actualizamos el JSON si se editó el carrito
        }
      }));
    }

    // ABONAR
    const { id, abono, metodoPagoId } = body;
    const deuda = await prisma.deuda.findUnique({ where: { id } });
    if (!deuda) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const nuevoAbonado = deuda.abonado + parseFloat(abono);
    const pagado = nuevoAbonado >= (deuda.monto - 0.01);

    const updated = await prisma.deuda.update({
      where: { id },
      data: {
        abonado: nuevoAbonado,
        estado: pagado ? "PAGADO" : "PENDIENTE",
        fechaPago: pagado ? new Date() : null
      }
    });

    if (pagado && deuda.tipo === "COBRAR") {
       let metodoIdFinal = metodoPagoId;
       if (!metodoIdFinal) {
          const metodoDefault = await prisma.metodosPago.findFirst({ where: { comercioId: session.user.comercioId } });
          metodoIdFinal = metodoDefault?.id;
       }

       if (metodoIdFinal) {
         const tasa = await obtenerTasaServer();
         await prisma.venta.create({
            data: {
                total: deuda.monto,
                totalBs: deuda.monto * tasa,
                tasaBCV: tasa,
                fechaHora: new Date(),
                metodoPagoId: metodoIdFinal,
                comercioId: session.user.comercioId,
                deudaId: id
            }
         });
       }
    }
    return NextResponse.json(updated);
  } catch (error) {
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