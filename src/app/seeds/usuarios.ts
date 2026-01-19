import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function seedUsuarios() {
  console.log("Verificando Usuarios...");

  // 1. Buscamos el ID del Rol "ADMIN_COMERCIO" (para dárselo a los dueños)
  const rolComercio = await prisma.rol.findUnique({
    where: { nombre: "ADMIN_COMERCIO" },
  });

  if (!rolComercio) {
    console.error(" Error: No se encontró el rol ADMIN_COMERCIO. Ejecuta seedRoles primero.");
    return;
  }

  // 2. Buscamos los comercios para obtener sus IDs
  const bodega = await prisma.comercio.findUnique({ where: { slug: "bodega-esquina" } });
  const ferreteria = await prisma.comercio.findUnique({ where: { slug: "ferreteria-tuerca" } });

  // Contraseña genérica para pruebas (encriptada)
  const passwordEncriptada = await bcrypt.hash("123456", 10);

  // 3. Crear Usuario A: Dueño de la Bodega
  if (bodega) {
    await prisma.usuario.upsert({
      where: { email: "bodega@demo.com" },
      update: {}, // Si existe, no hace nada
      create: {
        nombre: "Juan Bodeguero",
        email: "bodega@demo.com",
        password: passwordEncriptada,
        rolId: rolComercio.id,
        comercioId: bodega.id, // <--- AQUÍ LO VINCULAMOS A SU NEGOCIO
      },
    });
    console.log("  Usuario creado: bodega@demo.com (Dueño de Bodega)");
  }

  // 4. Crear Usuario B: Dueño de la Ferretería
  if (ferreteria) {
    await prisma.usuario.upsert({
      where: { email: "ferreteria@demo.com" },
      update: {},
      create: {
        nombre: "Pedro Ferretero",
        email: "ferreteria@demo.com",
        password: passwordEncriptada,
        rolId: rolComercio.id,
        comercioId: ferreteria.id, // <--- VINCULADO A LA FERRETERÍA
      },
    });
    console.log("  Usuario creado: ferreteria@demo.com (Dueño de Ferretería)");
  }
}