"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package, Home, BarChart3, ReceiptText, LogOut, Settings,
  BanknoteArrowDown, LogIn, Boxes, PhoneCall, CircleDollarSign,
  ShieldAlert, BadgeDollarSign, Menu, X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { NavbarProps, UserSession } from "../types/login";
import LogoutModal from "./LogoutModal";

const Navbar = ({ user: initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = (session?.user as UserSession) || initialUser;
  const iconSize = 20;

  const clientNavItems = [
    { name: "Dashboard", href: "/home", icon: <Package size={iconSize} /> },
    { name: "Registrar Venta", href: "/home/registrar-venta", icon: <Home size={iconSize} /> },
    { name: "Ventas", href: "/home/ventas", icon: <ReceiptText size={iconSize} /> },
    { name: "Estadísticas", href: "/home/estadisticas", icon: <BarChart3 size={iconSize} /> },
    { name: "Deudas", href: "/home/deudas", icon: <BanknoteArrowDown size={iconSize} /> },
    { name: "Caja", href: "/home/caja", icon: <CircleDollarSign size={iconSize} /> },
    { name: "Ajustes", href: "/home/configuracion", icon: <Settings size={iconSize} /> },
  ];

  const adminNavItems = [
    { name: "Panel Maestro", href: "/admin", icon: <ShieldAlert size={iconSize} /> },
    { name: "Auditoría Pagos", href: "/admin/pagos", icon: <BadgeDollarSign size={iconSize} /> },
  ];

  const itemsToShow = user?.rol === 'SUPER_ADMIN' ? adminNavItems : clientNavItems;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 h-[72px] shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-between h-full">

          {/* 1. BRANDING */}
          <Link href={user ? (user.rol === 'SUPER_ADMIN' ? "/admin" : "/home") : "/"} className="flex items-center flex-shrink-0 group mr-2 md:mr-6" title="Ir al Inicio">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 active:scale-95 ${user?.rol === 'SUPER_ADMIN' ? 'bg-black shadow-gray-400' : 'bg-indigo-600 shadow-indigo-200'}`}>
              <span className="text-white font-black text-sm tracking-tighter">SaaS</span>
            </div>
            {!user && (
              <div className="hidden md:block ml-3">
                <h1 className="text-lg font-bold text-gray-800 leading-tight">Plataforma</h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Gestión</p>
              </div>
            )}
          </Link>

          {/* 2. NAVEGACIÓN CENTRAL (Desktop) */}
          {user && (
            <div className="hidden md:flex flex-1 items-center justify-center px-2 overflow-x-auto no-scrollbar mask-linear">
              <div className="flex items-center gap-1.5">
                {itemsToShow.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
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
                      <span className="ml-2.5 hidden xl:inline-block">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ZONA DERECHA (Perfil & Hamburger) */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-gray-200 h-10">
                <div className="hidden text-right sm:block">
                  <div className="text-base font-bold text-gray-800 leading-none truncate max-w-[120px]">
                    {user.nombre?.split(' ')[0]}
                  </div>
                  <div className={`text-xs font-bold uppercase mt-1 text-right truncate max-w-[120px] ${user.rol === 'SUPER_ADMIN' ? 'text-red-600' : 'text-gray-500'}`}>
                    {user.rol?.replace('_', ' ') || "USUARIO"}
                  </div>
                </div>

                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                    user.rol === 'SUPER_ADMIN' 
                    ? 'bg-gray-900 border border-gray-800' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-none'
                }`}>
                  {user.nombre?.substring(0, 2).toUpperCase() || "US"}
                </div>

                {/* BOTÓN HAMBURGUESA (Móvil) */}
                <button
                  className="md:hidden ml-1 p-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>

                {/* BOTÓN LOGOUT (Desktop) */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden md:flex ml-1 items-center justify-center h-10 w-10 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              // Links Públicos
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="flex items-center gap-2 text-base font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <Home size={22} /> <span className="hidden sm:inline">Inicio</span>
                </Link>
                <Link href="/demo" className="flex items-center gap-2 text-base font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <Boxes size={22} /> <span className="hidden sm:inline">Demo</span>
                </Link>
                <Link href="/contacto" className="flex items-center gap-2 text-base font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                  <PhoneCall size={22} /> <span className="hidden sm:inline">Contacto</span>
                </Link>
                <Link href="/api/auth/signin" className="flex items-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                  <LogIn size={20} /> <span className="hidden sm:inline">Ingresar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* OVERLAY MOBILE MENU */}
      {user && (
        <div className={`fixed inset-0 z-[60] flex md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          {/* Clic fuera cierra el menú */}
          <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          <div className={`relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-800">Menú</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 bg-white rounded-lg border shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {itemsToShow.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                      isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl transition-colors"
              >
                <LogOut size={20} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navbar;