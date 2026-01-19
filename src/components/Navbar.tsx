"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Home, BarChart3, ReceiptText, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { NavbarProps, UserSession } from "../types/login"; 

const Navbar = ({ user: initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // TIPO DE SEGURIDAD
  const user = (session?.user as UserSession) || initialUser;

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
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
    <nav className="bg-white border-b border-gray-200 h-20 shadow-sm flex items-center z-50 sticky top-0">
      <div className="w-11/12 mx-auto px-4 flex items-center justify-between h-full">
        
        {/* Branding / Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 gap-3 group cursor-pointer">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-indigo-200 shadow-md transform transition-transform group-hover:scale-105">
            <span className="text-white font-black text-xs tracking-tighter">SaaS</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Plataforma</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">De Gestión de ventas</p>
          </div>
        </Link>

        {/* Navegación Central */}
        {user && (
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className={`${isActive ? "text-indigo-600" : "text-gray-400"}`}>
                    {item.icon}
                  </span>
                  <span className="ml-2">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Área de Usuario y Logout */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-4">
              
              {/* Información del Usuario */}
              <div className="flex items-center gap-3 pl-4">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-gray-800 leading-none">
                    {user.nombre}
                  </div>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mt-1">
                      {user.rol?.replace('_', ' ') || "USUARIO"}
                  </div>
                </div>
                
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-700 font-bold text-sm shadow-sm">
                  {user.nombre?.substring(0, 2).toUpperCase() || "US"}
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-1"></div>

              <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="group flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link 
                 href="/" 
                 className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
               >
                 Inicio
               </Link>

               <Link 
                 href="/api/auth/signin" 
                 className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
               >
                 Iniciar Sesión
               </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;