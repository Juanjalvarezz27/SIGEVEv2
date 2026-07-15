import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { Prisma } from "@prisma/client";

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
  } catch (error: any) {
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

    // CORRECCIÓN: Usamos !
    const whereClause: Prisma.DeudaWhereInput = { 
        comercioId: session.user.comercioId! 
    };
    
    if (tipo) whereClause.tipo = tipo;

    const deudas = await prisma.deuda.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(deudas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { tipo, persona, descripcion, monto, telefono, productos } = body;
    const montoFloat = parseFloat(monto);

    if (montoFloat <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

    const resultado = await prisma.$transaction(async (tx) => {
        let deudaFinal;

        // A. FUSIONAR DEUDA
        if (tipo === "COBRAR") {
            const deudaExistente = await tx.deuda.findFirst({
                where: {
                    // CORRECCIÓN: Usamos !
                    comercioId: session.user.comercioId!,
                    persona: { equals: persona, mode: "insensitive" },
                    tipo: "COBRAR",
                    estado: "PENDIENTE"
                }
            });

            if (deudaExistente) {
                const detallesViejos = (deudaExistente.detalles as any[]) || [];
                const nuevosConFecha = productos ? productos.map((p: any) => ({ ...p, fechaAgregado: new Date() })) : [];
                const detallesFusionados = [...detallesViejos, ...nuevosConFecha];
                const fechaHoy = new Date().toLocaleDateString('es-VE', { timeZone: 'America/Caracas' });
                const nuevaDescripcion = `${deudaExistente.descripcion || ''}\n\n--- Agregado el ${fechaHoy} ---\n${descripcion}`;

                deudaFinal = await tx.deuda.update({
                    where: { id: deudaExistente.id },
                    data: {
                        monto: { increment: montoFloat },
                        descripcion: nuevaDescripcion,
                        detalles: detallesFusionados,
                        telefono: telefono || deudaExistente.telefono,
                        fecha: new Date()
                    }
                });
            }
        }

        // B. CREAR NUEVA
        if (!deudaFinal) {
            const nuevosConFecha = productos ? productos.map((p: any) => ({ ...p, fechaAgregado: new Date() })) : [];
            deudaFinal = await tx.deuda.create({
                data: {
                    tipo, persona, descripcion, telefono,
                    monto: montoFloat,
                    detalles: nuevosConFecha,
                    // CORRECCIÓN: Usamos !
                    comercioId: session.user.comercioId!,
                    fecha: new Date(),
                    abonado: 0,
                    estado: "PENDIENTE"
                },
            });
        }

        // C. RESTAR STOCK
        if (tipo === "COBRAR" && productos && productos.length > 0) {
            for (const p of productos) {
                const cantidadDescontar = (p.porPeso && p.peso) ? parseFloat(p.peso) : p.cantidad;
                if (cantidadDescontar <= 0) throw new Error("Cantidad inválida");
                
                // Asegurar que el producto pertenece al comercio
                const prod = await tx.producto.findFirst({ where: { id: p.id, comercioId: session.user.comercioId! } });
                if (!prod) throw new Error("Producto no encontrado o no pertenece al comercio");

                await tx.producto.update({
                    where: { id: p.id },
                    data: { stock: { decrement: cantidadDescontar } }
                });
            }
        }

        return deudaFinal;
    });

    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error procesando' }, { status: 500 });
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
      const montoF = parseFloat(monto);
      if (montoF <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

      // Validar pertenencia
      const existe = await prisma.deuda.findFirst({ where: { id, comercioId: session.user.comercioId! }});
      if (!existe) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

      return NextResponse.json(await prisma.deuda.update({
        where: { id },
        data: { persona, descripcion, monto: montoF, telefono, detalles: productos }
      }));
    }

    // 2. ABONAR
    const { id, abono, metodoPagoId, crearGasto } = body;
    const abonoF = parseFloat(abono);
    if (abonoF <= 0) return NextResponse.json({ error: "Abono inválido" }, { status: 400 });

    const deuda = await prisma.deuda.findFirst({ where: { id, comercioId: session.user.comercioId! } });
    if (!deuda) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const nuevoAbonado = deuda.abonado + parseFloat(abono);
    const pagado = nuevoAbonado >= (deuda.monto - 0.01);

    const resultado = await prisma.$transaction(async (tx) => {
      const updatedDeuda = await tx.deuda.update({
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
          // CORRECCIÓN: Usamos !
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
              // CORRECCIÓN: Usamos !
              comercioId: session.user.comercioId!,
              deudaId: id
            }
          });
        }
      }

      if (deuda.tipo === "PAGAR" && crearGasto) {
        await tx.gasto.create({
          data: {
            descripcion: `Pago Deuda: ${deuda.persona}`,
            monto: parseFloat(abono),
            fecha: new Date(),
            // CORRECCIÓN: Usamos !
            comercioId: session.user.comercioId!
          }
        });
      }

      return updatedDeuda;
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await req.json();
    
    // Verificación
    const deuda = await prisma.deuda.findFirst({
        where: { 
            id, 
            comercioId: session.user.comercioId! // CORRECCIÓN: Usamos !
        }
    });

    if (!deuda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await prisma.deuda.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Error' }, { status: 500 }); }
}