import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "next-auth/react";

// 1. IMPORTA EL WRAPPER QUE ACABAS DE CREAR
import NavbarWrapper from "@/src/components/NavbarWrapper"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema SaaS",
  description: "Plataforma de Gestión",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          
          <NavbarWrapper /> 
          
          {children}
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}