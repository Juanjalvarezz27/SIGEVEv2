import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // @ts-ignore
  if (session.user?.rol !== "SUPER_ADMIN") {
    return redirect("/home");
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* CAMBIO AQUÍ: max-w-7xl y p-6 para igualar la vista de usuario */}
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}