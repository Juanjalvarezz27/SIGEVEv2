"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productoNombre: string;
  loading?: boolean;
}

const ModalConfirmacion = ({
  isOpen,
  onClose,
  onConfirm,
  productoNombre,
  loading = false
}: ModalConfirmacionProps) => {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar el producto?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="font-medium text-red-800 text-center">
                "{productoNombre}"
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Esta acción eliminará permanentemente el producto del sistema. 
              Si el producto está asociado a ventas, no podrá ser eliminado.
            </p>

            <div className="mb-2 text-left">
               <label className="block text-xs font-bold text-gray-500 mb-2">Escribe <span className="text-red-500 select-all">ELIMINAR</span> para confirmar:</label>
               <input 
                 type="text"
                 value={confirmText}
                 onChange={(e) => setConfirmText(e.target.value)}
                 className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-bold text-gray-700 uppercase"
                 placeholder="ELIMINAR"
               />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || confirmText.toUpperCase() !== 'ELIMINAR'}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-[3px] border-white/30 border-t-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Sí, Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;