"use client";

import { useState, useEffect } from "react";
import { X, Save, Phone, Search, Plus, Trash2, ShoppingCart, Package, AlertCircle, Minus, Weight, ChevronLeft, ChevronRight, User, Check } from "lucide-react";
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
  const [formData, setFormData] = useState({ persona: "", telefono: "" });
  
  // Datos
  const [productos, setProductos] = useState<any[]>([]);
  const [deudoresExistentes, setDeudoresExistentes] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Carrito y Busqueda
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);
  const [notasExtra, setNotasExtra] = useState("");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  // Control Inputs Peso
  const [pesoInputs, setPesoInputs] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [modoManual, setModoManual] = useState(false);

  // CARGAR DATOS INICIALES
  useEffect(() => {
    if (isOpen && tipo === "COBRAR") {
      setCargandoProductos(true);
      
      // 1. Cargar Productos
      fetch("/api/lista-productos")
        .then((res) => res.json())
        .then((data) => {
            const lista = data.productos && Array.isArray(data.productos) ? data.productos : [];
            setProductos(lista);
        })
        .catch(() => toast.error("Error inventario"))
        .finally(() => setCargandoProductos(false));

      // 2. Cargar Deudores para Autocomplete (Solo si es nuevo)
      if (!initialData) {
          fetch("/api/deudas?tipo=COBRAR")
            .then(res => res.json())
            .then(data => {
                const unicos = new Map();
                data.forEach((d: any) => {
                    if (!unicos.has(d.persona.toLowerCase())) {
                        unicos.set(d.persona.toLowerCase(), { persona: d.persona, telefono: d.telefono });
                    }
                });
                setDeudoresExistentes(Array.from(unicos.values()));
            });
      }
    }
  }, [isOpen, tipo, initialData]);

  // RESETEAR PAGINACIÓN AL BUSCAR
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  // LÓGICA DE AUTOCOMPLETE
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      setFormData({ ...formData, persona: valor });
      
      if (valor.length > 1) {
          const filtrados = deudoresExistentes.filter(d => 
              d.persona.toLowerCase().includes(valor.toLowerCase())
          );
          setSugerencias(filtrados);
          setMostrarSugerencias(true);
      } else {
          setMostrarSugerencias(false);
      }
  };

  const seleccionarDeudor = (deudor: any) => {
      setFormData({ persona: deudor.persona, telefono: deudor.telefono || "" });
      setMostrarSugerencias(false);
      toast.success(`Cliente seleccionado: ${deudor.persona}`);
  };

  // PARSER Y RESET (CARGA DE DATOS PARA EDITAR)
  useEffect(() => {
    if (initialData) {
      setFormData({ persona: initialData.persona, telefono: initialData.telefono || "" });
      
      // A. INTENTAR LEER JSON (NUEVO SISTEMA)
      if (initialData.detalles && Array.isArray(initialData.detalles) && initialData.detalles.length > 0) {
          setCarrito(initialData.detalles);
          
          // Sincronizar inputs de peso visuales
          const inputs: any = {};
          initialData.detalles.forEach((i: any) => {
              if (i.porPeso) inputs[i.id] = i.cantidad.toString();
          });
          setPesoInputs(inputs);
          setNotasExtra(""); // Si hay JSON, limpiamos notas legacy
          setModoManual(false);

      } else {
          // B. FALLBACK: LEER TEXTO (SISTEMA VIEJO)
          const desc = initialData.descripcion || "";
          const lineas = desc.split("\n");
          const itemsRecuperados: any[] = [];
          let notas = "";

          const regexProducto = /• ([\d\.]+) (?:kg|unid) x (.+) \(\$([\d\.]+)\) ➝ \$([\d\.]+)/;

          lineas.forEach((linea: string) => {
            const match = linea.match(regexProducto);
            if (match) {
              const cantidad = parseFloat(match[1]);
              const precio = parseFloat(match[3]);
              itemsRecuperados.push({
                id: `recup-${Math.random()}`,
                nombre: match[2].trim(),
                precio: precio,
                cantidad: cantidad,
                porPeso: linea.includes("kg"), 
                subtotal: cantidad * precio
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
            itemsRecuperados.forEach(i => {
                if (i.porPeso) inputs[i.id] = i.cantidad.toString();
            });
            setPesoInputs(inputs);
          } else {
            setNotasExtra(desc);
            setModoManual(true);
          }
      }

    } else {
      // MODO CREAR NUEVO
      setFormData({ persona: "", telefono: "" });
      setCarrito([]);
      setPesoInputs({});
      setNotasExtra("");
      setModoManual(tipo === "PAGAR"); 
    }
  }, [initialData, isOpen, tipo]);

  // --- LOGICA CARRITO ---
  const agregarAlCarrito = (producto: any) => {
    const existente = carrito.find((p) => p.id === producto.id);
    if (existente) {
      if (!producto.porPeso) {
          const nuevaCant = existente.cantidad + 1;
          setCarrito(carrito.map((p) => 
            p.id === producto.id ? { ...p, cantidad: nuevaCant, subtotal: nuevaCant * p.precio } : p
          ));
      } else {
          toast.info("Ajusta el peso en la lista.");
      }
    } else {
      const cantidadInicial = producto.porPeso ? 0 : 1; 
      setCarrito([...carrito, { 
          ...producto, 
          cantidad: cantidadInicial, 
          subtotal: cantidadInicial * producto.precio,
          porPeso: producto.porPeso
      }]);
      if (producto.porPeso) {
          setPesoInputs(prev => ({ ...prev, [producto.id]: "" }));
      }
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
          setCarrito(carrito.map(p => 
              p.id === id ? { ...p, cantidad: num, subtotal: num * p.precio } : p
          ));
      }
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.persona.trim()) { toast.warning("Nombre obligatorio"); return; }
    if (!formData.telefono || formData.telefono.length !== 11) { toast.warning("Teléfono 11 dígitos"); return; }

    setLoading(true);

    let montoFinal = 0;
    let descripcionFinal = "";

    if (modoManual) {
       montoFinal = initialData ? initialData.monto : 0; 
       descripcionFinal = notasExtra; // En manual guardamos texto
    } else {
      if (carrito.length === 0) { toast.warning("Carrito vacío"); setLoading(false); return; }
      
      const invalidos = carrito.filter(p => p.porPeso && p.cantidad <= 0);
      if (invalidos.length > 0) { toast.warning(`Ingresa peso válido para: ${invalidos[0].nombre}`); setLoading(false); return; }

      montoFinal = totalCarrito;
      
      // Generamos descripción textual SOLO como respaldo visual/búsqueda
      const listaProductos = carrito.map(p => {
            const unidad = p.porPeso ? "kg" : "unid";
            return `• ${p.cantidad} ${unidad} x ${p.nombre} ($${p.precio}) ➝ $${p.subtotal.toFixed(2)}`;
        }).join("\n");

      descripcionFinal = notasExtra ? `${notasExtra}\n${listaProductos}` : listaProductos;
    }

    // AQUI ENVIAMOS EL JSON "productos" AL BACKEND
    const payload = { 
        ...formData, 
        monto: montoFinal, 
        descripcion: descripcionFinal,
        productos: modoManual ? [] : carrito 
    };

    if (tipo === "PAGAR") {
         await onSubmit({ ...payload, monto: parseFloat(notasExtra) || 0, descripcion: "Deuda Proveedor (Manual)" }); 
    } else {
         await onSubmit(payload);
    }

    setLoading(false);
    onClose();
  };

  // Paginación
  const productosFiltrados = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const totalPages = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE);
  const paginatedProducts = productosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col relative h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-200 my-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-white flex-shrink-0">
            <div>
                <h3 className="text-2xl font-bold text-gray-900">
                {initialData ? "Editar Fiado" : "Nueva Venta a Crédito"}
                </h3>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24}/>
            </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#F8FAFC]">
          
          {/* DATOS CLIENTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AUTOCOMPLETE NOMBRE */}
            <div className="relative">
                <div className={`bg-white px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 relative z-20 shadow-sm ${!formData.persona ? 'border-gray-300' : 'border-indigo-300 ring-1 ring-indigo-50'}`}>
                    <User size={20} className="text-gray-400"/>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">Cliente</label>
                        <input
                            required autoFocus
                            className="w-full bg-transparent outline-none font-semibold text-gray-800 text-base placeholder:text-gray-300"
                            placeholder="Buscar o crear nuevo..."
                            value={formData.persona}
                            onChange={handleNombreChange}
                            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                        />
                    </div>
                </div>

                {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto ring-1 ring-black/5">
                        <div className="p-3 text-xs text-gray-400 font-bold uppercase bg-gray-50">Clientes Encontrados</div>
                        {sugerencias.map((s, i) => (
                            <button 
                                key={i}
                                type="button"
                                onClick={() => seleccionarDeudor(s)}
                                className="w-full text-left px-5 py-3 hover:bg-indigo-50 text-base text-gray-700 flex justify-between items-center group border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <span className="font-medium group-hover:text-indigo-700">{s.persona}</span>
                                <span className="text-sm text-gray-400 group-hover:text-indigo-500 flex items-center gap-1"><Phone size={14}/> {s.telefono}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TELEFONO */}
            <div className={`bg-white px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 shadow-sm ${formData.telefono.length !== 11 ? 'border-gray-200' : 'border-green-300 ring-1 ring-green-50'}`}>
                <Phone size={20} className={formData.telefono.length === 11 ? "text-green-500" : "text-gray-400"}/>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">WhatsApp (11 dígitos)</label>
                    <input
                        className="w-full bg-transparent outline-none font-medium text-gray-600 text-base placeholder:text-gray-300"
                        placeholder="0412..."
                        maxLength={11}
                        value={formData.telefono}
                        onChange={e => /^\d*$/.test(e.target.value) && setFormData({...formData, telefono: e.target.value})}
                    />
                </div>
                {formData.telefono.length === 11 && <Check size={20} className="text-green-500"/>}
            </div>
          </div>

          {/* HISTORIAL */}
          {notasExtra && (
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-sm text-orange-800">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5"/>
                <div>
                    <span className="font-bold block mb-1">Nota Anterior:</span>
                    <pre className="whitespace-pre-wrap font-sans opacity-80">{notasExtra}</pre>
                </div>
            </div>
          )}

          {/* AREA DE TRABAJO */}
          {modoManual ? (
             <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50 text-lg">Modo Manual Activado</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[400px]">
                
                {/* IZQUIERDA: LISTA PRODUCTOS */}
                <div className="lg:col-span-7 border border-gray-200 rounded-2xl flex flex-col h-full bg-white overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                className="w-full pl-10 p-2.5 rounded-lg border border-gray-200 outline-none focus:border-indigo-500 text-sm font-medium bg-white transition-all shadow-sm" 
                                placeholder="Buscar producto..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
                        {cargandoProductos ? <div className="text-center py-20 text-gray-400">Cargando...</div> : 
                          productosFiltrados.length === 0 ? <div className="text-center py-20 text-gray-400">Sin resultados</div> :
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paginatedProducts.map((prod) => (
                                <button 
                                    type="button"
                                    key={prod.id}
                                    onClick={() => agregarAlCarrito(prod)}
                                    className="w-full bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                                >
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-gray-700 text-sm truncate group-hover:text-indigo-700">{prod.nombre}</p>
                                            {prod.porPeso && <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0">Kg</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono group-hover:text-indigo-500 font-medium">${prod.precio}</p>
                                    </div>
                                    <div className="h-8 w-8 bg-gray-50 text-gray-400 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Plus size={18} strokeWidth={2.5}/>
                                    </div>
                                </button>
                            ))}
                          </div>
                        }
                    </div>

                    {totalPages > 1 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500 font-medium">
                            <span>Página {currentPage} de {totalPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* DERECHA: CARRITO */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <div className="bg-white border-2 border-indigo-50 rounded-2xl flex-1 flex flex-col shadow-xl shadow-indigo-50/50 overflow-hidden">
                        <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                                <ShoppingCart size={20}/> Pedido Actual
                            </div>
                            <span className="text-xs bg-white text-indigo-600 px-2.5 py-1 rounded-lg font-bold shadow-sm border border-indigo-100">
                               {carrito.length} Items
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-white">
                            {carrito.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-60">
                                    <Package size={48} className="mb-3 stroke-1"/>
                                    <p className="text-sm font-medium text-center">Selecciona productos</p>
                                </div>
                            ) : (
                                carrito.map((item, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 group hover:border-indigo-100 transition-colors">
                                        
                                        <div className="w-[5rem] flex-shrink-0">
                                            {item.porPeso ? (
                                                <div className="relative">
                                                    <input 
                                                        type="number"
                                                        className="w-full text-center font-bold text-indigo-600 bg-gray-50 border border-gray-100 rounded-lg py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                                        value={pesoInputs[item.id] !== undefined ? pesoInputs[item.id] : item.cantidad}
                                                        onChange={(e) => handlePesoChange(item.id, e.target.value)}
                                                        step="any" placeholder="0.0"
                                                    />
                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 font-bold pointer-events-none">KG</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden h-7">
                                                    <button type="button" onClick={() => cambiarCantidadUnidad(item.id, -1)} className="px-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 h-full"><Minus size={12}/></button>
                                                    <span className="flex-1 text-center text-xs font-bold text-gray-700">{item.cantidad}</span>
                                                    <button type="button" onClick={() => cambiarCantidadUnidad(item.id, 1)} className="px-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 h-full"><Plus size={12}/></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 px-1">
                                            <p className="text-gray-800 font-bold text-xs truncate leading-tight">{item.nombre}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">${item.precio} c/u</p>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-gray-900 text-sm">${item.subtotal.toFixed(2)}</p>
                                            <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 mt-1"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className="bg-white p-5 border-t border-gray-100 z-10">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Final</span>
                                <span className="text-3xl font-black text-indigo-600 tracking-tight">${totalCarrito.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3 flex-shrink-0 z-20">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"><Save size={18} /> {loading ? "Guardando..." : "Confirmar Fiado"}</button>
        </div>

      </div>
    </div>
  );
}