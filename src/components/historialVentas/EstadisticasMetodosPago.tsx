"use client";

import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Smartphone, 
  Bitcoin, 
  Terminal, 
  ArrowRightLeft 
} from 'lucide-react';

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

  // --- LÓGICA DE ESTILOS Y COLORES ---
  const getPaymentStyle = (nombre: string) => {
    const n = nombre.toLowerCase();

    // 1. EFECTIVO (Verde Esmeralda)
    if (n.includes('efectivo') || n.includes('cash') || n.includes('divisa')) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-700',
        bar: 'bg-emerald-500',
        iconBg: 'bg-emerald-100 text-emerald-600',
        icon: <Banknote className="h-5 w-5" />
      };
    }

    // 2. PAGO MÓVIL (Azul Real)
    if (n.includes('movil') || n.includes('móvil') || n.includes('pm')) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-700',
        bar: 'bg-blue-600',
        iconBg: 'bg-blue-100 text-blue-600',
        icon: <Smartphone className="h-5 w-5" />
      };
    }

    // 3. ZELLE (Morado/Púrpura)
    if (n.includes('zelle')) {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        text: 'text-purple-700',
        bar: 'bg-purple-600',
        iconBg: 'bg-purple-100 text-purple-600',
        icon: <Landmark className="h-5 w-5" />
      };
    }

    // 4. BINANCE / USDT / CRYPTO (Ámbar/Amarillo)
    if (n.includes('binance') || n.includes('usdt') || n.includes('crypto')) {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
        iconBg: 'bg-amber-100 text-amber-600',
        icon: <Bitcoin className="h-5 w-5" />
      };
    }

    // 5. PUNTO DE VENTA / TARJETA (Indigo)
    if (n.includes('punto') || n.includes('tarjeta') || n.includes('debito') || n.includes('débito')) {
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        text: 'text-indigo-700',
        bar: 'bg-indigo-600',
        iconBg: 'bg-indigo-100 text-indigo-600',
        icon: <Terminal className="h-5 w-5" />
      };
    }

    // 6. BIOPAGO / BANCOS (Rojo/Rose)
    if (n.includes('bio') || n.includes('biopago') || n.includes('banco')) {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-700',
        bar: 'bg-rose-500',
        iconBg: 'bg-rose-100 text-rose-600',
        icon: <CreditCard className="h-5 w-5" />
      };
    }

    // 7. TRANSFERENCIA (Cyan)
    if (n.includes('transferencia')) {
      return {
        bg: 'bg-cyan-50',
        border: 'border-cyan-100',
        text: 'text-cyan-700',
        bar: 'bg-cyan-600',
        iconBg: 'bg-cyan-100 text-cyan-600',
        icon: <ArrowRightLeft className="h-5 w-5" />
      };
    }

    // DEFAULT (Gris Slate)
    return {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      bar: 'bg-slate-500',
      iconBg: 'bg-white text-slate-500 border border-slate-100',
      icon: <Wallet className="h-5 w-5" />
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedStats.map(([nombre, data]) => {
        const porcentaje = totalGeneral > 0 ? (data.usd / totalGeneral) * 100 : 0;
        const style = getPaymentStyle(nombre);
        
        return (
          <div 
            key={nombre} 
            className={`rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${style.bg} ${style.border}`}
          >
            
            <div className="flex justify-between items-start mb-4">
               {/* Icono con fondo coloreado */}
               <div className={`p-2.5 rounded-xl shadow-sm ${style.iconBg}`}>
                  {style.icon}
               </div>

               {/* Badge de cantidad */}
               <div className="text-right">
                  <span className="text-[10px] font-bold bg-white/80 px-2 py-1 rounded-lg shadow-sm border border-black/5 text-gray-600 backdrop-blur-sm">
                    {data.count} ventas
                  </span>
               </div>
            </div>

            <div className="mb-2">
               <h4 className={`font-bold text-base truncate uppercase tracking-tight ${style.text}`} title={nombre}>
                  {nombre}
               </h4>
            </div>

            <div className="flex items-end justify-between mb-4">
               <div>
                 <p className="text-2xl font-black tracking-tight text-gray-800">${data.usd.toFixed(2)}</p>
                 <p className="text-xs text-gray-500 font-medium font-mono mt-0.5">Bs {data.bs.toFixed(2)}</p>
               </div>
               <div className="text-right pb-1">
                 <span className={`text-sm font-bold ${style.text}`}>{porcentaje.toFixed(0)}%</span>
               </div>
            </div>

            {/* Barra de progreso mini */}
            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-gray-100/50">
               <div 
                 className={`h-full rounded-full ${style.bar} transition-all duration-1000 ease-out`} 
                 style={{ width: `${porcentaje}%` }}
               />
            </div>
          </div>
        );
      })}
    </div>
  );
}