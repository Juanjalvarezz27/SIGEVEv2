"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full overflow-hidden transform transition-all scale-100">
        
        {/* Cabecera */}
        <div className="p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <LogOut className="h-8 w-8 text-red-600 ml-1" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            ¿Cerrar Sesión?
          </h3>
          <p className="text-sm text-gray-500">
            Estás a punto de salir del sistema. Tendrás que iniciar sesión nuevamente para acceder.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
              onClose(); // Cerramos el modal visualmente aunque redirija
            }}
            className="w-full py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200 text-sm"
          >
            Sí, Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;