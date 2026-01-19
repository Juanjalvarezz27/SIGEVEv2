import { ShoppingBag, DollarSign, Package } from 'lucide-react';

interface Estadisticas {
  totalVentas: number;
  totalIngresos: number;
  productosVendidos: number;
}

interface HistorialHeaderProps {
  estadisticas: Estadisticas;
}

export default function HistorialHeader({ estadisticas }: HistorialHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Ventas Hoy</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.totalVentas}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-100 rounded-lg mr-3">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Ingresos Hoy</p>
            <p className="text-2xl font-bold text-gray-900">
              ${estadisticas.totalIngresos.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200">
        <div className="flex items-center">
          <div className="p-2 bg-amber-100 rounded-lg mr-3">
            <Package className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Productos Hoy</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.productosVendidos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}