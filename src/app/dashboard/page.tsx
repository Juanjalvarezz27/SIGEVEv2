import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { signOut } from "@/src/auth";

export default async function DashboardPage() {
  // 1. Verificar Sesión
  const session = await auth();

  // Si no hay usuario, lo mandamos al login (Protección de ruta)
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // 2. Lógica de Base de Datos (Buscar nombre del comercio)
  let nombreComercio = "Sin Comercio Asignado";
  let estadoComercio = false;

  if (session.user.comercioId) {
    const comercio = await prisma.comercio.findUnique({
      where: { id: session.user.comercioId },
      select: { nombre: true, activo: true }
    });
    
    if (comercio) {
      nombreComercio = comercio.nombre;
      estadoComercio = comercio.activo;
    }
  }

  // 3. Renderizar la Vista Privada
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">¡Hola, {session.user.nombre}! 👋</h1>
          <p className="text-blue-100 text-sm mt-1">{session.user.email}</p>
        </div>

        {/* Cuerpo */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              Estás administrando
            </p>
            <h2 className="text-3xl font-extrabold text-gray-800 mt-2">
              {nombreComercio}
            </h2>
            
            {/* Badges */}
            <div className="flex justify-center gap-2 mt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoComercio ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {estadoComercio ? '🟢 ACTIVO' : '🔴 INACTIVO'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                🛡️ {session.user.rol}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          <div className="space-y-3">
            {/* Aquí podrías poner links a otras partes del sistema */}
            <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-[1.02]">
              🚀 Empezar a Vender
            </button>

            {/* Formulario de Logout (Server Action Inline) */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
                Cerrar Sesión
              </button>
            </form>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-6 font-mono">
            ID Comercio: {session.user.comercioId?.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}