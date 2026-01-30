import { auth } from "@/src/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ContactButtons from "@/src/components/Landing/ContactButtons"; 
import { 
  BarChart3, 
  Box, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Store,
  Calculator,
  Smartphone,
  Banknote
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/home");
  }

  // CARACTERÍSTICAS
  // Enfoque: Gestión Interna / No Fiscal
  const features = [
    {
      title: "Control de Inventario Interno",
      description: "Administra tu stock real. El sistema descuenta la mercancía al momento de la venta interna, permitiéndote saber exactamente qué tienes en almacén para tus reposiciones.",
      icon: <Box className="w-6 h-6 text-white" />,
    },
    {
      title: "Gestión de Cuentas por Cobrar",
      description: "Organiza los fiados y créditos. Registra quién te debe, controla los abonos parciales y mantén un saldo claro de tu dinero en la calle.",
      icon: <Banknote className="w-6 h-6 text-white" />, 
    },
    {
      title: "Calculadora de Divisas",
      description: "Herramienta de cálculo rápido. Convierte precios de referencia en Dólares a Bolívares automáticamente con la tasa del día para agilizar el cobro.",
      icon: <Calculator className="w-6 h-6 text-white" />, 
    },
    {
      title: "Reportes Gerenciales",
      description: "Estadísticas para el dueño. Analiza el rendimiento de tu negocio, flujo de caja y ganancias reales para tomar decisiones administrativas.",
      icon: <BarChart3 className="w-6 h-6 text-white" />,
    },
    {
      title: "Notas de Entrega (No Fiscal)",
      description: "Genera notas de entrega digitales para control interno y envíalos por WhatsApp al cliente.",
      icon: <Smartphone className="w-6 h-6 text-white" />,
    },
    {
      title: "Seguridad de Datos",
      description: "Tu información administrativa resguardada. Sistema de acceso restringido para uso exclusivo de la gerencia y empleados autorizados.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
    },
  ];

  const logos = [
    "BODEGA EXPRESS", "FERRETERÍA CENTRAL", "MINI-MARKET", "FARMACIA SAN JOSÉ", "LICORERÍA EL REY",
    "BODEGA EXPRESS", "FERRETERÍA CENTRAL", "MINI-MARKET", "FARMACIA SAN JOSÉ", "LICORERÍA EL REY"
  ];

  return (
    <div className="bg-white scroll-smooth overflow-x-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
      
      {/* === HERO SECTION === */}
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 min-h-[90vh] border-b border-gray-100 overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[800px] sm:h-[500px] bg-indigo-200/20 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none"></div>

        <div className="text-center max-w-5xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-24 pb-12 w-full">
          
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Gestión Interna (No Fiscal)
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-6 sm:mb-8 tracking-tight leading-[1.1]">
            Organiza la administración <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              de tu negocio al detalle
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-medium px-2">
            Software administrativo para dueños de negocios. <br className="hidden sm:block"/>
            Controla inventario, cuentas y divisas para tu gestión interna. <br/>
            <span className="text-sm font-bold text-gray-400 uppercase mt-2 block">(No es un sistema de facturación fiscal)</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
            <Link 
              href="/demo" 
              className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 shadow-xl hover:shadow-indigo-500/40 ring-4 ring-transparent hover:ring-indigo-100"
            >
              Prueba la Demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="#features" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-600 transition-all bg-transparent hover:bg-gray-50 rounded-full hover:text-gray-900"
            >
              Ver Herramientas
            </Link>
          </div>

          {/* Carrusel */}
          <div className="mt-16 w-full max-w-[100vw] overflow-hidden opacity-50 grayscale hover:grayscale-0 transition-all duration-500 relative">
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-white via-transparent to-white w-full h-full"></div>
            <div className="flex whitespace-nowrap animate-scroll relative z-10">
               {logos.map((logo, index) => (
                 <div key={index} className="mx-6 sm:mx-8 flex items-center gap-2 font-bold text-base sm:text-xl text-gray-400">
                    <Store className="w-4 h-4 sm:w-5 sm:h-5 mb-1" /> {logo}
                 </div>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* === CARACTERÍSTICAS === */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Herramienta Gerencial</h2>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Gestión para Dueños
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Una plataforma diseñada para organizar tu casa por dentro: inventario real, cuentas claras y control de personal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="relative w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="relative text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-gray-500 leading-relaxed group-hover:text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === BENEFICIOS === */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
             <div className="inline-block px-4 py-1 mb-4 rounded-full bg-green-100 text-green-700 font-bold text-xs uppercase">
               Orden Administrativo
             </div>
             <h2 className="text-4xl font-bold text-gray-900 mb-6">El control real de tu negocio</h2>
             <p className="text-lg text-gray-600 mb-8">
               Nuestro sistema es una herramienta puramente administrativa. No sustituye tus deberes formales, pero te da la visión clara que necesitas para administrar: qué tienes, qué debes y cuánto ganas realmente.
             </p>
             
             <ul className="space-y-4">
               {[
                 "Control de Inventario y Mermas (Uso Interno)",
                 "Cálculo automático de precios referenciales",
                 "Gestión de Cuentas por Cobrar y Pagar",
                 "Sistema de Gestión Administrativa (No Fiscal)"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3">
                   <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                   <span className="text-gray-700 font-medium">{item}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="flex-1 w-full bg-white p-2 rounded-3xl shadow-xl border border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500">
             <img 
                src="/demo.png" 
                alt="Vista Previa del Dashboard" 
                className="w-full h-auto rounded-2xl shadow-inner border border-gray-100"
             />
          </div>
        </div>
      </section>

      {/* === CONTACTO === */}
      <section id="contact" className="py-24 relative overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Mejora tu administración hoy mismo
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Únete a los comercios que ya están organizando su inventario y cuentas de forma eficiente.
          </p>

          <ContactButtons />

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center">
             <div className="text-sm text-gray-500 mb-2">Desarrollado por Juan Álvarez</div>
             <p className="text-xs text-gray-600">© {new Date().getFullYear()} SaaS Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </section>
    </div>
  );
}