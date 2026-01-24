"use client";

import { useState, useEffect } from "react";
import { Search, Calculator, ArrowRight, CheckCircle2, AlertTriangle, CheckSquare, Square, Save, X, Grid } from "lucide-react";
import { toast } from "react-toastify";

export default function ActualizadorPrecios() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  // Selección
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  // Formulario de Regla
  const [accion, setAccion] = useState<"AUMENTAR" | "DISMINUIR" | "FIJAR">("AUMENTAR");
  const [tipoValor, setTipoValor] = useState<"PORCENTAJE" | "MONTO">("PORCENTAJE");
  const [valor, setValor] = useState("");
  const [redondear, setRedondear] = useState(false);

  // Modal Confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      // RUTA CORREGIDA: Sin /inventario
      const res = await fetch(`/api/actualizacion-masiva?search=${busqueda}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
            setProductos(data);
        } else {
            setProductos([]);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error cargando lista");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchProductos, 400);
    return () => clearTimeout(debounce);
  }, [busqueda]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(seleccionados);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSeleccionados(newSet);
  };

  const toggleSelectAll = () => {
    if (seleccionados.size === productos.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(productos.map(p => p.id)));
    }
  };

  const calcularSimulacion = (precioActual: number) => {
    const val = parseFloat(valor) || 0;
    let nuevo = precioActual;
    
    if (accion === "FIJAR") {
      nuevo = val;
    } else {
      let delta = tipoValor === "PORCENTAJE" ? precioActual * (val / 100) : val;
      if (accion === "AUMENTAR") nuevo += delta;
      if (accion === "DISMINUIR") nuevo -= delta;
    }
    
    if (nuevo < 0) nuevo = 0;
    if (redondear) nuevo = Math.round(nuevo * 2) / 2;
    
    return nuevo;
  };

  const handleGuardar = async () => {
    setProcesando(true);
    try {
      // RUTA CORREGIDA
      const res = await fetch('/api/actualizacion-masiva', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(seleccionados),
          tipoAccion: accion,
          tipoValor,
          valor: parseFloat(valor),
          redondear
        })
      });

      if (res.ok) {
        toast.success("¡Precios actualizados correctamente!");
        setSeleccionados(new Set());
        setValor("");
        setShowConfirm(false);
        fetchProductos();
      } else {
        toast.error("Error al actualizar");
      }
    } catch (e) {
      toast.error("Error de conexión");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUMNA IZQUIERDA: LISTA (GRID 2x2) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[650px]">
        
        {/* Header FIJO (No se mueve al scrollear, evita el corte visual) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm rounded-t-2xl z-10">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                
                {/* Botón Seleccionar Todo */}
                <button 
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all w-full sm:w-auto justify-center shadow-sm"
                >
                    {seleccionados.size > 0 && seleccionados.size === productos.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                    {seleccionados.size === productos.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </button>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-1">
                <span>Resultados: {productos.length}</span>
                <span className={seleccionados.size > 0 ? "text-indigo-600 font-bold" : ""}>{seleccionados.size} seleccionados</span>
            </div>
        </div>

        {/* Área Scrollable con GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50/30">
          {loading ? (
             <div className="text-center py-20 text-gray-400 text-sm">Cargando inventario...</div>
          ) : productos.length === 0 ? (
             <div className="text-center py-20 text-gray-400 text-sm">No se encontraron productos.</div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {productos.map(p => {
                    const isSelected = seleccionados.has(p.id);
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => toggleSelect(p.id)}
                        className={`
                            relative p-3 rounded-xl border cursor-pointer transition-all duration-200 group
                            ${isSelected 
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                                : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md'
                            }
                        `}
                      >
                        <div className="flex justify-between items-start gap-3">
                            {/* Checkbox y Nombre */}
                            <div className="flex gap-3 items-start flex-1 min-w-0">
                                <div className={`mt-0.5 transition-colors flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                    {isSelected ? <CheckSquare size={18}/> : <Square size={18}/>}
                                </div>
                                <div>
                                    <p className={`text-xs font-bold uppercase truncate pr-2 ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`} title={p.nombre}>
                                        {p.nombre}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Stock disponible</p>
                                </div>
                            </div>

                            {/* Precio */}
                            <div className="text-right bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                                <span className="block text-xs font-black text-gray-800">${p.precio.toFixed(2)}</span>
                            </div>
                        </div>
                      </div>
                    )
                 })}
             </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: REGLAS (Igual que antes, solo visualmente limpio) */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden top-6">
            <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
                <Calculator className="text-indigo-600" size={24}/>
                Regla de Precio
            </div>

            <div className="space-y-5">
                {/* 1. ACCIÓN */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">1. Acción</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['AUMENTAR', 'DISMINUIR', 'FIJAR'].map((opcion) => (
                            <button
                                key={opcion}
                                onClick={() => setAccion(opcion as any)}
                                className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${accion === opcion ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {opcion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. TIPO DE VALOR */}
                {accion !== 'FIJAR' && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">2. Tipo</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setTipoValor('PORCENTAJE')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${tipoValor === 'PORCENTAJE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>% Porcentaje</button>
                            <button onClick={() => setTipoValor('MONTO')} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${tipoValor === 'MONTO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>$ Fijo</button>
                        </div>
                    </div>
                )}

                {/* 3. VALOR */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">3. Valor</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 font-bold text-gray-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-lg"
                            placeholder="0.00"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                            {accion === 'FIJAR' || tipoValor === 'MONTO' ? '$' : '%'}
                        </span>
                    </div>
                </div>

                {/* 4. REDONDEO */}
                <div onClick={() => setRedondear(!redondear)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${redondear ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${redondear ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300'}`}>
                        {redondear && <CheckCircle2 size={14}/>}
                    </div>
                    <div>
                        <p className={`text-xs font-bold ${redondear ? 'text-emerald-700' : 'text-gray-600'}`}>Redondeo Inteligente</p>
                        <p className="text-[10px] text-gray-400">Ej: 10.13 ➝ 10.00</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                    disabled={seleccionados.size === 0 || !valor}
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   <Save size={18}/> Actualizar ({seleccionados.size})
                </button>
            </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" size={20}/> Confirmar Cambios
                    </h3>
                    <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-gray-600 mb-4">
                        Modificarás el precio de <span className="font-bold">{seleccionados.size} productos</span>. Revisa la muestra:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {productos.filter(p => seleccionados.has(p.id)).slice(0, 50).map(p => {
                            const nuevo = calcularSimulacion(p.precio);
                            const sube = nuevo > p.precio;
                            const baja = nuevo < p.precio;
                            return (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                                    <span className="font-medium text-gray-700 truncate flex-1">{p.nombre}</span>
                                    <div className="flex items-center gap-3 ml-4">
                                        <span className="text-gray-400 line-through text-xs">${p.precio.toFixed(2)}</span>
                                        <ArrowRight size={14} className="text-gray-300"/>
                                        <span className={`font-bold ${sube ? 'text-green-600' : (baja ? 'text-red-500' : 'text-gray-800')}`}>
                                            ${nuevo.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        {seleccionados.size > 50 && (
                            <p className="text-center text-xs text-gray-400 italic mt-2">... y {seleccionados.size - 50} más.</p>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 mt-auto">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 text-gray-600 font-bold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button onClick={handleGuardar} disabled={procesando} className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70">
                        {procesando ? "Aplicando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}