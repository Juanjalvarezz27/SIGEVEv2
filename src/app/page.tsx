import ProductosList from "../components/inventario/ProductosList"
import TasaDolarBCV from "../components/inventario/TasaDolarBCV"
import { Package } from 'lucide-react';

export default function InventarioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-11/12 mx-auto px-4 py-8">
        {/* Header simple */}
        <div className="mb-8 flex justify-between">
          <div>
            <Package size={56} />
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="mt-2 text-gray-600">
              Administra los productos de tu catálogo
            </p>
          </div>
          <TasaDolarBCV />
        </div>

        <ProductosList />
      </div>
    </div>
  );
}