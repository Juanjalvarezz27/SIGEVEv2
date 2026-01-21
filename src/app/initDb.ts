import prisma from "@/src/lib/prisma";
import { seedRoles } from "./seeds/roles";
import { seedComercios } from "./seeds/comercios";
import { seedUsuarios } from "./seeds/usuarios"; 
export async function def() {
  try {
    console.log("Iniciando población de Base de Datos Multi-Tenant...");

    await seedRoles();
    await seedComercios();
    await seedUsuarios(); 

    console.log("Inicialización completada exitosamente.");
  } catch (error) {
    console.error("Error en initDb:", error);
  } finally {
    await prisma.$disconnect();
  }
}