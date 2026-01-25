import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function seedUsuarios() {
  console.log("Verificando Usuarios...");

  // 1. Buscamos los IDs de los Roles necesarios
  const rolComercio = await prisma.rol.findUnique({ where: { nombre: "ADMIN_COMERCIO" } });
  const rolSuperAdmin = await prisma.rol.findUnique({ where: { nombre: "SUPER_ADMIN" } });

  if (!rolComercio || !rolSuperAdmin) {
    console.error("Error: No se encontraron los roles necesarios (ADMIN_COMERCIO o SUPER_ADMIN). Ejecuta seedRoles primero.");
    return;
  }

  // 2. Buscamos los comercios para obtener sus IDs
  const bodega = await prisma.comercio.findUnique({ where: { slug: "bodega-esquina" } });
  const ferreteria = await prisma.comercio.findUnique({ where: { slug: "ferreteria-tuerca" } });

  // Contraseña genérica para pruebas (encriptada)
  const passwordEncriptada = await bcrypt.hash("123456", 10);

  // ==========================================
  //  CREAR TU USUARIO SUPER ADMIN
  // ==========================================
  await prisma.usuario.upsert({
    where: { email: "jjsalvarezz@gmail.com" },
    update: {}, // Si ya existe, no hace nada
    create: {
      nombre: "Juan Álvarez",
      email: "jjsalvarezz@gmail.com",
      password: passwordEncriptada, // Contraseña: 123456
      rolId: rolSuperAdmin.id,      // Rol: SUPER_ADMIN
      comercioId: null,             // IMPORTANTE: Null porque gestionas todo
    },
  });
  console.log("Usuario creado: jjsalvarezz@gmail.com (SUPER ADMIN)");


  // ==========================================
  //  CREAR USUARIOS DE COMERCIOS (CLIENTES)
  // ==========================================
  
  // Usuario A: Dueño de la Bodega
  if (bodega) {
    await prisma.usuario.upsert({
      where: { email: "bodega@demo.com" },
      update: {},
      create: {
        nombre: "Juan Bodeguero",
        email: "bodega@demo.com",
        password: passwordEncriptada,
        rolId: rolComercio.id,
        comercioId: bodega.id, 
      },
    });
    console.log("Usuario creado: bodega@demo.com (Dueño de Bodega)");
  }

  // Usuario B: Dueño de la Ferretería
  if (ferreteria) {
    await prisma.usuario.upsert({
      where: { email: "ferreteria@demo.com" },
      update: {},
      create: {
        nombre: "Pedro Ferretero",
        email: "ferreteria@demo.com",
        password: passwordEncriptada,
        rolId: rolComercio.id,
        comercioId: ferreteria.id,
      },
    });
    console.log("Usuario creado: ferreteria@demo.com (Dueño de Ferretería)");
  }
}