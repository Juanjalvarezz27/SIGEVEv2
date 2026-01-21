"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Trash2, Plus, Loader2, Wallet, Banknote, Landmark, Smartphone, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface MetodoPago {
  id: string;
  nombre: string;
}

// Iconos predefinidos
const TIPOS_METODO = [
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={18} />, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'pago_movil', label: 'Pago Móvil', icon: <Smartphone size={18} />, color: 'text-blue-600 bg-blue-50' },
  { id: 'zelle', label: 'Zelle / Digital', icon: <Wallet size={18} />, color: 'text-purple-600 bg-purple-50' },
  { id: 'punto', label: 'Punto / Tarjeta', icon: <CreditCard size={18} />, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'banco', label: 'Transferencia', icon: <Landmark size={18} />, color: 'text-gray-600 bg-gray-50' },
];

export default function GestionMetodosPago() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  
  // Estado para el Modal de Confirmación
  const [metodoAEliminar, setMetodoAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarMetodos();
  }, []);

  const cargarMetodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/metodos-pago');
      if (res.ok) {
        setMetodos(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    try {
      setCreando(true);
      const res = await fetch('/api/configuracion/metodos-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });

      if (res.ok) {
        const nuevo = await res.json();
        setMetodos([...metodos, nuevo]);
        setNuevoNombre('');
        toast.success('Método agregado');
      } else {
        toast.error('Error al agregar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setCreando(false);
    }
  };

  // Función que realmente elimina (llamada desde el modal)
  const confirmarEliminacion = async () => {
    if (!metodoAEliminar) return;

    try {
      setEliminando(true);
      const res = await fetch(`/api/configuracion/metodos-pago?id=${metodoAEliminar}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMetodos(metodos.filter(m => m.id !== metodoAEliminar));
        toast.success('Método eliminado');
        setMetodoAEliminar(null); // Cerrar modal
      } else {
        toast.error('No se puede eliminar (probablemente tenga ventas asociadas)');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  const getIconForName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('efectivo') || n.includes('cash') || n.includes('dolar')) return TIPOS_METODO[0];
    if (n.includes('movil') || n.includes('móvil')) return TIPOS_METODO[1];
    if (n.includes('zelle') || n.includes('binance') || n.includes('paypal')) return TIPOS_METODO[2];
    if (n.includes('punto') || n.includes('tarjeta') || n.includes('debito')) return TIPOS_METODO[3];
    return TIPOS_METODO[4]; 
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600"/>
              Métodos de Pago
            </h3>
            <p className="text-sm text-gray-500">Configura las opciones de pago para tus ventas.</p>
          </div>
          <button onClick={cargarMetodos} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Formulario Agregar */}
        <form onSubmit={handleCrear} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Nuevo Método</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
               <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Pago Móvil Banesco"
                  className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
               />
            </div>
            <button
              type="submit"
              disabled={creando || !nuevoNombre}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              {creando ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} className="mr-2"/>}
              Agregar
            </button>
          </div>
          
          {nuevoNombre && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 animate-in fade-in">
               <span>Se verá así:</span>
               <span className={`inline-flex items-center px-2 py-1 rounded-md border border-gray-200 bg-white ${getIconForName(nuevoNombre).color.replace('bg-', 'text-')}`}>
                  {getIconForName(nuevoNombre).icon}
                  <span className="ml-1 font-medium text-gray-700">{nuevoNombre}</span>
               </span>
            </div>
          )}
        </form>

        {/* Lista de Métodos */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Cargando métodos...</div>
        ) : metodos.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic">No hay métodos configurados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metodos.map((metodo) => {
              const estilo = getIconForName(metodo.nombre);
              return (
                <div key={metodo.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${estilo.color}`}>
                      {estilo.icon}
                    </div>
                    <span className="font-medium text-gray-700">{metodo.nombre}</span>
                  </div>
                  <button
                    onClick={() => setMetodoAEliminar(metodo.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar método"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MINI MODAL DE CONFIRMACIÓN */}
      {metodoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar método?</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro? Esto podría afectar el historial visual de las ventas si no se maneja con cuidado.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setMetodoAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  disabled={eliminando}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {eliminando ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}