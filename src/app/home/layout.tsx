import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verificamos la sesión en el SERVIDOR 
  const session = await auth();

  // 2. Si NO hay sesión -> Al login
  if (!session) {
    redirect("/login");
  }

  // 3. Si hay sesión, adelante -> Muestra el contenido
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
}