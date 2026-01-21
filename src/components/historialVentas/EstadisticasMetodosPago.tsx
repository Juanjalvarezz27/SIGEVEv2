import { Wallet, CreditCard, Banknote, Landmark } from 'lucide-react';

interface Venta {
  total: number;
  totalBs: number;
  metodoPago: { nombre: string };
}

export default function EstadisticasMetodosPago({ ventas }: { ventas: Venta[] }) {
  const totalGeneral = ventas.reduce((acc, v) => acc + v.total, 0);

  const stats = ventas.reduce((acc, curr) => {
    const metodo = curr.metodoPago.nombre;
    if (!acc[metodo]) acc[metodo] = { usd: 0, bs: 0, count: 0 };
    acc[metodo].usd += curr.total;
    acc[metodo].bs += curr.totalBs;
    acc[metodo].count += 1;
    return acc;
  }, {} as Record<string, { usd: number, bs: number, count: number }>);

  // Ordenar por mayor ingreso USD
  const sortedStats = Object.entries(stats).sort((a, b) => b[1].usd - a[1].usd);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('efectivo')) return <Banknote className="h-5 w-5" />;
    if (n.includes('movil') || n.includes('móvil')) return <Wallet className="h-5 w-5" />;
    if (n.includes('zelle') || n.includes('binance')) return <Landmark className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  const getColors = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('efectivo')) return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
    if (n.includes('pago movil')) return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
    if (n.includes('zelle')) return 'bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/20';
    return 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/20';
  };

  const getBarColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('efectivo')) return 'bg-emerald-500';
    if (n.includes('pago movil')) return 'bg-blue-500';
    if (n.includes('zelle')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedStats.map(([nombre, data]) => {
        const porcentaje = totalGeneral > 0 ? (data.usd / totalGeneral) * 100 : 0;
        
        return (
          <div key={nombre} className={`rounded-xl border p-4 transition-all hover:shadow-md ${getColors(nombre)} bg-opacity-40`}>
            
            <div className="flex justify-between items-start mb-3">
               <div className={`p-2 rounded-lg bg-white shadow-sm border border-transparent`}>
                  {getIcon(nombre)}
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-full shadow-sm border border-opacity-10 opacity-80">
                    {data.count} ventas
                  </span>
               </div>
            </div>

            <div className="mb-1">
               <h4 className="font-bold text-lg truncate" title={nombre}>{nombre}</h4>
            </div>

            <div className="flex items-end justify-between mb-3">
               <div>
                 <p className="text-2xl font-bold tracking-tight">${data.usd.toFixed(2)}</p>
                 <p className="text-xs opacity-70 font-medium">Bs {data.bs.toFixed(2)}</p>
               </div>
               <div className="text-right pb-1">
                 <span className="text-sm font-bold">{porcentaje.toFixed(0)}%</span>
               </div>
            </div>

            {/* Barra de progreso mini */}
            <div className="w-full bg-white bg-opacity-50 h-1.5 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full ${getBarColor(nombre)} transition-all duration-1000`} 
                 style={{ width: `${porcentaje}%` }}
               />
            </div>
          </div>
        );
      })}
    </div>
  );
}