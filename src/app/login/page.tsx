"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Phone, HelpCircle } from "lucide-react"; 

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Credenciales incorrectas.");
      } else {
        router.refresh();
        router.push("/home");
      }
    } catch (err) {
      setLoading(false);
      setError("Error de conexión.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-gray-50 p-4">
    
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[480px]">
        
        {/* === SECCIÓN IZQUIERDA: AZUL === */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 flex flex-col relative overflow-hidden text-white">
          
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>

          {/* CONTENIDO PRINCIPAL (Centrado) */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
            <div className="h-12 w-12 mx-auto rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-4 border border-white/30 transform transition-transform hover:scale-105 duration-300">
              <span className="text-white font-black text-base tracking-tighter">SaaS</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">¡Hola de nuevo!</h2>
            <p className="text-indigo-100 max-w-xs mx-auto text-xs md:text-sm leading-relaxed text-center opacity-90">
              Control total de tu negocio. Gestión eficiente de inventario y ventas.
            </p>
          </div>

          {/* ZONA DE CONTACTO */}
          <div className="relative z-10 py-4 bg-black/10 backdrop-blur-[2px]">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-indigo-200 flex items-center gap-1 opacity-80">
                <HelpCircle size={10} />
                Soporte
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 w-full px-4">
                <a 
                  href="mailto:jjsalvarezz@gmail.com" 
                  className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10"
                >
                  <Mail size={12} className="text-indigo-200 group-hover:text-white" />
                  <span className="text-[10px] md:text-xs font-medium text-indigo-100 group-hover:text-white">
                    jjsalvarezz@gmail.com
                  </span>
                </a>

                <a
                  href="https://wa.me/584129164371" 
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10"
                >
                  <Phone size={12} className="text-indigo-200 group-hover:text-white" />
                  <span className="text-[10px] md:text-xs font-medium text-indigo-100 group-hover:text-white">
                    0412-916-4371
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* === SECCIÓN DERECHA: FORMULARIO === */}
        <div className="md:w-1/2 p-6 md:p-8 bg-white flex flex-col justify-center">
          
          <div className="mb-5 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h3>
            <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar.</p>
          </div>

          {/* CAMBIO: space-y-3 en vez de space-y-5 para juntar los inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide ml-1">Correo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@empresa.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 bg-gray-50/50 focus:bg-white text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 bg-gray-50/50 focus:bg-white text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-md"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  Ingresar al sistema
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}