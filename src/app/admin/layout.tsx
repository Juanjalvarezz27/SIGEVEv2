import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import Navbar from "@/src/components/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Protección de Ruta: Si no hay sesión, fuera.
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // 2. Protección de Rol: Si no es SUPER_ADMIN, fuera.
  // @ts-ignore
  if (session.user.rol !== 'SUPER_ADMIN') {
    redirect("/home"); 
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar user={session.user as any} />
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}


