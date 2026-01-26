import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Package, CreditCard, Users, 
  Calendar, DollarSign, Wallet, Store, 
  ChevronLeft, ChevronRight
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ComercioDetallePage({ params, searchParams }: PageProps) {
  const session = await auth();
  
  // @ts-ignore
  if (session?.user?.rol !== 'SUPER_ADMIN') redirect("/home");

  const { id } = await params;
  const { page } = await searchParams;
  
  // PAGINACIÓN PRODUCTOS
  const currentPage = Number(page) || 1;
  const itemsPerPage = 50;
  const skip = (currentPage - 1) * itemsPerPage;

  // 1. CARGA DE DATOS (PARALELO PARA VELOCIDAD)
  const [comercio, productos, totalProductos] = await Promise.all([
    // Datos del Comercio
    prisma.comercio.findUnique({
      where: { id },
      include: {
        metodosPago: true,
        usuarios: { select: { id: true, nombre: true, email: true, rol: true } },
        _count: { select: { ventas: true, deudas: true } },
        // Traemos sumas para ver volumen de negocio (opcional pero útil)
        ventas: { select: { total: true } }, 
        deudas: { where: { estado: 'PENDIENTE' }, select: { monto: true } }
      }
    }),
    // Productos Paginados
    prisma.producto.findMany({
      where: { comercioId: id, activo: true }, // Solo activos
      select: { id: true, nombre: true, precio: true, stock: true },
      orderBy: { nombre: 'asc' },
      take: itemsPerPage,
      skip: skip,
    }),
    // Conteo Total para Paginación
    prisma.producto.count({ where: { comercioId: id, activo: true } })
  ]);

  if (!comercio) {
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Comercio no encontrado</h1>
            <Link href="/admin/comercios" className="text-indigo-600 hover:underline mt-4 block">Volver al listado</Link>
        </div>
    );
  }

  // Cálculos rápidos
  const totalPaginas = Math.ceil(totalProductos / itemsPerPage);
  // Suma total histórica aproximada
  const totalVendido = comercio.ventas.reduce((acc, v) => acc + v.total, 0);
  const totalDeuda = comercio.deudas.reduce((acc, d) => acc + d.monto, 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20}/>
        </Link>
        <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {comercio.nombre}
                {comercio.estado === 'SUSPENDIDO' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-lg border border-red-200">SUSPENDIDO</span>}
            </h1>
            <p className="text-sm text-gray-500 font-mono">ID: {comercio.id}</p>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN RAPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>
              <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Volumen Ventas</p>
                  <p className="text-xl font-black text-gray-800">${totalVendido.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Wallet size={24}/></div>
              <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Deuda en Calle</p>
                  <p className="text-xl font-black text-gray-800">${totalDeuda.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
              <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Usuarios</p>
                  <p className="text-xl font-black text-gray-800">{comercio.usuarios.length}</p>
              </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={24}/></div>
              <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Vencimiento</p>
                  <p className="text-sm font-black text-gray-800">
                      {comercio.fechaVencimiento ? new Date(comercio.fechaVencimiento).toLocaleDateString() : 'N/A'}
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: DETALLES Y MÉTODOS */}
          <div className="space-y-6">
              
              {/* Info de Contacto */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                      <Store size={18}/> Datos del Negocio
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Contacto</p>
                          <p className="font-medium">{comercio.nombreContacto || "No registrado"}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                          <p className="font-medium text-indigo-600">{comercio.emailContacto}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Teléfono</p>
                          <p className="font-medium">{comercio.telefono || "Sin teléfono"}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Dirección</p>
                          <p className="font-medium text-gray-600">{comercio.direccion || "Sin dirección"}</p>
                      </div>
                  </div>
              </div>

              {/* Métodos de Pago */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                      <CreditCard size={18}/> Métodos de Pago Activos
                  </div>
                  <div className="p-2">
                      {comercio.metodosPago.length > 0 ? (
                          <div className="flex flex-wrap gap-2 p-2">
                              {comercio.metodosPago.map((mp) => (
                                  <span key={mp.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                                      {mp.nombre}
                                  </span>
                              ))}
                          </div>
                      ) : (
                          <p className="p-4 text-sm text-gray-400 italic text-center">No ha configurado métodos de pago.</p>
                      )}
                  </div>
              </div>

          </div>

          {/* COLUMNA DERECHA: INVENTARIO PAGINADO */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <div className="font-bold text-gray-700 flex items-center gap-2">
                          <Package size={18}/> Inventario
                      </div>
                      <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded font-bold text-gray-500">
                          Total: {totalProductos}
                      </span>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b">
                              <tr>
                                  <th className="px-4 py-3 font-bold">Producto</th>
                                  <th className="px-4 py-3 font-bold text-right">Precio ($)</th>
                                  <th className="px-4 py-3 font-bold text-center">Stock</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {productos.length === 0 ? (
                                  <tr>
                                      <td colSpan={3} className="p-8 text-center text-gray-400">
                                          Este comercio no tiene productos cargados.
                                      </td>
                                  </tr>
                              ) : (
                                  productos.map((p) => (
                                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-3 font-medium text-gray-700">{p.nombre}</td>
                                          <td className="px-4 py-3 text-right font-bold text-gray-900">${p.precio.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-center">
                                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                  {p.stock}
                                              </span>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>

                  {/* Footer Paginación */}
                  {totalPaginas > 1 && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-auto">
                          <Link 
                            href={currentPage > 1 ? `/admin/comercios/${id}?page=${currentPage - 1}` : '#'}
                            className={`flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold transition-all ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 text-gray-700'}`}
                          >
                              <ChevronLeft size={14}/> Anterior
                          </Link>
                          
                          <span className="text-xs font-medium text-gray-500">
                              Pág {currentPage} de {totalPaginas}
                          </span>

                          <Link 
                            href={currentPage < totalPaginas ? `/admin/comercios/${id}?page=${currentPage + 1}` : '#'}
                            className={`flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold transition-all ${currentPage >= totalPaginas ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 text-gray-700'}`}
                          >
                              Siguiente <ChevronRight size={14}/>
                          </Link>
                      </div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
}