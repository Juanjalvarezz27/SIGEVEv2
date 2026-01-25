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
  Users,       // Icono para Super Admin
  Store,       // Icono para Super Admin
  ShieldAlert  // Icono para Super Admin
} from "lucide-react";
import { useSession } from "next-auth/react";
import { NavbarProps, UserSession } from "../types/login";
import LogoutModal from "./LogoutModal";

const Navbar = ({ user: initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = (session?.user as UserSession) || initialUser;
  const iconSize = 18;

  // --- MENÚ PARA CLIENTES (ADMIN_COMERCIO) ---
  const clientNavItems = [
    { name: "Dashboard", href: "/home", icon: <Package size={iconSize} /> },
    { name: "Registrar Venta", href: "/home/registrar-venta", icon: <Home size={iconSize} /> },
    { name: "Ventas", href: "/home/ventas", icon: <ReceiptText size={iconSize} /> },
    { name: "Estadísticas", href: "/home/estadisticas", icon: <BarChart3 size={iconSize} /> },
    { name: "Deudas", href: "/home/deudas", icon: <BanknoteArrowDown size={iconSize} /> },
    { name: "Caja", href: "/home/caja", icon: <CircleDollarSign size={iconSize} /> },
    { name: "Ajustes", href: "/home/configuracion", icon: <Settings size={iconSize} /> },
  ];

  // --- MENÚ PARA TI (SUPER_ADMIN) ---
  const adminNavItems = [
    { name: "Admin Panel", href: "/admin", icon: <ShieldAlert size={iconSize} /> },
    { name: "Usuarios", href: "/admin/usuarios", icon: <Users size={iconSize} /> },
    { name: "Configuración", href: "/admin/config", icon: <Settings size={iconSize} /> },
  ];

  // Selección automática de menú según el rol
  const itemsToShow = user?.rol === 'SUPER_ADMIN' ? adminNavItems : clientNavItems;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 h-[64px] shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-between h-full">

          {/* 1. BRANDING */}
          <Link href={user ? (user.rol === 'SUPER_ADMIN' ? "/admin" : "/home") : "/"} className="flex items-center flex-shrink-0 group mr-4" title="Ir al Inicio">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 ${user?.rol === 'SUPER_ADMIN' ? 'bg-black shadow-gray-400' : 'bg-indigo-600 shadow-indigo-200'}`}>
              <span className="text-white font-black text-xs tracking-tighter">SaaS</span>
            </div>
            {!user && (
              <div className="hidden md:block ml-3">
                <h1 className="text-base font-bold text-gray-800 leading-tight">Plataforma</h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Gestión</p>
              </div>
            )}
          </Link>

          {/* 2. NAVEGACIÓN CENTRAL (Dinámica según Rol) */}
          {user && (
            <div className="flex-1 flex items-center justify-start md:justify-center px-2 overflow-x-auto no-scrollbar mask-linear">
              <div className="flex items-center gap-1">
                {itemsToShow.map((item) => {
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
                      title={item.name}
                    >
                      <span className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                        {item.icon}
                      </span>
                      <span className="ml-2 hidden xl:inline-block">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ZONA DERECHA (Perfil) */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 h-8">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-gray-800 leading-none truncate max-w-[100px]">
                    {user.nombre?.split(' ')[0]}
                  </div>
                  <div className={`text-[9px] font-bold uppercase mt-1 text-right truncate max-w-[100px] ${user.rol === 'SUPER_ADMIN' ? 'text-red-600' : 'text-gray-500'}`}>
                    {user.rol?.replace('_', ' ') || "USUARIO"}
                  </div>
                </div>

                <div className={`h-9 w-9 rounded-full flex items-center justify-center border text-white font-bold text-xs shadow-sm ${user.rol === 'SUPER_ADMIN' ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-br from-indigo-50 to-white border-gray-200 text-indigo-700'}`}>
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
              // Links Públicos
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <Home size={20} /> <span className="hidden sm:inline">Inicio</span>
                </Link>
                <Link href="/demo" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <Boxes size={20} /> <span className="hidden sm:inline">Demo</span>
                </Link>
                <Link href="/contacto" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <PhoneCall size={20} /> <span className="hidden sm:inline">Contacto</span>
                </Link>
                <Link href="/api/auth/signin" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                  <LogIn size={18} /> <span className="hidden sm:inline">Ingresar</span>
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