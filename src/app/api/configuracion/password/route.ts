import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/src/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    const user = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}