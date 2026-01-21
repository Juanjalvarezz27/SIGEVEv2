"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Home, BarChart3, ReceiptText, LogOut, Settings, BanknoteArrowDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { NavbarProps, UserSession } from "../types/login";
import LogoutModal from "./LogoutModal";

const Navbar = ({ user: initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = (session?.user as UserSession) || initialUser;

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/home", 
      icon: <Package size={18} /> 
    },
    { 
      name: "Registrar Venta", 
      href: "/home/registrar-venta", 
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
    { 
      name: "Deudas", 
      href: "/home/deudas", 
      icon: <BanknoteArrowDown size={18} /> 
    },
    { 
      name: "Configuración", 
      href: "/home/configuracion", 
      icon: <Settings size={18} /> 
    },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 h-[72px] shadow-sm sticky top-0 z-50">
        {/* Usamos px-6 para aprovechar más el ancho de la pantalla */}
        <div className="w-full max-w-[1600px] mx-auto px-6 flex items-center justify-between h-full">

          {/* 1. BRANDING (Izquierda) */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <span className="text-white font-black text-xs tracking-tighter">SaaS</span>
            </div>
            <div className="hidden xl:block">
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Plataforma</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Gestión</p>
            </div>
          </Link>

          {/* 2. NAVEGACIÓN (Centro - Espaciado Optimizado) */}
          {user && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                        {item.icon}
                      </span>
                      {/* El texto se oculta solo si la pantalla es muy pequeña (tablet vertical), se muestra en laptop */}
                      <span className="ml-2 hidden lg:inline-block">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. USUARIO (Derecha) */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-gray-800 leading-none">
                    {user.nombre}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 text-right">
                      {user.rol?.replace('_', ' ') || "USUARIO"}
                  </div>
                </div>
                
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center border border-gray-200 text-indigo-700 font-bold text-sm shadow-sm">
                  {user.nombre?.substring(0, 2).toUpperCase() || "US"}
                </div>

                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="ml-2 flex items-center justify-center h-9 w-9 rounded-lg  bg-red-50 text-red-500 hover:bg-red-50 transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link href="/api/auth/signin" className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                   Iniciar Sesión
                 </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};

export default Navbar;