"use client";

import { ShieldAlert, Ban, Phone, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react"; // Importamos la función directa

interface SuspendedViewProps {
  estado: string;
  nombreComercio?: string;
}

export default function SuspendedView({ estado, nombreComercio }: SuspendedViewProps) {
  const isCancelado = estado === "CANCELADO";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden text-center border border-gray-100">
        
        {/* Header Rojo */}
        <div className="bg-red-50 p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-pulse">
            {isCancelado ? <Ban size={40} /> : <ShieldAlert size={40} />}
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {isCancelado ? "Cuenta Cancelada" : "Servicio Suspendido"}
          </h1>
          {nombreComercio && (
            <p className="text-red-500 font-bold mt-2 uppercase tracking-wide text-sm">
              {nombreComercio}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <p className="text-gray-600 text-lg leading-relaxed">
            {isCancelado 
              ? "Esta cuenta ha sido desactivada permanentemente. Si crees que es un error, contacta a soporte."
              : "Tu suscripción ha vencido o tu cuenta requiere atención. Para reactivar el acceso al sistema y tus datos, por favor gestiona tu pago."
            }
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 border border-gray-200">
            <p>🔒 Tus datos están seguros, pero no puedes acceder a ellos ni registrar ventas hasta regularizar tu estado.</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Botón de Contacto (Número Actualizado) */}
            <Link 
              href="https://wa.me/584129164371" // <--- NÚMERO ACTUALIZADO
              target="_blank"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Phone size={20}/> Contactar Soporte / Renovar
            </Link>
            
            {/* Botón Cerrar Sesión Directo (Sin Confirmación) */}
            <button 
              onClick={() => signOut({ callbackUrl: "/" })} // Redirige al inicio directamente
              className="w-full py-2 text-gray-400 font-medium text-sm hover:text-gray-600 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={16}/> Cerrar Sesión
            </button>
          </div>
        </div>

      </div>
      
      <p className="mt-8 text-gray-400 text-xs font-medium uppercase tracking-widest">
        Plataforma de Gestión SaaS
      </p>
    </div>
  );
}