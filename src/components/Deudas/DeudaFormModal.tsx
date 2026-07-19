"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Phone, Search, Plus, Trash2, ShoppingCart, Package, AlertCircle, Minus, Weight, ChevronLeft, ChevronRight, User, Check, FileText, DollarSign } from "lucide-react";
import { toast } from "react-toastify";

interface DeudaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  tipo: "COBRAR" | "PAGAR";
}

const ITEMS_PER_PAGE = 20;

export default function DeudaFormModal({ isOpen, onClose, onSubmit, initialData, tipo }: DeudaFormModalProps) {
  const [formData, setFormData] = useState({ persona: "", telefono: "", cedula: "" });
  
  // Datos
  const [productos, setProductos] = useState<any[]>([]);
  const [deudoresExistentes, setDeudoresExistentes] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Carrito y Busqueda
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);
  
  // CAMPOS MANUALES (PARA "POR PAGAR")
  const [notasExtra, setNotasExtra] = useState("");
  const [montoManual, setMontoManual] = useState("");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pesoInputs, setPesoInputs] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [modoManual, setModoManual] = useState(false);

  const MAX_CHARS_DESC = 200;

  // CARGAR DATOS INICIALES
  useEffect(() => {
    if (isOpen) {
      setModoManual(tipo === "PAGAR");

      if (tipo === "COBRAR") {
        setCargandoProductos(true);
        fetch("/api/lista-productos")
          .then((res) => res.json())
          .then((data) => {
              const lista = data.productos && Array.isArray(data.productos) ? data.productos : [];
              setProductos(lista);
          })
          .catch(() => toast.error("Error inventario"))
          .finally(() => setCargandoProductos(false));
      }

      if (!initialData) {
          fetch(`/api/deudas?tipo=${tipo}`)
            .then(res => res.json())
            .then(data => {
                const unicos = new Map();
                const deudasArray = Array.isArray(data) ? data : (data.deudas || []);
                deudasArray.forEach((d: any) => {
                    if (!unicos.has(d.persona.toLowerCase())) {
                        unicos.set(d.persona.toLowerCase(), { persona: d.persona, telefono: d.telefono, cedula: d.cedula || "" });
                    }
                });
                setDeudoresExistentes(Array.from(unicos.values()));
            });
      }
    }
  }, [isOpen, tipo, initialData]);

  // RESETEAR PAGINACIÓN
  useEffect(() => { setCurrentPage(1); }, [busqueda]);

  // AUTOCOMPLETE
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      setFormData({ ...formData, persona: valor });
      if (valor.length > 1) {
          const filtrados = deudoresExistentes.filter(d => 
              d.persona.toLowerCase().includes(valor.toLowerCase()) || 
              (d.cedula && d.cedula.toLowerCase().includes(valor.toLowerCase()))
          );
          setSugerencias(filtrados);
          setMostrarSugerencias(true);
      } else {
          setMostrarSugerencias(false);
      }
  };

  const seleccionarDeudor = (deudor: any) => {
      setFormData({ persona: deudor.persona, telefono: deudor.telefono || "", cedula: deudor.cedula || "" });
      setMostrarSugerencias(false);
      toast.success(`${tipo === "COBRAR" ? 'Cliente' : 'Proveedor'} seleccionado`);
  };

  // PARSER (EDITAR)
  useEffect(() => {
    if (initialData) {
      setFormData({ persona: initialData.persona, telefono: initialData.telefono || "", cedula: initialData.cedula || "" });
      
      if (tipo === "PAGAR") {
          setNotasExtra(initialData.descripcion || "");
          setMontoManual(initialData.monto.toString());
          setModoManual(true);
          return; 
      }

      // COBRAR (CARRITO)
      if (initialData.detalles && Array.isArray(initialData.detalles) && initialData.detalles.length > 0) {
          setCarrito(initialData.detalles);
          const inputs: any = {};
          initialData.detalles.forEach((i: any) => { if (i.porPeso) inputs[i.id] = i.cantidad.toString(); });
          setPesoInputs(inputs);
          setNotasExtra(""); 
          setModoManual(false);
      } else {
          // Fallback texto
          const desc = initialData.descripcion || "";
          const lineas = desc.split("\n");
          const itemsRecuperados: any[] = [];
          let notas = "";
          const regexProducto = /• ([\d\.]+) (?:kg|unid) x (.+) \(\$([\d\.]+)\) ➝ \$([\d\.]+)/;

          lineas.forEach((linea: string) => {
            const match = linea.match(regexProducto);
            if (match) {
              itemsRecuperados.push({
                id: `recup-${Math.random()}`,
                nombre: match[2].trim(),
                precio: parseFloat(match[3]),
                cantidad: parseFloat(match[1]),
                porPeso: linea.includes("kg"), 
                subtotal: parseFloat(match[1]) * parseFloat(match[3])
              });
            } else if (linea.trim() !== "") {
              notas += linea + "\n";
            }
          });

          if (itemsRecuperados.length > 0) {
            setCarrito(itemsRecuperados);
            setNotasExtra(notas.trim());
            setModoManual(false);
            const inputs: any = {};
            itemsRecuperados.forEach(i => { if (i.porPeso) inputs[i.id] = i.cantidad.toString(); });
            setPesoInputs(inputs);
          } else {
            setNotasExtra(desc);
            setModoManual(true);
          }
      }

    } else {
      setFormData({ persona: "", telefono: "", cedula: "" });
      setCarrito([]);
      setPesoInputs({});
      setNotasExtra("");
      setMontoManual("");
      setModoManual(tipo === "PAGAR"); 
    }
  }, [initialData, isOpen, tipo]);

  // CARRITO LOGIC
  const agregarAlCarrito = (producto: any) => {
    const existente = carrito.find((p) => p.id === producto.id);
    if (existente) {
      if (!producto.porPeso) {
          const nuevaCant = existente.cantidad + 1;
          setCarrito(carrito.map((p) => p.id === producto.id ? { ...p, cantidad: nuevaCant, subtotal: nuevaCant * p.precio } : p));
      } else {
          toast.info("Ajusta el peso en la lista.");
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: producto.porPeso ? 0 : 1, subtotal: (producto.porPeso ? 0 : 1) * producto.precio, porPeso: producto.porPeso }]);
      if (producto.porPeso) setPesoInputs(prev => ({ ...prev, [producto.id]: "" }));
    }
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter((p) => p.id !== id));
    const newInputs = { ...pesoInputs };
    delete newInputs[id];
    setPesoInputs(newInputs);
  };

  const cambiarCantidadUnidad = (id: string, delta: number) => {
      setCarrito(carrito.map(p => {
          if (p.id === id) {
              const nueva = Math.max(1, p.cantidad + delta);
              return { ...p, cantidad: nueva, subtotal: nueva * p.precio };
          }
          return p;
      }));
  };

  const handlePesoChange = (id: string, val: string) => {
      setPesoInputs(prev => ({ ...prev, [id]: val }));
      const num = parseFloat(val);
      if (!isNaN(num)) {
          setCarrito(carrito.map(p => p.id === id ? { ...p, cantidad: num, subtotal: num * p.precio } : p));
      }
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.persona.trim()) { toast.warning("Nombre obligatorio"); return; }
    if (formData.telefono && formData.telefono.length !== 11) { toast.warning("Teléfono debe tener 11 dígitos"); return; }

    setLoading(true);
    let montoFinal = 0;
    let descripcionFinal = "";

    if (modoManual) {
       if (!notasExtra.trim()) { toast.warning("Escribe una descripción"); setLoading(false); return; }
       if (!montoManual || parseFloat(montoManual) <= 0) { toast.warning("Ingresa un monto válido"); setLoading(false); return; }
       montoFinal = parseFloat(montoManual);
       descripcionFinal = notasExtra;
    } else {
      if (carrito.length === 0) { toast.warning("Carrito vacío"); setLoading(false); return; }
      const invalidos = carrito.filter(p => p.porPeso && p.cantidad <= 0);
      if (invalidos.length > 0) { toast.warning(`Ingresa peso válido para: ${invalidos[0].nombre}`); setLoading(false); return; }
      montoFinal = totalCarrito;
      const listaProductos = carrito.map(p => {
            const unidad = p.porPeso ? "kg" : "unid";
            return `• ${p.cantidad} ${unidad} x ${p.nombre} ($${p.precio}) ➝ $${p.subtotal.toFixed(2)}`;
        }).join("\n");
      descripcionFinal = notasExtra ? `${notasExtra}\n${listaProductos}` : listaProductos;
    }

    const payload = { 
        ...formData, 
        monto: montoFinal, 
        descripcion: descripcionFinal,
        productos: modoManual ? [] : carrito 
    };

    await onSubmit(payload);
    setLoading(false);
    onClose();
  };

  const productosFiltrados = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const paginatedProducts = productosFiltrados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col relative h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-200 my-auto">
        
        {/* HEADER */}
        <div className={`flex justify-between items-center px-8 py-5 border-b border-gray-100 flex-shrink-0 ${tipo === "PAGAR" ? 'bg-orange-50' : 'bg-white'}`}>
            <div>
                <h3 className={`text-2xl font-bold ${tipo === "PAGAR" ? 'text-orange-900' : 'text-gray-900'}`}>
                {initialData ? "Editar Deuda" : (tipo === "PAGAR" ? "Registrar Cuenta por Pagar" : "Nueva Venta a Crédito")}
                </h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm">
                <X size={24}/>
            </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#F8FAFC]">
          
          {/* DATOS CLIENTE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative col-span-1 md:col-span-1">
                <div className={`bg-white px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 relative z-20 shadow-sm ${!formData.persona ? 'border-gray-300' : 'border-indigo-300 ring-1 ring-indigo-50'}`}>
                    <User size={20} className="text-gray-400"/>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{tipo === "PAGAR" ? "Proveedor / Acreedor" : "Cliente"}</label>
                        <input required autoFocus className="w-full bg-transparent outline-none font-semibold text-gray-800 text-base placeholder:text-gray-300" placeholder={tipo === "PAGAR" ? "Ej: Distribuidora Polar" : "Buscar cliente..."} value={formData.persona} onChange={handleNombreChange} onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)} />
                    </div>
                </div>
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto ring-1 ring-black/5">
                        <div className="p-3 text-xs text-gray-400 font-bold uppercase bg-gray-50">Encontrados</div>
                        {sugerencias.map((s, i) => (
                            <button key={i} type="button" onClick={() => seleccionarDeudor(s)} className="w-full text-left px-5 py-3 hover:bg-indigo-50 text-base text-gray-700 flex justify-between items-center group border-b border-gray-50 last:border-0 transition-colors">
                                <span className="font-medium group-hover:text-indigo-700">{s.persona} {s.cedula && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded ml-2">{s.cedula}</span>}</span>
                                <span className="text-sm text-gray-400 group-hover:text-indigo-500 flex items-center gap-1"><Phone size={14}/> {s.telefono}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`bg-white px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 shadow-sm ${formData.cedula.length > 0 ? 'border-gray-200' : 'border-gray-200'}`}>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Cédula / RIF</label>
                    <input className="w-full bg-transparent outline-none font-medium text-gray-600 text-base placeholder:text-gray-300" placeholder="Ej: V-12345678" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                </div>
            </div>

            <div className={`bg-white px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 shadow-sm ${formData.telefono.length > 0 && formData.telefono.length !== 11 ? 'border-red-200' : 'border-gray-200'}`}>
                <Phone size={20} className={formData.telefono.length === 11 ? "text-green-500" : "text-gray-400"}/>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp (Opcional)</label>
                    <input className="w-full bg-transparent outline-none font-medium text-gray-600 text-base placeholder:text-gray-300" placeholder="0412..." maxLength={11} value={formData.telefono} onChange={e => /^\d*$/.test(e.target.value) && setFormData({...formData, telefono: e.target.value})} />
                </div>
                {formData.telefono.length === 11 && <Check size={20} className="text-green-500"/>}
            </div>
          </div>

          {/* AREA DE TRABAJO */}
          {modoManual ? (
             <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 h-72">
                
                {/* IZQUIERDA: DESCRIPCIÓN */}
                <div className="flex-1 flex flex-col h-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1 justify-between">
                        <span>Descripción de la Deuda</span>
                        <span className={`${notasExtra.length >= MAX_CHARS_DESC ? 'text-red-500' : 'text-gray-400'}`}>{notasExtra.length}/{MAX_CHARS_DESC}</span>
                    </label>
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 transition-all flex flex-col">
                        <div className="flex gap-3 h-full">
                            <FileText className="text-orange-300 mt-1 flex-shrink-0" size={24}/>
                            <textarea 
                                maxLength={MAX_CHARS_DESC}
                                className="w-full h-full resize-none outline-none text-gray-700 placeholder:text-gray-300 bg-transparent text-lg leading-relaxed custom-scrollbar"
                                placeholder="Ej: Compra de mercancía, pago de servicio..."
                                value={notasExtra}
                                onChange={(e) => setNotasExtra(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                {/* DERECHA: MONTO */}
                <div className="w-full md:w-80 flex flex-col h-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Monto a Pagar</label>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center items-center h-full gap-2 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 transition-all">
                        <span className="text-orange-500 font-bold uppercase tracking-wider text-xs">Total en Dólares</span>
                        <div className="flex items-center gap-1">
                            <DollarSign size={32} className="text-gray-300"/>
                            <input 
                                type="number" 
                                className="w-full text-5xl font-black text-gray-800 outline-none text-center placeholder:text-gray-200"
                                placeholder="0.00"
                                value={montoManual}
                                onChange={(e) => setMontoManual(e.target.value)}
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
             </div>
          ) : (
            // --- MODO CARRITO REDISEÑADO ---
            <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {/* BUSCADOR DE PRODUCTOS (Autocomplete Style) */}
                <div className="relative z-40">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Buscar y agregar producto</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            className="w-full pl-10 p-3.5 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-base font-medium bg-white transition-all shadow-sm" 
                            placeholder="Ej: Harina Pan, Arroz..." 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                        />
                    </div>
                    {/* RESULTADOS DEL BUSCADOR */}
                    {busqueda.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto ring-1 ring-black/5 custom-scrollbar">
                            {cargandoProductos ? <div className="p-4 text-center text-sm text-gray-400">Cargando catálogo...</div> : 
                             productosFiltrados.length === 0 ? <div className="p-4 text-center text-sm text-gray-400">No se encontraron productos</div> :
                             productosFiltrados.slice(0, 15).map(prod => (
                                <button type="button" key={prod.id} onClick={() => { agregarAlCarrito(prod); setBusqueda(''); }} className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex justify-between items-center group border-b border-gray-50 last:border-0 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700 group-hover:text-indigo-700 text-sm">{prod.nombre}</span>
                                        {prod.porPeso && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Kg</span>}
                                    </div>
                                    <span className="text-sm font-mono text-gray-500 group-hover:text-indigo-600 font-bold">${prod.precio}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* LISTA DE PRODUCTOS AGREGADOS */}
                <div className="bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
                    <div className="bg-gray-50 p-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 font-bold text-sm"><ShoppingCart size={18}/> Lista de Artículos</div>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{carrito.length} Ítems</span>
                    </div>
                    
                    <div className="p-4 space-y-2 bg-white relative z-10 min-h-[150px]">
                        {carrito.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-300 opacity-80">
                                <Package size={40} className="mb-3 stroke-1 text-gray-200"/>
                                <p className="text-sm font-medium text-center text-gray-400">Busca y agrega productos arriba</p>
                            </div>
                        ) : (
                            carrito.map((item, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                                    {/* Control Cantidad/Peso */}
                                    <div className="w-[6rem] flex-shrink-0">
                                        {item.porPeso ? (
                                            <div className="relative">
                                                <input type="number" className="w-full text-center font-bold text-indigo-600 bg-gray-50 border border-gray-200 rounded-lg py-1.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={pesoInputs[item.id] !== undefined ? pesoInputs[item.id] : item.cantidad} onChange={(e) => handlePesoChange(item.id, e.target.value)} step="any" placeholder="0.0" />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold pointer-events-none">KG</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-8">
                                                <button type="button" onClick={() => cambiarCantidadUnidad(item.id, -1)} className="px-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 h-full transition-colors"><Minus size={14}/></button>
                                                <span className="flex-1 text-center text-sm font-bold text-gray-800">{item.cantidad}</span>
                                                <button type="button" onClick={() => cambiarCantidadUnidad(item.id, 1)} className="px-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 h-full transition-colors"><Plus size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-gray-900 font-bold text-sm truncate">{item.nombre}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">${item.precio} c/u</p>
                                    </div>
                                    
                                    {/* Subtotal & Delete */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <p className="font-black text-gray-900 text-base w-16 text-right">${item.subtotal.toFixed(2)}</p>
                                        <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* TOTAL */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200 z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Total de la Deuda</span>
                            <span className="text-3xl font-black text-indigo-600 tracking-tight">${totalCarrito.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3 flex-shrink-0 z-20">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className={`px-8 py-3 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm ${tipo === "PAGAR" ? "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"}`}>
                <Save size={18} /> {loading ? "Guardando..." : "Confirmar"}
            </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}