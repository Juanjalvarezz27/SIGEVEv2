"use client";

import { useState } from 'react';
import { X, Save, TrendingDown, RefreshCw, AlignLeft } from 'lucide-react';
import useTasaBCV from '@/src/app/hooks/useTasaBCV';

export default function ModalNuevoGasto({ isOpen, onClose, onSuccess }: any) {
  const [descripcion, setDescripcion] = useState('');
  const [nota, setNota] = useState('');
  const [monto, setMonto] = useState('');
  const [montoBs, setMontoBs] = useState('');
  const [loading, setLoading] = useState(false);
  const { tasa, loading: loadingTasa } = useTasaBCV();

  const handleMontoUSDChange = (val: string) => {
      setMonto(val);
      if(val && tasa) {
          setMontoBs((parseFloat(val) * tasa).toFixed(2));
      } else {
          setMontoBs('');
      }
  }

  const handleMontoBsChange = (val: string) => {
      setMontoBs(val);
      if(val && tasa) {
          setMonto((parseFloat(val) / tasa).toFixed(2));
      } else {
          setMonto('');
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || !monto) return;

    setLoading(true);
    const descripcionFinal = nota ? `${descripcion} | ${nota}` : descripcion;

    try {
      const res = await fetch('/api/caja/gastos', {
        method: 'POST',
        body: JSON.stringify({ descripcion: descripcionFinal, monto, montoBs, tasaBCV: tasa }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setDescripcion('');
        setNota('');
        setMonto('');
        setMontoBs('');
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl text-white shadow-md shadow-red-200">
                        <TrendingDown size={24}/>
                    </div>
                    Registrar Gasto
                </h3>
                <p className="text-gray-500 text-sm mt-1 ml-14">Agrega una salida de dinero de la caja</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Motivo del Gasto *</label>
                    <input 
                        autoFocus
                        required
                        type="text" 
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-medium text-gray-800"
                        placeholder="Ej: Pago de Hielo, Bolsa de basura..."
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        <AlignLeft size={14}/> Nota Adicional (Opcional)
                    </label>
                    <textarea 
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all text-gray-700 resize-none"
                        placeholder="Detalles adicionales sobre este gasto..."
                        rows={2}
                        value={nota}
                        onChange={e => setNota(e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Monto ($)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input 
                            required
                            type="number" 
                            step="0.01"
                            className="w-full pl-8 p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all font-black text-xl text-gray-800"
                            placeholder="0.00"
                            value={monto}
                            onChange={e => handleMontoUSDChange(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Monto (Bs)
                        {loadingTasa ? <RefreshCw size={12} className="animate-spin"/> : <span className="text-[10px] text-gray-400">Tasa: Bs {tasa?.toFixed(2)}</span>}
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs</span>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full pl-10 p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-xl text-gray-800"
                            placeholder="0.00"
                            value={montoBs}
                            onChange={e => handleMontoBsChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={loading || loadingTasa}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-lg py-4 rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-200 active:scale-[0.98] disabled:opacity-50 mt-2 flex justify-center items-center gap-2"
                >
                    {loading ? 'Registrando salida...' : <><Save size={20}/> Registrar Salida</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}