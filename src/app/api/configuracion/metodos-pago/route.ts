import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';

// GET: Obtener métodos del comercio actual
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json([], { status: 401 });

    const metodos = await prisma.metodosPago.findMany({
      where: { comercioId: session.user.comercioId },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(metodos);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: Crear nuevo método
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { nombre } = await req.json();

    const nuevo = await prisma.metodosPago.create({
      data: {
        nombre,
        comercioId: session.user.comercioId
      }
    });

    return NextResponse.json(nuevo);
  } catch (error) {
    return NextResponse.json({ error: 'Error creando método' }, { status: 500 });
  }
}

// DELETE: Eliminar método
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.comercioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.metodosPago.deleteMany({
      where: {
        id: id, 
        comercioId: session.user.comercioId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'No se puede eliminar este método (tiene ventas asociadas)' }, { status: 400 });
  }
}