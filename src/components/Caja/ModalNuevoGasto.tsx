"use client";

import { useState } from 'react';
import { X, Save, TrendingDown } from 'lucide-react';

export default function ModalNuevoGasto({ isOpen, onClose, onSuccess }: any) {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || !monto) return;

    setLoading(true);
    try {
      const res = await fetch('/api/caja/gastos', {
        method: 'POST',
        body: JSON.stringify({ descripcion, monto }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setDescripcion('');
        setMonto('');
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-lg text-red-600"><TrendingDown size={20}/></div>
                Registrar Gasto
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo del Gasto</label>
                <input 
                    autoFocus
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-medium"
                    placeholder="Ej: Pago de Hielo, Bolsa de basura..."
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto ($)</label>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-bold text-lg"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
            >
                {loading ? 'Guardando...' : <><Save size={18}/> Guardar Salida</>}
            </button>
        </form>
      </div>
    </div>
  );
}