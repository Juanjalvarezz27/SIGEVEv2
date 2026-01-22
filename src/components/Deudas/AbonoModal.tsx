"use client";

import { useState, useEffect, useRef } from "react";
import { X, DollarSign, Wallet, ChevronDown, CheckCircle2, CreditCard, Banknote } from "lucide-react";
import { toast } from "react-toastify";

interface AbonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (monto: number, metodoId: string) => Promise<void>;
  deudaTotal: number;
  abonado: number;
}

export default function AbonoModal({ isOpen, onClose, onConfirm, deudaTotal, abonado }: AbonoModalProps) {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [metodos, setMetodos] = useState<any[]>([]);
  
  // Estado para el Dropdown Custom
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const restante = deudaTotal - abonado;

  // Cargar métodos
  useEffect(() => {
    if (isOpen) {
        fetch("/api/lista-productos")
            .then(res => res.json())
            .then(data => {
                if (data.metodos && Array.isArray(data.metodos)) {
                    setMetodos(data.metodos);
                    // Seleccionar el primero por defecto
                    if (data.metodos.length > 0) setMetodoSeleccionado(data.metodos[0]);
                }
            })
            .catch(err => console.error("Error cargando métodos", err));
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
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
    await onConfirm(parseFloat(monto), metodoSeleccionado.id);
    setLoading(false);
    setMonto("");
    onClose();
  };

  if (!isOpen) return null;

  const montoNum = parseFloat(monto) || 0;
  const liquidaDeuda = montoNum >= restante - 0.01;

  // Función para obtener icono según nombre (opcional, decorativo)
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

          {/* DROPDOWN CUSTOM DE MÉTODO DE PAGO */}
          <div ref={dropdownRef}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Método de Pago</label>
              <div className="relative">
                  {/* Botón Trigger */}
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

                  {/* Lista Desplegable */}
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

          {/* Mensaje de Liquidación */}
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