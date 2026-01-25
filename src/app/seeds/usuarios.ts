import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function seedUsuarios() {
  console.log(" Verificando Usuarios ");

  // 1. Buscamos el ID del Rol SUPER_ADMIN
  const rolSuperAdmin = await prisma.rol.findUnique({ where: { nombre: "SUPER_ADMIN" } });

  if (!rolSuperAdmin) {
    console.error(" Error: No se encontró el rol SUPER_ADMIN. Ejecuta seedRoles primero.");
    return;
  }

  // Contraseña genérica 
  const passwordEncriptada = await bcrypt.hash("123456", 10);

  //  CREAR TU USUARIO SUPER ADMIN (ÚNICO)
  // ==========================================
  await prisma.usuario.upsert({
    where: { email: "jjsalvarezz@gmail.com" },
    update: {
        rolId: rolSuperAdmin.id, 
        comercioId: null
    },
    create: {
      nombre: "Juan Álvarez",
      email: "jjsalvarezz@gmail.com",
      password: passwordEncriptada, 
      rolId: rolSuperAdmin.id,      
      comercioId: null,             
    },
  });
  
  console.log(" Usuario Maestro creado: jjsalvarezz@gmail.com");
}