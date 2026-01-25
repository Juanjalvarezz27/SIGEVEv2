"use client"; 

import { useState } from "react";
import Link from "next/link";
import { 
  MessageCircle, 
  Mail, 
  ArrowLeft, 
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  X,    
  Copy, 
  Check 
} from "lucide-react";

export default function ContactoPage() {
  // --- LÓGICA DEL MODAL ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "jjsalvarezz@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* === FONDO CON IDENTIDAD DE MARCA === */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      
      {/* Botón Volver */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/demo" 
          className="flex items-center gap-2 text-sm font-bold text-indigo-900/60 hover:text-indigo-600 transition-colors bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-white hover:shadow-md hover:border-indigo-100"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Volver a la Demo
        </Link>
      </div>

      <div className="max-w-5xl w-full relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
             <Sparkles size={14} /> Soporte y Ventas
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Hablemos de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Futuro</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            ¿Tienes dudas sobre los planes? ¿Quieres una demostración personalizada? Estamos a un clic de distancia.
          </p>
        </div>

        {/* TARJETAS DE CONTACTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Tarjeta WhatsApp (Link directo) */}
          <a 
            href="https://wa.me/584129164371" 
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-white hover:border-green-400 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:-translate-y-1"
          >
             <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-2xl">
                MÁS RÁPIDO
             </div>
             
             <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-green-500 group-hover:text-white border-4 border-green-50 group-hover:border-green-200">
                <MessageCircle size={44} strokeWidth={1.5} />
             </div>
             
             <h2 className="text-3xl font-black text-slate-900 mb-3 group-hover:text-green-600 transition-colors">WhatsApp Directo</h2>
             <p className="text-slate-500 mb-8 text-base font-medium leading-relaxed">
                Respuesta inmediata. Ideal para coordinar pagos, dudas rápidas o solicitar acceso.
             </p>
             
             <span className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-2xl w-full group-hover:bg-green-700 shadow-lg shadow-green-200 transition-all text-lg">
                Chatear Ahora <ArrowLeft className="rotate-180" size={20} strokeWidth={3}/>
             </span>
          </a>

          {/* Tarjeta Email (CON MODAL POPUP) */}
          <button 
            onClick={() => setShowEmailModal(true)}
            className="group relative bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-white hover:border-indigo-400 transition-all duration-300 flex flex-col items-center text-center overflow-hidden hover:-translate-y-1 w-full"
          >
             
             <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-600 group-hover:text-white border-4 border-indigo-50 group-hover:border-indigo-200">
                <Mail size={44} strokeWidth={1.5} />
             </div>
             
             <h2 className="text-3xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Correo Electrónico</h2>
             <p className="text-slate-500 mb-8 text-base font-medium leading-relaxed">
                Para propuestas formales, soporte técnico detallado o alianzas comerciales.
             </p>
             
             <span className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-2xl w-full group-hover:border-indigo-600 group-hover:bg-indigo-50 transition-all text-lg shadow-sm">
                Ver Correo
             </span>
          </button>

        </div>

        {/* INFO ADICIONAL */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-900/5 grid grid-cols-1 md:grid-cols-3 gap-8">
           
           <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Clock size={24} />
              </div>
              <div>
                 <p className="font-bold text-slate-900 text-lg">Horario</p>
                 <p className="text-slate-500 font-medium">Lunes a Sábado</p>
                 <p className="text-indigo-600 font-bold text-sm">8:00 AM - 6:00 PM</p>
              </div>
           </div>
           
           <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <MapPin size={24} />
              </div>
              <div>
                 <p className="font-bold text-slate-900 text-lg">Ubicación</p>
                 <p className="text-slate-500 font-medium">Trujillo, Venezuela</p>
                 <p className="text-indigo-600 font-bold text-sm">Soporte Remoto Nacional</p>
              </div>
           </div>

           <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                 <p className="font-bold text-slate-900 text-lg">Garantía</p>
                 <p className="text-slate-500 font-medium">Soporte incluido</p>
                 <p className="text-indigo-600 font-bold text-sm">Actualizaciones constantes</p>
              </div>
           </div>

        </div>

        {/* Footer Copyright */}
        <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm font-medium">
                © {new Date().getFullYear()} Plataforma SaaS. Desarrollado en Venezuela.
            </p>
        </div>

      </div>

      {/* === MODAL POPUP PARA EMAIL === */}
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

    </div>
  );
}