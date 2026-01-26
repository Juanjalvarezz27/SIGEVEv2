import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";
import Navbar from "@/src/components/Navbar"; // Asumo que tu Navbar está aquí
import SuspendedView from "@/src/components/SuspendedView";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Seguridad básica: Si no hay sesión, fuera.
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // 2. Si es SUPER_ADMIN, le dejamos pasar siempre (para que puedas ver cómo se ve el sistema)
  // @ts-ignore
  if (session.user.rol === 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={session.user as any} />
        <main className="max-w-[1600px] mx-auto p-4 md:p-6">
            {children}
        </main>
      </div>
    );
  }

  // 3. Consultar estado REAL en BD (No confiar en la sesión, podría ser vieja)
  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      comercio: {
        select: {
          estado: true,
          nombre: true
        }
      }
    }
  });

  const estado = usuario?.comercio?.estado;

  // 4. EL MURO: Si está suspendido o cancelado, retornamos la vista de bloqueo
  // NOTA: Al retornar esto aquí, NO se renderiza ni el Navbar ni el children. Bloqueo total.
  if (estado === 'SUSPENDIDO' || estado === 'CANCELADO') {
    return <SuspendedView estado={estado} nombreComercio={usuario?.comercio?.nombre} />;
  }

  // 5. Si todo está bien (ACTIVO), mostramos el sistema
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user as any} />
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}