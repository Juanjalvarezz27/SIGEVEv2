"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Home, BarChart3, ReceiptText } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Inventario", 
      href: "/", 
      icon: <Package size={18} /> 
    },
    { 
      name: "Registrar Venta", 
      href: "/home", 
      icon: <Home size={18} /> 
    },
    { 
      name: "Ventas", 
      href: "/home/ventas", 
      icon: <ReceiptText size={18} /> 
    },
    { 
      name: "Estadísticas", 
      href: "/home/estadisticas", 
      icon: <BarChart3 size={18} /> 
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 h-24 shadow-sm flex items-center">
      <div className="w-11/12 mx-auto px-4 flex items-center justify-between h-full">
        
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">AD</span>
          </div>
          <div className="ml-3 hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sistema de Ventas</h1>
          </div>
        </div>

        {/* Navegación - Contenedor con fondo gris */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }
                `}
              >
                <span className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span className="ml-2.5">{item.name}</span>
                {isActive && (
                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-gray-900">Administrador</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-white shadow-lg">
            <span className="text-white text-xs font-bold">AD</span>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;