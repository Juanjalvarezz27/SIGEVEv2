import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificamos sesión
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  
  // Si NO es SUPER_ADMIN, lo expulsamos a su dashboard de cliente (/home)
  // @ts-ignore
  if (session.user?.rol !== "SUPER_ADMIN") {
    return redirect("/home");
  }

  // 3. Si es Super Admin, le mostramos su reino
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Aquí podrías poner un Sidebar específico si quisieras, 
          pero ya el Navbar se adapta solo */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}