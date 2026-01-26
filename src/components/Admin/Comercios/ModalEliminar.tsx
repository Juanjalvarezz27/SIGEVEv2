"use client";

import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreItem?: string;
  loading: boolean;
}

export default function ModalEliminar({ isOpen, onClose, onConfirm, nombreItem, loading }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Rojo */}
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <AlertTriangle size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-gray-900 leading-tight">¿Eliminar Cliente?</h3>
            {nombreItem && (
                <p className="text-sm font-bold text-red-600 mt-2 bg-red-100/50 px-3 py-1 rounded-lg">
                    {nombreItem}
                </p>
            )}
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-3">
            <p className="text-gray-500 text-sm leading-relaxed">
                Estás a punto de borrar este comercio, su usuario dueño y <strong>todo su historial de ventas</strong>.
            </p>
            <div className="text-gray-800 font-bold text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2 justify-center">
                ⚠️ Esta acción es irreversible.
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button 
                onClick={onClose} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <><Trash2 size={16}/> Sí, Eliminar</>}
            </button>
        </div>

      </div>
    </div>
  );
}