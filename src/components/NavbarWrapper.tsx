"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Lista de rutas donde NO queremos que salga el Navbar Global
  // (Porque esas rutas ya tienen su propio Layout con Navbar)
  const rutasPrivadas = ["/home", "/admin"];

  // Si la ruta actual empieza con /home o /admin, no renderizamos nada aquí.
  const esRutaPrivada = rutasPrivadas.some((ruta) => pathname?.startsWith(ruta));

  if (esRutaPrivada) {
    return null;
  }

  // Si estamos en la Landing, Login, Contacto, etc., mostramos el Navbar.
  return <Navbar />;
}