import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificamos la sesión
  const session = await auth();

  // 2. Si NO hay sesión -> Al login
  if (!session) {
    redirect("/login");
  }

  // @ts-ignore
  if (session.user?.rol === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // 4. Si eres usuario normal, adelante
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}