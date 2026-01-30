"use client";

import { useState } from 'react';
import { Settings, User, CreditCard, ShieldCheck, HelpCircle, Tags } from 'lucide-react';
import PerfilUsuario from '@/src/components/Configuracion/PerfilUsuario';
import GestionMetodosPago from '@/src/components/Configuracion/GestionMetodosPago';
import ActualizadorPrecios from '@/src/components/Configuracion/ActualizadorPrecios';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'negocio' | 'precios'>('perfil');

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen pb-24 overflow-x-hidden">

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg text-white shrink-0">
            <Settings size={24} className="md:w-7 md:h-7" />
          </div>
          Configuración
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1 ml-1">Gestiona tu cuenta, pagos e inventario masivo.</p>
      </div>

      {/* === TABS DE NAVEGACIÓN CORREGIDOS === 
         Usamos -mx-4 px-4 para que en móvil el scroll toque los bordes de la pantalla
         y pb-2 para que no se corte la sombra del botón activo.
      */}
      <div className="mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-full md:w-fit border border-gray-200 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('precios')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${activeTab === 'precios'
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-500/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }
            `}
          >
            <Tags size={16} className="mr-2 shrink-0" />
            Ajuste Precios
          </button>

          <button
            onClick={() => setActiveTab('negocio')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${activeTab === 'negocio'
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }
            `}
          >
            <CreditCard size={16} className="mr-2 shrink-0" />
            Métodos Pago
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`
              flex-1 md:flex-none flex items-center justify-center px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${activeTab === 'perfil'
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }
            `}
          >
            <User size={16} className="mr-2 shrink-0" />
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