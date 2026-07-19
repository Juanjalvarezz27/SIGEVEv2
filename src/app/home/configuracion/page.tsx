"use client";

import { useState } from 'react';
import { Settings, User, CreditCard, ShieldCheck, HelpCircle, Tags } from 'lucide-react';
import PerfilUsuario from '@/src/components/Configuracion/PerfilUsuario';
import GestionMetodosPago from '@/src/components/Configuracion/GestionMetodosPago';
import ActualizadorPrecios from '@/src/components/Configuracion/ActualizadorPrecios';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'negocio' | 'precios'>('perfil');

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-24 overflow-x-hidden">

      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6 md:mb-8">
         <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl text-white shadow-inner flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 shadow-gray-300">
               <Settings size={32} strokeWidth={2}/>
            </div>
            <div>
               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Configuración</h1>
               <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Gestiona tu cuenta, pagos e inventario masivo</p>
            </div>
         </div>
      </div>

      {/* === TABS DE NAVEGACIÓN ULTRA-CLEAN (ESTILO iOS/VERCEL) - TAMAÑO AUMENTADO === */}
      <div className="mb-10 flex justify-center w-full px-4 md:px-0">
        <div className="inline-flex flex-nowrap bg-gray-100/70 p-1.5 rounded-[16px] w-full md:w-auto overflow-x-auto no-scrollbar shadow-inner border border-gray-200/50">
          
          <button
            onClick={() => setActiveTab('precios')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-8 sm:px-10 py-3 rounded-[12px] text-sm sm:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap
              ${activeTab === 'precios'
                ? 'bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }
            `}
          >
            <Tags size={18} className={`mr-2.5 shrink-0 ${activeTab === 'precios' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Ajuste Precios
          </button>

          <button
            onClick={() => setActiveTab('negocio')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-8 sm:px-10 py-3 rounded-[12px] text-sm sm:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap
              ${activeTab === 'negocio'
                ? 'bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }
            `}
          >
            <CreditCard size={18} className={`mr-2.5 shrink-0 ${activeTab === 'negocio' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Métodos Pago
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-8 sm:px-10 py-3 rounded-[12px] text-sm sm:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap
              ${activeTab === 'perfil'
                ? 'bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
              }
            `}
          >
            <User size={18} className={`mr-2.5 shrink-0 ${activeTab === 'perfil' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Perfil
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
        {activeTab === 'perfil' && <PerfilUsuario />}
        {activeTab === 'negocio' && <GestionMetodosPago />}
        {activeTab === 'precios' && <ActualizadorPrecios />}
      </div>

      {/* === FOOTER === */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left shadow-sm">

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Sistema Seguro & Encriptado</h4>
              <p className="text-xs text-gray-500 max-w-[250px] md:max-w-none mx-auto md:mx-0">
                Tus datos están protegidos con los mejores estándares.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-xs font-medium text-gray-500 w-full md:w-auto">
            <a
              href="https://wa.me/584129164371"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 w-full md:w-auto"
            >
              <HelpCircle size={14}/> Soporte Técnico
            </a>

            <div className="flex gap-4">
              <span>v2.0 (SaaS)</span>
              <span>© {new Date().getFullYear()} SIGEVE </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}