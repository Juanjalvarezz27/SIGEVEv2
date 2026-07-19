"use client";

import { useState, useEffect } from "react";
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
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 text-center">
        
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
           <AlertTriangle size={24} />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-sm text-gray-500 mb-4">{mensaje}</p>

        <div className="mb-6 text-left">
           <label className="block text-xs font-bold text-gray-500 mb-2">Escribe <span className="text-red-500 select-all">ELIMINAR</span> para confirmar:</label>
           <input 
             type="text"
             value={confirmText}
             onChange={(e) => setConfirmText(e.target.value)}
             className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-bold text-gray-700 uppercase"
             placeholder="ELIMINAR"
           />
        </div>

        <div className="flex gap-3">
           <button 
             onClick={onClose} 
             className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
           >
             Cancelar
           </button>
           <button 
             onClick={() => { onConfirm(); onClose(); }} 
             disabled={confirmText.toUpperCase() !== 'ELIMINAR'}
             className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Eliminar
           </button>
        </div>

      </div>
    </div>
  );
}