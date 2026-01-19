import prisma from "@/src/lib/prisma";
import { seedRoles } from "./seeds/roles";
import { seedComercios } from "./seeds/comercios";
import { seedUsuarios } from "./seeds/usuarios"; 

export async function def() {
  try {

    console.log("Iniciando población de Base de Datos Multi-Tenant...");

    await seedRoles();      // Paso 1: Crear Roles
    await seedComercios();  // Paso 2: Crear Comercios y Productos
    await seedUsuarios();   // Paso 3: Crear Dueños 

    console.log("Inicialización completada exitosamente.");

  } catch (error) {
    console.error("Error en initDb:", error);
  } finally {
    await prisma.$disconnect();
  }
}