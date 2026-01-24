"use client";

import { useState, useEffect, useRef } from "react";
import { X, DollarSign, Wallet, ChevronDown, CheckCircle2, CreditCard, Banknote, Store, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

interface AbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (monto: number, metodoId: string, crearGasto: boolean) => Promise<void>;
  deudaTotal: number;
  abonado: number;
  tipo: "COBRAR" | "PAGAR";
}

export default function AbonoModal({ isOpen, onClose, onConfirm, deudaTotal, abonado, tipo }: AbonoModalProps) {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [metodos, setMetodos] = useState<any[]>([]);
  
  // Por defecto FALSE (Deseleccionado)
  const [crearGasto, setCrearGasto] = useState(false);

  const [metodoSeleccionado, setMetodoSeleccionado] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const restante = deudaTotal - abonado;

  useEffect(() => {
    if (isOpen) {
      setCrearGasto(false); 
      fetch("/api/lista-productos")
        .then(res => res.json())
        .then(data => {
            if (data.metodos && Array.isArray(data.metodos)) {
                setMetodos(data.metodos);
                if (data.metodos.length > 0) setMetodoSeleccionado(data.metodos[0]);
            }
        })
        .catch(err => console.error("Error cargando métodos", err));
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !metodoSeleccionado) {
      toast.warning("Completa el monto y método de pago");
      return;
    }

    setLoading(true);
    await onConfirm(parseFloat(monto), metodoSeleccionado.id, crearGasto);
    setLoading(false);
    setMonto("");
    onClose();
  };

  if (!isOpen) return null;

  const montoNum = parseFloat(monto) || 0;
  const liquidaDeuda = montoNum >= restante - 0.01;

  const getMetodoIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('efectivo') || n.includes('cash')) return <Banknote size={16} className="text-green-600"/>;
    if (n.includes('zelle') || n.includes('binance')) return <DollarSign size={16} className="text-blue-600"/>;
    return <CreditCard size={16} className="text-gray-500"/>;
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={20} />
        </button>

        <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Registrar Pago</h3>
        <p className="text-sm text-gray-500 mb-6 font-medium">
            Resta por pagar: <span className="font-bold text-rose-600">${restante.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* INPUT MONTO */}
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Monto a Abonar</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-indigo-500 transition-colors">$</span>
                    <input 
                        type="number" 
                        step="0.01" 
                        max={restante}
                        min={0.01}
                        autoFocus
                        className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                    />
                </div>
            </div>

            {/* DROPDOWN CUSTOM */}
            <div ref={dropdownRef}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Método de Pago</label>
                <div className="relative">
                    <button 
                        type="button" 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full pl-4 pr-4 py-3.5 bg-gray-50 border rounded-2xl text-base font-bold text-gray-700 outline-none flex items-center justify-between transition-all hover:bg-gray-100 ${dropdownOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white' : 'border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                                {metodoSeleccionado ? getMetodoIcon(metodoSeleccionado.nombre) : <Wallet size={16}/>}
                            </div>
                            <span>{metodoSeleccionado ? metodoSeleccionado.nombre : "Seleccionar..."}</span>
                        </div>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-indigo-500' : ''}`}/>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <div className="p-1">
                                {metodos.map((m) => (
                                    <button 
                                        key={m.id} 
                                        type="button"
                                        onClick={() => {
                                            setMetodoSeleccionado(m);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${metodoSeleccionado?.id === m.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        {getMetodoIcon(m.nombre)}
                                        {m.nombre}
                                        {metodoSeleccionado?.id === m.id && <CheckCircle2 size={16} className="ml-auto text-indigo-500"/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECCIÓN DE LA TARJETA (SOLO SI ES PAGAR) --- */}
            {tipo === "PAGAR" && (
                 <div>
                     {/* HEADER LLAMATIVO CENTRADO */}
                     <div className="flex items-center justify-center gap-2 mb-2 px-1">
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={10} /> Atención
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                            Verifica esto antes de guardar 👇
                        </span>
                     </div>

                     {/* TARJETA INTERACTIVA */}
                     <div 
                        onClick={() => setCrearGasto(!crearGasto)}
                        className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-200 relative group select-none ${crearGasto ? 'bg-orange-50 border-orange-300 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-gray-50'}`}
                     >
                        {/* Check Visual */}
                        <div className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center transition-all ${crearGasto ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-300 border border-gray-200'}`}>
                            {crearGasto && <CheckCircle2 size={14} strokeWidth={4}/>}
                        </div>

                        <div className="flex items-center gap-3 mb-1.5">
                            <div className={`p-2 rounded-xl transition-colors ${crearGasto ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                                <Store size={20}/>
                            </div>
                            <span className={`font-bold text-sm ${crearGasto ? 'text-orange-900' : 'text-gray-600'}`}>
                                Usé dinero de la Caja
                            </span>
                        </div>
                        
                        {/* TEXTO RESTAURADO A LA VERSIÓN ANTERIOR */}
                        <p className={`text-xs ml-[52px] leading-relaxed pr-6 transition-colors ${crearGasto ? 'text-orange-800 font-medium' : 'text-gray-400'}`}>
                            Marca esto si sacaste el dinero de la venta del día. Se restará para que te cuadre la cuenta y la caja.
                        </p>
                     </div>
                 </div>
            )}

            <div className={`transition-all duration-300 overflow-hidden ${liquidaDeuda ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-xl text-center font-bold border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16}/>
                    ¡Este pago liquidará la deuda!
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading || !monto}
                className={`w-full py-3.5 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg active:scale-95 ${liquidaDeuda ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
                {loading ? "Procesando..." : <> <DollarSign size={18} strokeWidth={2.5}/> Confirmar Pago </>}
            </button>
        </form>
      </div>
    </div>
  );
}