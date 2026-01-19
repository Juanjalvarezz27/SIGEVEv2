import { auth } from "@/src/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  BarChart3, 
  Box, 
  ShieldCheck, 
  Zap, 
  Tags,      
  CreditCard  
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/home");
  }

  const features = [
    {
      title: "Gestión de Inventario",
      description: "Control total de tu stock en tiempo real. Entradas, salidas y alertas de bajo stock.",
      icon: <Box className="w-6 h-6 text-white" />,
    },
    {
      title: "Análisis y Reportes",
      description: "Toma decisiones basadas en datos. Gráficos de ventas diarias, mensuales y por producto.",
      icon: <BarChart3 className="w-6 h-6 text-white" />,
    },
    {
      title: "Gestión de Precios", 
      description: "Administra múltiples listas de precios, descuentos y promociones de forma flexible.",
      icon: <Tags className="w-6 h-6 text-white" />, 
    },
    {
      title: "Seguridad SaaS",
      description: "Tus datos están aislados y protegidos con los mejores estándares de la industria.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
    {
      title: "Métodos de Pago", 
      description: "Registra ventas con tarjetas, efectivo, transferencias o billeteras digitales fácilmente.",
      icon: <CreditCard className="w-6 h-6 text-white" />, 
    },
    {
      title: "Rápido y Escalable",
      description: "Creado con tecnología moderna para que tu negocio nunca se detenga.",
      icon: <Zap className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <div className="bg-white">
      
      {/* SECCIÓN HERO */}
      <section className="relative flex flex-col items-center justify-center bg-gray-50 px-6 min-h-[calc(100vh-5rem)] border-b border-gray-200">
        <div className="text-center max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="inline-block mb-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
            v2.0 Disponible
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            <span className="md:whitespace-nowrap">Sistema Multi-Comercio</span>
            <span className="block text-indigo-600">SaaS</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
            La plataforma todo en uno para gestionar tu inventario, ventas y clientes. 
            Potencia tu negocio con tecnología simple, segura y eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/api/auth/signin" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-1"
            >
              Comenzar Ahora
            </Link>
            
            <Link 
              href="#features" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 transition-all bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 shadow-sm"
            >
              Ver Características
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para crecer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas para la eficiencia operativa de tu comercio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              JA
            </div>
            <span className="text-white font-semibold text-lg">Sistema Multi-Comercio SaaS</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Juan Alvarez. Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}