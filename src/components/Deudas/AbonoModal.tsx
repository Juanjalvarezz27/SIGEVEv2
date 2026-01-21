"use client";

import { useState } from "react";
import { X, DollarSign } from "lucide-react";

interface AbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (monto: number) => Promise<void>;
  deudaTotal: number;
  abonado: number;
}

export default function AbonoModal({ isOpen, onClose, onConfirm, deudaTotal, abonado }: AbonoModalProps) {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  
  const restante = deudaTotal - abonado;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto) return;
    setLoading(true);
    await onConfirm(parseFloat(monto));
    setLoading(false);
    setMonto("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Registrar Abono</h3>
        <p className="text-sm text-gray-500 mb-6">
          Resta por pagar: <span className="font-bold text-gray-800">${restante.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
            <input 
              type="number"
              step="0.01"
              max={restante}
              min={0.01}
              autoFocus
              className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-gray-800 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !monto}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? "Procesando..." : <> <DollarSign size={18}/> Confirmar Abono </>}
          </button>
        </form>
      </div>
    </div>
  );
}