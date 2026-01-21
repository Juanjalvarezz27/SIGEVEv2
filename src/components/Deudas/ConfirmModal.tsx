"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje?: string;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = "¿Estás seguro?", 
  mensaje = "Esta acción no se puede deshacer." 
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 text-center">
        
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
           <AlertTriangle size={24} />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-sm text-gray-500 mb-6">{mensaje}</p>

        <div className="flex gap-3">
           <button 
             onClick={onClose} 
             className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
           >
             Cancelar
           </button>
           <button 
             onClick={() => { onConfirm(); onClose(); }} 
             className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200"
           >
             Eliminar
           </button>
        </div>

      </div>
    </div>
  );
}