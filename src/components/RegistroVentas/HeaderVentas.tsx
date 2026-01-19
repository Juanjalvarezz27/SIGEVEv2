import { ShoppingCart, Package } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
      <div className="flex items-center">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4">
          <ShoppingCart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            REGISTRAR VENTA
          </h1>
          <p className="text-gray-600 mt-1">Gestión completa de ventas del sistema</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div className="text-2xl font-bold text-blue-600">
          Total: ${total.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 flex items-center mt-1">
          <Package className="h-4 w-4 mr-1" />
          {productosCount} productos seleccionados
        </div>
      </div>
    </div>
  );
}