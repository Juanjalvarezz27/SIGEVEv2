import { ShoppingCart, Package, RefreshCw } from 'lucide-react';

interface HeaderVentasProps {
  total: number;
  productosCount: number;
  tasaBCV: number | null;
  loadingTasa: boolean;
}

export default function HeaderVentas({
  total,
  productosCount,
  tasaBCV,
  loadingTasa
}: HeaderVentasProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-2xl text-white shadow-inner flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200">
            <ShoppingCart size={32} strokeWidth={2}/>
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Punto de Venta</h1>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 font-medium mt-1 gap-2">
                <span>Tasa BCV:</span>
                {loadingTasa ? (
                    <RefreshCw className="w-3 h-3 animate-spin"/>
                ) : (
                    <span className="font-bold text-indigo-600">Bs {tasaBCV?.toFixed(2) || '---'}</span>
                )}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 w-full md:w-auto justify-end">
        <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total Venta</p>
            <p className="text-3xl font-black text-indigo-600 leading-none">${total.toFixed(2)}</p>
        </div>
        <div className="h-10 w-px bg-gray-200 mx-2"></div>
        <div className="text-right flex flex-col justify-center">
             <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Items</p>
             <div className="flex items-center justify-end gap-1 text-gray-700 font-bold text-xl leading-none">
                <Package className="w-5 h-5" />
                {productosCount}
             </div>
        </div>
      </div>

    </div>
  );
}