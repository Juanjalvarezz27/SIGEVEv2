"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Home,
  BarChart3,
  ReceiptText,
  LogOut,
  Settings,
  BanknoteArrowDown,
  LogIn,
  Boxes,
  PhoneCall,
  CircleDollarSign,
  Layers // Icono opcional para Inventario si lo necesitas
} from "lucide-react";
import { useSession } from "next-auth/react";
import { NavbarProps, UserSession } from "../types/login";
import LogoutModal from "./LogoutModal";

const Navbar = ({ user: initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = (session?.user as UserSession) || initialUser;

  // TAMAÑO COMPACTO
  const iconSize = 20;

  const navItems = [
    { name: "Dashboard", href: "/home", icon: <Package size={iconSize} /> },
    { name: "Registrar Venta", href: "/home/registrar-venta", icon: <Home size={iconSize} /> },
    { name: "Ventas", href: "/home/ventas", icon: <ReceiptText size={iconSize} /> },
    // { name: "Inventario", href: "/home/inventario", icon: <Layers size={iconSize} /> }, // Espacio listo para inventario
    { name: "Estadísticas", href: "/home/estadisticas", icon: <BarChart3 size={iconSize} /> },
    { name: "Deudas", href: "/home/deudas", icon: <BanknoteArrowDown size={iconSize} /> },
    { name: "Caja", href: "/home/caja", icon: <CircleDollarSign size={iconSize} /> },
    { name: "Ajustes", href: "/home/configuracion", icon: <Settings size={iconSize} /> },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 h-[64px] shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 flex items-center justify-between h-full">

          {/* 1. BRANDING (SOLO LOGO) */}
          {/* Se eliminó el texto para ahorrar espacio */}
          <Link href="/" className="flex items-center flex-shrink-0 group mr-4" title="Ir al Inicio">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 transition-transform group-hover:scale-105 active:scale-95">
              <span className="text-white font-black text-xs tracking-tighter">SaaS</span>
            </div>
          </Link>

          {/* 2. NAVEGACIÓN (Expandida) */}
          {user && (
            <div className="flex-1 flex items-center justify-start md:justify-center px-2 overflow-x-auto no-scrollbar mask-linear">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap
                        ${isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }
                      `}
                      title={item.name} // Tooltip nativo para cuando solo se ve el icono
                    >
                      <span className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                        {item.icon}
                      </span>
                      {/* Texto visible SOLO en pantallas XL (más de 1280px) para que quepan muchas rutas */}
                      <span className="ml-2 hidden xl:inline-block">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. USUARIO (Compacto) */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 h-8">
                
                {/* Info de usuario (oculta en móvil) */}
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-gray-800 leading-none truncate max-w-[100px]">
                    {user.nombre?.split(' ')[0]} {/* Solo primer nombre para ahorrar espacio */}
                  </div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 text-right truncate max-w-[100px]">
                    {user.rol?.replace('_', ' ') || "USUARIO"}
                  </div>
                </div>

                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center border border-gray-200 text-indigo-700 font-bold text-xs shadow-sm">
                  {user.nombre?.substring(0, 2).toUpperCase() || "US"}
                </div>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="ml-1 flex items-center justify-center h-8 w-8 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 {/* Links de visita simplificados */}
                <Link href="/api/auth/signin" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Ingresar</span>
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