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

      {/* === TABS DE NAVEGACIÓN === */}
      <div className="mb-8 md:mb-10 flex justify-center w-full px-4 md:px-0">
        <div className="flex bg-gray-100/70 p-1.5 rounded-[16px] w-full md:w-auto shadow-inner border border-gray-200/50">
          
          <button
            onClick={() => setActiveTab('precios')}
            className={`
              flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center px-2 py-2 md:px-8 md:py-3 rounded-[12px] transition-all duration-300 gap-1 md:gap-2.5
              ${activeTab === 'precios'
                ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'hover:bg-gray-200/50'
              }
            `}
          >
            <Tags size={20} className={`shrink-0 md:w-[18px] md:h-[18px] ${activeTab === 'precios' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] md:text-[15px] font-bold md:font-semibold whitespace-nowrap ${activeTab === 'precios' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>Ajustes</span>
          </button>

          <button
            onClick={() => setActiveTab('negocio')}
            className={`
              flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center px-2 py-2 md:px-8 md:py-3 rounded-[12px] transition-all duration-300 gap-1 md:gap-2.5
              ${activeTab === 'negocio'
                ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'hover:bg-gray-200/50'
              }
            `}
          >
            <CreditCard size={20} className={`shrink-0 md:w-[18px] md:h-[18px] ${activeTab === 'negocio' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] md:text-[15px] font-bold md:font-semibold whitespace-nowrap ${activeTab === 'negocio' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>Métodos</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`
              flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center px-2 py-2 md:px-8 md:py-3 rounded-[12px] transition-all duration-300 gap-1 md:gap-2.5
              ${activeTab === 'perfil'
                ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'hover:bg-gray-200/50'
              }
            `}
          >
            <User size={20} className={`shrink-0 md:w-[18px] md:h-[18px] ${activeTab === 'perfil' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`text-[10px] md:text-[15px] font-bold md:font-semibold whitespace-nowrap ${activeTab === 'perfil' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>Perfil</span>
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