import { CreditCard, BadgeDollarSign, Banknote, Wallet, TrendingUp, DollarSign, Coins } from 'lucide-react';

interface Venta {
  id: number;
  total: number;
  totalBs: number;           // ← Ahora viene de la DB
  tasaBCV: number;           // ← Tasa guardada
  fechaHora: string;
  metodoPagoId: number;
  metodoPago: {
    id: number;
    nombre: string;
  };
}

interface EstadisticasMetodosPagoProps {
  ventas: Venta[];
  tasaBCV?: number | null;    // Solo para mostrar tasa actual
  loadingTasa?: boolean;
}

export default function EstadisticasMetodosPago({ 
  ventas, 
  tasaBCV, 
  loadingTasa 
}: EstadisticasMetodosPagoProps) {
  
  // Agrupar ventas por método de pago incluyendo totalBs
  const agruparPorMetodoPago = () => {
    const grupos: Record<string, { 
      totalUSD: number; 
      totalBs: number;        // ← Sumamos totalBs guardados
      count: number; 
      nombre: string; 
      orden: number 
    }> = {};
    
    ventas.forEach(venta => {
      const metodoNombre = venta.metodoPago.nombre;
      
      if (!grupos[metodoNombre]) {
        // Asignar un orden específico
        let orden = 0;
        const nombreLower = metodoNombre.toLowerCase();
        if (nombreLower.includes('efectivo')) orden = 1;
        else if (nombreLower.includes('tarjeta')) orden = 2;
        else if (nombreLower.includes('transferencia')) orden = 3;
        else if (nombreLower.includes('móvil') || nombreLower.includes('movil')) orden = 4;
        else orden = 5;
        
        grupos[metodoNombre] = {
          totalUSD: 0,
          totalBs: 0,
          count: 0,
          nombre: metodoNombre,
          orden
        };
      }
      
      grupos[metodoNombre].totalUSD += venta.total;
      grupos[metodoNombre].totalBs += venta.totalBs; // ← Sumar totalBs guardado
      grupos[metodoNombre].count += 1;
    });
    
    // Ordenar por orden específico y luego por total descendente
    return Object.values(grupos).sort((a, b) => {
      if (a.orden !== b.orden) return a.orden - b.orden;
      return b.totalUSD - a.totalUSD;
    });
  };

  const gruposMetodos = agruparPorMetodoPago();
  const totalGeneralUSD = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const totalGeneralBs = ventas.reduce((sum, venta) => sum + venta.totalBs, 0); // ← Suma de totalBs guardados

  // Obtener icono según método de pago
  const getMetodoPagoIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo')) return <BadgeDollarSign className="h-5 w-5" />;
    if (nombreLower.includes('tarjeta')) return <CreditCard className="h-5 w-5" />;
    if (nombreLower.includes('transferencia')) return <Banknote className="h-5 w-5" />;
    if (nombreLower.includes('móvil') || nombreLower.includes('movil')) return <Wallet className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  // Obtener color según método de pago
  const getMetodoPagoColor = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo')) return 'from-green-50 to-green-100 border-green-200';
    if (nombreLower.includes('tarjeta')) return 'from-blue-50 to-blue-100 border-blue-200';
    if (nombreLower.includes('transferencia')) return 'from-purple-50 to-purple-100 border-purple-200';
    if (nombreLower.includes('móvil') || nombreLower.includes('movil')) return 'from-cyan-50 to-cyan-100 border-cyan-200';
    return 'from-gray-50 to-gray-100 border-gray-200';
  };

  // Obtener color de texto según método de pago
  const getMetodoPagoTextColor = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('efectivo')) return 'text-green-700';
    if (nombreLower.includes('tarjeta')) return 'text-blue-700';
    if (nombreLower.includes('transferencia')) return 'text-purple-700';
    if (nombreLower.includes('móvil') || nombreLower.includes('movil')) return 'text-cyan-700';
    return 'text-gray-700';
  };

  if (ventas.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
        Ventas por Método de Pago
      </h3>
      
      {/* Cuadros de métodos de pago */}
      <div className="space-y-4">
        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gruposMetodos.slice(0, 3).map((grupo) => {
            const porcentaje = totalGeneralUSD > 0 ? (grupo.totalUSD / totalGeneralUSD) * 100 : 0;
            
            return (
              <div 
                key={grupo.nombre}
                className={`bg-gradient-to-r ${getMetodoPagoColor(grupo.nombre)} rounded-xl border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Header con icono y nombre */}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl mr-4 ${getMetodoPagoTextColor(grupo.nombre).replace('text-', 'bg-')} bg-opacity-20`}>
                    {getMetodoPagoIcon(grupo.nombre)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{grupo.nombre}</h4>
                    <p className="text-sm text-gray-500">
                      {grupo.count} {grupo.count === 1 ? 'transacción' : 'transacciones'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{porcentaje.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">del total</div>
                  </div>
                </div>
                
                {/* Indicador de total vendido */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total vendido</span>
                    <span className="font-bold text-gray-900">${grupo.totalUSD.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getMetodoPagoTextColor(grupo.nombre).replace('text-', 'bg-')} rounded-full transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
                
                {/* Montos */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      USD
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      ${grupo.totalUSD.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Coins className="h-4 w-4 mr-1" />
                      Bs
                    </div>
                    <p className={`text-xl font-bold ${getMetodoPagoTextColor(grupo.nombre)}`}>
                      Bs {grupo.totalBs.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Segunda fila */}
        {gruposMetodos.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gruposMetodos.slice(3).map((grupo) => {
              const porcentaje = totalGeneralUSD > 0 ? (grupo.totalUSD / totalGeneralUSD) * 100 : 0;
              
              return (
                <div 
                  key={grupo.nombre}
                  className={`bg-gradient-to-r ${getMetodoPagoColor(grupo.nombre)} rounded-xl border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl mr-3 ${getMetodoPagoTextColor(grupo.nombre).replace('text-', 'bg-')} bg-opacity-20`}>
                        {getMetodoPagoIcon(grupo.nombre)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{grupo.nombre}</h4>
                        <p className="text-sm text-gray-500">
                          {grupo.count} {grupo.count === 1 ? 'venta' : 'ventas'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{porcentaje.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">del total</div>
                    </div>
                  </div>
                  
                  {/* Indicador de total vendido */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total vendido</span>
                      <span className="font-bold text-gray-900">${grupo.totalUSD.toFixed(2)}</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getMetodoPagoTextColor(grupo.nombre).replace('text-', 'bg-')} rounded-full`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total USD</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${grupo.totalUSD.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Bs</p>
                      <p className={`text-xl font-bold ${getMetodoPagoTextColor(grupo.nombre)}`}>
                        Bs {grupo.totalBs.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}