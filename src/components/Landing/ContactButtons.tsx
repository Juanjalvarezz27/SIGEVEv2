"use client";

import { useState } from "react";
import { Mail, MessageCircle, X, Copy, Check } from "lucide-react";

export default function ContactButtons() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "jjsalvarezz@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* WHATSAPP */}
        <a 
          href="https://wa.me/584129164371" 
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-green-600 hover:border-green-500 transition-all duration-300 cursor-pointer"
        >
          <MessageCircle className="w-10 h-10 text-green-400 group-hover:text-white mb-4 transition-colors" />
          <h3 className="text-xl font-bold text-white mb-1">WhatsApp Directo</h3>
          <p className="text-gray-400 group-hover:text-white/90 text-sm">Respuesta inmediata</p>
        </a>

        {/* CORREO (CON POPUP) */}
        <button 
          onClick={() => setShowEmailModal(true)}
          className="group flex flex-col items-center p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 cursor-pointer w-full"
        >
          <Mail className="w-10 h-10 text-indigo-400 group-hover:text-white mb-4 transition-colors" />
          <h3 className="text-xl font-bold text-white mb-1">Correo Electrónico</h3>
          <p className="text-gray-400 group-hover:text-white/90 text-sm">Soporte y Ventas</p>
        </button>
      </div>

      {/* --- MODAL POPUP --- */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Header Modal */}
            <div className="bg-indigo-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Mail size={18}/> Contacto
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors">
                <X size={20}/>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm mb-2 font-medium uppercase tracking-wide">Correo de Contacto</p>
              
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                {/* AQUI EL CAMBIO: Quitada font-mono, ahora es texto normal */}
                <span className="text-gray-800 font-medium text-base truncate mr-2 select-all">
                  {email}
                </span>
                
                <button onClick={handleCopy} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors" title="Copiar">
                  {copied ? <Check size={18}/> : <Copy size={18}/>}
                </button>
              </div>

              <button 
                onClick={() => setShowEmailModal(false)}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}