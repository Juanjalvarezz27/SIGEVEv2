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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
            <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-900">Punto de Venta</h1>
            <div className="flex items-center text-xs text-gray-500 gap-2">
                <span>Tasa BCV:</span>
                {loadingTasa ? (
                    <RefreshCw className="w-3 h-3 animate-spin"/>
                ) : (
                    <span className="font-bold text-gray-700">Bs {tasaBCV?.toFixed(2) || '---'}</span>
                )}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
        <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Venta</p>
            <p className="text-2xl font-black text-indigo-600">${total.toFixed(2)}</p>
        </div>
        <div className="h-8 w-px bg-gray-300 mx-2"></div>
        <div className="text-right">
             <p className="text-xs text-gray-500 uppercase font-bold">Items</p>
             <div className="flex items-center justify-end gap-1 text-gray-700 font-bold">
                <Package className="w-4 h-4" />
                {productosCount}
             </div>
        </div>
      </div>

    </div>
  );
}