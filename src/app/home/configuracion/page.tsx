"use client";

import { useState } from 'react';
import { Settings, User, CreditCard, ShieldCheck, HelpCircle, Tags } from 'lucide-react';
import PerfilUsuario from '@/src/components/Configuracion/PerfilUsuario';
import GestionMetodosPago from '@/src/components/Configuracion/GestionMetodosPago';
import ActualizadorPrecios from '@/src/components/Configuracion/ActualizadorPrecios';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'perfil' | 'negocio' | 'precios'>('perfil');

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen pb-24">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg text-white">
            <Settings size={28} />
          </div>
          Configuración
        </h1>
        <p className="text-gray-500 mt-1 ml-1">Gestiona tu cuenta, pagos e inventario masivo.</p>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit border border-gray-200 overflow-x-auto">

        <button
          onClick={() => setActiveTab('precios')}
          className={`
            flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${activeTab === 'precios'
              ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-500/10'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }
          `}
        >
          <Tags size={16} className="mr-2" />
          Ajuste Masivo de Precios
        </button>

        <button
          onClick={() => setActiveTab('negocio')}
          className={`
            flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${activeTab === 'negocio'
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }
          `}
        >
          <CreditCard size={16} className="mr-2" />
          Métodos de Pago
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`
            flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${activeTab === 'perfil'
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }
          `}
        >
          <User size={16} className="mr-2" />
          Mi Perfil
        </button>
      </div>

      {/* Contenido */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
        {activeTab === 'perfil' && <PerfilUsuario />}
        {activeTab === 'negocio' && <GestionMetodosPago />}
        {activeTab === 'precios' && <ActualizadorPrecios />}
      </div>

      {/* === FOOTER PROFESIONAL === */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left shadow-sm">

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Sistema Seguro & Encriptado</h4>
              <p className="text-xs text-gray-500">Tus datos están protegidos con los mejores estándares.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-gray-500">

            {/* ENLACE DE WHATSAPP */}
            <a
              href="https://wa.me/584129164371"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100"
            >
              <HelpCircle size={14}/> Soporte Técnico
            </a>

            <span>v2.0 (SaaS)</span>
            <span>© {new Date().getFullYear()} SIGEVE </span>
          </div>

        </div>
      </div>

    </div>
  );
}