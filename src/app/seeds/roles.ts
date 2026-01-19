import prisma from "@/src/lib/prisma";

export async function seedRoles() {
  // Definimos los roles que queremos
  const roles = ["SUPER_ADMIN", "ADMIN_COMERCIO"];

  console.log(" Verificando Roles...");

  for (const nombre of roles) {
    // Upsert crea si no existe, o actualiza si existe (ideal para seeds)
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log(" Roles verificados/creados");
}