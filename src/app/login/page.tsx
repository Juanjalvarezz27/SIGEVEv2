"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"; 

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Nuevos estados para controlar la visibilidad y errores locales
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiamos errores previos

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        // Mostrar mensaje de error en el formulario (ya no usa toast)
        setError("Credenciales incorrectas. Intenta de nuevo.");
      } else {
        // Redirección silenciosa y rápida
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      setError("Ocurrió un error de conexión.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* SECCIÓN IZQUIERDA: Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>

          <div className="relative z-10">
            <div className="h-14 w-14 mx-auto rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-6 border border-white/30">
              <span className="text-white font-black text-sm tracking-tighter">SaaS</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Hola de nuevo!</h2>
            <p className="text-indigo-100 max-w-xs mx-auto text-sm leading-relaxed">
              Accede a tu panel de control para gestionar inventario, ventas y clientes de forma eficiente.
            </p>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Formulario */}
        <div className="md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-center">
          
          <div className="mb-6 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h3>
            <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mensaje de Error Local */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 ml-1">Correo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 bg-gray-50 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password con Ojito */}
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase">Contraseña</label>
              </div>
              
              <div className="relative group">
                {/* Icono Candado (Izquierda) */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 bg-gray-50 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Botón de Ojito (Derecha) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Protegido por Sistema SaaS v2.0
          </p>
        </div>

      </div>
    </div>
  );
}