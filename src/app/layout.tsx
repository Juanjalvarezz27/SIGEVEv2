import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; 
import ToastConfig from "../components/ToastConfig";
import { auth } from "@/src/auth"; 
import AuthProvider from "./providers/AuthProvider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Ventas SaaS",
  description: "Sistema de gestión multi-comercio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Navbar />
          
          <main className="min-h-screen">
            {children}
          </main>
          <ToastConfig />
        </AuthProvider>
      </body>
    </html>
  );
}