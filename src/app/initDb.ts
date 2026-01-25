import prisma from "@/src/lib/prisma";
import { seedRoles } from "./seeds/roles";
import { seedUsuarios } from "./seeds/usuarios";

export async function def() {
  try {
    console.log("Iniciando inicialización de Base de Datos...");


    await seedRoles();
    await seedUsuarios();

    console.log("Inicialización completada exitosamente.");
  } catch (error) {
    console.error("Error en initDb:", error);
  } finally {
    await prisma.$disconnect();
  }
}